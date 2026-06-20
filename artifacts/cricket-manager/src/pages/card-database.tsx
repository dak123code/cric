import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { CricketCard, type CardPlayer, type CardType } from "@/components/cricket-card";
import { ALL_PLAYERS_EXPORT, PRIME_PLAYERS, ICON_PLAYERS, TOTW_IDS, MW_IDS } from "@/lib/static-data";

// Combine all players: regular + prime + icons, sorted by rating desc
const ALL_CARDS: (CardPlayer & { _cardType: CardType })[] = [
  ...ICON_PLAYERS.map(p => ({ ...p, _cardType: "icon" as CardType })),
  ...PRIME_PLAYERS.map(p => ({ ...p, _cardType: "prime" as CardType })),
  ...ALL_PLAYERS_EXPORT.map(p => ({
    ...p,
    _cardType: (MW_IDS.has(p.id) ? "mw" : TOTW_IDS.has(p.id) ? "totw" : "normal") as CardType,
  })),
].sort((a, b) => b.overallRating - a.overallRating);

const ROLES = [
  { id: "all", label: "All" },
  { id: "batsman", label: "Batsmen" },
  { id: "bowler", label: "Bowlers" },
  { id: "allrounder", label: "All-Rounders" },
  { id: "wicketkeeper", label: "WK" },
];

export default function CardDatabase() {
  const [, navigate] = useLocation();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [sortBy, setSortBy] = useState<"rating" | "name">("rating");

  const totwCards = ALL_CARDS.filter((p) => TOTW_IDS.has(p.id))
    .sort((a, b) => b.overallRating - a.overallRating);

  const filtered = useMemo(() => {
    let result = ALL_CARDS.filter((p) => !TOTW_IDS.has(p.id));
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((p) => p.name.toLowerCase().includes(q));
    }
    if (roleFilter !== "all") {
      result = result.filter((p) => p.role === roleFilter);
    }
    if (sortBy === "rating") {
      result = [...result].sort((a, b) => b.overallRating - a.overallRating);
    } else {
      result = [...result].sort((a, b) => a.name.localeCompare(b.name));
    }
    return result;
  }, [search, roleFilter, sortBy]);

  return (
    <div className="max-w-7xl mx-auto py-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-5xl md:text-6xl font-display font-black tracking-tight text-white">
          CARD <span className="text-primary">DATABASE</span>
        </h1>
        <p className="text-muted-foreground mt-2">
          {ALL_CARDS.length} players — Icons, Primes &amp; TOTW included
        </p>
      </motion.div>

      {/* TOTW Feature Cards */}
      {totwCards.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 justify-center mb-5">
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-r from-transparent to-blue-500/50" />
            <span className="text-xs font-black uppercase tracking-[0.25em] text-blue-400">
              ⚡ Team of the Week
            </span>
            <div className="h-px flex-1 max-w-[120px] bg-gradient-to-l from-transparent to-blue-500/50" />
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {totwCards.map((card, i) => (
              <motion.div
                key={card.id}
                animate={{ y: [0, -6, 0] }}
                transition={{ repeat: Infinity, duration: 3, ease: "easeInOut", delay: i * 0.4 }}
                className="cursor-pointer"
                onClick={() => navigate(`/cards/${card.id}`)}
                whileHover={{ scale: 1.06 }}
              >
                <CricketCard
                  player={card}
                  cardType="totw"
                  size="sm"
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-4 mb-8">
        <div className="h-px flex-1 bg-border/40" />
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          All Cards
        </span>
        <div className="h-px flex-1 bg-border/40" />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="flex flex-wrap gap-3 justify-center mb-8"
      >
        {/* Search */}
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search player…"
          className="bg-card border border-border/50 text-white placeholder-muted-foreground rounded-xl px-4 py-2 text-sm focus:outline-none focus:border-primary/60 w-48"
        />

        {/* Role filter */}
        <div className="flex gap-1.5 flex-wrap justify-center">
          {ROLES.map((r) => (
            <button
              key={r.id}
              onClick={() => setRoleFilter(r.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                roleFilter === r.id
                  ? "bg-primary text-black"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-white"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Sort */}
        <div className="flex gap-1.5">
          {(["rating", "name"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setSortBy(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                sortBy === s
                  ? "bg-accent text-black"
                  : "bg-card border border-border/50 text-muted-foreground hover:text-white"
              }`}
            >
              {s === "rating" ? "By Rating" : "A – Z"}
            </button>
          ))}
        </div>

        {/* Count */}
        <span className="text-xs text-muted-foreground self-center">
          {filtered.length} cards
        </span>
      </motion.div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20 text-muted-foreground text-lg">
          No players match your search.
        </div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3 md:gap-4"
        >
          {filtered.map((player, i) => (
            <motion.div
              key={player.id + "-" + player._cardType}
              initial={{ opacity: 0, scale: 0.88 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: Math.min(i * 0.018, 0.5) }}
              className="cursor-pointer"
              onClick={() => navigate(`/cards/${player.id}`)}
              whileHover={{ scale: 1.05, y: -4 }}
              whileTap={{ scale: 0.97 }}
            >
              <CricketCard player={player} cardType={player._cardType} size="sm" />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}
