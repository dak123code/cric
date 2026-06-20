import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CricketCard, type CardPlayer, type CardType } from "@/components/cricket-card";
import {
  getCollection,
  addToCollection,
  removeFromCollection,
  hasUnlock,
  grantUnlock,
  getWins,
  type SBCDefinition,
  SBC_DEFINITIONS,
} from "@/lib/game-store";
import { getPrimePlayer, PRIME_PLAYERS, ICON_PLAYERS, ALL_PLAYERS_EXPORT, TOTW_IDS, getMWPlayer, MW_IDS } from "@/lib/static-data";
import { Button } from "@/components/shared";

function toCardPlayer(p: NonNullable<ReturnType<typeof getPrimePlayer>>): CardPlayer {
  return { id: p.id, name: p.name, role: p.role, country: p.country, battingRating: p.battingRating, bowlingRating: p.bowlingRating, keepingRating: p.keepingRating, overallRating: p.overallRating, age: p.age, salary: p.salary };
}

function r10(v: number) { return Math.min(99, Math.ceil(v / 10)); }

// ── Squad Builder Modal ───────────────────────────────────────────────────────

export interface Slot {
  reqIndex: number;
  slotIndex: number;
  card: (CardPlayer & { addedAt: number }) | null;
}

export function buildEmptySlots(sbc: SBCDefinition): Slot[] {
  const slots: Slot[] = [];
  sbc.requiredRoles.forEach((req, ri) => {
    for (let si = 0; si < req.count; si++) {
      slots.push({ reqIndex: ri, slotIndex: si, card: null });
    }
  });
  return slots;
}

function SquadBuilder({
  sbc,
  slots,
  onSlotsChange,
  onClose,
  onSubmit,
}: {
  sbc: SBCDefinition;
  slots: Slot[];
  onSlotsChange: (slots: Slot[]) => void;
  onClose: () => void;
  onSubmit: (submittedCards: (CardPlayer & { addedAt: number })[]) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [error, setError] = useState("");

  const collection = getCollection();
  const usedAddedAts = new Set(slots.filter(s => s.card).map(s => s.card!.addedAt));

  // Any unused card is eligible for any slot
  const pickerCards = activeSlot !== null
    ? collection.filter(c => !usedAddedAts.has(c.addedAt))
    : [];

  const allFilled = slots.every(s => s.card !== null);

  // Validate that the squad as a whole meets all requirements
  const validateSquad = (): string | null => {
    const submitted = slots.map(s => s.card).filter(Boolean) as (CardPlayer & { addedAt: number })[];
    for (const req of sbc.requiredRoles) {
      const matching = submitted.filter(c => c.role === req.role && r10(c.overallRating) >= req.minRating).length;
      if (matching < req.count) {
        return `Need ${req.count}× ${req.role} ${req.minRating}+ rated (have ${matching})`;
      }
    }
    return null;
  };

  // Suggested Squad: fill slots with the lowest-rated combination that meets requirements
  const handleSuggest = () => {
    const sorted = [...collection].sort((a, b) => a.overallRating - b.overallRating);
    const used = new Set<number>();
    const result: (CardPlayer & { addedAt: number } | null)[] = Array(slots.length).fill(null);
    let slotIdx = 0;
    // First satisfy each role requirement with lowest eligible players
    for (const req of sbc.requiredRoles) {
      for (let i = 0; i < req.count; i++) {
        const pick = sorted.find(c => !used.has(c.addedAt) && c.role === req.role && r10(c.overallRating) >= req.minRating);
        if (pick && slotIdx < result.length) { result[slotIdx++] = pick; used.add(pick.addedAt); }
      }
    }
    // Fill remaining slots with any unused cards
    for (let i = slotIdx; i < result.length; i++) {
      const pick = sorted.find(c => !used.has(c.addedAt));
      if (pick) { result[i] = pick; used.add(pick.addedAt); }
    }
    onSlotsChange(slots.map((s, i) => ({ ...s, card: result[i] ?? s.card })));
    setActiveSlot(null);
    setError("");
  };

  const handleSlotClick = (idx: number) => {
    setActiveSlot(idx === activeSlot ? null : idx);
    setError("");
  };

  const handlePickCard = (card: CardPlayer & { addedAt: number }) => {
    if (activeSlot === null) return;
    onSlotsChange(slots.map((s, i) => i === activeSlot ? { ...s, card } : s));
    setActiveSlot(null);
  };

  const handleRemoveCard = (idx: number) => {
    onSlotsChange(slots.map((s, i) => i === idx ? { ...s, card: null } : s));
    setActiveSlot(null);
  };

  const handleSubmit = () => {
    if (!allFilled) { setError("Fill all slots before submitting."); return; }
    const validationError = validateSquad();
    if (validationError) { setError(validationError); return; }
    onSubmit(slots.map(s => s.card!));
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-2xl rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: "linear-gradient(145deg,#1a1200,#0e0900)", borderColor: "rgba(251,191,36,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-white text-2xl">{sbc.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{sbc.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors text-lg ml-4">✕</button>
        </div>

        {/* Requirements + Suggested Squad */}
        <div className="flex flex-wrap items-center gap-2">
          {sbc.requiredRoles.map((req, i) => (
            <span key={i} className="text-xs px-2.5 py-1 rounded-lg border font-bold"
              style={{ background: "rgba(251,191,36,0.08)", borderColor: "rgba(251,191,36,0.3)", color: "#fbbf24" }}>
              {req.count}× {req.role} {req.minRating}+
            </span>
          ))}
          <button
            onClick={handleSuggest}
            className="ml-auto text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/10 text-amber-300 hover:bg-amber-500/20 transition-colors"
          >
            Suggested Squad
          </button>
          {slots.filter(s => s.card).length > 0 && (
            <button
              onClick={() => { onSlotsChange(slots.map(s => ({ ...s, card: null }))); setError(""); }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-3 justify-center">
          {slots.map((slot, idx) => {
            const isActive = activeSlot === idx;
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div
                  onClick={() => slot.card ? handleRemoveCard(idx) : handleSlotClick(idx)}
                  className="cursor-pointer rounded-xl transition-all duration-200"
                  style={{
                    outline: isActive ? "2px solid #fbbf24"
                      : slot.card ? "2px solid rgba(74,222,128,0.5)"
                      : "2px dashed rgba(251,191,36,0.3)",
                    outlineOffset: 2,
                  }}
                >
                  {slot.card ? (
                    <div className="relative">
                      <CricketCard player={slot.card} cardType="normal" size="sm" />
                      <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-black">✕</div>
                    </div>
                  ) : (
                    <div className="w-[130px] h-[184px] rounded-xl flex flex-col items-center justify-center gap-1"
                      style={{ background: isActive ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)" }}>
                      <span className="text-2xl opacity-40">+</span>
                      <span className="text-[9px] text-muted-foreground font-bold uppercase text-center leading-tight px-2">
                        Any Player
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <AnimatePresence>
          {activeSlot !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-black text-amber-400 uppercase tracking-wider mb-2">
                Select any player — {pickerCards.length} available
              </p>
              {pickerCards.length === 0 ? (
                <p className="text-sm text-red-400 font-bold">No players in collection — open some packs first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                  {pickerCards.map(card => (
                    <div key={card.addedAt}
                      onClick={() => handlePickCard(card)}
                      className="cursor-pointer transition-transform hover:scale-105"
                      title={card.name}
                    >
                      <CricketCard player={card} cardType="normal" size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="flex-1 font-black"
            style={allFilled ? { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000" } : {}}
          >
            Submit Squad
          </Button>
          {error && <span className="text-xs text-red-400 font-bold">{error}</span>}
        </div>

        <p className="text-xs text-muted-foreground text-center">
          Submitted players will be permanently removed from your collection.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Double Squad Builder ──────────────────────────────────────────────────────

type DSlot = (CardPlayer & { addedAt: number }) | null;

function DoubleSquadBuilder({
  sbc,
  slots,
  onSlotsChange,
  onClose,
  onSubmit,
}: {
  sbc: SBCDefinition;
  slots: DSlot[];
  onSlotsChange: (slots: DSlot[]) => void;
  onClose: () => void;
  onSubmit: (submittedCards: (CardPlayer & { addedAt: number })[]) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  // Use only cards in the player's collection
  const collection = getCollection();
  const usedAddedAts = new Set(slots.filter(Boolean).map(s => s!.addedAt));
  const availableCards = collection.filter(c => !usedAddedAts.has(c.addedAt));
  const filledCount = slots.filter(Boolean).length;
  const allFilled = filledCount === 22;

  const handleSlotClick = (idx: number) => {
    if (slots[idx]) {
      onSlotsChange(slots.map((s, i) => i === idx ? null : s));
      setActiveSlot(null);
    } else {
      setActiveSlot(idx === activeSlot ? null : idx);
    }
  };

  const handlePickCard = (card: CardPlayer & { addedAt: number }) => {
    if (activeSlot === null) return;
    onSlotsChange(slots.map((s, i) => i === activeSlot ? card : s));
    setActiveSlot(null);
  };

  const renderGrid = (start: number, label: string) => (
    <div>
      <div className="text-xs font-black uppercase tracking-widest mb-2" style={{ color: "#fbbf24" }}>{label}</div>
      <div className="flex flex-wrap gap-2 justify-center">
        {Array.from({ length: 11 }, (_, i) => {
          const idx = start + i;
          const card = slots[idx];
          const isActive = activeSlot === idx;
          return (
            <div key={idx} onClick={() => handleSlotClick(idx)} className="cursor-pointer rounded-xl transition-all duration-200"
              style={{
                outline: isActive ? "2px solid #fbbf24" : card ? "2px solid rgba(74,222,128,0.5)" : "2px dashed rgba(251,191,36,0.3)",
                outlineOffset: 2,
              }}>
              {card ? (
                <div className="relative">
                  <CricketCard player={card} cardType="normal" size="sm" />
                  <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-black">✕</div>
                </div>
              ) : (
                <div className="w-[90px] h-[127px] rounded-xl flex flex-col items-center justify-center gap-1"
                  style={{ background: isActive ? "rgba(251,191,36,0.12)" : "rgba(255,255,255,0.04)" }}>
                  <span className="text-xl opacity-40">+</span>
                  <span className="text-[9px] text-muted-foreground font-bold">ANY</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-4xl rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: "linear-gradient(145deg,#0a0020,#050010)", borderColor: "rgba(167,139,250,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-white text-2xl">{sbc.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{sbc.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white transition-colors text-lg ml-4">✕</button>
        </div>

        {/* Progress + auto-fill */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${(filledCount / 22) * 100}%`, background: "linear-gradient(90deg,#7c3aed,#a855f7)" }} />
          </div>
          <span className="text-sm font-black text-purple-400">{filledCount}/22</span>
          <button
            onClick={() => {
              const lowest = [...collection].sort((a, b) => a.overallRating - b.overallRating).slice(0, 22);
              const filled: DSlot[] = Array(22).fill(null);
              lowest.forEach((card, i) => { filled[i] = card; });
              onSlotsChange(filled);
              setActiveSlot(null);
            }}
            className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors whitespace-nowrap"
          >
            Select 22 Lowest
          </button>
          {filledCount > 0 && (
            <button
              onClick={() => { onSlotsChange(Array(22).fill(null)); setActiveSlot(null); }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Squad grids */}
        {renderGrid(0, "Squad 1 — Players 1–11")}
        {renderGrid(11, "Squad 2 — Players 12–22")}

        {/* Player picker */}
        <AnimatePresence>
          {activeSlot !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <p className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2">
                Select any player from your club (slot {activeSlot + 1}) — {availableCards.length} available
              </p>
              {availableCards.length === 0 ? (
                <p className="text-sm text-red-400 font-bold">No more players in your club — open some packs first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                  {availableCards.map(card => (
                    <div key={card.addedAt} onClick={() => handlePickCard(card)} className="cursor-pointer hover:scale-105 transition-transform">
                      <CricketCard player={card} cardType="normal" size="sm" />
                    </div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={() => onSubmit(slots as (CardPlayer & { addedAt: number })[])}
            disabled={!allFilled}
            className="flex-1 font-black"
            style={allFilled ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" } : {}}
          >
            Submit Both Squads ({filledCount}/22)
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">
          All 22 submitted players will be permanently removed from your collection.
        </p>
      </motion.div>
    </motion.div>
  );
}

// ── Pack Reveal Modal ─────────────────────────────────────────────────────────

// ── Legends of the Game Builder ───────────────────────────────────────────────

function LegendsBuilder({
  sbc,
  slots,
  onSlotsChange,
  onClose,
  onSubmit,
}: {
  sbc: SBCDefinition;
  slots: DSlot[];
  onSlotsChange: (slots: DSlot[]) => void;
  onClose: () => void;
  onSubmit: (cards: (CardPlayer & { addedAt: number })[]) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [error, setError] = useState("");

  const collection = getCollection();
  const usedAddedAts = new Set(slots.filter(Boolean).map(s => s!.addedAt));
  const availableCards = collection.filter(c => !usedAddedAts.has(c.addedAt));
  const filledCount = slots.filter(Boolean).length;
  const allFilled = filledCount === 11;

  const goldCount = slots.filter(s => s && r10(s.overallRating) >= 75).length;
  const totwCount = slots.filter(s => s && TOTW_IDS.has(s.id)).length;
  const meetsGold = goldCount >= 3;
  const meetsTOTW = totwCount >= 1;

  const handleSlotClick = (idx: number) => {
    if (slots[idx]) {
      onSlotsChange(slots.map((s, i) => i === idx ? null : s));
      setActiveSlot(null);
    } else {
      setActiveSlot(idx === activeSlot ? null : idx);
    }
  };

  const handlePickCard = (card: CardPlayer & { addedAt: number }) => {
    if (activeSlot === null) return;
    onSlotsChange(slots.map((s, i) => i === activeSlot ? card : s));
    setActiveSlot(null);
  };

  const handleSuggest = () => {
    const sorted = [...collection].sort((a, b) => a.overallRating - b.overallRating);
    const used = new Set<number>();
    const result: (CardPlayer & { addedAt: number } | null)[] = Array(11).fill(null);
    // Pick 1 TOTW card (lowest rated TOTW available)
    const totw = sorted.find(c => TOTW_IDS.has(c.id));
    if (totw) { result[0] = totw; used.add(totw.addedAt); }
    // Pick 3 Gold (75+) cards (lowest rated)
    let goldFilled = result[0] && r10(result[0].overallRating) >= 75 ? 1 : 0;
    for (let i = 1; i < 11 && goldFilled < 3; i++) {
      if (result[i]) continue;
      const pick = sorted.find(c => !used.has(c.addedAt) && r10(c.overallRating) >= 75);
      if (pick) { result[i] = pick; used.add(pick.addedAt); goldFilled++; }
    }
    // Fill remaining with cheapest available
    for (let i = 0; i < 11; i++) {
      if (result[i]) continue;
      const pick = sorted.find(c => !used.has(c.addedAt));
      if (pick) { result[i] = pick; used.add(pick.addedAt); }
    }
    onSlotsChange(result);
    setActiveSlot(null);
    setError("");
  };

  const handleSubmit = () => {
    if (!allFilled) { setError("Fill all 11 slots first."); return; }
    if (!meetsGold) { setError(`Need at least 3 Gold players (75+ rated) — you have ${goldCount}.`); return; }
    if (!meetsTOTW) { setError("Need at least 1 TOTW card in your squad."); return; }
    setError("");
    onSubmit(slots as (CardPlayer & { addedAt: number })[]);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-3xl rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: "linear-gradient(145deg,#0a0020,#050010)", borderColor: "rgba(192,132,252,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-white text-2xl">{sbc.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{sbc.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white text-lg ml-4">✕</button>
        </div>

        {/* Requirements + Suggested Squad */}
        <div className="flex flex-wrap items-center gap-2">
          {[
            { label: `${filledCount}/11 players`, met: allFilled },
            { label: `${goldCount}/3 Gold (75+)`, met: meetsGold },
            { label: `${totwCount}/1 TOTW card`, met: meetsTOTW },
          ].map(({ label, met }) => (
            <div key={label} className={`text-xs px-2.5 py-1 rounded-lg border font-bold ${met ? "bg-green-500/10 border-green-500/40 text-green-400" : "bg-purple-500/10 border-purple-500/30 text-purple-300"}`}>
              {met ? "✓" : ""} {label}
            </div>
          ))}
          <button
            onClick={handleSuggest}
            className="ml-auto text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-purple-500/40 bg-purple-500/10 text-purple-300 hover:bg-purple-500/20 transition-colors"
          >
            Suggested Squad
          </button>
          {filledCount > 0 && (
            <button
              onClick={() => { onSlotsChange(Array(11).fill(null)); setError(""); }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Squad grid */}
        <div className="flex flex-wrap gap-2 justify-center">
          {Array.from({ length: 11 }, (_, idx) => {
            const card = slots[idx];
            const isActive = activeSlot === idx;
            const isTOTW = card && TOTW_IDS.has(card.id);
            const isGold = card && r10(card.overallRating) >= 75;
            return (
              <div key={idx} onClick={() => handleSlotClick(idx)} className="cursor-pointer rounded-xl transition-all duration-200"
                style={{
                  outline: isActive ? "2px solid #c084fc"
                    : isTOTW ? "2px solid rgba(251,191,36,0.8)"
                    : isGold ? "2px solid rgba(74,222,128,0.5)"
                    : card ? "2px solid rgba(255,255,255,0.2)"
                    : "2px dashed rgba(192,132,252,0.3)",
                  outlineOffset: 2,
                }}>
                {card ? (
                  <div className="relative">
                    <CricketCard player={card} cardType={isTOTW ? "totw" : "normal"} size="sm" />
                    <div className="absolute top-1 right-1 w-5 h-5 rounded-full bg-red-500/80 flex items-center justify-center text-white text-[10px] font-black">✕</div>
                  </div>
                ) : (
                  <div className="w-[90px] h-[127px] rounded-xl flex flex-col items-center justify-center gap-1"
                    style={{ background: isActive ? "rgba(192,132,252,0.12)" : "rgba(255,255,255,0.04)" }}>
                    <span className="text-xl opacity-40">+</span>
                    <span className="text-[9px] text-muted-foreground font-bold">ANY</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Picker */}
        <AnimatePresence>
          {activeSlot !== null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <p className="text-xs font-black text-purple-400 uppercase tracking-wider mb-2">
                Select a player — {availableCards.length} available · TOTW & Gold highlighted
              </p>
              {availableCards.length === 0 ? (
                <p className="text-sm text-red-400 font-bold">No players in collection — open some packs first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-52 overflow-y-auto pr-1">
                  {availableCards.map(card => {
                    const isTOTWCard = TOTW_IDS.has(card.id);
                    const isGoldCard = r10(card.overallRating) >= 75;
                    return (
                      <div key={card.addedAt} onClick={() => handlePickCard(card)} className="cursor-pointer hover:scale-105 transition-transform relative">
                        <CricketCard player={card} cardType={isTOTWCard ? "totw" : "normal"} size="sm" />
                        {isTOTWCard && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                            <span className="text-[7px] font-black bg-amber-500/80 text-black px-1 rounded">TOTW</span>
                          </div>
                        )}
                        {!isTOTWCard && isGoldCard && (
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center pointer-events-none">
                            <span className="text-[7px] font-black bg-green-500/70 text-black px-1 rounded">GOLD</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handleSubmit}
            disabled={!allFilled}
            className="flex-1 font-black"
            style={allFilled && meetsGold && meetsTOTW ? { background: "linear-gradient(135deg,#7c3aed,#6d28d9)", color: "#fff" } : {}}
          >
            Submit Squad ({filledCount}/11)
          </Button>
          {error && <span className="text-xs text-red-400 font-bold">{error}</span>}
        </div>
        <p className="text-xs text-muted-foreground text-center">All 11 submitted players are permanently sacrificed.</p>
      </motion.div>
    </motion.div>
  );
}

// ── MW Squad Builder (7 slots, 3+ gold, 3+ Indians) ──────────────────────────

type MWSlot = (CardPlayer & { addedAt: number }) | null;

function cardTypeFor(card: CardPlayer): CardType {
  if (MW_IDS.has(card.id)) return "mw";
  if (TOTW_IDS.has(card.id)) return "totw";
  if (card.id >= 2000) return "icon";
  if (card.id >= 998) return "prime";
  return "normal";
}

function MWSquadBuilder({
  sbc,
  slots,
  onSlotsChange,
  onClose,
  onSubmit,
}: {
  sbc: SBCDefinition;
  slots: MWSlot[];
  onSlotsChange: (s: MWSlot[]) => void;
  onClose: () => void;
  onSubmit: (cards: (CardPlayer & { addedAt: number })[]) => void;
}) {
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [error, setError] = useState("");

  const collection = getCollection();
  const usedAddedAts = new Set(slots.filter(Boolean).map(s => s!.addedAt));
  const availableCards = collection.filter(c => !usedAddedAts.has(c.addedAt));

  const filled   = slots.filter(Boolean) as (CardPlayer & { addedAt: number })[];
  const filledCount = filled.length;
  const allFilled   = filledCount === 7;
  const goldCount   = filled.filter(c => r10(c.overallRating) >= 75).length;
  const indCount    = filled.filter(c => c.country === "India").length;
  const meetsGold   = goldCount >= 3;
  const meetsIndia  = indCount >= 3;
  const canSubmit   = allFilled && meetsGold && meetsIndia;

  const handleSlotClick = (idx: number) => {
    if (slots[idx]) {
      onSlotsChange(slots.map((s, i) => i === idx ? null : s));
      if (activeSlot === idx) setActiveSlot(null);
    } else {
      setActiveSlot(idx === activeSlot ? null : idx);
    }
  };

  const handlePickCard = (card: CardPlayer & { addedAt: number }) => {
    if (activeSlot === null) return;
    onSlotsChange(slots.map((s, i) => i === activeSlot ? card : s));
    // Auto-advance to next empty slot
    const nextEmpty = slots.findIndex((s, i) => i > activeSlot && !s);
    setActiveSlot(nextEmpty === -1 ? null : nextEmpty);
    setError("");
  };

  const handleSuggest = () => {
    const sorted = [...collection].sort((a, b) => a.overallRating - b.overallRating);
    const used = new Set<number>();
    const result: MWSlot[] = Array(7).fill(null);
    let slot = 0;

    const pick = (card: typeof sorted[0]) => {
      result[slot++] = card;
      used.add(card.addedAt);
    };

    // Step 1: gold Indians (count toward both requirements) — cheapest first
    for (const c of sorted) {
      if (slot >= 7) break;
      if (!used.has(c.addedAt) && c.country === "India" && r10(c.overallRating) >= 75) pick(c);
    }

    // Step 2: fill remaining India requirement with cheapest non-gold Indians
    const indNeed = Math.max(0, 3 - result.slice(0, slot).filter(c => c?.country === "India").length);
    let indExtra = 0;
    for (const c of sorted) {
      if (slot >= 7 || indExtra >= indNeed) break;
      if (!used.has(c.addedAt) && c.country === "India") { pick(c); indExtra++; }
    }

    // Step 3: fill remaining gold requirement with cheapest non-Indian gold
    const goldNeed = Math.max(0, 3 - result.slice(0, slot).filter(c => c && r10(c.overallRating) >= 75).length);
    let goldExtra = 0;
    for (const c of sorted) {
      if (slot >= 7 || goldExtra >= goldNeed) break;
      if (!used.has(c.addedAt) && r10(c.overallRating) >= 75) { pick(c); goldExtra++; }
    }

    // Step 4: fill rest with cheapest remaining
    for (const c of sorted) {
      if (slot >= 7) break;
      if (!used.has(c.addedAt)) pick(c);
    }

    onSlotsChange(result);
    setActiveSlot(null);
    setError("");
  };

  const handleSubmit = () => {
    if (!allFilled)  { setError("Fill all 7 slots first."); return; }
    if (!meetsGold)  { setError(`Need 3+ Gold (75+ rated) — you have ${goldCount}.`); return; }
    if (!meetsIndia) { setError(`Need 3+ Indian players — you have ${indCount}.`); return; }
    setError("");
    onSubmit(filled);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
        className="w-full max-w-3xl rounded-2xl border p-6 flex flex-col gap-5"
        style={{ background: "linear-gradient(145deg,#200404,#100202)", borderColor: "rgba(239,68,68,0.4)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display font-black text-white text-2xl">{sbc.name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{sbc.description}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white text-lg ml-4">✕</button>
        </div>

        {/* Requirements + actions */}
        <div className="flex flex-wrap items-center gap-2">
          {([
            { label: `${filledCount}/7 filled`,        met: allFilled },
            { label: `${goldCount}/3 Gold (75+)`,      met: meetsGold },
            { label: `${indCount}/3 🇮🇳 Indian`,       met: meetsIndia },
          ] as { label: string; met: boolean }[]).map(({ label, met }) => (
            <div key={label} className={`text-xs px-2.5 py-1 rounded-lg border font-bold transition-colors ${
              met ? "bg-green-500/15 border-green-500/50 text-green-400"
                  : "bg-red-500/10 border-red-500/30 text-red-300"
            }`}>
              {met ? "✓ " : ""}{label}
            </div>
          ))}
          <button onClick={handleSuggest}
            className="ml-auto text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-red-500/40 bg-red-500/10 text-red-300 hover:bg-red-500/20 transition-colors">
            Auto Fill
          </button>
          {filledCount > 0 && (
            <button onClick={() => { onSlotsChange(Array(7).fill(null)); setActiveSlot(null); setError(""); }}
              className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-muted-foreground hover:text-white transition-colors">
              Clear
            </button>
          )}
        </div>

        {/* 7 slots */}
        <div className="flex flex-wrap gap-3 justify-center">
          {slots.map((card, idx) => {
            const isActive = activeSlot === idx;
            const isGold   = card ? r10(card.overallRating) >= 75 : false;
            const isIndia  = card?.country === "India";
            return (
              <div key={idx} className="flex flex-col items-center gap-1">
                <div onClick={() => handleSlotClick(idx)} className="cursor-pointer rounded-xl transition-all duration-200"
                  style={{
                    outline: isActive ? "2px solid #ef4444" : card ? "2px solid rgba(74,222,128,0.5)" : "2px dashed rgba(239,68,68,0.3)",
                    outlineOffset: 2,
                  }}>
                  {card ? (
                    <div className="relative">
                      <CricketCard player={card} cardType={cardTypeFor(card)} size="sm" />
                      <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-red-600/90 flex items-center justify-center text-white text-[9px] font-black">✕</div>
                    </div>
                  ) : (
                    <div className="w-[90px] h-[127px] rounded-xl flex flex-col items-center justify-center gap-1"
                      style={{ background: isActive ? "rgba(239,68,68,0.15)" : "rgba(255,255,255,0.03)" }}>
                      <span className="text-2xl opacity-30">+</span>
                      <span className="text-[9px] text-muted-foreground font-bold">{idx + 1}</span>
                    </div>
                  )}
                </div>
                {card && (
                  <div className="flex gap-1">
                    {isGold  && <span className="text-[8px] font-black bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 px-1 rounded">GOLD</span>}
                    {isIndia && <span className="text-[8px] font-black bg-orange-500/20 text-orange-300 border border-orange-500/30 px-1 rounded">🇮🇳</span>}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Player picker */}
        <AnimatePresence>
          {activeSlot !== null && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <p className="text-xs font-black text-red-300 uppercase tracking-wider mb-2">
                Pick a player for slot {activeSlot + 1} · {availableCards.length} available
                <span className="ml-2 text-muted-foreground normal-case font-normal">Gold & Indian cards highlighted</span>
              </p>
              {availableCards.length === 0 ? (
                <p className="text-sm text-red-400 font-bold">No players in collection — open some packs first.</p>
              ) : (
                <div className="flex flex-wrap gap-2 max-h-56 overflow-y-auto pr-1">
                  {[...availableCards]
                    .sort((a, b) => {
                      // Sort: gold Indians first, then gold, then Indians, then rest
                      const aScore = (a.country === "India" ? 2 : 0) + (r10(a.overallRating) >= 75 ? 1 : 0);
                      const bScore = (b.country === "India" ? 2 : 0) + (r10(b.overallRating) >= 75 ? 1 : 0);
                      return bScore - aScore || b.overallRating - a.overallRating;
                    })
                    .map(card => {
                      const isGold  = r10(card.overallRating) >= 75;
                      const isIndia = card.country === "India";
                      return (
                        <div key={card.addedAt} onClick={() => handlePickCard(card)}
                          className="cursor-pointer hover:scale-105 transition-transform relative"
                          style={{ filter: (!isGold && !isIndia) ? "brightness(0.65)" : "none" }}>
                          <CricketCard player={card} cardType={cardTypeFor(card)} size="sm" />
                          <div className="absolute bottom-1 left-0 right-0 flex justify-center gap-0.5 pointer-events-none">
                            {isGold  && <span className="text-[7px] font-black bg-yellow-500/90 text-black px-1 rounded">GOLD</span>}
                            {isIndia && <span className="text-[7px] font-black bg-orange-500/90 text-white px-1 rounded">🇮🇳</span>}
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit row */}
        {error && (
          <div className="text-sm text-red-400 font-bold bg-red-500/10 border border-red-500/30 rounded-lg px-4 py-2">
            ⚠ {error}
          </div>
        )}
        <div className="flex gap-3">
          <Button onClick={handleSubmit} disabled={!canSubmit} className="flex-1 font-black"
            style={canSubmit ? { background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff" } : {}}>
            {canSubmit ? "Submit Squad ✓" : `Submit (${filledCount}/7 · ${goldCount}/3 Gold · ${indCount}/3 🇮🇳)`}
          </Button>
        </div>
        <p className="text-xs text-muted-foreground text-center">All 7 players are permanently sacrificed on submit.</p>
      </motion.div>
    </motion.div>
  );
}

// ── Pack Reveal Modal ─────────────────────────────────────────────────────────

function PackReveal({ cards, onClose }: { cards: { player: CardPlayer; cardType: CardType }[]; onClose: () => void }) {
  const [revealed, setRevealed] = useState(0);

  const revealNext = () => {
    if (revealed < cards.length) setRevealed(r => r + 1);
    else onClose();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center gap-6 px-4"
      onClick={revealNext}
    >
      <div className="text-center">
        <div className="text-4xl font-display font-black text-white mb-1">ULTIMATE GAUNTLET REWARD</div>
        <p className="text-muted-foreground text-sm">Tap anywhere to reveal</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center max-w-3xl">
        {cards.map((c, i) => (
          <motion.div
            key={i}
            initial={{ rotateY: 180, scale: 0.8, opacity: 0 }}
            animate={i < revealed ? { rotateY: 0, scale: 1, opacity: 1 } : { rotateY: 180, scale: 0.8, opacity: 0.3 }}
            transition={{ duration: 0.4 }}
          >
            {i < revealed ? (
              <CricketCard player={c.player} cardType={c.cardType} size="sm" />
            ) : (
              <div className="w-[90px] h-[127px] rounded-xl border-2 border-purple-500/50 flex items-center justify-center"
                style={{ background: "linear-gradient(145deg,#1a0030,#0d0020)" }}>
                <span className="text-2xl">?</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <Button onClick={revealed >= cards.length ? onClose : revealNext} className="mt-2">
        {revealed < cards.length ? `Reveal (${revealed}/${cards.length})` : "Collect All"}
      </Button>
    </motion.div>
  );
}

// ── SBC Card (list item) ──────────────────────────────────────────────────────

function SBCCard({ sbc, onOpen, onClaim }: { sbc: SBCDefinition; onOpen: () => void; onClaim?: () => void }) {
  const already = hasUnlock(sbc.id);
  const reward = sbc.rewardPlayerId ? (getPrimePlayer(sbc.rewardPlayerId) ?? getMWPlayer(sbc.rewardPlayerId)) : null;
  const isDouble = sbc.isDoubleSquad;
  const isLegends = sbc.isLegendsOfGame;
  const isMWSBC = sbc.isMWSquad;
  const isWinReward = sbc.isWinReward;
  const collectionSize = getCollection().length;
  const col = getCollection();
  const goldCount = col.filter(c => r10(c.overallRating) >= 75).length;
  const totwCount = col.filter(c => TOTW_IDS.has(c.id)).length;
  const wins = getWins();
  const canClaim = isWinReward && wins >= 1 && !already;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-2xl border p-5 flex flex-col gap-4 transition-all duration-200 ${!already && !isWinReward ? "cursor-pointer hover:scale-[1.01]" : ""}`}
      style={{
        background: already
          ? "linear-gradient(145deg, rgba(20,40,20,0.7), rgba(10,25,10,0.5))"
          : isWinReward
            ? "linear-gradient(145deg, rgba(0,30,60,0.75), rgba(0,15,35,0.55))"
            : isLegends
              ? "linear-gradient(145deg, rgba(50,0,80,0.75), rgba(25,0,45,0.55))"
              : isDouble
                ? "linear-gradient(145deg, rgba(30,0,60,0.7), rgba(15,0,35,0.5))"
                : isMWSBC
                  ? "linear-gradient(145deg, rgba(80,8,8,0.75), rgba(40,4,4,0.55))"
                  : "linear-gradient(145deg, rgba(61,42,0,0.55), rgba(30,20,0,0.4))",
        borderColor: already ? "rgba(74,222,128,0.4)" : isWinReward ? "rgba(56,189,248,0.5)" : isLegends ? "rgba(192,132,252,0.6)" : isDouble ? "rgba(167,139,250,0.45)" : isMWSBC ? "rgba(239,68,68,0.5)" : "rgba(251,191,36,0.35)",
      }}
      onClick={!already && !isWinReward ? onOpen : undefined}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-lg">{isWinReward ? "🏅" : isLegends ? "👑" : isDouble ? "⚡" : isMWSBC ? "🏆" : "🧩"}</span>
            <h3 className="font-display font-black text-white text-lg">{sbc.name}</h3>
            {already
              ? <span className="text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded uppercase tracking-wider">Completed</span>
              : isWinReward
                ? <span className="text-[10px] font-black bg-sky-500/20 text-sky-300 border border-sky-500/30 px-2 py-0.5 rounded uppercase tracking-wider">{canClaim ? "Ready to Claim!" : "Win a Match"}</span>
                : isLegends
                  ? <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase tracking-wider">Icon Reward</span>
                  : isDouble
                    ? <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase tracking-wider">22 Players Required</span>
                    : isMWSBC
                      ? <span className="text-[10px] font-black bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-0.5 rounded uppercase tracking-wider">Match Winner Reward</span>
                      : <span className="text-[10px] font-black bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded uppercase tracking-wider">Tap to build squad</span>
            }
          </div>
          <p className="text-sm text-muted-foreground">{sbc.description}</p>
        </div>
        {reward && (
          <div className="flex-shrink-0">
            <CricketCard player={toCardPlayer(reward)} cardType={isMWSBC ? "mw" : "prime"} size="sm" />
          </div>
        )}
        {isDouble && !reward && (
          <div className="flex-shrink-0 flex flex-col items-center gap-1">
            <div className="w-16 h-16 rounded-xl border-2 border-purple-400/50 flex items-center justify-center text-2xl"
              style={{ background: "linear-gradient(145deg,#1a0030,#0d0020)" }}>📦</div>
            <span className="text-[9px] font-black text-purple-400 uppercase">Pack Reward</span>
          </div>
        )}
      </div>

      {/* Double squad: show collection count */}
      {isDouble && !already && (
        <div className="flex flex-wrap gap-2">
          <div className="text-xs px-2.5 py-1 rounded-lg border font-bold"
            style={{
              background: collectionSize >= 22 ? "rgba(74,222,128,0.1)" : "rgba(167,139,250,0.08)",
              borderColor: collectionSize >= 22 ? "rgba(74,222,128,0.4)" : "rgba(167,139,250,0.3)",
              color: collectionSize >= 22 ? "#4ade80" : "#a78bfa",
            }}>
            {collectionSize >= 22 ? "✓" : `${collectionSize}/22`} cards in collection
          </div>
          {sbc.rewardPack && (
            <>
              <div className="text-xs px-2.5 py-1 rounded-lg border font-bold bg-amber-500/10 border-amber-500/30 text-amber-300">
                1 Prime guaranteed
              </div>
              <div className="text-xs px-2.5 py-1 rounded-lg border font-bold bg-purple-500/10 border-purple-500/30 text-purple-300">
                1 Icon guaranteed
              </div>
              <div className="text-xs px-2.5 py-1 rounded-lg border font-bold bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
                8 Gold players
              </div>
            </>
          )}
        </div>
      )}

      {/* Legends requirements */}
      {isLegends && !already && (
        <div className="flex flex-wrap gap-2">
          {[
            { label: `${goldCount}+ Gold (75+)`, met: goldCount >= 3, need: "3 Gold" },
            { label: `${totwCount} TOTW`, met: totwCount >= 1, need: "1 TOTW" },
          ].map(({ label, met, need }) => (
            <div key={need} className="text-xs px-2.5 py-1 rounded-lg border font-bold"
              style={{
                background: met ? "rgba(74,222,128,0.1)" : "rgba(192,132,252,0.08)",
                borderColor: met ? "rgba(74,222,128,0.4)" : "rgba(192,132,252,0.35)",
                color: met ? "#4ade80" : "#c084fc",
              }}>
              {met ? `✓ ${label}` : `${label} / need ${need}`}
            </div>
          ))}
          <div className="text-xs px-2.5 py-1 rounded-lg border font-bold bg-purple-500/10 border-purple-500/30 text-purple-300">
            🎁 Reward: Random Icon Card
          </div>
        </div>
      )}

      {/* MW squad requirements summary */}
      {isMWSBC && !already && (
        <div className="flex flex-wrap gap-2">
          {(() => {
            const goldHave = col.filter(c => r10(c.overallRating) >= 75).length;
            const indianHave = col.filter(c => c.country === "India").length;
            return [
              { label: `${Math.min(goldHave, 3)}/3 Gold (75+)`, met: goldHave >= 3 },
              { label: `${Math.min(indianHave, 3)}/3 Indian players`, met: indianHave >= 3 },
              { label: "7 players total", met: col.length >= 7 },
            ].map(({ label, met }) => (
              <div key={label} className="text-xs px-2.5 py-1 rounded-lg border font-bold"
                style={{
                  background: met ? "rgba(74,222,128,0.1)" : "rgba(239,68,68,0.08)",
                  borderColor: met ? "rgba(74,222,128,0.4)" : "rgba(239,68,68,0.3)",
                  color: met ? "#4ade80" : "#f87171",
                }}>
                {met ? "✓" : ""} {label}
              </div>
            ));
          })()}
        </div>
      )}

      {/* Win reward requirements + claim button */}
      {isWinReward && !already && (
        <div className="flex items-center gap-3">
          <div className={`text-xs px-2.5 py-1 rounded-lg border font-bold flex-1 text-center ${
            wins >= 1
              ? "bg-green-500/10 border-green-500/30 text-green-400"
              : "bg-sky-500/10 border-sky-500/30 text-sky-300"
          }`}>
            {wins >= 1 ? `✓ ${wins} match${wins > 1 ? "es" : ""} won` : "Win 1 match to unlock"}
          </div>
          <div className="text-xs px-2.5 py-1 rounded-lg border font-bold bg-yellow-500/10 border-yellow-500/30 text-yellow-300">
            🎁 5 Gold cards
          </div>
          <button
            disabled={!canClaim}
            onClick={e => { e.stopPropagation(); onClaim?.(); }}
            className="px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={canClaim ? {
              background: "linear-gradient(135deg, #0ea5e9, #38bdf8)",
              color: "#000",
              boxShadow: "0 0 16px rgba(56,189,248,0.4)",
            } : {
              background: "rgba(56,189,248,0.1)",
              color: "#94a3b8",
              border: "1px solid rgba(56,189,248,0.2)",
            }}
          >
            {canClaim ? "Claim!" : "Locked"}
          </button>
        </div>
      )}

      {/* Standard slot requirements summary */}
      {!isDouble && !isLegends && !isMWSBC && !isWinReward && (
        <div className="flex flex-wrap gap-2">
          {sbc.requiredRoles.map((req, i) => {
            const have = col.filter(c => c.role === req.role && r10(c.overallRating) >= req.minRating).length;
            const met = have >= req.count;
            return (
              <div key={i} className="text-xs px-2.5 py-1 rounded-lg border font-bold"
                style={{
                  background: met ? "rgba(74,222,128,0.1)" : "rgba(251,191,36,0.08)",
                  borderColor: met ? "rgba(74,222,128,0.4)" : "rgba(251,191,36,0.3)",
                  color: met ? "#4ade80" : "#fbbf24",
                }}>
                {met ? "✓" : `${have}/${req.count}`} {req.role} {req.minRating}+
              </div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────

type PackCard = { player: CardPlayer; cardType: CardType };

function buildPackReward(pack: { primes: number; icons: number; golds: number }): PackCard[] {
  const result: PackCard[] = [];
  const shuffled = <T,>(arr: T[]) => [...arr].sort(() => Math.random() - 0.5);

  // Primes
  shuffled(PRIME_PLAYERS).slice(0, pack.primes).forEach(p =>
    result.push({ player: toCardPlayer(p), cardType: "prime" })
  );
  // Icons
  shuffled(ICON_PLAYERS).slice(0, pack.icons).forEach(p =>
    result.push({ player: toCardPlayer(p), cardType: "icon" })
  );
  // Golds: players with overallRating >= 700 from main pool
  const golds = shuffled(ALL_PLAYERS_EXPORT.filter(p => p.overallRating >= 700));
  golds.slice(0, pack.golds).forEach(p =>
    result.push({ player: toCardPlayer(p), cardType: "normal" })
  );

  return shuffled(result);
}

export default function SBCs() {
  const [openSBC, setOpenSBC] = useState<SBCDefinition | null>(null);
  const [completedSBC, setCompletedSBC] = useState<string | null>(null);
  const [packCards, setPackCards] = useState<PackCard[] | null>(null);

  // Slot state lifted here so it persists across modal open/close
  const [sbcSlots, setSbcSlots] = useState<Record<string, Slot[]>>(() =>
    Object.fromEntries(SBC_DEFINITIONS.filter(s => !s.isDoubleSquad && !s.isLegendsOfGame && !s.isMWSquad && !s.isWinReward).map(s => [s.id, buildEmptySlots(s)]))
  );
  const [doubleSlots, setDoubleSlots] = useState<DSlot[]>(Array(22).fill(null));
  const [legendsSlots, setLegendsSlots] = useState<DSlot[]>(Array(11).fill(null));
  const [mwSlots, setMwSlots] = useState<Record<string, MWSlot[]>>(() =>
    Object.fromEntries(SBC_DEFINITIONS.filter(s => s.isMWSquad).map(s => [s.id, Array(7).fill(null)]))
  );

  const handleSubmit = (sbc: SBCDefinition, submittedCards: (CardPlayer & { addedAt: number })[]) => {
    removeFromCollection(submittedCards.map(c => c.addedAt));
    grantUnlock(sbc.id);
    setOpenSBC(null);
    // Reset the slots for this SBC after successful submission
    if (sbc.isDoubleSquad) {
      setDoubleSlots(Array(22).fill(null));
    } else if (sbc.isLegendsOfGame) {
      setLegendsSlots(Array(11).fill(null));
    } else if (sbc.isMWSquad) {
      setMwSlots(prev => ({ ...prev, [sbc.id]: Array(7).fill(null) }));
    } else {
      setSbcSlots(prev => ({ ...prev, [sbc.id]: buildEmptySlots(sbc) }));
    }

    if (sbc.isLegendsOfGame) {
      // Reward: 1 random icon card
      const icon = [...ICON_PLAYERS].sort(() => Math.random() - 0.5)[0];
      addToCollection([toCardPlayer(icon)]);
      setPackCards([{ player: toCardPlayer(icon), cardType: "icon" }]);
      return;
    }

    if (sbc.isMWSquad) {
      const reward = getMWPlayer(sbc.rewardPlayerId);
      if (reward) addToCollection([toCardPlayer(reward)]);
      setCompletedSBC(sbc.id);
      setTimeout(() => setCompletedSBC(null), 4000);
      return;
    }

    if (sbc.rewardPack) {
      const cards = buildPackReward(sbc.rewardPack);
      addToCollection(cards.map(c => c.player));
      setPackCards(cards);
    } else {
      const reward = getPrimePlayer(sbc.rewardPlayerId);
      if (reward) addToCollection([toCardPlayer(reward)]);
      setCompletedSBC(sbc.id);
      setTimeout(() => setCompletedSBC(null), 4000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-display font-black text-white mb-2">Squad Building Challenges</h1>
        <p className="text-muted-foreground">
          Assemble a squad from your collection and submit it to unlock exclusive rewards.
          Submitted players are permanently sacrificed.
        </p>
      </div>

      {/* Completion toast */}
      <AnimatePresence>
        {completedSBC && (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white font-black px-6 py-3 rounded-xl shadow-xl text-sm"
          >
            {SBC_DEFINITIONS.find(s => s.id === completedSBC)?.isMWSquad
              ? "SBC Complete! Match Winner card added to your collection 🏆"
              : "SBC Complete! Prime player added to your collection 🎉"}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Prime rewards showcase */}
      <div className="mb-10">
        <h2 className="text-sm font-black uppercase tracking-widest text-amber-400 mb-4">Prime Rewards</h2>
        <div className="flex flex-wrap gap-4 justify-center">
          {PRIME_PLAYERS.filter(p => SBC_DEFINITIONS.some(s => s.rewardPlayerId === p.id && !s.isMWSquad)).map(p => (
            <div key={p.id} className="flex flex-col items-center gap-2">
              <CricketCard player={toCardPlayer(p)} cardType="prime" size="md" />
              <span className="text-xs font-black" style={{ color: hasUnlock(SBC_DEFINITIONS.find(s => s.rewardPlayerId === p.id)?.id ?? "") ? "#4ade80" : "#fbbf24" }}>
                {hasUnlock(SBC_DEFINITIONS.find(s => s.rewardPlayerId === p.id)?.id ?? "") ? "UNLOCKED" : "LOCKED"}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Match Winner SBC rewards showcase */}
      {SBC_DEFINITIONS.filter(s => s.isMWSquad).length > 0 && (
        <div className="mb-10">
          <h2 className="text-sm font-black uppercase tracking-widest text-red-400 mb-4">🏆 Match Winner Rewards</h2>
          <div className="flex flex-wrap gap-4 justify-center">
            {SBC_DEFINITIONS.filter(s => s.isMWSquad).map(s => {
              const mwp = getMWPlayer(s.rewardPlayerId);
              if (!mwp) return null;
              return (
                <div key={s.id} className="flex flex-col items-center gap-2">
                  <CricketCard player={toCardPlayer(mwp)} cardType="mw" size="md" />
                  <span className="text-xs font-black" style={{ color: hasUnlock(s.id) ? "#4ade80" : "#f87171" }}>
                    {hasUnlock(s.id) ? "UNLOCKED" : "LOCKED"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex flex-col gap-6">
        {SBC_DEFINITIONS.map(sbc => (
          <SBCCard
            key={sbc.id}
            sbc={sbc}
            onOpen={() => setOpenSBC(sbc)}
            onClaim={sbc.isWinReward ? () => {
              if (sbc.rewardPack) {
                const cards = buildPackReward(sbc.rewardPack);
                addToCollection(cards.map(c => c.player));
                setPackCards(cards);
              }
              grantUnlock(sbc.id);
            } : undefined}
          />
        ))}
      </div>

      {/* Squad builder modals */}
      <AnimatePresence>
        {openSBC && !openSBC.isDoubleSquad && !openSBC.isLegendsOfGame && !openSBC.isMWSquad && sbcSlots[openSBC.id] && (
          <SquadBuilder
            sbc={openSBC}
            slots={sbcSlots[openSBC.id]}
            onSlotsChange={(s) => setSbcSlots(prev => ({ ...prev, [openSBC.id]: s }))}
            onClose={() => setOpenSBC(null)}
            onSubmit={(cards) => handleSubmit(openSBC, cards)}
          />
        )}
        {openSBC && openSBC.isDoubleSquad && (
          <DoubleSquadBuilder
            sbc={openSBC}
            slots={doubleSlots}
            onSlotsChange={setDoubleSlots}
            onClose={() => setOpenSBC(null)}
            onSubmit={(cards) => handleSubmit(openSBC, cards)}
          />
        )}
        {openSBC && openSBC.isLegendsOfGame && (
          <LegendsBuilder
            sbc={openSBC}
            slots={legendsSlots}
            onSlotsChange={setLegendsSlots}
            onClose={() => setOpenSBC(null)}
            onSubmit={(cards) => handleSubmit(openSBC, cards)}
          />
        )}
        {openSBC && openSBC.isMWSquad && mwSlots[openSBC.id] && (
          <MWSquadBuilder
            sbc={openSBC}
            slots={mwSlots[openSBC.id]}
            onSlotsChange={(s) => setMwSlots(prev => ({ ...prev, [openSBC.id]: s }))}
            onClose={() => setOpenSBC(null)}
            onSubmit={(cards) => handleSubmit(openSBC, cards)}
          />
        )}
        {packCards && (
          <PackReveal
            cards={packCards}
            onClose={() => setPackCards(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
