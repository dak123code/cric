import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { CricketCard } from "@/components/cricket-card";
import { TOTW_IDS, MW_IDS, PRIME_PLAYERS, ICON_PLAYERS } from "@/lib/static-data";
import type { Player } from "@/lib/static-data";

const PRIME_IDS = new Set(PRIME_PLAYERS.map(p => p.id));
const ICON_IDS  = new Set(ICON_PLAYERS.map(p => p.id));
const MW_ICON_IDS = new Set([763, 767]);

function getCardType(player: Player) {
  if (MW_ICON_IDS.has(player.id)) return "mw-icon" as const;
  if (ICON_IDS.has(player.id))    return "icon"    as const;
  if (PRIME_IDS.has(player.id))   return "prime"   as const;
  if (MW_IDS.has(player.id))      return "mw"      as const;
  if (TOTW_IDS.has(player.id))    return "totw"    as const;
  return "normal" as const;
}

// ── Coin ────────────────────────────────────────────────────────────

type TossStage = "intro" | "spinning" | "result";

function TossCoin({ stage, winner }: { stage: TossStage; winner: 1 | 2 | null }) {
  // 1440 = 4×360 → lands on 0° (heads/P1); 1620 = 4.5×360 → lands on 180° (tails/P2)
  const targetRotation = winner === 2 ? 1620 : 1440;

  return (
    <div style={{ perspective: "600px" }} className="w-28 h-28 flex items-center justify-center">
      <motion.div
        key={stage === "intro" ? "idle" : "active"}
        className="w-28 h-28 relative"
        style={{ transformStyle: "preserve-3d" }}
        initial={{ rotateY: 0, y: 0, scale: 1 }}
        animate={
          stage === "intro"
            ? { y: [0, -10, 0], transition: { repeat: Infinity, duration: 2.4, ease: "easeInOut" } }
            : stage === "spinning"
              ? { rotateY: targetRotation, transition: { duration: 2.5, ease: [0.3, 0, 0.3, 1] } }
              : { scale: [1, 1.18, 1], transition: { duration: 0.5, ease: "easeOut" } }
        }
      >
        {/* Heads — P1 gold */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5"
          style={{
            backfaceVisibility: "hidden",
            background: "radial-gradient(circle at 38% 35%, #fde68a, #f59e0b 55%, #78350f)",
            boxShadow: "inset -5px -5px 16px rgba(0,0,0,0.45), inset 4px 4px 12px rgba(255,255,255,0.4), 0 0 28px rgba(251,191,36,0.45)",
          }}
        >
          <span className="text-3xl leading-none select-none">🏏</span>
          <span className="text-[9px] font-black text-yellow-900/80 uppercase tracking-widest">P1</span>
        </div>
        {/* Tails — P2 silver */}
        <div
          className="absolute inset-0 rounded-full flex flex-col items-center justify-center gap-0.5"
          style={{
            backfaceVisibility: "hidden",
            transform: "rotateY(180deg)",
            background: "radial-gradient(circle at 38% 35%, #e2e8f0, #94a3b8 55%, #1e293b)",
            boxShadow: "inset -5px -5px 16px rgba(0,0,0,0.45), inset 4px 4px 12px rgba(255,255,255,0.4), 0 0 20px rgba(148,163,184,0.35)",
          }}
        >
          <span className="text-3xl leading-none select-none">🏏</span>
          <span className="text-[9px] font-black text-slate-800/80 uppercase tracking-widest">P2</span>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ──────────────────────────────────────────────────

export interface TossCutsceneProps {
  /** Highest-rated player from each side, used as the "captain" card. */
  captain1: Player | null;
  captain2: Player | null;
  /** Display labels shown above each captain. */
  label1?: string;
  label2?: string;
  /**
   * When true, show Bat / Bowl choice buttons after the winner is revealed.
   * When false (auto-sim draft), show a single "Start Match" button instead.
   */
  showBatChoice?: boolean;
  /**
   * In 1-player mode the user is always P1 and the coin always lands on P1.
   * (Preserves existing UX where "you always win the toss".)
   */
  is1P?: boolean;
  /**
   * Called when the cutscene is complete.
   * `team1BatsFirst` = true if team-1 bats first.
   * In no-choice mode (showBatChoice=false) the value is always true but callers can ignore it.
   */
  onComplete: (team1BatsFirst: boolean) => void;
}

export function TossCutscene({
  captain1,
  captain2,
  label1 = "Player 1",
  label2 = "Player 2",
  showBatChoice = false,
  is1P = false,
  onComplete,
}: TossCutsceneProps) {
  const [stage, setStage] = useState<TossStage>("intro");
  const [winner, setWinner] = useState<1 | 2 | null>(null);
  const [batsFirst, setBatsFirst] = useState<1 | 2 | null>(null);

  const handleFlip = () => {
    // 1P: user (P1) always wins the toss, consistent with prior behaviour.
    const w: 1 | 2 = is1P ? 1 : (Math.random() < 0.5 ? 1 : 2);
    setWinner(w);

    if (!showBatChoice) {
      // Auto-sim: P1 bats first by convention; caller ignores the value anyway.
      setBatsFirst(1);
    }

    setStage("spinning");
    setTimeout(() => setStage("result"), 2800);
  };

  const handleBatChoice = (winnerBatsFirst: boolean) => {
    // Translate "winner bats first" into "team-1 bats first"
    const team1Bats = winner === 1 ? winnerBatsFirst : !winnerBatsFirst;
    setBatsFirst(team1Bats ? 1 : 2);
    onComplete(team1Bats);
  };

  const p1Glow = stage === "result" && winner === 1;
  const p2Glow = stage === "result" && winner === 2;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center overflow-hidden"
      style={{ background: "radial-gradient(ellipse at 50% 0%, #0c0c24 0%, #050510 55%, #080508 100%)" }}
    >
      {/* Subtle grid texture */}
      <div
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, y: -24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-center mb-10 relative z-10"
      >
        <p className="text-[10px] font-black uppercase tracking-[0.35em] text-primary/60 mb-1">Pre-Match</p>
        <h1 className="text-5xl md:text-6xl font-display font-black text-white tracking-widest drop-shadow-lg">
          THE TOSS
        </h1>
      </motion.div>

      {/* Main row: Captain 1 | Coin | Captain 2 */}
      <div className="relative z-10 flex items-center gap-6 md:gap-12 w-full max-w-3xl px-4">

        {/* ── Captain 1 ── */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", damping: 22 }}
          className="flex flex-col items-center gap-2 flex-1"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-primary/70">{label1}</p>
          <p className="text-xs font-bold text-white/60 mb-1">Captain</p>
          {captain1 && (
            <motion.div
              animate={p1Glow ? { y: -6 } : { y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl transition-all duration-500",
                p1Glow
                  ? "ring-4 ring-green-400/70 ring-offset-4 ring-offset-transparent shadow-[0_0_50px_rgba(74,222,128,0.55)]"
                  : p2Glow
                    ? "opacity-35 scale-95"
                    : ""
              )}
            >
              <CricketCard player={captain1} cardType={getCardType(captain1)} size="sm" />
            </motion.div>
          )}
          <AnimatePresence>
            {p1Glow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-green-400 font-black text-xs bg-green-500/15 border border-green-500/30 px-3 py-1 rounded-full mt-1"
              >
                WON TOSS ✓
              </motion.div>
            )}
          </AnimatePresence>
          {captain1 && (
            <p className="text-xs text-white/50 font-semibold text-center leading-tight mt-1 px-2">
              {captain1.name}
            </p>
          )}
        </motion.div>

        {/* ── Center: VS + Coin + controls ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.7 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.5, type: "spring", damping: 18 }}
          className="flex flex-col items-center gap-5 shrink-0"
        >
          <AnimatePresence>
            {stage === "intro" && (
              <motion.div
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.3 }}
                className="text-lg font-black text-white/30 tracking-[0.2em] uppercase"
              >
                vs
              </motion.div>
            )}
          </AnimatePresence>

          <TossCoin stage={stage} winner={winner} />

          {/* Controls below coin */}
          <div className="min-h-[80px] flex flex-col items-center justify-center">
            <AnimatePresence mode="wait">
              {stage === "intro" && (
                <motion.button
                  key="flip-btn"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ delay: 0.7 }}
                  onClick={handleFlip}
                  className="px-7 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-[0_0_24px_rgba(74,222,128,0.45)]"
                >
                  Flip Coin
                </motion.button>
              )}

              {stage === "spinning" && (
                <motion.p
                  key="flipping"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: [0.4, 1, 0.4] }}
                  transition={{ repeat: Infinity, duration: 0.7 }}
                  className="text-xs text-muted-foreground font-black uppercase tracking-widest"
                >
                  Flipping...
                </motion.p>
              )}

              {stage === "result" && (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-center space-y-3"
                >
                  {showBatChoice ? (
                    /* Interactive: winner chooses bat or bowl */
                    <>
                      <p className="text-white/70 text-xs font-bold uppercase tracking-widest">
                        {winner === 1 ? label1 : label2} choose:
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => handleBatChoice(true)}
                          className="px-5 py-2 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-primary/90 active:scale-95 transition-all"
                        >
                          🏏 Bat
                        </button>
                        <button
                          onClick={() => handleBatChoice(false)}
                          className="px-5 py-2 bg-white/10 text-white font-black text-xs uppercase tracking-widest rounded-full hover:bg-white/20 active:scale-95 transition-all border border-white/20"
                        >
                          🎯 Bowl
                        </button>
                      </div>
                    </>
                  ) : (
                    /* Auto-sim: just show a start button */
                    <>
                      <p className="text-white font-black text-sm">
                        {winner === 1 ? label1 : label2} <span className="text-primary">won the toss</span>
                      </p>
                      <button
                        onClick={() => onComplete(batsFirst === 1)}
                        className="px-7 py-2.5 bg-primary text-black font-black text-xs uppercase tracking-widest rounded-full hover:bg-primary/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(74,222,128,0.4)]"
                      >
                        Start Match →
                      </button>
                    </>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ── Captain 2 ── */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3, type: "spring", damping: 22 }}
          className="flex flex-col items-center gap-2 flex-1"
        >
          <p className="text-[10px] font-black uppercase tracking-widest text-blue-400/70">{label2}</p>
          <p className="text-xs font-bold text-white/60 mb-1">Captain</p>
          {captain2 && (
            <motion.div
              animate={p2Glow ? { y: -6 } : { y: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                "rounded-2xl transition-all duration-500",
                p2Glow
                  ? "ring-4 ring-blue-400/70 ring-offset-4 ring-offset-transparent shadow-[0_0_50px_rgba(96,165,250,0.55)]"
                  : p1Glow
                    ? "opacity-35 scale-95"
                    : ""
              )}
            >
              <CricketCard player={captain2} cardType={getCardType(captain2)} size="sm" />
            </motion.div>
          )}
          <AnimatePresence>
            {p2Glow && (
              <motion.div
                initial={{ opacity: 0, scale: 0.6, y: 4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="text-blue-400 font-black text-xs bg-blue-500/15 border border-blue-500/30 px-3 py-1 rounded-full mt-1"
              >
                WON TOSS ✓
              </motion.div>
            )}
          </AnimatePresence>
          {captain2 && (
            <p className="text-xs text-white/50 font-semibold text-center leading-tight mt-1 px-2">
              {captain2.name}
            </p>
          )}
        </motion.div>
      </div>

      {/* Ambient glow spots */}
      <div
        className="absolute left-[12%] top-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(74,222,128,0.8) 0%, transparent 70%)" }}
      />
      <div
        className="absolute right-[12%] top-1/2 -translate-y-1/2 w-64 h-64 rounded-full opacity-10 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(96,165,250,0.8) 0%, transparent 70%)" }}
      />
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full opacity-20 pointer-events-none"
        style={{ background: "radial-gradient(circle, rgba(251,191,36,0.6) 0%, transparent 70%)" }}
      />
    </motion.div>
  );
}
