import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/shared";
import { setMatchSetup } from "@/lib/match-store";
import type { Difficulty } from "@/lib/match-store";
import { motion, AnimatePresence } from "framer-motion";
import { getCountriesWithFullSquad, getCountrySquad, type Player } from "@/lib/static-data";
import { getCollection } from "@/lib/game-store";

const FORMAT_OPTIONS = [
  { overs: 2,  label: "2 Overs",  desc: "Lightning match" },
  { overs: 5,  label: "5 Overs",  desc: "Power play only" },
  { overs: 10, label: "10 Overs", desc: "Half a T20" },
];

const MY_COLLECTION_ID = "__my_collection__";

type Step = "select" | "xi1" | "xi2";

export default function QuickMatch() {
  const countries = getCountriesWithFullSquad();
  const [, navigate] = useLocation();
  const [step, setStep] = useState<Step>("select");
  const [team1Id, setTeam1Id] = useState("");
  const [team2Id, setTeam2Id] = useState("");
  const [overs, setOvers] = useState(10);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");
  const [twoPlayer, setTwoPlayer] = useState(false);
  const [xi1, setXi1] = useState<Player[]>([]);
  const [xi2, setXi2] = useState<Player[]>([]);

  // Collected cards — cast to Player[] (compatible fields)
  const collectionAsPlayers = useMemo(
    () => getCollection() as unknown as Player[],
    []
  );

  const t1 = team1Id === MY_COLLECTION_ID
    ? { id: MY_COLLECTION_ID, name: "My Collection", flag: "🏆" }
    : countries.find(c => c.id === team1Id);
  const t2 = countries.find(c => c.id === team2Id);

  const getSquad = (id: string): Player[] => {
    if (id === MY_COLLECTION_ID) return collectionAsPlayers;
    const squad = getCountrySquad(id);
    const country = countries.find(c => c.id === id);
    if (country?.name === "England") {
      return squad.filter(p => (p.overallRating ?? 0) >= 750);
    }
    return squad;
  };

  const handleStart = () => {
    if (!t1 || !t2) return;
    setMatchSetup({
      team1Name: t1.name, team1Flag: t1.flag ?? "",
      team1Players: xi1,
      team2Name: t2.name, team2Flag: t2.flag ?? "",
      team2Players: xi2,
      overs,
      difficulty,
      twoPlayer,
    });
    navigate("/match-play");
  };

  const collectionCount = collectionAsPlayers.length;
  const hasEnoughCards = collectionCount >= 11;

  return (
    <div className="max-w-5xl mx-auto py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-10">
        <h1 className="text-4xl font-display font-black text-white">
          QUICK <span className="text-primary">MATCH</span>
        </h1>
        <p className="text-muted-foreground mt-2">Select teams, pick your XIs, and play</p>
      </motion.div>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 mb-8">
        {(["select", "xi1", "xi2"] as Step[]).map((s, i) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black transition-all ${
              step === s ? "bg-primary text-black scale-110" :
              (step === "xi2" && s === "select") || (step === "xi2" && s === "xi1") || (step === "xi1" && s === "select")
                ? "bg-green-600 text-white" : "bg-card border border-border/50 text-muted-foreground"
            }`}>{i + 1}</div>
            {i < 2 && <div className="w-8 h-px bg-border/50" />}
          </div>
        ))}
        <span className="ml-3 text-xs text-muted-foreground font-bold uppercase tracking-wider">
          {step === "select" ? "Choose Teams" : step === "xi1" ? `Pick ${t1?.name} XI` : `Pick ${t2?.name} XI`}
        </span>
      </div>

      <AnimatePresence mode="wait">
        {step === "select" && (
          <motion.div key="select" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>

            {/* My Collection callout */}
            {hasEnoughCards && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 p-4 rounded-2xl border border-primary/30 bg-primary/8 flex items-center gap-4"
              >
                <span className="text-3xl">🏆</span>
                <div className="flex-1">
                  <div className="font-black text-white text-sm">Play with My Collection</div>
                  <div className="text-xs text-muted-foreground">
                    You have {collectionCount} cards — select "My Collection" as your team
                  </div>
                </div>
                <button
                  onClick={() => setTeam1Id(MY_COLLECTION_ID)}
                  className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border transition-all ${
                    team1Id === MY_COLLECTION_ID
                      ? "bg-primary text-black border-primary"
                      : "border-primary/40 text-primary hover:bg-primary/10"
                  }`}
                >
                  {team1Id === MY_COLLECTION_ID ? "✓ Selected" : "Select"}
                </button>
              </motion.div>
            )}

            {/* 2-Player toggle */}
            <div className="mb-6 flex items-center justify-center gap-4 p-4 rounded-2xl bg-card border border-border/40">
              <div>
                <div className="font-black text-white text-sm">Game Mode</div>
                <div className="text-xs text-muted-foreground">Choose solo vs AI or pass-and-play with a friend</div>
              </div>
              <div className="flex gap-2 ml-auto">
                {[
                  { id: false, label: "🤖 vs AI",    desc: "1 Player" },
                  { id: true,  label: "👥 Pass & Play", desc: "2 Players" },
                ].map(opt => (
                  <button
                    key={String(opt.id)}
                    onClick={() => setTwoPlayer(opt.id)}
                    className={`flex flex-col items-center px-5 py-2.5 rounded-xl border-2 font-display font-bold transition-all text-sm ${
                      twoPlayer === opt.id
                        ? "border-primary bg-primary/15 text-primary scale-105"
                        : "border-border/50 bg-card text-muted-foreground hover:border-primary/40 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <span className="text-[10px] font-normal opacity-60">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
              <TeamSelector
                title={twoPlayer ? "Player 1 Team" : "Your Team"}
                accent="primary"
                teams={countries}
                selectedId={team1Id}
                showMyCollection={hasEnoughCards}
                myCollectionId={MY_COLLECTION_ID}
                onSelect={id => { setTeam1Id(id); if (id === team2Id) setTeam2Id(""); }}
              />
              <TeamSelector
                title={twoPlayer ? "Player 2 Team" : "Opponent"}
                accent="accent"
                teams={countries}
                selectedId={team2Id}
                showMyCollection={false}
                myCollectionId={MY_COLLECTION_ID}
                onSelect={id => { setTeam2Id(id); if (id === team1Id) setTeam1Id(""); }}
              />
            </div>

            <div className="mt-8">
              <h3 className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Match Format</h3>
              <div className="flex justify-center gap-3">
                {FORMAT_OPTIONS.map(opt => (
                  <button key={opt.overs} onClick={() => setOvers(opt.overs)}
                    className={`flex flex-col items-center px-6 py-3 rounded-2xl border-2 font-display font-bold transition-all ${
                      overs === opt.overs
                        ? "border-primary bg-primary/15 text-primary scale-105"
                        : "border-border/50 bg-card text-muted-foreground hover:border-primary/40 hover:text-white"
                    }`}>
                    <span className="text-xl">{opt.label}</span>
                    <span className="text-[11px] font-normal opacity-70 mt-0.5">{opt.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {!twoPlayer && (
              <div className="mt-6">
                <h3 className="text-center text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Difficulty</h3>
                <div className="flex justify-center gap-3">
                  {([
                    { id: "easy"   as Difficulty, label: "Easy",   desc: "Wider zones, forgiving timing", color: "#4ade80" },
                    { id: "medium" as Difficulty, label: "Medium", desc: "Balanced challenge",             color: "#fbbf24" },
                    { id: "hard"   as Difficulty, label: "Hard",   desc: "Tight zones, tough opponents",   color: "#f87171" },
                  ]).map(d => (
                    <button key={d.id} onClick={() => setDifficulty(d.id)}
                      className="flex flex-col items-center px-6 py-3 rounded-2xl border-2 font-display font-bold transition-all duration-200"
                      style={{
                        borderColor: difficulty === d.id ? d.color : "rgba(148,163,184,0.25)",
                        background: difficulty === d.id ? `${d.color}18` : "transparent",
                        transform: difficulty === d.id ? "scale(1.05)" : "scale(1)",
                      }}>
                      <span className="text-xl" style={{ color: d.color }}>{d.label}</span>
                      <span className="text-[11px] font-normal opacity-70 mt-0.5 text-white">{d.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {team1Id && team2Id && team1Id !== team2Id && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 text-center">
                <Button size="lg" onClick={() => {
                  const squad = getSquad(team1Id);
                  setXi1(squad.slice(0, 11));
                  setStep("xi1");
                }} className="min-w-[280px]">
                  Next: Pick {t1?.name} XI →
                </Button>
              </motion.div>
            )}
          </motion.div>
        )}

        {step === "xi1" && t1 && (
          <motion.div key="xi1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <XIBuilder
              teamName={t1.name} teamFlag={t1.flag ?? ""}
              customSquad={getSquad(team1Id)}
              selected={xi1} onSelect={setXi1}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("select")}>← Back</Button>
              <Button disabled={xi1.length !== 11} onClick={() => {
                const squad = getSquad(team2Id);
                setXi2(squad.slice(0, 11));
                setStep("xi2");
              }}>
                Next: Pick {t2?.name} XI →
              </Button>
            </div>
          </motion.div>
        )}

        {step === "xi2" && t2 && (
          <motion.div key="xi2" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}>
            <XIBuilder
              teamName={t2.name} teamFlag={t2.flag ?? ""}
              customSquad={getSquad(team2Id)}
              selected={xi2} onSelect={setXi2}
            />
            <div className="flex justify-between mt-6">
              <Button variant="outline" onClick={() => setStep("xi1")}>← Back</Button>
              <Button disabled={xi2.length !== 11} onClick={handleStart}>
                🏏 Start {overs}-Over Match
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Team selector ─────────────────────────────────────────────────────────────

function TeamSelector({ title, accent, teams, selectedId, onSelect, showMyCollection, myCollectionId }: {
  title: string; accent: "primary" | "accent";
  teams: any[]; selectedId: string; onSelect: (id: string) => void;
  showMyCollection: boolean; myCollectionId: string;
}) {
  const sel = accent === "primary"
    ? "bg-primary/10 border-primary text-white scale-105 shadow-[0_0_20px_rgba(255,180,0,0.15)]"
    : "bg-accent/10 border-accent text-white scale-105 shadow-[0_0_20px_rgba(255,120,0,0.15)]";
  return (
    <div>
      <h3 className="text-xl font-display font-bold mb-4 text-center text-muted-foreground">{title}</h3>
      <div className="grid grid-cols-2 gap-3">
        {showMyCollection && (
          <button
            onClick={() => onSelect(myCollectionId)}
            className={`col-span-2 flex items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 ${
              selectedId === myCollectionId ? sel : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-white"
            }`}
          >
            <span className="text-3xl">🏆</span>
            <span className="font-display font-bold tracking-wide">My Collection</span>
          </button>
        )}
        {teams.map((c: any) => (
          <button key={c.id} onClick={() => onSelect(c.id)}
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all duration-300 ${
              selectedId === c.id ? sel : "bg-card border-border/50 text-muted-foreground hover:border-primary/50 hover:text-white"
            }`}>
            <span className="text-3xl mb-2">{c.flag}</span>
            <span className="font-display font-bold tracking-wide">{c.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ── XI Builder ────────────────────────────────────────────────────────────────

const ROLE_COLORS: Record<string, string> = {
  batsman:      "bg-blue-500/20 text-blue-300 border-blue-500/30",
  bowler:       "bg-red-500/20 text-red-300 border-red-500/30",
  allrounder:   "bg-green-500/20 text-green-300 border-green-500/30",
  wicketkeeper: "bg-purple-500/20 text-purple-300 border-purple-500/30",
};

function XIBuilder({ teamName, teamFlag, customSquad, selected, onSelect }: {
  teamName: string; teamFlag: string;
  customSquad: Player[];
  selected: Player[]; onSelect: (p: Player[]) => void;
}) {
  const squad = customSquad;
  const selectedIds = useMemo(() => new Set(selected.map(p => p.id)), [selected]);

  const toggle = (player: Player) => {
    if (selectedIds.has(player.id)) {
      onSelect(selected.filter(p => p.id !== player.id));
    } else if (selected.length < 11) {
      onSelect([...selected, player]);
    }
  };

  const autoFill = () => onSelect(squad.slice(0, 11));
  const clear = () => onSelect([]);

  if (squad.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <div className="text-4xl mb-4">📦</div>
        <p className="font-bold text-white">No cards in your collection yet!</p>
        <p className="text-sm mt-2">Open some packs first to build your collection.</p>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-3xl">{teamFlag}</span>
          <h2 className="text-2xl font-display font-black text-white">{teamName}</h2>
        </div>
        <div className="flex items-center gap-3">
          <span className={`text-sm font-black px-3 py-1 rounded-full ${selected.length === 11 ? "bg-green-600 text-white" : "bg-primary/20 text-primary"}`}>
            {selected.length}/11 selected
          </span>
          <button onClick={autoFill} className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-colors">
            Auto Best XI
          </button>
          <button onClick={clear} className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg bg-white/5 text-muted-foreground hover:text-white transition-colors">
            Clear
          </button>
        </div>
      </div>

      {/* Selected XI strip */}
      {selected.length > 0 && (
        <div className="mb-4 p-3 rounded-xl bg-white/5 border border-border/30">
          <div className="text-xs font-black uppercase tracking-wider text-muted-foreground mb-2">Your XI</div>
          <div className="flex flex-wrap gap-1.5">
            {selected.map((p, i) => (
              <button key={p.id} onClick={() => toggle(p)}
                className="text-xs px-2 py-1 rounded-lg bg-primary/20 text-primary border border-primary/30 font-bold hover:bg-red-500/20 hover:text-red-300 hover:border-red-500/30 transition-all">
                {i + 1}. {p.name.split(" ").slice(-1)[0]}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Full squad */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {squad.map(player => {
          const inXI = selectedIds.has(player.id);
          const disabled = !inXI && selected.length >= 11;
          return (
            <button key={player.id} onClick={() => toggle(player)} disabled={disabled}
              className={`flex items-center gap-3 p-3 rounded-xl border transition-all text-left ${
                inXI
                  ? "bg-primary/15 border-primary/50 scale-[1.01]"
                  : disabled
                    ? "bg-card border-border/20 opacity-30 cursor-not-allowed"
                    : "bg-card border-border/40 hover:border-primary/40 hover:bg-white/5"
              }`}>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-white text-sm truncate">{player.name}</div>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className={`text-[10px] font-black px-1.5 py-0.5 rounded border uppercase ${ROLE_COLORS[player.role ?? "batsman"]}`}>
                    {player.role === "wicketkeeper" ? "WK" : (player.role ?? "bat").slice(0, 3).toUpperCase()}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{player.country}</span>
                </div>
              </div>
              <div className={`text-lg font-black tabular-nums ${inXI ? "text-primary" : "text-muted-foreground"}`}>
                {Math.round((player.overallRating ?? 0) / 10)}
              </div>
              {inXI && <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-black text-[10px] font-black flex-shrink-0">✓</div>}
            </button>
          );
        })}
      </div>
    </div>
  );
}
