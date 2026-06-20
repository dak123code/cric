import { useState, useCallback } from "react";
import { ALL_PLAYERS_EXPORT, TOTW_IDS, MW_IDS, PRIME_PLAYERS, ICON_PLAYERS } from "@/lib/static-data";
import type { Player } from "@/lib/static-data";
import { RoleIcon } from "@/components/player-card";
import { CricketCard } from "@/components/cricket-card";
import { Button, Modal } from "@/components/shared";
import { MatchScorecard } from "@/components/match-scorecard";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Plus, ChevronRight, Swords } from "lucide-react";
import { TossCutscene } from "@/components/toss-cutscene";

// ── Types ──────────────────────────────────────────────────────────

type Role = "batsman" | "bowler" | "allrounder" | "wicketkeeper";

interface SlotDef {
  id: number;
  label: string;
  short: string;
  role: Role | null;
  isBench: boolean;
}

interface BallEvent {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  description: string;
}

interface InningsResult {
  teamName: string;
  score: number;
  wickets: number;
  overs: string;
  topScorer: string;
  topScorerRuns: number;
  topBowler: string;
  topBowlerWickets: number;
  ballByBall: BallEvent[];
}

interface MatchResult {
  winner: string;
  margin: string;
  manOfTheMatch: string;
  innings1: InningsResult;
  innings2: InningsResult;
}

// ── Slot definitions ───────────────────────────────────────────────

const SLOT_DEFS: SlotDef[] = [
  { id: 0,  label: "Wicketkeeper",   short: "WK",   role: "wicketkeeper", isBench: false },
  { id: 1,  label: "Opener 1",       short: "OPN",  role: "batsman",      isBench: false },
  { id: 2,  label: "Opener 2",       short: "OPN",  role: "batsman",      isBench: false },
  { id: 3,  label: "Batsman 3",      short: "BAT",  role: "batsman",      isBench: false },
  { id: 4,  label: "Batsman 4",      short: "BAT",  role: "batsman",      isBench: false },
  { id: 5,  label: "Batsman 5",      short: "BAT",  role: "batsman",      isBench: false },
  { id: 6,  label: "All-rounder 1",  short: "AR",   role: "allrounder",   isBench: false },
  { id: 7,  label: "All-rounder 2",  short: "AR",   role: "allrounder",   isBench: false },
  { id: 8,  label: "Bowler 1",       short: "BWL",  role: "bowler",       isBench: false },
  { id: 9,  label: "Bowler 2",       short: "BWL",  role: "bowler",       isBench: false },
  { id: 10, label: "Bowler 3",       short: "BWL",  role: "bowler",       isBench: false },
  { id: 11, label: "Bench 1",        short: "SUB",  role: null,           isBench: true  },
  { id: 12, label: "Bench 2",        short: "SUB",  role: null,           isBench: true  },
  { id: 13, label: "Bench 3",        short: "SUB",  role: null,           isBench: true  },
  { id: 14, label: "Bench 4",        short: "SUB",  role: null,           isBench: true  },
];

// ── Styling maps ───────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  wicketkeeper: "text-yellow-400 border-yellow-400/40 bg-yellow-400/10",
  batsman:      "text-blue-400   border-blue-400/40   bg-blue-400/10",
  allrounder:   "text-purple-400 border-purple-400/40 bg-purple-400/10",
  bowler:       "text-red-400    border-red-400/40    bg-red-400/10",
};

const BADGE_COLORS: Record<string, string> = {
  WK:  "bg-yellow-400/20 text-yellow-300 border-yellow-400/30",
  OPN: "bg-blue-400/20   text-blue-300   border-blue-400/30",
  BAT: "bg-blue-400/20   text-blue-300   border-blue-400/30",
  AR:  "bg-purple-400/20 text-purple-300 border-purple-400/30",
  BWL: "bg-red-400/20    text-red-300    border-red-400/30",
  SUB: "bg-gray-500/20   text-gray-300   border-gray-500/30",
};

// ── Local simulation ───────────────────────────────────────────────

function simulateInnings(battingTeam: Player[], bowlingTeam: Player[], teamName: string): InningsResult {
  const lineup = [
    ...battingTeam.filter(p => p.role === "wicketkeeper"),
    ...battingTeam.filter(p => p.role === "batsman"),
    ...battingTeam.filter(p => p.role === "allrounder"),
    ...battingTeam.filter(p => p.role === "bowler"),
  ].slice(0, 11);

  const bowlers = [
    ...bowlingTeam.filter(p => p.role === "bowler"),
    ...bowlingTeam.filter(p => p.role === "allrounder"),
  ];

  const batterScores: Record<number, number> = {};
  const bowlerWickets: Record<number, number> = {};
  lineup.forEach(p => { batterScores[p.id] = 0; });
  bowlers.forEach(p => { bowlerWickets[p.id] = 0; });

  const battingStrength = battingTeam.reduce((s, p) => s + p.battingRating, 0) / battingTeam.length;
  const bowlingStrength = bowlers.length > 0
    ? bowlers.reduce((s, p) => s + p.bowlingRating, 0) / bowlers.length
    : 500;

  let totalScore = 0;
  let wickets = 0;
  let batterIdx = 0;
  const ballByBall: BallEvent[] = [];

  for (let over = 0; over < 20 && wickets < 10 && batterIdx < lineup.length; over++) {
    const bowler = bowlers[over % Math.max(bowlers.length, 1)];

    for (let ball = 1; ball <= 6 && wickets < 10 && batterIdx < lineup.length; ball++) {
      const batter = lineup[batterIdx];

      const wicketProb = Math.max(0.04, Math.min(0.16,
        0.08 + (bowlingStrength - battingStrength) / 8000
      ));

      if (Math.random() < wicketProb) {
        wickets++;
        batterIdx++;
        if (bowler) bowlerWickets[bowler.id]++;
        ballByBall.push({
          over, ball, runs: 0, isWicket: true,
          description: `${batter.name} OUT — ${bowler?.name ?? "Unknown"} strikes!`,
        });
      } else {
        const runBias = Math.sqrt(battingStrength / Math.max(bowlingStrength, 1));
        const rand = Math.random();
        let runs: number;
        if      (rand < 0.28) runs = 0;
        else if (rand < 0.54) runs = 1;
        else if (rand < 0.68) runs = 2;
        else if (rand < 0.74) runs = 3;
        else if (rand < 0.86) runs = 4;
        else if (rand < 0.93) runs = 6;
        else                   runs = 1;
        runs = Math.max(0, Math.min(6, Math.round(runs * runBias)));

        totalScore += runs;
        batterScores[batter.id] += runs;
        ballByBall.push({
          over, ball, runs, isWicket: false,
          description: runs === 6
            ? `${batter.name} launches a SIX!`
            : runs === 4
              ? `${batter.name} drives for FOUR!`
              : runs === 0
                ? `Dot ball. Tight bowling from ${bowler?.name ?? "Unknown"}`
                : `${batter.name} takes ${runs}`,
        });
      }
    }
  }

  const topScorerEntry = Object.entries(batterScores).sort((a, b) => +b[1] - +a[1])[0];
  const topBowlerEntry = Object.entries(bowlerWickets).sort((a, b) => +b[1] - +a[1])[0];

  const totalBalls = ballByBall.length;
  const completedOvers = Math.floor(totalBalls / 6);
  const extraBalls = totalBalls % 6;
  const oversStr = extraBalls > 0 ? `${completedOvers}.${extraBalls}` : `${Math.min(20, completedOvers)}`;

  return {
    teamName,
    score: totalScore,
    wickets,
    overs: oversStr,
    topScorer: lineup.find(p => p.id === +topScorerEntry[0])?.name ?? "Unknown",
    topScorerRuns: +topScorerEntry[1],
    topBowler: bowlers.find(p => p.id === +topBowlerEntry[0])?.name ?? "Unknown",
    topBowlerWickets: +topBowlerEntry[1],
    ballByBall,
  };
}

function runLocalSimulation(xi1: Player[], xi2: Player[], name1: string, name2: string): MatchResult {
  const innings1 = simulateInnings(xi1, xi2, name1);
  const innings2 = simulateInnings(xi2, xi1, name2);

  const p1Wins = innings1.score > innings2.score;
  const winner = p1Wins ? name1 : name2;
  const margin = p1Wins
    ? `${innings1.score - innings2.score} runs`
    : `${10 - innings2.wickets} wickets`;

  const candidates = [
    { name: innings1.topScorer,  value: innings1.topScorerRuns },
    { name: innings1.topBowler,  value: innings1.topBowlerWickets * 25 },
    { name: innings2.topScorer,  value: innings2.topScorerRuns },
    { name: innings2.topBowler,  value: innings2.topBowlerWickets * 25 },
  ];
  const manOfTheMatch = candidates.sort((a, b) => b.value - a.value)[0].name;

  return { winner, margin, manOfTheMatch, innings1, innings2 };
}

// ── Helpers ────────────────────────────────────────────────────────

const PRIME_IDS   = new Set(PRIME_PLAYERS.map(p => p.id));
const ICON_IDS    = new Set(ICON_PLAYERS.map(p => p.id));
// MW players elevated to Icon tier — Brian Lara (763), Stuart Broad (767)
const MW_ICON_IDS = new Set([763, 767]);

function getCardType(player: Player) {
  if (MW_ICON_IDS.has(player.id)) return "mw-icon" as const;
  if (ICON_IDS.has(player.id))    return "icon"    as const;
  if (PRIME_IDS.has(player.id))   return "prime"   as const;
  if (MW_IDS.has(player.id))      return "mw"      as const;
  if (TOTW_IDS.has(player.id))    return "totw"    as const;
  return "normal" as const;
}

function getChoices(role: Role | null, alreadyPicked: (Player | null)[]): Player[] {
  const pickedIds = new Set(alreadyPicked.filter(Boolean).map(p => p!.id));
  const pool = ALL_PLAYERS_EXPORT.filter(p =>
    (role === null || p.role === role) && !pickedIds.has(p.id)
  );
  return [...pool].sort(() => Math.random() - 0.5).slice(0, 5);
}

type Phase = "p1draft" | "handoff" | "p2draft" | "done";

// ── Page ───────────────────────────────────────────────────────────

export default function Draft2P() {
  const [phase, setPhase] = useState<Phase>("p1draft");
  const [team1, setTeam1] = useState<(Player | null)[]>(Array(15).fill(null));
  const [team2, setTeam2] = useState<(Player | null)[]>(Array(15).fill(null));
  const [activeSlotId, setActiveSlotId] = useState<number | null>(null);
  const [choices, setChoices] = useState<Player[]>([]);
  const [result, setResult] = useState<MatchResult | null>(null);
  const [simulating, setSimulating] = useState(false);
  const [showToss, setShowToss] = useState(false);

  const isP1 = phase === "p1draft";
  const currentTeam = isP1 ? team1 : team2;
  const setCurrentTeam = isP1 ? setTeam1 : setTeam2;
  const filledCount = currentTeam.filter(Boolean).length;

  const handleSlotClick = useCallback((slotId: number) => {
    if (currentTeam[slotId] !== null) return;
    setChoices(getChoices(SLOT_DEFS[slotId].role, currentTeam));
    setActiveSlotId(slotId);
  }, [currentTeam]);

  const handlePickPlayer = useCallback((player: Player) => {
    if (activeSlotId === null) return;
    setCurrentTeam(prev => {
      const next = [...prev];
      next[activeSlotId] = player;
      return next;
    });
    setActiveSlotId(null);
    setChoices([]);
  }, [activeSlotId, setCurrentTeam]);

  const handleSimulate = () => {
    const xi1 = team1.slice(0, 11).filter(Boolean) as Player[];
    const xi2 = team2.slice(0, 11).filter(Boolean) as Player[];
    setSimulating(true);
    setTimeout(() => {
      setResult(runLocalSimulation(xi1, xi2, "Player 1 XI", "Player 2 XI"));
      setSimulating(false);
    }, 600);
  };

  const handleTossComplete = () => {
    setShowToss(false);
    handleSimulate();
  };

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-display font-black text-white">
          2-PLAYER <span className="text-primary">DRAFT</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          Build your squad position by position, then battle it out.
        </p>
      </div>

      <BazBallAd />

      <AnimatePresence mode="wait">

        {/* ── Handoff ──────────────────────────────────────────── */}
        {phase === "handoff" && (
          <motion.div
            key="handoff"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.92 }}
            className="flex flex-col items-center justify-center min-h-[55vh] gap-8 text-center"
          >
            <div className="w-24 h-24 rounded-full bg-primary/20 border-2 border-primary/40 flex items-center justify-center text-5xl">
              ✅
            </div>
            <div>
              <h2 className="text-3xl font-display font-black text-white mb-2">Player 1 is Done!</h2>
              <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                All 15 positions filled. Hand the device to Player 2.
              </p>
            </div>
            <Button size="lg" onClick={() => setPhase("p2draft")}>
              Player 2, Start Your Draft <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </motion.div>
        )}

        {/* ── Both done — squads + simulate ────────────────────── */}
        {phase === "done" && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-display font-black text-white mb-1">Both squads ready!</h2>
              <p className="text-muted-foreground mb-6">Time to see who drafted better.</p>
              <Button size="lg" onClick={() => setShowToss(true)} disabled={simulating}>
                <Swords className="mr-2 w-5 h-5" />
                {simulating ? "Simulating Clash..." : "BEGIN TOSS"}
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <SquadPreview label="Player 1 XI" picks={team1} accent="text-primary border-primary" />
              <SquadPreview label="Player 2 XI" picks={team2} accent="text-blue-400 border-blue-500" />
            </div>
          </motion.div>
        )}

        {/* ── Draft grid ────────────────────────────────────────── */}
        {(phase === "p1draft" || phase === "p2draft") && (
          <motion.div key={phase} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            {/* Player indicator + progress */}
            <div className="flex items-center justify-between mb-6 bg-card border border-border/50 rounded-2xl px-5 py-3">
              <div className="flex items-center gap-3">
                <span className={cn(
                  "w-3 h-3 rounded-full",
                  isP1 ? "bg-primary" : "bg-blue-500"
                )} />
                <span className="font-display font-bold text-white text-lg">
                  {isP1 ? "Player 1" : "Player 2"} — building squad
                </span>
              </div>
              <div className="flex items-center gap-1">
                <span className="text-2xl font-display font-black text-white">{filledCount}</span>
                <span className="text-muted-foreground font-bold text-lg">/15</span>
              </div>
            </div>

            {/* Starting XI */}
            <SectionLabel text="Starting XI" />
            <div className="grid grid-cols-3 gap-3 mb-2">
              {SLOT_DEFS.slice(0, 11).map(slot => (
                <PositionSlot
                  key={slot.id}
                  slot={slot}
                  player={currentTeam[slot.id]}
                  onClick={() => handleSlotClick(slot.id)}
                />
              ))}
            </div>

            {/* Bench */}
            <SectionLabel text="Bench" className="mt-5" />
            <div className="grid grid-cols-3 gap-3">
              {SLOT_DEFS.slice(11).map(slot => (
                <PositionSlot
                  key={slot.id}
                  slot={slot}
                  player={currentTeam[slot.id]}
                  onClick={() => handleSlotClick(slot.id)}
                />
              ))}
              <div className="invisible" />
            </div>

            {/* CTA */}
            <AnimatePresence>
              {filledCount === 15 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="text-center mt-8"
                >
                  <Button
                    size="lg"
                    onClick={() => setPhase(isP1 ? "handoff" : "done")}
                  >
                    {isP1 ? "Done — Pass to Player 2" : "Done — See Squads"}
                    <ChevronRight className="ml-2 w-5 h-5" />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

      </AnimatePresence>

      {/* ── Player choices modal ──────────────────────────────── */}
      <Modal
        isOpen={activeSlotId !== null}
        onClose={() => { setActiveSlotId(null); setChoices([]); }}
      >
        {activeSlotId !== null && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-display font-black text-white">
                Choose {SLOT_DEFS[activeSlotId].label}
              </h3>
              <p className="text-muted-foreground text-sm mt-1">
                Tap a card to pick that player
              </p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              {choices.map(player => (
                <CricketCard
                  key={player.id}
                  player={player}
                  cardType={getCardType(player)}
                  size="md"
                  onClick={() => handlePickPlayer(player)}
                />
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* ── Match result modal ────────────────────────────────── */}
      <Modal isOpen={!!result} onClose={() => setResult(null)}>
        {result && (
          <MatchScorecard result={result as any} onDone={() => setResult(null)} />
        )}
      </Modal>

      {/* ── Toss cutscene overlay ─────────────────────────────── */}
      <AnimatePresence>
        {showToss && (
          <TossCutscene
            captain1={[...(team1.slice(0, 11).filter(Boolean) as Player[])].sort((a, b) => b.overallRating - a.overallRating)[0] ?? null}
            captain2={[...(team2.slice(0, 11).filter(Boolean) as Player[])].sort((a, b) => b.overallRating - a.overallRating)[0] ?? null}
            showBatChoice={false}
            onComplete={handleTossComplete}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function SectionLabel({ text, className }: { text: string; className?: string }) {
  return (
    <div className={cn("flex items-center gap-2 mb-3", className)}>
      <div className="h-px flex-1 bg-border/40" />
      <span className="text-xs font-black text-muted-foreground uppercase tracking-widest">{text}</span>
      <div className="h-px flex-1 bg-border/40" />
    </div>
  );
}

function PositionSlot({ slot, player, onClick }: {
  slot: SlotDef;
  player: Player | null;
  onClick: () => void;
}) {
  const filled = player !== null;
  const roleColor = filled && player ? (ROLE_COLORS[player.role] ?? "") : "";

  return (
    <motion.button
      whileHover={!filled ? { scale: 1.03 } : {}}
      whileTap={!filled ? { scale: 0.97 } : {}}
      onClick={!filled ? onClick : undefined}
      className={cn(
        "relative flex flex-col items-center justify-center rounded-2xl border-2 p-3 transition-all duration-200 text-center min-h-[110px] w-full",
        filled
          ? cn("cursor-default", roleColor)
          : slot.isBench
            ? "border-dashed border-border/30 bg-card/20 hover:border-border/60 hover:bg-card/40 cursor-pointer"
            : "border-dashed border-border/50 bg-card/30 hover:border-primary/50 hover:bg-card/60 cursor-pointer"
      )}
    >
      <span className={cn(
        "absolute top-2 left-2 text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded border",
        BADGE_COLORS[slot.short] ?? "bg-muted/20 text-muted-foreground border-muted/20"
      )}>
        {slot.short}
      </span>

      {filled && player ? (
        <div className="mt-2 flex flex-col items-center gap-0.5">
          <RoleIcon role={player.role} className="w-4 h-4 opacity-60 mb-1" />
          <p className="font-bold text-sm text-white leading-tight px-1">{player.name}</p>
          <p className="text-[10px] text-muted-foreground">{player.country}</p>
          <p className="text-[11px] font-black text-primary mt-1">OVR {Math.round(player.overallRating / 10)}</p>
        </div>
      ) : (
        <div className="mt-2 flex flex-col items-center gap-1">
          <Plus className="w-5 h-5 text-muted-foreground/40" />
          <p className="text-[10px] text-muted-foreground/50 font-medium leading-tight px-1">{slot.label}</p>
        </div>
      )}
    </motion.button>
  );
}


function SquadPreview({ label, picks, accent }: {
  label: string;
  picks: (Player | null)[];
  accent: string;
}) {
  const starting = picks.slice(0, 11).filter(Boolean) as Player[];
  const bench = picks.slice(11).filter(Boolean) as Player[];
  const [accentText, accentBorder] = accent.split(" ");

  return (
    <div className={cn("rounded-2xl border-t-4 bg-card p-5", accentBorder)}>
      <h3 className={cn("font-display font-black text-lg mb-4", accentText)}>{label}</h3>
      <div className="space-y-2">
        {starting.map((p, i) => (
          <div key={p.id} className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground w-5 text-right font-mono shrink-0">{i + 1}</span>
            <span className="flex-1 text-white font-medium">{p.name}</span>
            <span className="text-xs text-muted-foreground shrink-0">{p.country}</span>
            <span className="text-xs font-bold text-primary shrink-0 w-8 text-right">{Math.round(p.overallRating / 10)}</span>
          </div>
        ))}
      </div>
      {bench.length > 0 && (
        <div className="border-t border-border/30 mt-3 pt-3">
          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold mb-2">Bench</p>
          <div className="space-y-1.5">
            {bench.map(p => (
              <div key={p.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="flex-1">{p.name}</span>
                <span>{Math.round(p.overallRating / 10)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const HARRY_BROOK = {
  id: 9999,
  name: "Harry Brook",
  role: "batsman" as const,
  country: "England",
  battingRating: 930,
  bowlingRating: 120,
  keepingRating: 0,
  overallRating: 930,
  age: 26,
  salary: 0,
};

function BazBallAd() {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl mb-8 border border-green-500/25"
      style={{ background: "linear-gradient(135deg, #001a08 0%, #002d10 35%, #001a08 65%, #000e04 100%)" }}
    >
      {/* Background diagonal streaks */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.07] pointer-events-none" preserveAspectRatio="none" viewBox="0 0 800 160">
        <line x1="0"   y1="100" x2="800" y2="0"   stroke="#22c55e" strokeWidth="60" />
        <line x1="0"   y1="200" x2="800" y2="80"  stroke="#16a34a" strokeWidth="40" />
        <line x1="200" y1="200" x2="800" y2="20"  stroke="#4ade80" strokeWidth="25" />
      </svg>

      {/* Top "coming soon" ribbon */}
      <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.8), transparent)" }} />

      <div className="relative z-10 flex items-center justify-between px-6 py-6 md:px-10 md:py-8 gap-6">
        {/* Left — copy */}
        <div className="flex-1 min-w-0">
          <span className="inline-block text-[10px] font-black uppercase tracking-[0.2em] text-green-400 border border-green-500/40 bg-green-500/10 px-2.5 py-1 rounded-full mb-3">
            Coming Soon
          </span>
          <h2 className="text-4xl md:text-5xl font-display font-black leading-none">
            <span className="text-white">BAZ</span><span className="text-green-400">BALL</span>
          </h2>
          <p className="text-green-200/60 text-sm mt-2 max-w-xs leading-relaxed">
            England's most aggressive XI. Play bold. Play fearless.
          </p>

          {/* Confirmed label */}
          <div className="mt-5 flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-green-500/70">Confirmed</span>
            <div className="h-px flex-1 bg-green-500/20 max-w-[60px]" />
            <span className="text-xs font-bold text-white/80">Harry Brook</span>
            <span className="text-[10px] font-black text-green-400 bg-green-500/15 border border-green-500/30 px-1.5 py-0.5 rounded">93</span>
          </div>
        </div>

        {/* Right — card */}
        <div className="shrink-0">
          <CricketCard player={HARRY_BROOK} cardType="bazball" size="md" />
        </div>
      </div>

      {/* Bottom glow line */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px]" style={{ background: "linear-gradient(90deg, transparent, rgba(34,197,94,0.5), transparent)" }} />
    </motion.div>
  );
}
