import { useState } from "react";
import type { MatchResult, BallEvent } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button, Card, Tabs, Badge } from "./shared";
import { motion } from "framer-motion";

export function MatchScorecard({ result, onDone }: { result: MatchResult, onDone?: () => void }) {
  const [tab, setTab] = useState<'summary' | 'ball'>('summary');

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="p-6 md:p-8 border-b border-border/40 flex justify-between items-center bg-card/50">
        <div>
          <h2 className="text-3xl font-display font-black tracking-tight uppercase">Match Result</h2>
          <p className="text-primary mt-1 font-bold">{result.winner} won by {result.margin}</p>
        </div>
        {onDone && <Button onClick={onDone}>Continue</Button>}
      </div>

      <div className="p-4 md:p-8">
        <div className="mb-8">
          <Tabs tabs={['summary', 'ball']} activeTab={tab} onChange={(t) => setTab(t as any)} />
        </div>

        {tab === 'summary' && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <InningsCard innings={result.innings1} />
              <InningsCard innings={result.innings2} />
            </div>
            <Card className="p-6 bg-gradient-to-r from-primary/20 to-transparent border-primary/30">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                  <span className="text-2xl">🏆</span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-primary uppercase tracking-widest">Player of the Match</h4>
                  <p className="text-2xl font-display font-bold text-white">{result.manOfTheMatch}</p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {tab === 'ball' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="max-h-[500px] overflow-y-auto custom-scrollbar">
              <div className="p-4 space-y-1">
                {result.innings2.ballByBall.slice().reverse().map((b, i) => (
                  <BallRow key={`i2-${i}`} ball={b} />
                ))}
                <div className="py-4 text-center text-muted-foreground font-display font-bold tracking-widest text-sm border-y border-border/50 my-2">END OF INNINGS 1</div>
                {result.innings1.ballByBall.slice().reverse().map((b, i) => (
                  <BallRow key={`i1-${i}`} ball={b} />
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function InningsCard({ innings }: { innings: MatchResult['innings1'] }) {
  return (
    <Card className="p-6 border-t-4 border-t-primary">
      <div className="flex justify-between items-start mb-6">
        <h3 className="text-xl font-display font-bold text-white">{innings.teamName}</h3>
        <div className="text-right">
          <div className="text-4xl font-display font-black text-primary">
            {innings.score}<span className="text-2xl text-muted-foreground">/{innings.wickets}</span>
          </div>
          <div className="text-sm text-muted-foreground font-mono">{innings.overs} Overs</div>
        </div>
      </div>
      <div className="space-y-3">
        <div className="flex justify-between p-3 bg-background rounded-xl border border-border/50">
          <span className="text-muted-foreground">Top Scorer</span>
          <span className="font-bold text-white">{innings.topScorer} <span className="text-primary ml-2">{innings.topScorerRuns}</span></span>
        </div>
        <div className="flex justify-between p-3 bg-background rounded-xl border border-border/50">
          <span className="text-muted-foreground">Top Bowler</span>
          <span className="font-bold text-white">{innings.topBowler} <span className="text-accent ml-2">{innings.topBowlerWickets}W</span></span>
        </div>
      </div>
    </Card>
  );
}

function BallRow({ ball }: { ball: BallEvent }) {
  const isBoundary = ball.runs === 4 || ball.runs === 6;
  return (
    <div className="flex gap-4 p-3 hover:bg-white/5 rounded-xl items-center transition-colors">
      <div className="w-12 font-mono text-muted-foreground font-semibold">{ball.over}.{ball.ball}</div>
      <div className={`w-10 h-10 rounded-full flex items-center justify-center font-display font-black text-lg shadow-inner
        ${ball.isWicket ? 'bg-destructive text-white shadow-destructive/50' : 
          isBoundary ? 'bg-primary text-primary-foreground shadow-primary/50' : 
          'bg-secondary text-secondary-foreground'}`}
      >
        {ball.isWicket ? 'W' : ball.runs}
      </div>
      <div className="flex-1 text-[15px] text-white/90 leading-snug">
        {ball.description}
      </div>
    </div>
  );
}
