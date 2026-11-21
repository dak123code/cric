import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Crown, Plus, RotateCcw, Swords, Zap } from "lucide-react";
import { ALL_PLAYERS_EXPORT } from "@/lib/static-data";
import type { Player } from "@/lib/static-data";
import { runLocalSimulation, getCardType, type MatchResult } from "@/lib/draft-sim";
import { setMatchSetup } from "@/lib/match-store";
import { CricketCard, baseTierFor, type CardType } from "@/components/cricket-card";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button, Modal } from "@/components/shared";
import { MatchScorecard } from "@/components/match-scorecard";
import { TossCutscene } from "@/components/toss-cutscene";
import { cn } from "@/lib/utils";

// FIFA-style draft: pick a team shape → pick a captain from 5 → fill each
// remaining slot by choosing 1 of 5 cards → play an AI that drafted the same way.

type Role = Player["role"];

interface Formation {
  id: string;
  name: string;
  desc: string;
  counts: Record<Role, number>;
}

const FORMATIONS: Formation[] = [
  { id: "balanced", name: "Balanced",       desc: "The classic T20 shape.",         counts: { batsman: 4, wicketkeeper: 1, allrounder: 2, bowler: 4 } },
  { id: "batting",  name: "Batting Heavy",  desc: "Post a huge total.",             counts: { batsman: 5, wicketkeeper: 1, allrounder: 2, bowler: 3 } },
  { id: "bowling",  name: "Bowling Attack", desc: "Five strike bowlers.",           counts: { batsman: 3, wicketkeeper: 1, allrounder: 2, bowler: 5 } },
  { id: "allround", name: "All-Rounders",   desc: "Depth with bat and ball.",       counts: { batsman: 3, wicketkeeper: 1, allrounder: 4, bowler: 3 } },
];

// Batting order the slots are laid out in (and the order the XI bats in).
const ROLE_ORDER: Role[] = ["batsman", "wicketkeeper", "allrounder", "bowler"];

const ROLE_SHORT: Record<Role, string> = { batsman: "BAT", wicketkeeper: "WK", allrounder: "AR", bowler: "BWL" };
const ROLE_LABEL: Record<Role, string> = { batsman: "Batsman", wicketkeeper: "Wicketkeeper", allrounder: "All-rounder", bowler: "Bowler" };
// Role colours only on the team-shape picker; everywhere else a card's look comes from its tier.
const ROLE_STYLE: Record<Role, string> = {
  batsman:      "text-blue-300   border-blue-400/40   bg-blue-400/10",
  wicketkeeper: "text-yellow-300 border-yellow-400/40 bg-yellow-400/10",
  allrounder:   "text-purple-300 border-purple-400/40 bg-purple-400/10",
  bowler:       "text-red-300    border-red-400/40    bg-red-400/10",
};
const ROLE_CHIP = "text-slate-300 border-slate-500/40 bg-slate-500/10";

// Mirrors the colours CricketCard uses for each tier.
const TIER: Record<CardType,{ label: string | null; text: string; pill: string }> = {
  normal:    { label: null,      text: "text-white",       pill: "" },
  totw:      { label: "TOTW",    text: "text-sky-300",     pill: "bg-gradient-to-r from-blue-500 to-sky-400 text-white" },
  prime:     { label: "PRIME",   text: "text-yellow-300",  pill: "bg-gradient-to-r from-yellow-400 to-amber-300 text-black" },
  icon:      { label: "ICON",    text: "text-purple-300",  pill: "bg-gradient-to-r from-purple-400 to-fuchsia-400 text-black" },
  mw:        { label: "MW",      text: "text-orange-300",  pill: "bg-gradient-to-r from-red-600 to-orange-500 text-white" },
  "mw-icon": { label: "ICON MW", text: "text-fuchsia-300", pill: "bg-gradient-to-r from-purple-500 to-red-500 text-white" },
  bazball:   { label: "BAZBALL", text: "text-green-300",   pill: "bg-gradient-to-r from-green-600 to-emerald-500 text-white" },
};
// Normal cards by rating: gold (75+), silver (65–74), bronze — same tones as the cards.
const BASE_TEXT = { gold: "text-[#f4e4b8]", silver: "text-[#e4e7ec]", bronze: "text-[#ebb991]" } as const;

function nameColor(p: Player): string {
  const type = getCardType(p);
  return type === "normal" ? BASE_TEXT[baseTierFor(ovr(p))] : TIER[type].text;
}

const CHOICES_PER_PICK = 5;
const CAPTAIN_POOL_SIZE = 30;

// ── Draft helpers ──────────────────────────────────────────────────

function slotRoles(f: Formation): Role[] {
  return ROLE_ORDER.flatMap(r => Array<Role>(f.counts[r]).fill(r));
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Up to 5 random players, never repeating a person (special cards share names). */
function drawChoices(candidates: Player[], takenNames: Set<string>): Player[] {
  const seen = new Set(takenNames);
  const out: Player[] = [];
  for (const p of shuffle(candidates)) {
    if (seen.has(p.name)) continue;
    seen.add(p.name);
    out.push(p);
    if (out.length === CHOICES_PER_PICK) break;
  }
  return out;
}

const CAPTAIN_CANDIDATES = [...ALL_PLAYERS_EXPORT]
  .sort((a, b) => b.overallRating - a.overallRating)
  .slice(0, CAPTAIN_POOL_SIZE);

// Same rounding the cards use, so the list and the card always show the same number.
const ovr = (p: Player) => Math.min(99, Math.ceil(p.overallRating / 10));

function teamRating(players: (Player | null)[]): number {
  const xs = players.filter(Boolean) as Player[];
  if (!xs.length) return 0;
  return Math.round(xs.reduce((s, p) => s + p.overallRating, 0) / xs.length / 10);
}

const best = (xs: Player[]) => [...xs].sort((a, b) => b.overallRating - a.overallRating)[0];

/** The AI drafts exactly like the user: random shape, best captain of 5, best of 5 per slot. */
function draftAI(userPicks: Player[]): { formation: Formation; xi: Player[]; captainId: number } {
  const formation = FORMATIONS[Math.floor(Math.random() * FORMATIONS.length)];
  const roles = slotRoles(formation);
  const taken = new Set(userPicks.map(p => p.name));
  const xi: (Player | null)[] = Array(roles.length).fill(null);

  const captain = best(drawChoices(CAPTAIN_CANDIDATES, taken));
  xi[roles.indexOf(captain.role)] = captain;
  taken.add(captain.name);

  roles.forEach((role, i) => {
    if (xi[i]) return;
    const pick = best(drawChoices(ALL_PLAYERS_EXPORT.filter(p => p.role === role), taken));
    xi[i] = pick;
    taken.add(pick.name);
  });

  return { formation, xi: xi as Player[], captainId: captain.id };
}

// ── Page ───────────────────────────────────────────────────────────

type Phase = "formation" | "captain" | "draft" | "ready";

export default function DraftAI() {
  const [, navigate] = useLocation();
  const [phase, setPhase] = useState<Phase>("formation");
  const [formation, setFormation] = useState<Formation | null>(null);
  const [picks, setPicks] = useState<(Player | null)[]>([]);
  const [captainId, setCaptainId] = useState<number | null>(null);
  const [captainChoices, setCaptainChoices] = useState<Player[]>([]);
  // Choices are locked per slot once shown, so re-opening a slot can't re-roll it.
  const [slotChoices, setSlotChoices] = useState<Record<number, Player[]>>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(null);
  const [opponent, setOpponent] = useState<ReturnType<typeof draftAI> | null>(null);
  const [showToss, setShowToss] = useState(false);
  const [result, setResult] = useState<MatchResult | null>(null);

  const roles = useMemo(() => (formation ? slotRoles(formation) : []), [formation]);
  const filled = picks.filter(Boolean).length;
  const rating = teamRating(picks);
  const takenNames = () => new Set((picks.filter(Boolean) as Player[]).map(p => p.name));

  const chooseFormation = (f: Formation) => {
    setFormation(f);
    setPicks(Array(slotRoles(f).length).fill(null));
    setCaptainChoices(drawChoices(CAPTAIN_CANDIDATES, new Set()));
    setPhase("captain");
  };

  const chooseCaptain = (p: Player) => {
    const next = [...picks];
    next[roles.indexOf(p.role)] = p;
    setPicks(next);
    setCaptainId(p.id);
    setPhase("draft");
  };

  const openSlot = (i: number) => {
    if (picks[i]) return;
    if (!slotChoices[i]) {
      const pool = ALL_PLAYERS_EXPORT.filter(p => p.role === roles[i]);
      setSlotChoices(prev => ({ ...prev, [i]: drawChoices(pool, takenNames()) }));
    }
    setActiveSlot(i);
  };

  const pickForSlot = (p: Player) => {
    if (activeSlot === null) return;
    const next = [...picks];
    next[activeSlot] = p;
    setPicks(next);
    setActiveSlot(null);
  };

  const finishDraft = () => {
    setOpponent(draftAI(picks as Player[]));
    setPhase("ready");
  };

  const restart = () => {
    setPhase("formation");
    setFormation(null);
    setPicks([]);
    setCaptainId(null);
    setSlotChoices({});
    setOpponent(null);
    setResult(null);
  };

  const playMatch = () => {
    if (!opponent) return;
    setMatchSetup({
      team1Name: "Your XI", team1Flag: "🧢", team1Players: picks as Player[],
      team2Name: "AI XI",   team2Flag: "🤖", team2Players: opponent.xi,
      overs: 20,
      difficulty: "medium",
      returnTo: "/draft-ai",
      returnLabel: "New Draft",
    });
    navigate("/match-play");
  };

  const quickSim = (userBatsFirst: boolean) => {
    if (!opponent) return;
    const me = picks as Player[];
    setShowToss(false);
    setResult(userBatsFirst
      ? runLocalSimulation(me, opponent.xi, "Your XI", "AI XI")
      : runLocalSimulation(opponent.xi, me, "AI XI", "Your XI"));
  };

  const activeChoices = activeSlot !== null ? slotChoices[activeSlot] ?? [] : [];
  const userCaptain = picks.find(p => p?.id === captainId) ?? null;
  const aiCaptain = opponent?.xi.find(p => p.id === opponent.captainId) ?? null;

  return (
    <div className="py-6 max-w-5xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-4xl font-display font-black text-white">DRAFT <span className="text-primary">VS AI</span></h1>
          <p className="text-muted-foreground mt-1">
            {phase === "formation" && "Step 1 of 3 · Pick your team shape."}
            {phase === "captain" && "Step 2 of 3 · Pick your captain."}
            {phase === "draft" && "Step 3 of 3 · Tap each empty slot and pick 1 of 5 players."}
            {phase === "ready" && "Your XI is set. Time to face the AI."}
          </p>
        </div>
        {(phase === "captain" || phase === "draft") && (
          <div className="flex items-center gap-4">
            <RatingBadge label="Team rating" value={rating} />
            <div className="text-right">
              <div className="text-2xl font-display font-black text-white">{filled}<span className="text-muted-foreground text-lg">/11</span></div>
              <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">Picked</div>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence mode="wait">
        {/* ── 1. Team shape ─────────────────────────────────────── */}
        {phase === "formation" && (
          <motion.div key="formation" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {FORMATIONS.map(f => (
              <motion.button key={f.id} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={() => chooseFormation(f)}
                className="text-left rounded-2xl border-2 border-border/50 bg-card/60 hover:border-primary/60 p-5 transition-colors">
                <div className="font-display font-black text-xl text-white">{f.name}</div>
                <div className="text-sm text-muted-foreground mb-4">{f.desc}</div>
                <div className="flex flex-wrap gap-2">
                  {ROLE_ORDER.map(r => (
                    <span key={r} className={cn("text-xs font-black px-2 py-1 rounded-lg border", ROLE_STYLE[r])}>
                      {f.counts[r]} {ROLE_SHORT[r]}
                    </span>
                  ))}
                </div>
              </motion.button>
            ))}
          </motion.div>
        )}

        {/* ── 2. Captain ────────────────────────────────────────── */}
        {phase === "captain" && (
          <motion.div key="captain" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="text-center">
            <div className="inline-flex items-center gap-2 text-primary font-black uppercase tracking-widest text-sm mb-6">
              <Crown className="w-5 h-5" /> Choose your captain
            </div>
            <div className="flex flex-wrap gap-4 justify-center">
              {captainChoices.map(p => (
                <CricketCard key={p.id} player={p} cardType={getCardType(p)} size="md" onClick={() => chooseCaptain(p)} />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── 3. Draft the XI ───────────────────────────────────── */}
        {phase === "draft" && formation && (
          <motion.div key="draft" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <Pitch roles={roles} picks={picks} captainId={captainId} onSlot={openSlot} />
            <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
              <Button variant="ghost" onClick={restart}><RotateCcw className="w-4 h-4 mr-2" />Start over</Button>
              <Button size="lg" disabled={filled < roles.length} onClick={finishDraft}>
                <Swords className="w-5 h-5 mr-2" />{filled < roles.length ? `Pick ${roles.length - filled} more` : "Face the AI"}
              </Button>
            </div>
          </motion.div>
        )}

        {/* ── 4. Ready to play ──────────────────────────────────── */}
        {phase === "ready" && opponent && (
          <motion.div key="ready" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="space-y-8">
            <div className="flex items-center justify-center gap-6 sm:gap-12">
              <RatingBadge label="Your XI" value={rating} big />
              <span className="font-display font-black text-2xl text-muted-foreground">VS</span>
              <RatingBadge label="AI XI" value={teamRating(opponent.xi)} big muted />
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" onClick={playMatch}><Swords className="w-5 h-5 mr-2" />Play Match</Button>
              <Button size="lg" variant="outline" onClick={() => setShowToss(true)}><Zap className="w-5 h-5 mr-2" />Quick Sim</Button>
              <Button size="lg" variant="ghost" onClick={restart}><RotateCcw className="w-5 h-5 mr-2" />New Draft</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <TeamList title="Your XI" shape={formation?.name ?? ""} players={picks as Player[]} captainId={captainId} accent="border-primary text-primary" />
              <TeamList title="AI XI" shape={opponent.formation.name} players={opponent.xi} captainId={opponent.captainId} accent="border-blue-500 text-blue-400" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Pick 1 of 5 ─────────────────────────────────────────── */}
      <Modal isOpen={activeSlot !== null} onClose={() => setActiveSlot(null)}>
        {activeSlot !== null && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-xl font-display font-black text-white">Pick your {ROLE_LABEL[roles[activeSlot]].toLowerCase()}</h3>
              <p className="text-muted-foreground text-sm mt-1">Tap a card to add them to your XI.</p>
            </div>
            <div className="flex gap-4 justify-center flex-wrap">
              {activeChoices.map(p => (
                <CricketCard key={p.id} player={p} cardType={getCardType(p)} size="sm" onClick={() => pickForSlot(p)} />
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={!!result} onClose={() => setResult(null)}>
        {result && <MatchScorecard result={result as any} onDone={() => setResult(null)} />}
      </Modal>

      <AnimatePresence>
        {showToss && (
          <TossCutscene
            captain1={userCaptain}
            captain2={aiCaptain}
            label1="You"
            label2="AI"
            showBatChoice
            is1P
            onComplete={quickSim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────

function RatingBadge({ label, value, big, muted }: { label: string; value: number; big?: boolean; muted?: boolean }) {
  return (
    <div className="text-center">
      <div className={cn(
        "font-display font-black leading-none",
        big ? "text-6xl" : "text-3xl",
        muted ? "text-blue-400" : "text-primary",
      )}>{value || "–"}</div>
      <div className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground mt-1">{label}</div>
    </div>
  );
}

const PITCH_ROWS: { label: string; roles: Role[] }[] = [
  { label: "Top order",         roles: ["batsman"] },
  { label: "Keeper & all-rounders", roles: ["wicketkeeper", "allrounder"] },
  { label: "Bowlers",           roles: ["bowler"] },
];

function Pitch({ roles, picks, captainId, onSlot }: {
  roles: Role[];
  picks: (Player | null)[];
  captainId: number | null;
  onSlot: (i: number) => void;
}) {
  const size = useIsMobile() ? "xs" : "sm";
  return (
    <div className="rounded-3xl border border-green-500/20 p-4 sm:p-6 space-y-6"
      style={{ background: "radial-gradient(ellipse at center, rgba(34,197,94,0.14) 0%, rgba(22,101,52,0.08) 55%, transparent 100%)" }}>
      {PITCH_ROWS.map(row => (
        <div key={row.label}>
          <div className="text-center text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3">{row.label}</div>
          <div className="flex flex-wrap justify-center gap-3">
            {roles.map((r, i) => row.roles.includes(r) && (
              <Slot key={i} size={size} role={r} player={picks[i]} isCaptain={picks[i]?.id === captainId} onClick={() => onSlot(i)} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

const SLOT_DIMS = { xs: "w-[100px] h-[141px]", sm: "w-[130px] h-[184px]" } as const;

function Slot({ size, role, player, isCaptain, onClick }: {
  size: keyof typeof SLOT_DIMS;
  role: Role;
  player: Player | null;
  isCaptain: boolean;
  onClick: () => void;
}) {
  if (player) {
    return (
      <motion.div
        initial={{ rotateY: 90, opacity: 0 }}
        animate={{ rotateY: 0, opacity: 1 }}
        transition={{ duration: 0.45, ease: "easeOut" }}
        className="relative" style={{ perspective: 800 }}>
        <CricketCard player={player} cardType={getCardType(player)} size={size} className="cursor-default" />
        {isCaptain && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-1 rounded-full bg-primary text-primary-foreground px-2 py-0.5 text-[9px] font-black tracking-widest shadow-lg">
            <Crown className="w-3 h-3" />CAPT
          </span>
        )}
      </motion.div>
    );
  }
  return (
    <motion.button whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }} onClick={onClick}
      className={cn(SLOT_DIMS[size], "relative rounded-xl border-2 border-dashed border-border/60 bg-card/40 hover:border-primary/70 hover:bg-card/70 flex flex-col items-center justify-center gap-1 transition-colors")}>
      <span className={cn("absolute top-1.5 left-1.5 text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded border", ROLE_CHIP)}>{ROLE_SHORT[role]}</span>
      <Plus className="w-6 h-6 text-muted-foreground" />
      <span className="text-[10px] text-muted-foreground font-medium">{ROLE_LABEL[role]}</span>
    </motion.button>
  );
}

function TeamList({ title, shape, players, captainId, accent }: {
  title: string;
  shape: string;
  players: Player[];
  captainId: number | null;
  accent: string;
}) {
  const [border, text] = accent.split(" ");
  return (
    <div className={cn("rounded-2xl border-t-4 bg-card p-5", border)}>
      <div className="flex items-baseline justify-between mb-4">
        <h3 className={cn("font-display font-black text-lg", text)}>{title}</h3>
        <span className="text-xs text-muted-foreground font-bold">{shape}</span>
      </div>
      <div className="space-y-2">
        {players.map((p, i) => {
          const tier = TIER[getCardType(p)];
          return (
            <div key={p.id} className="flex items-center gap-2 text-sm">
              <span className="text-muted-foreground w-5 text-right font-mono shrink-0">{i + 1}</span>
              <span className={cn("flex-1 min-w-0 truncate font-medium", nameColor(p))}>
                {p.name}{p.id === captainId && <Crown className="inline w-3.5 h-3.5 ml-1.5 text-primary -mt-0.5" />}
              </span>
              {tier.label && (
                <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider shrink-0", tier.pill)}>{tier.label}</span>
              )}
              <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded border shrink-0", ROLE_CHIP)}>{ROLE_SHORT[p.role]}</span>
              <span className={cn("text-xs font-black shrink-0 w-6 text-right", nameColor(p))}>{ovr(p)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
