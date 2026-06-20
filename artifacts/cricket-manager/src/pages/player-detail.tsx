import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CricketCard, type CardType } from "@/components/cricket-card";
import { ALL_PLAYERS_EXPORT, PRIME_PLAYERS, ICON_PLAYERS, TOTW_IDS, MW_IDS } from "@/lib/static-data";
import { getCollection } from "@/lib/game-store";

// ── Lookup ────────────────────────────────────────────────────────────────────

function findPlayer(id: number): { player: typeof ALL_PLAYERS_EXPORT[0]; cardType: CardType } | null {
  // Search in priority order: icon → prime → all (covers TOTW, MW, normal)
  const icon = ICON_PLAYERS.find(p => p.id === id);
  if (icon) return { player: icon, cardType: "icon" };

  const prime = PRIME_PLAYERS.find(p => p.id === id);
  if (prime) return { player: prime, cardType: "prime" };

  const normal = ALL_PLAYERS_EXPORT.find(p => p.id === id);
  if (normal) {
    const cardType: CardType = MW_IDS.has(id) ? "mw" : TOTW_IDS.has(id) ? "totw" : "normal";
    return { player: normal, cardType };
  }

  return null;
}

// ── Rating bar ────────────────────────────────────────────────────────────────

const STAT_COLORS: Record<string, { bar: string; glow: string }> = {
  batting:  { bar: "linear-gradient(90deg,#f59e0b,#fbbf24)", glow: "rgba(251,191,36,0.4)" },
  bowling:  { bar: "linear-gradient(90deg,#ef4444,#f87171)", glow: "rgba(239,68,68,0.4)" },
  keeping:  { bar: "linear-gradient(90deg,#a855f7,#c084fc)", glow: "rgba(168,85,247,0.4)" },
  overall:  { bar: "linear-gradient(90deg,#22c55e,#4ade80)", glow: "rgba(74,222,128,0.4)" },
};

function RatingBar({ label, value, max = 1000 }: { label: string; value: number; max?: number }) {
  const pct = Math.min((value / max) * 100, 100);
  const display = Math.round(value / 10);
  const key = label.toLowerCase();
  const colors = STAT_COLORS[key] ?? STAT_COLORS.overall;

  return (
    <div>
      <div className="flex justify-between items-center mb-1.5">
        <span className="text-xs font-black uppercase tracking-wider text-muted-foreground">{label}</span>
        <span className="text-sm font-black text-white tabular-nums">{display}</span>
      </div>
      <div className="h-2.5 rounded-full bg-white/8 overflow-hidden">
        <motion.div
          className="h-full rounded-full"
          style={{ background: colors.bar, boxShadow: `0 0 8px ${colors.glow}` }}
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

// ── Card type meta ────────────────────────────────────────────────────────────

const CARD_TYPE_META: Record<CardType, { label: string; color: string; bg: string; border: string }> = {
  icon:   { label: "Icon",          color: "#fde68a", bg: "rgba(120,80,0,0.3)",   border: "rgba(251,191,36,0.5)" },
  prime:  { label: "Prime",         color: "#fbbf24", bg: "rgba(80,50,0,0.3)",    border: "rgba(245,158,11,0.5)" },
  mw:     { label: "Match Winner",  color: "#fca5a5", bg: "rgba(80,8,8,0.4)",     border: "rgba(239,68,68,0.5)" },
  totw:   { label: "Team of Week",  color: "#93c5fd", bg: "rgba(26,79,216,0.3)",  border: "rgba(96,165,250,0.5)" },
  normal: { label: "Normal",        color: "#94a3b8", bg: "rgba(30,30,40,0.3)",   border: "rgba(100,116,139,0.4)" },
};

const ROLE_COLORS: Record<string, string> = {
  batsman:      "bg-blue-500/20 text-blue-300 border-blue-500/40",
  bowler:       "bg-red-500/20 text-red-300 border-red-500/40",
  allrounder:   "bg-green-500/20 text-green-300 border-green-500/40",
  wicketkeeper: "bg-purple-500/20 text-purple-300 border-purple-500/40",
};

const COUNTRY_FLAGS: Record<string, string> = {
  India: "\uD83C\uDDEE\uD83C\uDDF3",
  Australia: "\uD83C\uDDE6\uD83C\uDDFA",
  England: "\uD83C\uDDEC\uD83C\uDDE7",
  "New Zealand": "\uD83C\uDDF3\uD83C\uDDFF",
  Pakistan: "\uD83C\uDDF5\uD83C\uDDF0",
  "South Africa": "\uD83C\uDDFF\uD83C\uDDE6",
  "West Indies": "\uD83C\uDFF4",
  "Sri Lanka": "\uD83C\uDDF1\uD83C\uDDF0",
  Bangladesh: "\uD83C\uDDE7\uD83C\uDDE9",
  Afghanistan: "\uD83C\uDDE6\uD83C\uDDEB",
  Zimbabwe: "\uD83C\uDDFF\uD83C\uDDFC",
  Ireland: "\uD83C\uDDEE\uD83C\uDDEA",
  Netherlands: "\uD83C\uDDF3\uD83C\uDDF1",
};

// ── How-to-get info ───────────────────────────────────────────────────────────

function HowToGet({ cardType, id }: { cardType: CardType; id: number }) {
  const lines: string[] = [];

  if (cardType === "icon") lines.push("Complete the Icon Pick quest (win 3 matches)", "Win the Legends of the Game SBC");
  else if (cardType === "prime") {
    if (id >= 1003) lines.push("Pull from Special Pack (guaranteed)", "Pull from Gold Pack (rare chance)");
    else lines.push("Complete the matching SBC challenge");
  } else if (cardType === "mw") {
    lines.push("Open a Match Winners Pack", "Complete the Match Winner SBC");
    if (id === 762) lines.push("Complete the Stokes' Masterclass quest");
  } else if (cardType === "totw") {
    lines.push("Pull from Gold Pack (5% chance)");
  } else {
    const r = Math.round(id);
    if (r < 650 * 10) lines.push("Bronze Pack", "Mini Pack");
    else if (r < 750 * 10) lines.push("Silver Pack", "Mini Pack");
    else lines.push("Gold Pack", "Mini Pack", "Exploder Pack", "Special Pack");
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card p-4">
      <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">How to get</h3>
      <div className="flex flex-col gap-1.5">
        {lines.map(l => (
          <div key={l} className="flex items-center gap-2 text-sm text-white/80">
            <span className="text-primary text-xs">›</span>
            {l}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function PlayerDetail({ id: idStr }: { id: string }) {
  const [, navigate] = useLocation();
  const id = parseInt(idStr, 10);
  const result = findPlayer(id);

  if (!result || isNaN(id)) {
    return (
      <div className="max-w-lg mx-auto py-20 text-center">
        <div className="text-5xl mb-4">❓</div>
        <h1 className="text-2xl font-display font-black text-white mb-2">Player Not Found</h1>
        <button onClick={() => navigate("/cards")} className="text-primary font-bold hover:underline">← Back to Database</button>
      </div>
    );
  }

  const { player, cardType } = result;
  const typeMeta = CARD_TYPE_META[cardType];
  const flag = COUNTRY_FLAGS[player.country] ?? "🏳️";
  const collection = getCollection();
  const inCollection = collection.some(c => c.id === player.id);
  const copies = collection.filter(c => c.id === player.id).length;

  const roleLabel = player.role === "wicketkeeper" ? "Wicket-Keeper" :
    player.role.charAt(0).toUpperCase() + player.role.slice(1);

  const hasKeeping = (player.keepingRating ?? 0) > 0;
  const hasBowling = (player.bowlingRating ?? 0) > 50;

  return (
    <div className="max-w-3xl mx-auto py-8">
      {/* Back */}
      <motion.button
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        onClick={() => navigate("/cards")}
        className="flex items-center gap-2 text-muted-foreground hover:text-white text-sm font-bold uppercase tracking-wider mb-8 transition-colors"
      >
        ← Card Database
      </motion.button>

      <div className="grid grid-cols-1 md:grid-cols-[auto,1fr] gap-8 items-start">

        {/* Left: Card */}
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 20 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ y: [0, -8, 0] }}
            transition={{ repeat: Infinity, duration: 3.5, ease: "easeInOut" }}
          >
            <CricketCard player={player} cardType={cardType} size="lg" />
          </motion.div>

          {/* Collection badge */}
          {inCollection ? (
            <div className="flex items-center gap-2 bg-green-500/15 border border-green-500/35 rounded-xl px-4 py-2">
              <span className="text-green-400 text-sm font-black">✓ In Collection</span>
              {copies > 1 && <span className="text-green-400/60 text-xs font-bold">×{copies}</span>}
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-xl px-4 py-2">
              <span className="text-muted-foreground text-sm font-bold">Not in collection</span>
            </div>
          )}
        </motion.div>

        {/* Right: Info */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col gap-5"
        >
          {/* Header */}
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {/* Card type badge */}
              <span
                className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border"
                style={{ color: typeMeta.color, background: typeMeta.bg, borderColor: typeMeta.border }}
              >
                {typeMeta.label}
              </span>
              {/* Role badge */}
              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border ${ROLE_COLORS[player.role] ?? ""}`}>
                {roleLabel}
              </span>
            </div>
            <h1 className="text-4xl font-display font-black text-white leading-tight mt-2">
              {player.name}
            </h1>
            <div className="flex items-center gap-2 mt-2 text-muted-foreground text-sm font-bold">
              <span>{flag} {player.country}</span>
              <span className="opacity-40">·</span>
              <span>Age {player.age}</span>
              {(player.salary ?? 0) > 0 && (
                <>
                  <span className="opacity-40">·</span>
                  <span>🪙 {player.salary} salary</span>
                </>
              )}
            </div>
          </div>

          {/* Overall rating spotlight */}
          <div
            className="rounded-2xl p-5 flex items-center justify-between"
            style={{ background: typeMeta.bg, border: `1.5px solid ${typeMeta.border}` }}
          >
            <div>
              <div className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Overall Rating</div>
              <div className="text-6xl font-display font-black" style={{ color: typeMeta.color }}>
                {Math.round(player.overallRating / 10)}
              </div>
            </div>
            <div className="text-6xl opacity-30">{
              cardType === "icon" ? "👑" :
              cardType === "prime" ? "⭐" :
              cardType === "mw" ? "🏆" :
              cardType === "totw" ? "⚡" : "🏏"
            }</div>
          </div>

          {/* Ratings */}
          <div className="rounded-xl border border-border/40 bg-card p-5 flex flex-col gap-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground">Ratings</h3>
            <RatingBar label="Batting" value={player.battingRating ?? 0} />
            {hasBowling && <RatingBar label="Bowling" value={player.bowlingRating ?? 0} />}
            {hasKeeping && <RatingBar label="Keeping" value={player.keepingRating ?? 0} />}
            <div className="border-t border-border/30 pt-3 mt-1">
              <RatingBar label="Overall" value={player.overallRating} />
            </div>
          </div>

          {/* How to get */}
          <HowToGet cardType={cardType} id={player.id} />
        </motion.div>
      </div>
    </div>
  );
}
