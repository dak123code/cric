import { Link } from "wouter";
import { motion } from "framer-motion";
import { hasUnlock, QUEST_DEFINITIONS, SBC_DEFINITIONS, getWins } from "@/lib/game-store";

const MODES = [
  {
    href: "/career",
    title: "Career Mode",
    desc: "Lead an IPL franchise across multiple seasons to ultimate glory.",
    color: "from-primary/30 to-background",
    border: "hover:border-primary/50",
    delay: 0.08,
  },
  {
    href: "/draft-ai",
    title: "Draft vs AI",
    desc: "Build your dream XI from a random pool and face an AI opponent.",
    color: "from-accent/30 to-background",
    border: "hover:border-accent/50",
    delay: 0.14,
  },
  {
    href: "/draft-2p",
    title: "2-Player Draft",
    desc: "Take turns drafting your squad against a friend locally.",
    color: "from-blue-500/30 to-background",
    border: "hover:border-blue-500/50",
    delay: 0.2,
  },
  {
    href: "/quick-match",
    title: "Quick Match",
    desc: "Pick two international teams and simulate a T20 thriller.",
    color: "from-red-500/30 to-background",
    border: "hover:border-red-500/50",
    delay: 0.26,
  },
  {
    href: "/packs",
    title: "Open Packs",
    desc: "Pull Bronze, Silver, Gold or Special packs to discover new player cards.",
    color: "from-yellow-500/25 to-background",
    border: "hover:border-yellow-500/50",
    delay: 0.32,
    badge: "⚡ NEW",
    badgeColor: "bg-yellow-400 text-black",
  },
  {
    href: "/cards",
    title: "Card Database",
    desc: "Browse all 147 player cards including Travis Head's exclusive TOTW card.",
    color: "from-blue-500/25 to-background",
    border: "hover:border-blue-400/60",
    delay: 0.38,
    badge: "⚡ NEW",
    badgeColor: "bg-blue-400 text-black",
  },
];

export default function Home() {
  return (
    <div className="space-y-12 py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-2xl mx-auto"
      >
        <h1 className="text-5xl md:text-7xl font-display font-black tracking-tight text-white mb-4">
          BUILD YOUR <span className="text-primary">LEGACY</span>
        </h1>
        <p className="text-xl text-muted-foreground">
          Experience the thrill of cricket management. Draft players, simulate matches,
          open packs, and conquer the championships.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {MODES.map((mode) => (
          <motion.div
            key={mode.href}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: mode.delay }}
          >
            <Link href={mode.href} className="block group">
              <div
                className={`relative h-52 rounded-[2rem] overflow-hidden border border-border/50 ${mode.border} transition-all duration-500 shadow-2xl`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${mode.color} z-10`} />
                <img
                  src={`${import.meta.env.BASE_URL}images/hero-stadium.png`}
                  alt="Stadium"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 mix-blend-luminosity opacity-40"
                />
                {"badge" in mode && mode.badge && (
                  <div className="absolute top-4 right-4 z-30">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-lg ${mode.badgeColor}`}
                    >
                      {mode.badge}
                    </span>
                  </div>
                )}
                <div className="absolute inset-0 z-20 p-7 flex flex-col justify-end">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-white group-hover:text-white transition-colors">
                    {mode.title}
                  </h2>
                  <p className="text-white/70 mt-2 text-base leading-relaxed">{mode.desc}</p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* ── SBCs ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-black text-white">Squad Building Challenges</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Submit players from your collection to unlock Prime cards.</p>
          </div>
          <Link href="/sbcs" className="text-sm font-black text-amber-400 hover:text-amber-300 transition-colors uppercase tracking-wider">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {SBC_DEFINITIONS.map((sbc) => {
            const done = hasUnlock(sbc.id);
            return (
              <Link href="/sbcs" key={sbc.id} className="block group">
                <div
                  className="rounded-2xl border p-4 h-full transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: done
                      ? "linear-gradient(145deg, rgba(20,40,20,0.6), rgba(10,25,10,0.4))"
                      : "linear-gradient(145deg, rgba(61,42,0,0.5), rgba(30,20,0,0.35))",
                    borderColor: done ? "rgba(74,222,128,0.35)" : "rgba(251,191,36,0.3)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span>{done ? "✅" : "🧩"}</span>
                    <span className="font-black text-white text-sm">{sbc.name}</span>
                    {done && (
                      <span className="ml-auto text-[9px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-1.5 py-0.5 rounded uppercase">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{sbc.description}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>

      {/* ── Quests ── */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55 }}
        className="max-w-6xl mx-auto"
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-display font-black text-white">Quests</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Complete match objectives to unlock exclusive Prime rewards.</p>
          </div>
          <Link href="/quests" className="text-sm font-black text-blue-400 hover:text-blue-300 transition-colors uppercase tracking-wider">
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {QUEST_DEFINITIONS.map((quest) => {
            const done = hasUnlock(quest.id);
            const isIcon = quest.isIconPick;
            const wins = getWins();
            const required = quest.winsRequired ?? 1;
            const progress = isIcon ? Math.min(wins / required, 1) : (done ? 1 : 0);
            return (
              <Link href="/quests" key={quest.id} className="block group">
                <div
                  className="rounded-2xl border p-4 transition-all duration-300 group-hover:scale-[1.02]"
                  style={{
                    background: done
                      ? isIcon
                        ? "linear-gradient(145deg, rgba(40,10,60,0.7), rgba(20,5,35,0.5))"
                        : "linear-gradient(145deg, rgba(20,40,20,0.6), rgba(10,25,10,0.4))"
                      : "linear-gradient(145deg, rgba(15,25,50,0.6), rgba(10,15,35,0.4))",
                    borderColor: done
                      ? isIcon ? "rgba(192,132,252,0.45)" : "rgba(74,222,128,0.35)"
                      : "rgba(96,165,250,0.25)",
                  }}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg">{done ? (isIcon ? "⭐" : "✅") : "🎯"}</span>
                    <span className="font-black text-white text-sm">{quest.name}</span>
                    {done && (
                      <span className={`ml-auto text-[9px] font-black px-1.5 py-0.5 rounded uppercase border ${isIcon ? "bg-purple-500/20 text-purple-300 border-purple-500/30" : "bg-green-500/20 text-green-400 border-green-500/30"}`}>
                        {isIcon ? "Unlocked" : "Complete"}
                      </span>
                    )}
                    {!done && isIcon && (
                      <span className="ml-auto text-[9px] font-black text-blue-400">{wins}/{required} wins</span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">{quest.description}</p>
                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${progress * 100}%`,
                        background: done
                          ? isIcon
                            ? "linear-gradient(90deg,#c084fc,#a855f7)"
                            : "linear-gradient(90deg,#4ade80,#22c55e)"
                          : "linear-gradient(90deg,#3b82f6,#1d4ed8)",
                      }}
                    />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
