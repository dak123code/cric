import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CricketCard, type CardType } from "@/components/cricket-card";
import { getCoins, getCollection, type CollectedCard } from "@/lib/game-store";
import { TOTW_IDS, MW_IDS } from "@/lib/static-data";
import { Link } from "wouter";

function getCardType(id: number): CardType {
  if (id >= 2000) return "icon";
  if (id >= 998) return "prime";
  if (TOTW_IDS.has(id)) return "totw";
  if (MW_IDS.has(id)) return "mw";
  return "normal";
}

function r10(v: number) { return Math.min(99, Math.ceil(v / 10)); }

function lastName(name: string) {
  const parts = name.trim().split(" ");
  return parts[parts.length - 1];
}

// ── Formations ────────────────────────────────────────────────────────────────

type FormationKey = "4-3-4" | "5-2-4" | "6-1-4" | "5-1-5" | "6-2-3";

const FORMATIONS: Record<FormationKey, { bat: number; ar: number; bowl: number }> = {
  "4-3-4": { bat: 4, ar: 3, bowl: 4 },
  "5-2-4": { bat: 5, ar: 2, bowl: 4 },
  "6-1-4": { bat: 6, ar: 1, bowl: 4 },
  "5-1-5": { bat: 5, ar: 1, bowl: 5 },
  "6-2-3": { bat: 6, ar: 2, bowl: 3 },
};

type SlotRole = "batsman" | "allrounder" | "bowler";

interface LineupSlot {
  role: SlotRole;
  player: CollectedCard | null;
}

function buildLineup(formation: FormationKey): LineupSlot[] {
  const { bat, ar, bowl } = FORMATIONS[formation];
  const slots: LineupSlot[] = [];
  for (let i = 0; i < bat; i++) slots.push({ role: "batsman", player: null });
  for (let i = 0; i < ar; i++) slots.push({ role: "allrounder", player: null });
  for (let i = 0; i < bowl; i++) slots.push({ role: "bowler", player: null });
  return slots;
}

// ── Pitch badge ───────────────────────────────────────────────────────────────

const BADGE_COLORS: Record<CardType, { bg: string; border: string; ratingColor: string; glow: string }> = {
  normal:  { bg: "#1e293b", border: "#64748b", ratingColor: "#f1f5f9", glow: "rgba(100,116,139,0.4)" },
  totw:    { bg: "#0f2898", border: "#3b82f6", ratingColor: "#bae6fd", glow: "rgba(59,130,246,0.6)" },
  prime:   { bg: "#3d2a00", border: "#f59e0b", ratingColor: "#fde68a", glow: "rgba(245,158,11,0.55)" },
  icon:    { bg: "#2d0050", border: "#a855f7", ratingColor: "#e879f9", glow: "rgba(168,85,247,0.6)" },
  mw:      { bg: "#7f1d1d", border: "#ef4444", ratingColor: "#fed7aa", glow: "rgba(239,68,68,0.6)" },
};

function PitchBadge({
  slot,
  isActive,
  onClick,
}: {
  slot: LineupSlot;
  isActive: boolean;
  onClick: () => void;
}) {
  const ROLE_LABEL: Record<SlotRole, string> = { batsman: "BAT", allrounder: "AR", bowler: "BWL" };

  if (!slot.player) {
    return (
      <button
        onClick={onClick}
        className="flex flex-col items-center gap-1 group"
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200"
          style={{
            border: isActive ? "2px solid #fbbf24" : "2px dashed rgba(255,255,255,0.25)",
            background: isActive ? "rgba(251,191,36,0.15)" : "rgba(255,255,255,0.04)",
            boxShadow: isActive ? "0 0 12px rgba(251,191,36,0.4)" : "none",
          }}
        >
          <span className="text-white/40 group-hover:text-white/70 text-lg transition-colors">+</span>
        </div>
        <span className="text-[9px] font-black uppercase tracking-wider text-white/35 group-hover:text-white/60 transition-colors">
          {ROLE_LABEL[slot.role]}
        </span>
      </button>
    );
  }

  const ct = getCardType(slot.player.id);
  const c = BADGE_COLORS[ct];
  const rating = r10(slot.player.overallRating);
  const name = lastName(slot.player.name);

  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center gap-1 group"
    >
      <div
        className="w-12 h-12 rounded-full flex flex-col items-center justify-center transition-all duration-200 group-hover:scale-110"
        style={{
          background: c.bg,
          border: isActive ? "2px solid #fbbf24" : `2px solid ${c.border}`,
          boxShadow: isActive ? `0 0 14px rgba(251,191,36,0.6)` : `0 0 8px ${c.glow}`,
        }}
      >
        <span className="text-[13px] font-black leading-none" style={{ color: c.ratingColor }}>
          {rating}
        </span>
      </div>
      <span className="text-[9px] font-bold text-white/85 max-w-[60px] truncate text-center leading-tight">
        {name}
      </span>
    </button>
  );
}

// ── Player picker panel ───────────────────────────────────────────────────────

function PlayerPicker({
  role,
  collection,
  usedIds,
  onPick,
  onClear,
  hasCurrent,
}: {
  role: SlotRole;
  collection: CollectedCard[];
  usedIds: Set<number>;
  onPick: (c: CollectedCard) => void;
  onClear: () => void;
  hasCurrent: boolean;
}) {
  const eligible = collection.filter(
    (c) => (c.role === role || (role === "batsman" && c.role === "wicketkeeper")) && !usedIds.has(c.id + c.addedAt)
  ).sort((a, b) => b.overallRating - a.overallRating);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      className="rounded-2xl border p-4"
      style={{ background: "rgba(10,10,20,0.97)", borderColor: "rgba(251,191,36,0.35)" }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-black uppercase tracking-wider text-amber-400">
          Pick {role === "allrounder" ? "All-Rounder" : role === "batsman" ? "Batsman" : "Bowler"}
        </span>
        {hasCurrent && (
          <button
            onClick={onClear}
            className="text-xs text-red-400 font-bold hover:text-red-300 transition-colors"
          >
            Remove player
          </button>
        )}
      </div>
      {eligible.length === 0 ? (
        <p className="text-xs text-muted-foreground py-2">
          No {role}s in your collection yet. Open packs to get some!
        </p>
      ) : (
        <div className="flex flex-wrap gap-2 max-h-44 overflow-y-auto pr-1">
          {eligible.map((card) => (
            <div
              key={card.id + "-" + card.addedAt}
              onClick={() => onPick(card)}
              className="cursor-pointer hover:scale-105 transition-transform"
            >
              <CricketCard
                player={card}
                cardType={getCardType(card.id)}
                size="sm"
              />
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}

// ── Cricket Pitch ─────────────────────────────────────────────────────────────

function CricketPitch({
  formation,
  lineup,
  activeSlot,
  onSlotClick,
}: {
  formation: FormationKey;
  lineup: LineupSlot[];
  activeSlot: number | null;
  onSlotClick: (idx: number) => void;
}) {
  const { bat, ar, bowl } = FORMATIONS[formation];

  const batSlots   = lineup.slice(0, bat);
  const arSlots    = lineup.slice(bat, bat + ar);
  const bowlSlots  = lineup.slice(bat + ar, bat + ar + bowl);

  const Row = ({ slots, startIdx, label }: { slots: LineupSlot[]; startIdx: number; label: string }) => (
    <div className="flex flex-col items-center gap-1 w-full">
      <span className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25 mb-1">{label}</span>
      <div className="flex justify-center gap-3 flex-wrap">
        {slots.map((slot, i) => (
          <PitchBadge
            key={startIdx + i}
            slot={slot}
            isActive={activeSlot === startIdx + i}
            onClick={() => onSlotClick(startIdx + i)}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden"
      style={{
        background: "linear-gradient(180deg, #0d3010 0%, #1a5c1a 30%, #1a5c1a 70%, #0d3010 100%)",
        border: "2px solid rgba(255,255,255,0.08)",
        minHeight: 360,
      }}
    >
      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" preserveAspectRatio="none" viewBox="0 0 400 360">
        {/* Centre circle */}
        <ellipse cx="200" cy="180" rx="160" ry="155" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="1.5" />
        <ellipse cx="200" cy="180" rx="90" ry="85" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        {/* Pitch strip */}
        <rect x="183" y="60" width="34" height="240" rx="3" fill="rgba(200,168,100,0.18)" stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
        {/* Crease lines */}
        <line x1="175" y1="105" x2="225" y2="105" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        <line x1="175" y1="255" x2="225" y2="255" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
        {/* Stumps */}
        <line x1="196" y1="97" x2="196" y2="108" stroke="#ff6090" strokeWidth="1.5" />
        <line x1="200" y1="96" x2="200" y2="108" stroke="#ff6090" strokeWidth="1.5" />
        <line x1="204" y1="97" x2="204" y2="108" stroke="#ff6090" strokeWidth="1.5" />
        <line x1="196" y1="252" x2="196" y2="263" stroke="#ff6090" strokeWidth="1.5" />
        <line x1="200" y1="252" x2="200" y2="263" stroke="#ff6090" strokeWidth="1.5" />
        <line x1="204" y1="252" x2="204" y2="263" stroke="#ff6090" strokeWidth="1.5" />
        {/* Divider lines between rows */}
        <line x1="20" y1="148" x2="380" y2="148" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 4" />
        <line x1="20" y1="212" x2="380" y2="212" stroke="rgba(255,255,255,0.06)" strokeWidth="1" strokeDasharray="6 4" />
      </svg>

      {/* Players: bowlers top, allrounders middle, batsmen bottom */}
      <div className="relative z-10 flex flex-col justify-between h-full py-5 px-4 gap-4" style={{ minHeight: 360 }}>
        <Row slots={bowlSlots}  startIdx={bat + ar} label="Bowlers" />
        <Row slots={arSlots}    startIdx={bat}      label="All-Rounders" />
        <Row slots={batSlots}   startIdx={0}        label="Batsmen" />
      </div>
    </div>
  );
}

// ── Persistence ───────────────────────────────────────────────────────────────

const MY_TEAM_KEY = "cm_my_team";

interface SavedTeam {
  formation: FormationKey;
  slots: Array<{ role: SlotRole; playerId: number | null; addedAt: number | null }>;
}

function saveTeam(formation: FormationKey, lineup: LineupSlot[]) {
  const data: SavedTeam = {
    formation,
    slots: lineup.map(s => ({
      role: s.role,
      playerId: s.player?.id ?? null,
      addedAt: s.player?.addedAt ?? null,
    })),
  };
  localStorage.setItem(MY_TEAM_KEY, JSON.stringify(data));
}

function loadTeam(collection: CollectedCard[]): { formation: FormationKey; lineup: LineupSlot[] } | null {
  try {
    const raw = localStorage.getItem(MY_TEAM_KEY);
    if (!raw) return null;
    const data: SavedTeam = JSON.parse(raw);
    if (!data.formation || !data.slots) return null;
    const lineup = data.slots.map(s => {
      const player = s.playerId !== null && s.addedAt !== null
        ? (collection.find(c => c.id === s.playerId && c.addedAt === s.addedAt) ?? null)
        : null;
      return { role: s.role, player };
    });
    return { formation: data.formation, lineup };
  } catch {
    return null;
  }
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function MyTeam() {
  const [coins, setCoins]         = useState(0);
  const [collection, setCollection] = useState<CollectedCard[]>([]);
  const [formation, setFormation] = useState<FormationKey>("4-3-4");
  const [lineup, setLineup]       = useState<LineupSlot[]>(buildLineup("4-3-4"));
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [tab, setTab]             = useState<"pitch" | "collection">("pitch");

  useEffect(() => {
    setCoins(getCoins());
    const col = getCollection();
    setCollection(col);
    const saved = loadTeam(col);
    if (saved) {
      setFormation(saved.formation);
      setLineup(saved.lineup);
    }
  }, []);

  const handleFormationChange = (f: FormationKey) => {
    const newLineup = buildLineup(f);
    setFormation(f);
    setLineup(newLineup);
    setActiveSlot(null);
    saveTeam(f, newLineup);
  };

  const usedIds = new Set(
    lineup.filter(s => s.player).map(s => s.player!.id + s.player!.addedAt)
  );

  const handleSlotClick = (idx: number) => {
    setActiveSlot(prev => (prev === idx ? null : idx));
  };

  const handlePick = (card: CollectedCard) => {
    if (activeSlot === null) return;
    setLineup(prev => {
      const next = prev.map((s, i) => i === activeSlot ? { ...s, player: card } : s);
      saveTeam(formation, next);
      return next;
    });
    setActiveSlot(null);
  };

  const handleClear = () => {
    if (activeSlot === null) return;
    setLineup(prev => {
      const next = prev.map((s, i) => i === activeSlot ? { ...s, player: null } : s);
      saveTeam(formation, next);
      return next;
    });
    setActiveSlot(null);
  };

  const activeRole = activeSlot !== null ? lineup[activeSlot].role : null;
  const activeCurrent = activeSlot !== null ? lineup[activeSlot].player : null;

  const filledCount = lineup.filter(s => s.player).length;

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-display font-black text-white uppercase">
            MY <span className="text-primary">TEAM</span>
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {filledCount}/11 players selected · {collection.length} cards in collection
          </p>
        </div>
        <div className="flex items-center gap-3 bg-card border border-border/40 rounded-2xl px-5 py-3 self-start">
          <span className="text-2xl">🪙</span>
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Coins</div>
            <div className="text-2xl font-display font-black text-primary">{coins.toLocaleString()}</div>
          </div>
        </div>
      </div>

      {/* Tab switcher */}
      <div className="flex gap-2">
        {(["pitch", "collection"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              tab === t
                ? "bg-primary text-black border-primary"
                : "bg-card text-muted-foreground border-border/40 hover:text-white"
            }`}
          >
            {t === "pitch" ? "Pitch View" : "Collection"}
          </button>
        ))}
      </div>

      {tab === "pitch" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6">
          {/* Left: pitch + formation */}
          <div className="flex flex-col gap-4">
            {/* Formation selector */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-xs font-black uppercase tracking-widest text-muted-foreground mr-1">Formation</span>
              {(Object.keys(FORMATIONS) as FormationKey[]).map(f => (
                <button
                  key={f}
                  onClick={() => handleFormationChange(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-black border transition-all ${
                    formation === f
                      ? "bg-primary text-black border-primary"
                      : "bg-card text-muted-foreground border-border/40 hover:text-white"
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Formation subtitle */}
            <p className="text-xs text-muted-foreground -mt-2">
              {FORMATIONS[formation].bat} Batsmen · {FORMATIONS[formation].ar} All-Rounder{FORMATIONS[formation].ar !== 1 ? "s" : ""} · {FORMATIONS[formation].bowl} Bowlers
            </p>

            {/* Pitch */}
            <CricketPitch
              formation={formation}
              lineup={lineup}
              activeSlot={activeSlot}
              onSlotClick={handleSlotClick}
            />
          </div>

          {/* Right: player picker */}
          <div className="flex flex-col gap-4">
            <AnimatePresence mode="wait">
              {activeSlot !== null && activeRole ? (
                <PlayerPicker
                  key={activeSlot}
                  role={activeRole}
                  collection={collection}
                  usedIds={usedIds}
                  onPick={handlePick}
                  onClear={handleClear}
                  hasCurrent={!!activeCurrent}
                />
              ) : (
                <motion.div
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="rounded-2xl border p-6 text-center"
                  style={{ borderColor: "rgba(148,163,184,0.15)", background: "rgba(255,255,255,0.02)" }}
                >
                  <p className="text-4xl mb-3">🏏</p>
                  <p className="font-black text-white text-sm">Tap a slot on the pitch</p>
                  <p className="text-xs text-muted-foreground mt-1">to assign a player from your collection</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Lineup summary */}
            {filledCount > 0 && (
              <div className="rounded-2xl border p-4 flex flex-col gap-2" style={{ borderColor: "rgba(148,163,184,0.15)", background: "rgba(255,255,255,0.02)" }}>
                <p className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-1">Starting XI</p>
                {lineup.map((slot, i) => (
                  slot.player ? (
                    <div key={i} className="flex items-center gap-2">
                      <span className="text-[9px] font-black w-8 text-right"
                        style={{ color: slot.role === "batsman" ? "#4ade80" : slot.role === "allrounder" ? "#fbbf24" : "#60a5fa" }}>
                        {slot.role === "batsman" ? "BAT" : slot.role === "allrounder" ? "AR" : "BWL"}
                      </span>
                      <span className="text-xs font-bold text-white truncate flex-1">{slot.player.name}</span>
                      <span className="text-xs font-black text-muted-foreground">{r10(slot.player.overallRating)}</span>
                    </div>
                  ) : null
                ))}
                {filledCount < 11 && (
                  <p className="text-[10px] text-muted-foreground mt-1">{11 - filledCount} slot{11 - filledCount !== 1 ? "s" : ""} remaining</p>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "collection" && (
        <div>
          {collection.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="text-6xl">📦</div>
              <h2 className="text-xl font-display font-bold text-white">No cards yet</h2>
              <p className="text-muted-foreground text-sm">Open packs to build your collection.</p>
              <Link href="/packs" className="bg-primary text-black font-black px-6 py-2.5 rounded-xl text-sm hover:brightness-110 transition-all">
                Go to Packs
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {[...collection].sort((a, b) => b.overallRating - a.overallRating).map((card, idx) => (
                <motion.div
                  key={card.id + "-" + card.addedAt}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: Math.min(idx * 0.025, 0.35) }}
                >
                  <CricketCard player={card} cardType={getCardType(card.id)} size="sm" />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
