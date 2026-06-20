import { useState, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CricketCard, type CardPlayer, type CardType } from "@/components/cricket-card";
import { getCoins, deductCoins, addToCollection, PACK_COSTS, getExploderCount, incrementExploderCount } from "@/lib/game-store";
import { ALL_PLAYERS_EXPORT, PRIME_PLAYERS, TOTW_IDS, MW_PLAYERS, MW_IDS } from "@/lib/static-data";

const ALL_PLAYERS: CardPlayer[] = ALL_PLAYERS_EXPORT;
// Pack-obtainable primes (ids 1003+)
const PACK_PRIMES: CardPlayer[] = PRIME_PLAYERS.filter(p => p.id >= 1003);

function getCardType(id: number): CardType {
  if (id >= 2000) return "icon";
  if (id >= 998) return "prime";
  if (TOTW_IDS.has(id)) return "totw";
  if (MW_IDS.has(id)) return "mw";
  return "normal";
}

const PACK_TYPES = [
  {
    id: "mini",
    name: "Mini Pack",
    desc: "6 players · 2 bronze · 2 silver · 2 gold",
    emoji: "🎁",
    gradientBg: "linear-gradient(145deg, rgba(30,80,30,0.45) 0%, rgba(15,50,15,0.25) 100%)",
    borderColor: "rgba(74,222,128,0.45)",
    glowColor: "rgba(34,197,94,0.3)",
    tier: "mini" as const,
  },
  {
    id: "bronze",
    name: "Bronze Pack",
    desc: "5 players · standard quality",
    emoji: "📦",
    gradientBg: "linear-gradient(145deg, rgba(120,53,15,0.45) 0%, rgba(92,40,10,0.25) 100%)",
    borderColor: "rgba(180,110,30,0.5)",
    glowColor: "rgba(180,83,9,0.35)",
    tier: "bronze" as const,
  },
  {
    id: "silver",
    name: "Silver Pack",
    desc: "5 players · good quality",
    emoji: "🥈",
    gradientBg: "linear-gradient(145deg, rgba(100,116,139,0.45) 0%, rgba(71,85,105,0.25) 100%)",
    borderColor: "rgba(148,163,184,0.5)",
    glowColor: "rgba(148,163,184,0.3)",
    tier: "silver" as const,
  },
  {
    id: "gold",
    name: "Gold Pack",
    desc: "5 players · elite quality",
    emoji: "🥇",
    gradientBg: "linear-gradient(145deg, rgba(161,98,7,0.5) 0%, rgba(133,77,14,0.28) 100%)",
    borderColor: "rgba(234,179,8,0.55)",
    glowColor: "rgba(234,179,8,0.4)",
    tier: "gold" as const,
  },
  {
    id: "special",
    name: "Special Pack",
    desc: "Guaranteed Prime card ⚡",
    emoji: "⚡",
    gradientBg: "linear-gradient(145deg, rgba(30,64,175,0.55) 0%, rgba(29,78,216,0.3) 100%)",
    borderColor: "rgba(96,165,250,0.65)",
    glowColor: "rgba(59,130,246,0.5)",
    tier: "special" as const,
  },
  {
    id: "mw",
    name: "Match Winners Pack",
    desc: "1 guaranteed MW card 🏆",
    emoji: "🏆",
    gradientBg: "linear-gradient(145deg, rgba(127,8,8,0.65) 0%, rgba(80,4,4,0.35) 100%)",
    borderColor: "rgba(239,68,68,0.65)",
    glowColor: "rgba(220,38,38,0.45)",
    tier: "mw" as const,
  },
  {
    id: "exploder",
    name: "Exploder Pack",
    desc: "4 golds · every 10th pack: a Prime or MW! 💥",
    emoji: "💥",
    gradientBg: "linear-gradient(145deg, rgba(88,28,135,0.6) 0%, rgba(59,7,100,0.35) 100%)",
    borderColor: "rgba(192,132,252,0.6)",
    glowColor: "rgba(168,85,247,0.45)",
    tier: "exploder" as const,
  },
];

type Tier = "mini" | "bronze" | "silver" | "gold" | "special" | "mw" | "exploder";

function pickPack(players: CardPlayer[], tier: Tier): CardPlayer[] {
  const shuffle = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  if (tier === "mini") {
    const bronzes = shuffle(players.filter(p => p.overallRating < 650)).slice(0, 2);
    const silvers = shuffle(players.filter(p => p.overallRating >= 650 && p.overallRating < 750)).slice(0, 2);
    const golds   = shuffle(players.filter(p => p.overallRating >= 750)).slice(0, 2);
    return shuffle([...bronzes, ...silvers, ...golds]);
  }

  if (tier === "exploder") {
    const count = incrementExploderCount();
    const golds = shuffle(players.filter(p => p.overallRating >= 750));
    const base = golds.slice(0, 4);
    if (count % 10 === 0) {
      // Every 10th pack: replace first gold with a prime or MW (50/50)
      const bonus = Math.random() < 0.5
        ? shuffle(PACK_PRIMES)[0]
        : shuffle([...MW_PLAYERS])[0];
      if (bonus) base[0] = bonus;
    }
    return base;
  }

  if (tier === "bronze") {
    return shuffle(players.filter((p) => p.overallRating < 650)).slice(0, 5);
  }
  if (tier === "silver") {
    return shuffle(players.filter((p) => p.overallRating >= 650 && p.overallRating < 750)).slice(0, 5);
  }
  if (tier === "gold") {
    const base = shuffle(players.filter((p) => p.overallRating >= 750)).slice(0, 5);
    const totwPool = players.filter(p => TOTW_IDS.has(p.id));
    const roll = Math.random();
    if (roll < 0.05 && totwPool.length > 0) {
      base[0] = shuffle(totwPool)[0];
    } else if (roll < 0.20 && PACK_PRIMES.length > 0) {
      base[0] = shuffle(PACK_PRIMES)[0];
    }
    return base;
  }
  if (tier === "mw") {
    const mw = shuffle([...MW_PLAYERS])[0];
    const goldFill = shuffle(players.filter((p) => p.overallRating >= 750)).slice(0, 4);
    return mw ? [mw, ...goldFill] : goldFill;
  }
  // Special: 1 guaranteed prime + 4 gold
  const prime = shuffle(PACK_PRIMES)[0];
  const usedId = prime?.id;
  const goldFill = shuffle(players.filter((p) => p.overallRating >= 750 && p.id !== usedId)).slice(0, 4);
  return prime ? [prime, ...goldFill] : goldFill;
}

type Phase = "idle" | "shaking" | "opening" | "reveal";

export default function Packs() {
  const [activePack, setActivePack] = useState<(typeof PACK_TYPES)[0] | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [openedCards, setOpenedCards] = useState<CardPlayer[]>([]);
  const [revealIndex, setRevealIndex] = useState(0);
  const [coins, setCoins] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    setCoins(getCoins());
  }, []);

  const players: CardPlayer[] = ALL_PLAYERS;

  const handleOpen = useCallback(
    (pack: (typeof PACK_TYPES)[0]) => {
      if (!players.length) return;
      const cost = PACK_COSTS[pack.id];
      const ok = deductCoins(cost);
      if (!ok) {
        setErrorMsg(`Not enough coins! You need ${cost} 🪙 to open a ${pack.name}.`);
        setTimeout(() => setErrorMsg(null), 3000);
        return;
      }
      const newCoins = getCoins();
      setCoins(newCoins);
      window.dispatchEvent(new Event("cm-coins-updated"));

      const cards = pickPack(players, pack.tier);
      addToCollection(cards);
      setOpenedCards(cards);
      setActivePack(pack);
      setRevealIndex(0);
      setPhase("shaking");
      setTimeout(() => setPhase("opening"), 900);
      setTimeout(() => {
        setPhase("reveal");
        setRevealIndex(1);
      }, 1600);
    },
    [players]
  );

  const handleRevealNext = useCallback(() => {
    setRevealIndex((prev) => Math.min(prev + 1, openedCards.length));
  }, [openedCards.length]);

  const handleClose = () => {
    setActivePack(null);
    setPhase("idle");
    setOpenedCards([]);
    setRevealIndex(0);
  };

  const allRevealed = revealIndex >= openedCards.length && openedCards.length > 0;

  return (
    <div className="max-w-5xl mx-auto py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-4"
      >
        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-white">
          OPEN <span className="text-primary">PACKS</span>
        </h1>
        <p className="text-muted-foreground mt-3 text-lg">
          Discover new players. Pull your dream squad.
        </p>
      </motion.div>

      {/* TOTW Showcase — top of page */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-4">
          <span className="text-xl">⚡</span>
          <div>
            <h2 className="text-base font-display font-black text-white">Team of the Week</h2>
            <p className="text-xs text-muted-foreground">Pullable from Gold Packs (5% chance)</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 justify-center">
          {ALL_PLAYERS_EXPORT.filter(p => TOTW_IDS.has(p.id)).map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1">
              <CricketCard player={p} cardType="totw" size="sm" />
              <span className="text-[9px] font-black text-sky-400 uppercase tracking-wider">{Math.round(p.overallRating / 10)} OVR</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Coin balance */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex justify-center mb-10"
      >
        <div className="flex items-center gap-2 bg-card border border-border/40 rounded-2xl px-6 py-3">
          <span className="text-2xl">🪙</span>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Your Coins</div>
            <div className="text-2xl font-display font-black text-primary">{coins.toLocaleString()}</div>
          </div>
        </div>
      </motion.div>

      {/* Error toast */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-destructive text-white font-bold px-6 py-3 rounded-xl shadow-xl text-sm"
          >
            {errorMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pack grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {PACK_TYPES.map((pack, i) => {
          const cost = PACK_COSTS[pack.id];
          const canAfford = coins >= cost;
          return (
            <motion.button
              key={pack.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              onClick={() => handleOpen(pack)}
              disabled={false}
              className="group relative rounded-2xl p-6 flex flex-col items-center gap-4 transition-all duration-300 hover:scale-105 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed text-left"
              style={{
                background: pack.gradientBg,
                border: `1.5px solid ${pack.borderColor}`,
                boxShadow: `0 0 20px ${pack.glowColor}`,
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 36px ${pack.glowColor}`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.boxShadow = `0 0 20px ${pack.glowColor}`;
              }}
            >
              <motion.span
                className="text-7xl"
                animate={{ rotate: [0, -4, 4, 0] }}
                transition={{ repeat: Infinity, duration: 4 + i * 0.5, ease: "easeInOut" }}
              >
                {pack.emoji}
              </motion.span>

              <div className="text-center">
                <h3 className="font-display font-black text-white text-xl leading-tight">
                  {pack.name}
                </h3>
                <p className="text-white/60 text-sm mt-1.5 leading-snug">{pack.desc}</p>
              </div>

              {/* Cost badge */}
              <div className={`flex items-center gap-1.5 px-4 py-1.5 rounded-xl text-sm font-black border transition-colors ${
                canAfford
                  ? "bg-black/30 border-white/20 text-white"
                  : "bg-black/30 border-red-500/40 text-red-400"
              }`}>
                <span>🪙</span>
                <span>{cost}</span>
                {!canAfford && <span className="text-red-400 ml-1 text-xs">(not enough)</span>}
              </div>

              <div
                className="px-5 py-2 rounded-xl font-black text-sm text-white transition-all duration-200 group-hover:brightness-125"
                style={{ background: "rgba(255,255,255,0.12)" }}
              >
                Open Pack
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Match Winners Showcase */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12"
      >
        <div className="flex items-center gap-3 mb-5">
          <span className="text-2xl">🏆</span>
          <div>
            <h2 className="text-lg font-display font-black text-white">Match Winners</h2>
            <p className="text-xs text-muted-foreground">Exclusive MW cards — open a Match Winners Pack or complete SBCs &amp; Quests</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-4 justify-center">
          {MW_PLAYERS.map(p => (
            <div key={p.id} className="flex flex-col items-center gap-1.5">
              <CricketCard player={p} cardType="mw" size="md" />
              <span className="text-[10px] font-black text-red-400 uppercase tracking-wider">MW</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* How to earn coins */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mt-12 bg-card border border-border/40 rounded-2xl p-6"
      >
        <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">How to Earn Coins</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          {[
            { label: "Win 2-over match", reward: "+50 🪙" },
            { label: "Win 5-over match", reward: "+100 🪙" },
            { label: "Win 10-over match", reward: "+150 🪙" },
            { label: "Career 1st place", reward: "+300 🪙" },
          ].map(item => (
            <div key={item.label} className="bg-background rounded-xl p-3">
              <div className="text-xs text-muted-foreground mb-1">{item.label}</div>
              <div className="font-display font-black text-primary text-lg">{item.reward}</div>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Pack opening overlay */}
      <AnimatePresence>
        {activePack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/92 backdrop-blur-sm"
            onClick={phase === "reveal" && !allRevealed ? handleRevealNext : undefined}
          >
            <div className="relative w-full max-w-4xl mx-4 flex flex-col items-center">

              {allRevealed && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  onClick={handleClose}
                  className="absolute -top-10 right-0 text-white/50 hover:text-white text-sm font-bold uppercase tracking-widest transition-colors"
                >
                  ✕ Close
                </motion.button>
              )}

              {(phase === "shaking" || phase === "opening") && (
                <motion.div
                  className="flex flex-col items-center gap-6"
                  animate={
                    phase === "shaking"
                      ? { rotate: [-4, 4, -3, 3, -2, 2, -1, 1, 0], scale: [1, 1.06, 1.04, 1.06, 1] }
                      : { scale: [1, 1.3, 0.1], opacity: [1, 1, 0], rotate: [0, 15] }
                  }
                  transition={{ duration: phase === "shaking" ? 0.75 : 0.45, ease: "easeOut" }}
                >
                  <span className="text-[130px] drop-shadow-2xl">{activePack.emoji}</span>
                  <motion.p
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ repeat: Infinity, duration: 0.8 }}
                    className="text-white/60 font-black text-sm uppercase tracking-[0.3em]"
                  >
                    Opening…
                  </motion.p>
                </motion.div>
              )}

              {phase === "reveal" && (
                <div className="flex flex-col items-center gap-8 w-full">
                  <div className="flex flex-wrap justify-center gap-4">
                    {openedCards.map((card, idx) => {
                      const cardType = getCardType(card.id);
                      const visible = idx < revealIndex;
                      return (
                        <AnimatePresence key={card.id + "-" + idx}>
                          {visible && (
                            <motion.div
                              initial={{ rotateY: 90, opacity: 0, scale: 0.75 }}
                              animate={{ rotateY: 0, opacity: 1, scale: 1 }}
                              transition={{ duration: 0.38, type: "spring", stiffness: 220, damping: 18 }}
                            >
                              <CricketCard
                                player={card}
                                cardType={cardType}
                                size="md"
                              />
                            </motion.div>
                          )}
                        </AnimatePresence>
                      );
                    })}
                  </div>

                  {!allRevealed ? (
                    <motion.p
                      animate={{ opacity: [0.5, 1, 0.5] }}
                      transition={{ repeat: Infinity, duration: 1.4 }}
                      className="text-white/55 text-sm font-black uppercase tracking-[0.25em] select-none"
                    >
                      Tap to reveal · {revealIndex} / {openedCards.length}
                    </motion.p>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-center space-y-4"
                    >
                      <p className="font-display font-black text-3xl text-primary">Pack Opened! 🎉</p>
                      <p className="text-muted-foreground text-sm">Cards added to My Team</p>
                      <button
                        onClick={handleClose}
                        className="px-8 py-3 bg-primary text-black font-black text-sm uppercase tracking-wider rounded-xl hover:brightness-110 transition-all"
                      >
                        Open Another Pack
                      </button>
                    </motion.div>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
