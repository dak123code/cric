import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocation } from "wouter";
import { Button, Card } from "@/components/shared";
import { addCoins, CAREER_COIN_REWARDS } from "@/lib/game-store";
import { loadCareer, saveCareer, applyFixtureResult, applyPlayedGame, getOpponentXI, type Career, type CareerPlayer } from "@/lib/career-store";
import { setMatchSetup } from "@/lib/match-store";
import { ALL_PLAYERS_EXPORT } from "@/lib/static-data";
import { Link } from "wouter";

function r10(v: number) { return Math.min(99, Math.ceil(v / 10)); }

// ── Squad tab ─────────────────────────────────────────────────────────────────

const ROLE_COLOR: Record<string, string> = {
  batsman: "#4ade80", bowler: "#60a5fa", allrounder: "#fbbf24", wicketkeeper: "#f472b6",
};

function SquadTab({ career, onUpdate }: { career: Career; onUpdate: (c: Career) => void }) {
  const [search, setSearch] = useState("");
  const [showSignPanel, setShowSignPanel] = useState(false);

  const squadIds = useMemo(() => new Set(career.squad.map(p => p.id)), [career.squad]);

  const availablePlayers = useMemo(() =>
    ALL_PLAYERS_EXPORT
      .filter(p => !squadIds.has(p.id))
      .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.country.toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => b.overallRating - a.overallRating),
    [squadIds, search]
  );

  const toggleXI = (playerId: number) => {
    const inXI = career.squad.filter(p => p.inXI);
    const updated = career.squad.map(p => {
      if (p.id !== playerId) return p;
      if (p.inXI) return { ...p, inXI: false };
      if (inXI.length >= 11) return p;
      return { ...p, inXI: true };
    });
    const next = { ...career, squad: updated };
    saveCareer(next);
    onUpdate(next);
  };

  const signPlayer = (player: typeof ALL_PLAYERS_EXPORT[number]) => {
    if (career.squad.length >= 25) return;
    const newPlayer: CareerPlayer = { ...player, inXI: false };
    const next = { ...career, squad: [...career.squad, newPlayer] };
    saveCareer(next);
    onUpdate(next);
  };

  const releasePlayer = (playerId: number) => {
    const updated = career.squad.filter(p => p.id !== playerId);
    const battingOrder = career.battingOrder.filter(id => id !== playerId);
    const next = { ...career, squad: updated, battingOrder };
    saveCareer(next);
    onUpdate(next);
  };

  const xi = career.squad.filter(p => p.inXI).sort((a, b) => b.overallRating - a.overallRating);
  const bench = career.squad.filter(p => !p.inXI).sort((a, b) => b.overallRating - a.overallRating);

  const PlayerRow = ({ p, inXI }: { p: CareerPlayer; inXI: boolean }) => (
    <div className="flex items-center gap-3 p-3 rounded-xl border transition-all hover:border-primary/40"
      style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(148,163,184,0.15)" }}>
      <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0 cursor-pointer"
        style={{ background: "rgba(255,255,255,0.07)", color: ROLE_COLOR[p.role] ?? "white" }}
        onClick={() => toggleXI(p.id)}>
        {r10(p.overallRating)}
      </div>
      <div className="flex-1 min-w-0 cursor-pointer" onClick={() => toggleXI(p.id)}>
        <div className="font-bold text-white text-sm truncate">{p.name}</div>
        <div className="text-xs font-bold" style={{ color: ROLE_COLOR[p.role] ?? "#94a3b8" }}>
          {p.role.toUpperCase()} · {p.country}
        </div>
      </div>
      <div className={`text-xs font-black px-2 py-0.5 rounded border cursor-pointer ${
        inXI ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-white/5 text-muted-foreground border-white/10"
      }`} onClick={() => toggleXI(p.id)}>
        {inXI ? "XI" : "BENCH"}
      </div>
      {!inXI && (
        <button
          onClick={() => releasePlayer(p.id)}
          className="text-[10px] font-black px-1.5 py-0.5 rounded border border-red-500/30 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors ml-1"
          title="Release player">
          ✕
        </button>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs mb-3 flex justify-between">
            <span>Playing XI</span>
            <span className={xi.length === 11 ? "text-green-400" : "text-amber-400"}>{xi.length}/11</span>
          </h4>
          <div className="space-y-2">
            {xi.map(p => <PlayerRow key={p.id} p={p} inXI={true} />)}
            {xi.length < 11 && (
              <p className="text-xs text-amber-400 font-bold text-center py-2">
                {11 - xi.length} more player{11 - xi.length !== 1 ? "s" : ""} needed — click bench players to add
              </p>
            )}
          </div>
        </div>
        <div>
          <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs mb-3">
            Bench ({bench.length}) <span className="text-muted-foreground/50 font-normal normal-case">— click ✕ to release</span>
          </h4>
          <div className="space-y-2">
            {bench.map(p => <PlayerRow key={p.id} p={p} inXI={false} />)}
            {bench.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">All players are in the XI.</p>
            )}
          </div>
        </div>
      </div>

      {/* Sign Players panel */}
      <div className="border-t border-border/40 pt-5">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-black text-muted-foreground uppercase tracking-widest text-xs">
            Sign Players <span className="text-muted-foreground/50 font-normal normal-case">({career.squad.length}/25 squad)</span>
          </h4>
          <button
            onClick={() => setShowSignPanel(v => !v)}
            className="text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors">
            {showSignPanel ? "Hide" : "Browse Players"}
          </button>
        </div>
        {showSignPanel && (
          <div>
            <input
              type="text"
              placeholder="Search by name or country…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full bg-background border border-border/50 focus:border-primary rounded-xl px-4 py-2.5 text-sm text-white outline-none mb-3 placeholder:text-muted-foreground/50 transition-colors"
            />
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {availablePlayers.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No players found.</p>
              )}
              {availablePlayers.map(p => (
                <div key={p.id} className="flex items-center gap-3 p-3 rounded-xl border"
                  style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(148,163,184,0.12)" }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm flex-shrink-0"
                    style={{ background: "rgba(255,255,255,0.05)", color: ROLE_COLOR[p.role] ?? "white" }}>
                    {r10(p.overallRating)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-white text-sm truncate">{p.name}</div>
                    <div className="text-xs font-bold" style={{ color: ROLE_COLOR[p.role] ?? "#94a3b8" }}>
                      {p.role.toUpperCase()} · {p.country}
                    </div>
                  </div>
                  <button
                    onClick={() => signPlayer(p)}
                    disabled={career.squad.length >= 25}
                    className="text-xs font-black px-3 py-1 rounded-lg border border-primary/40 bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-30">
                    Sign
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── League table tab ──────────────────────────────────────────────────────────

function TableTab({ career }: { career: Career }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs font-black uppercase tracking-wider text-muted-foreground border-b border-border/40">
            <th className="pb-3 pr-4">#</th>
            <th className="pb-3 pr-4">Team</th>
            <th className="pb-3 pr-4 text-center">P</th>
            <th className="pb-3 pr-4 text-center">W</th>
            <th className="pb-3 pr-4 text-center">L</th>
            <th className="pb-3 text-center">Pts</th>
          </tr>
        </thead>
        <tbody>
          {career.leagueTable.map((entry, i) => {
            const isUser = entry.teamId === career.teamId;
            return (
              <tr key={entry.teamId}
                className={`border-b transition-colors ${isUser ? "border-primary/20" : "border-border/20"}`}
                style={{ background: isUser ? "rgba(255,180,0,0.06)" : "transparent" }}>
                <td className="py-3 pr-4 font-black text-muted-foreground">{i + 1}</td>
                <td className="py-3 pr-4">
                  <span className={`font-bold ${isUser ? "text-primary" : "text-white"}`}>
                    {entry.shortName}
                    {isUser && <span className="ml-2 text-[9px] text-primary/70 font-black uppercase">YOU</span>}
                  </span>
                </td>
                <td className="py-3 pr-4 text-center text-muted-foreground">{entry.played}</td>
                <td className="py-3 pr-4 text-center text-green-400 font-bold">{entry.won}</td>
                <td className="py-3 pr-4 text-center text-red-400 font-bold">{entry.lost}</td>
                <td className="py-3 text-center font-black text-white text-base">{entry.points}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// ── Pre-match modal ───────────────────────────────────────────────────────────

function PreMatchModal({
  career,
  onClose,
  onSimulate,
  onPlayIt,
  onOrderChange,
}: {
  career: Career;
  onClose: () => void;
  onSimulate: () => void;
  onPlayIt: (order: number[]) => void;
  onOrderChange: (order: number[]) => void;
}) {
  const xi = career.squad.filter(p => p.inXI);
  // Initialise batting order: use saved order, falling back to squad order for any missing
  const initialOrder = (() => {
    const saved = (career.battingOrder ?? []).filter(id => xi.some(p => p.id === id));
    const missing = xi.filter(p => !saved.includes(p.id)).map(p => p.id);
    return [...saved, ...missing];
  })();
  const [order, setOrder] = useState<number[]>(initialOrder);

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...order];
    const swapIdx = idx + dir;
    if (swapIdx < 0 || swapIdx >= next.length) return;
    [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
    setOrder(next);
    onOrderChange(next);
  };

  const RoleColor: Record<string, string> = {
    batsman: "#4ade80", bowler: "#60a5fa", allrounder: "#fbbf24", wicketkeeper: "#f472b6",
  };

  const nextFixture = career.fixtures.find(f => !f.played);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <motion.div
        initial={{ scale: 0.94, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 20 }}
        className="w-full max-w-lg rounded-2xl border p-6 flex flex-col gap-5 max-h-[90vh] overflow-y-auto"
        style={{ background: "rgba(8,12,24,0.98)", borderColor: "rgba(255,180,0,0.3)" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-1">Next Match</p>
            <h2 className="text-2xl font-display font-black text-white">vs {nextFixture?.opponentShortName}</h2>
            <p className="text-xs text-muted-foreground mt-1">{nextFixture?.opponent} · {career.oversPerGame ?? 20} overs</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-white text-lg ml-4">✕</button>
        </div>

        {/* Batting order */}
        <div>
          <p className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-3">Batting Order</p>
          <div className="space-y-1.5">
            {order.map((id, idx) => {
              const p = xi.find(pl => pl.id === id);
              if (!p) return null;
              return (
                <div key={id} className="flex items-center gap-3 px-3 py-2 rounded-xl border"
                  style={{ background: "rgba(255,255,255,0.03)", borderColor: "rgba(148,163,184,0.12)" }}>
                  <span className="w-5 text-center text-xs font-black text-muted-foreground">{idx + 1}</span>
                  <div className="flex-1 min-w-0">
                    <span className="font-bold text-white text-sm truncate block">{p.name}</span>
                    <span className="text-[10px] font-bold" style={{ color: RoleColor[p.role] ?? "#94a3b8" }}>
                      {p.role.toUpperCase()}
                    </span>
                  </div>
                  <span className="text-xs font-black text-muted-foreground">{Math.min(99, Math.ceil(p.overallRating / 10))}</span>
                  <div className="flex gap-1">
                    <button onClick={() => move(idx, -1)} disabled={idx === 0}
                      className="w-6 h-6 rounded-lg text-xs font-black border border-border/30 bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-colors">▲</button>
                    <button onClick={() => move(idx, 1)} disabled={idx === order.length - 1}
                      className="w-6 h-6 rounded-lg text-xs font-black border border-border/30 bg-white/5 hover:bg-white/10 disabled:opacity-20 transition-colors">▼</button>
                  </div>
                </div>
              );
            })}
          </div>
          {xi.length < 11 && (
            <p className="text-xs text-amber-400 font-bold mt-2 text-center">
              Select {11 - xi.length} more player{11 - xi.length !== 1 ? "s" : ""} in Squad tab first
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-1">
          <Button variant="secondary" className="flex-1 font-black" onClick={onSimulate}>
            SIMULATE
          </Button>
          <Button
            className="flex-1 font-black"
            disabled={xi.length < 11}
            onClick={() => onPlayIt(order)}
            style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000" }}
          >
            PLAY IT
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────

export default function CareerDashboard({ id }: { id: string }) {
  const [, navigate] = useLocation();
  const [career, setCareer] = useState<Career | null>(null);
  const [tab, setTab] = useState<"overview" | "squad" | "table">("overview");
  const [showPreMatch, setShowPreMatch] = useState(false);
  const [matchResult, setMatchResult] = useState<{
    userScore: number; opponentScore: number; opponent: string; won: boolean;
    seasonComplete: boolean; finalPosition: number; coinsEarned: number;
  } | null>(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    const c = loadCareer(id);
    if (c) setCareer(c);
  }, [id]);

  if (!career) {
    return (
      <div className="text-center py-32">
        <p className="text-2xl font-display font-black text-primary animate-pulse">Loading Career…</p>
        <p className="text-muted-foreground mt-2 text-sm">
          Career not found.{" "}
          <Link href="/career" className="text-primary underline">Start a new one</Link>
        </p>
      </div>
    );
  }

  const nextFixture = career.fixtures.find(f => !f.played);
  const seasonDone = !nextFixture;

  const handleSimulate = () => {
    if (!nextFixture || simulating) return;
    setShowPreMatch(false);
    setSimulating(true);
    const fixtureIndex = career.fixtures.findIndex(f => !f.played);
    setTimeout(() => {
      const { career: updated, userScore, opponentScore, won, seasonComplete, finalPosition } = applyFixtureResult(career, fixtureIndex);
      let coinsEarned = 0;
      if (seasonComplete) {
        const reward = CAREER_COIN_REWARDS[finalPosition] ?? 0;
        if (reward !== 0) {
          addCoins(reward);
          coinsEarned = reward;
          window.dispatchEvent(new Event("cm-coins-updated"));
        }
      }
      setCareer(updated);
      setMatchResult({ userScore, opponentScore, opponent: nextFixture.opponentShortName, won, seasonComplete, finalPosition, coinsEarned });
      setSimulating(false);
    }, 600);
  };

  const handlePlayIt = (battingOrder: number[]) => {
    if (!nextFixture || !career) return;
    // Save updated batting order
    const updated = { ...career, battingOrder };
    saveCareer(updated);
    setCareer(updated);

    const fixtureIndex = career.fixtures.findIndex(f => !f.played);
    const orderedXI = battingOrder
      .map(pid => career.squad.find(p => p.id === pid))
      .filter(Boolean) as CareerPlayer[];
    const opponentXI = getOpponentXI(nextFixture.opponentTeamId);

    setMatchSetup({
      team1Name: career.teamName,
      team1Flag: "🏏",
      team1Players: orderedXI,
      team2Name: nextFixture.opponent,
      team2Flag: "⚔️",
      team2Players: opponentXI,
      overs: career.oversPerGame ?? 20,
      difficulty: career.difficulty ?? "medium",
      careerId: career.id,
      fixtureIndex,
    });
    navigate("/match-play");
  };

  const TABS = [
    { key: "overview" as const, label: "Overview" },
    { key: "squad" as const, label: "Squad" },
    { key: "table" as const, label: "League Table" },
  ];

  return (
    <div className="max-w-5xl mx-auto space-y-6 py-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-6 rounded-2xl border border-border/40 bg-card">
        <div>
          <h1 className="text-4xl font-display font-black text-white">{career.teamName}</h1>
          <p className="text-primary font-bold mt-1 text-sm">
            {career.managerName} · Season {career.season}
          </p>
        </div>
        <div className="flex gap-3">
          <div className="bg-background px-5 py-3 rounded-xl border border-border text-center">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Points</div>
            <div className="text-2xl font-display font-black text-white">{career.points}</div>
          </div>
          <div className="bg-background px-5 py-3 rounded-xl border border-border text-center">
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Trophies</div>
            <div className="text-2xl font-display font-black text-primary">{career.trophies} 🏆</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border transition-all ${
              tab === t.key ? "bg-primary text-black border-primary" : "bg-card text-muted-foreground border-border/40 hover:text-white"
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 space-y-4">
            {/* Next match */}
            <Card className="p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Next Match</h3>
              {nextFixture ? (
                <div className="text-center">
                  <div className="text-3xl font-display font-black text-white py-4 border-y border-border/40 my-3">
                    vs {nextFixture.opponentShortName}
                  </div>
                  <p className="text-xs text-muted-foreground mb-3">{nextFixture.opponent}</p>
                  <Button size="lg" className="w-full" onClick={() => setShowPreMatch(true)} disabled={simulating}>
                    {simulating ? "Simulating…" : "PLAY GAME"}
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-primary font-black text-lg">Season Complete!</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Final position: #{career.leagueTable.findIndex(e => e.teamId === career.teamId) + 1}
                  </p>
                </div>
              )}
            </Card>

            {/* Trophy cabinet */}
            <Card className="p-5">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Trophy Cabinet</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/30 to-background flex items-center justify-center border border-primary/30">
                  <img src={`${import.meta.env.BASE_URL}images/trophy.png`} className="w-10 h-10 object-contain" alt="trophy" />
                </div>
                <div>
                  <div className="text-3xl font-display font-black text-white">{career.trophies}</div>
                  <div className="text-sm text-muted-foreground">Championships</div>
                </div>
              </div>
            </Card>
          </div>

          {/* Fixtures */}
          <div className="lg:col-span-8">
            <Card className="p-5 h-full">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-4">Season Fixtures</h3>
              <div className="space-y-2">
                {career.fixtures.map(f => {
                  const isNext = !f.played && f.matchNumber === (nextFixture?.matchNumber ?? -1);
                  return (
                    <div key={f.matchNumber}
                      className="flex justify-between items-center p-3 rounded-xl border transition-colors"
                      style={{
                        background: isNext ? "rgba(255,180,0,0.08)" : "rgba(255,255,255,0.02)",
                        borderColor: isNext ? "rgba(255,180,0,0.3)" : "rgba(148,163,184,0.12)",
                      }}>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-muted-foreground text-xs w-5">{String(f.matchNumber).padStart(2, "0")}</span>
                        <span className={`font-bold text-sm ${isNext ? "text-primary" : "text-white"}`}>
                          vs {f.opponent}
                        </span>
                      </div>
                      {f.played ? (
                        <span className={`text-xs font-black px-2.5 py-1 rounded-lg border ${
                          f.won ? "bg-green-500/15 text-green-400 border-green-500/30" : "bg-red-500/15 text-red-400 border-red-500/30"
                        }`}>
                          {f.result}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-muted-foreground border border-dashed border-border/40 px-2.5 py-1 rounded-lg">
                          Upcoming
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          </div>
        </div>
      )}

      {tab === "squad" && (
        <Card className="p-6">
          <SquadTab career={career} onUpdate={setCareer} />
        </Card>
      )}

      {tab === "table" && (
        <Card className="p-6">
          <TableTab career={career} />
        </Card>
      )}

      {/* Pre-match modal */}
      <AnimatePresence>
        {showPreMatch && nextFixture && (
          <PreMatchModal
            career={career}
            onClose={() => setShowPreMatch(false)}
            onSimulate={handleSimulate}
            onPlayIt={handlePlayIt}
            onOrderChange={(order) => {
              const updated = { ...career, battingOrder: order };
              saveCareer(updated);
              setCareer(updated);
            }}
          />
        )}
      </AnimatePresence>

      {/* Match result modal */}
      <AnimatePresence>
        {matchResult && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/85 flex items-center justify-center p-4"
            onClick={() => setMatchResult(null)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md rounded-2xl border p-8 text-center"
              style={{ background: "rgba(10,10,20,0.98)", borderColor: matchResult.won ? "rgba(74,222,128,0.4)" : "rgba(239,68,68,0.4)" }}
              onClick={e => e.stopPropagation()}
            >
              <div className="text-5xl mb-3">{matchResult.won ? "🏆" : "❌"}</div>
              <h2 className={`text-3xl font-display font-black mb-1 ${matchResult.won ? "text-green-400" : "text-red-400"}`}>
                {matchResult.won ? "VICTORY!" : "DEFEAT"}
              </h2>
              <p className="text-white font-bold text-xl mb-1">vs {matchResult.opponent}</p>
              <p className="text-2xl font-display font-black text-white my-4">
                {matchResult.userScore} — {matchResult.opponentScore}
              </p>

              {matchResult.seasonComplete && (
                <div className="mt-4 p-4 rounded-xl border"
                  style={{ background: "rgba(255,180,0,0.08)", borderColor: "rgba(255,180,0,0.25)" }}>
                  <p className="font-black text-primary text-lg">Season Complete!</p>
                  <p className="text-white font-bold mt-1">
                    Final Position: #{matchResult.finalPosition}
                    {matchResult.finalPosition === 1 ? " 🏆 Champions!" : ""}
                  </p>
                  {matchResult.coinsEarned !== 0 && (
                    <p className="text-sm font-black mt-2" style={{ color: matchResult.coinsEarned > 0 ? "#4ade80" : "#f87171" }}>
                      {matchResult.coinsEarned > 0 ? "+" : ""}{matchResult.coinsEarned} 🪙 coins
                    </p>
                  )}
                </div>
              )}

              <Button className="mt-6 w-full" onClick={() => setMatchResult(null)}>
                {matchResult.seasonComplete ? "Continue" : "Next Match"}
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
