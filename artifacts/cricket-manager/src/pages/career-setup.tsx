import { useState } from "react";
import { useLocation } from "wouter";
import { Button, Card } from "@/components/shared";
import { motion } from "framer-motion";
import { IPL_TEAMS } from "@/lib/static-data";
import { buildCareer, saveCareer } from "@/lib/career-store";
import type { Difficulty } from "@/lib/match-store";

const OVERS_OPTIONS = [5, 10, 15, 20] as const;

export default function CareerSetup() {
  const [, setLocation] = useLocation();
  const [managerName, setManagerName] = useState("");
  const [teamId, setTeamId] = useState("");
  const [oversPerGame, setOversPerGame] = useState<number>(20);
  const [difficulty, setDifficulty] = useState<Difficulty>("medium");

  const handleStart = () => {
    if (!managerName || !teamId) return;
    const career = buildCareer(managerName, teamId, oversPerGame, difficulty);
    saveCareer(career);
    setLocation(`/career/${career.id}`);
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-5xl font-display font-black text-white">NEW <span className="text-primary">CAREER</span></h1>
        <p className="text-muted-foreground mt-2 text-lg">Take charge of an elite franchise.</p>
      </div>

      <div className="space-y-8">
        <Card className="p-8 border-primary/20">
          <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Manager Name</label>
          <input 
            type="text" 
            value={managerName}
            onChange={(e) => setManagerName(e.target.value)}
            placeholder="Enter your name..."
            className="w-full bg-background border-2 border-border focus:border-primary focus:ring-4 focus:ring-primary/10 rounded-2xl px-6 py-4 text-xl font-display font-bold text-white outline-none transition-all placeholder:text-muted-foreground/50"
          />
        </Card>

        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">Select Your Franchise</label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {IPL_TEAMS.map((t) => (
              <button
                key={t.id}
                onClick={() => setTeamId(t.id)}
                className={`relative overflow-hidden group p-6 rounded-3xl border-2 transition-all duration-300 text-center ${
                  teamId === t.id 
                    ? 'border-primary ring-4 ring-primary/20 scale-105' 
                    : 'border-border/50 hover:border-primary/50 hover:bg-white/5'
                }`}
                style={{ backgroundColor: teamId === t.id ? t.color : 'transparent' }}
              >
                <div className="absolute inset-0 bg-background/80 group-hover:bg-background/60 transition-colors" />
                <div className="relative z-10">
                  <div className="text-3xl font-display font-black text-white">{t.shortName}</div>
                  <div className="text-xs text-white/80 mt-1 font-semibold">{t.name}</div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
            Difficulty
          </label>
          <div className="grid grid-cols-3 gap-4">
            {([
              { id: "easy",   label: "Easy",   desc: "Forgiving timing, simulation boost",   color: "#4ade80" },
              { id: "medium", label: "Medium", desc: "Balanced challenge",                    color: "#fbbf24" },
              { id: "hard",   label: "Hard",   desc: "Tight zones, tough opponents",          color: "#f87171" },
            ] as { id: Difficulty; label: string; desc: string; color: string }[]).map(d => (
              <button
                key={d.id}
                onClick={() => setDifficulty(d.id)}
                className={`p-5 rounded-2xl border-2 text-center transition-all duration-200 ${
                  difficulty === d.id ? "scale-105" : "border-border/50 hover:border-primary/40"
                }`}
                style={{
                  borderColor: difficulty === d.id ? d.color : undefined,
                  background: difficulty === d.id ? `${d.color}18` : "transparent",
                }}
              >
                <div className="text-xl font-display font-black" style={{ color: d.color }}>{d.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-snug">{d.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Overs selection */}
        <div>
          <label className="block text-sm font-bold uppercase tracking-wider text-muted-foreground mb-4 text-center">
            Game Length — Overs per Innings
          </label>
          <div className="flex gap-4 justify-center">
            {OVERS_OPTIONS.map(o => (
              <button
                key={o}
                onClick={() => setOversPerGame(o)}
                className={`px-6 py-4 rounded-2xl border-2 font-display font-black text-xl transition-all duration-200 ${
                  oversPerGame === o
                    ? "border-primary bg-primary/10 text-primary scale-105"
                    : "border-border/50 text-muted-foreground hover:border-primary/50 hover:text-white"
                }`}
              >
                {o}
                <div className="text-xs font-sans font-semibold mt-0.5 opacity-70">overs</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center pt-8 border-t border-border/50">
          <Button size="lg" disabled={!managerName || !teamId} onClick={handleStart} className="w-full md:w-auto md:min-w-[300px]">
            START CAREER
          </Button>
        </div>
      </div>
    </div>
  );
}
