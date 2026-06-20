import { useState } from "react";
import { useGetPlayerPool, useSimulateMatch } from "@workspace/api-client-react";
import type { Player, MatchResult } from "@workspace/api-client-react/src/generated/api.schemas";
import { useDraftState } from "@/hooks/use-draft-logic";
import { PlayerCard } from "@/components/player-card";
import { Button, Modal } from "@/components/shared";
import { MatchScorecard } from "@/components/match-scorecard";
import { motion, AnimatePresence } from "framer-motion";

export default function DraftAI() {
  const { data: poolData, isLoading } = useGetPlayerPool({ count: 30 });
  const { userTeam, handlePick, removePick, isValidXI, wks, bowlers, isDraftComplete } = useDraftState();
  const simMatch = useSimulateMatch();
  const [result, setResult] = useState<MatchResult | null>(null);

  if (isLoading) return <div className="text-center py-20 animate-pulse text-muted-foreground">Generating Player Pool...</div>;

  const handleSimulate = () => {
    if (!poolData || !isValidXI) return;
    const pool = poolData.players;
    const remaining = pool.filter(p => !userTeam.some(u => u.id === p.id));
    
    // AI picks 11
    const aiTeam: Player[] = [];
    const availableWks = remaining.filter(p => p.role === 'wicketkeeper').sort((a,b)=>b.overallRating - a.overallRating);
    if(availableWks[0]) aiTeam.push(availableWks[0]);

    const availableBowlers = remaining.filter(p => p.role === 'bowler' || p.role === 'allrounder')
      .filter(p => p.id !== aiTeam[0]?.id)
      .sort((a,b)=>b.overallRating - a.overallRating).slice(0, 5);
    aiTeam.push(...availableBowlers);

    const availableBats = remaining.filter(p => !aiTeam.some(a => a.id === p.id))
      .sort((a,b)=>b.overallRating - a.overallRating).slice(0, 11 - aiTeam.length);
    aiTeam.push(...availableBats);

    simMatch.mutate({
      data: { team1: userTeam, team2: aiTeam, team1Name: "Your XI", team2Name: "AI XI", format: 't20' }
    }, { onSuccess: setResult });
  };

  const poolPlayers = poolData?.players.filter(p => !userTeam.some(u => u.id === p.id)) || [];

  return (
    <div className="py-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-display font-black text-white">DRAFT <span className="text-primary">VS AI</span></h1>
          <p className="text-muted-foreground mt-1">Pick 11 players for your ultimate XI.</p>
        </div>
        <div className="flex flex-col items-end">
          <div className="flex gap-4 mb-3 text-sm font-semibold">
            <span className={isDraftComplete ? "text-primary" : "text-muted-foreground"}>{userTeam.length}/11 Players</span>
            <span className={wks >= 1 ? "text-accent" : "text-destructive"}>{wks}/1 WK</span>
            <span className={bowlers >= 5 ? "text-accent" : "text-destructive"}>{bowlers}/5 Bowl Options</span>
          </div>
          <Button disabled={!isValidXI || simMatch.isPending} onClick={handleSimulate}>
            {simMatch.isPending ? "Simulating..." : "Confirm & Play AI"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <h3 className="text-xl font-display font-bold text-white mb-4">Player Pool</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <AnimatePresence>
              {poolPlayers.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                  <PlayerCard player={p} action="add" disabled={isDraftComplete} onAction={() => handlePick(p)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
        <div className="lg:col-span-4">
          <h3 className="text-xl font-display font-bold text-white mb-4">Your XI</h3>
          <div className="space-y-3 bg-secondary/30 p-4 rounded-3xl border border-border/50 min-h-[500px]">
            <AnimatePresence>
              {userTeam.length === 0 && (
                 <div className="text-center p-8 text-muted-foreground border-2 border-dashed border-border/50 rounded-2xl">
                   No players selected yet.
                 </div>
              )}
              {userTeam.map((p) => (
                <motion.div key={p.id} layout initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, scale: 0.9 }}>
                  <PlayerCard player={p} action="remove" compact onAction={() => removePick(p.id)} />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <Modal isOpen={!!result} onClose={() => setResult(null)}>
        {result && <MatchScorecard result={result} onDone={() => setResult(null)} />}
      </Modal>
    </div>
  );
}
