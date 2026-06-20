import { ALL_PLAYERS_EXPORT, IPL_TEAMS, IPL_TEAM_ROSTERS } from "./static-data";
import type { Player } from "./static-data";
import type { Difficulty } from "./match-store";

// ── Types ─────────────────────────────────────────────────────────────────────

export interface CareerPlayer extends Player {
  inXI: boolean;
}

export interface CareerFixture {
  matchNumber: number;
  opponent: string;
  opponentShortName: string;
  opponentTeamId: string;
  played: boolean;
  won: boolean | null;
  userScore: number | null;
  opponentScore: number | null;
  result: string;
}

export interface LeagueEntry {
  teamId: string;
  name: string;
  shortName: string;
  played: number;
  won: number;
  lost: number;
  points: number;
}

export interface Career {
  id: string;
  managerName: string;
  teamId: string;
  teamName: string;
  teamShortName: string;
  season: number;
  budget: number;
  points: number;
  trophies: number;
  oversPerGame: number;          // overs per innings (5 / 10 / 15 / 20)
  difficulty: Difficulty;        // easy / medium / hard
  battingOrder: number[];        // ordered player IDs for the XI batting order
  squad: CareerPlayer[];
  fixtures: CareerFixture[];
  leagueTable: LeagueEntry[];
}

// ── Player distribution ───────────────────────────────────────────────────────

function buildTeamSquads(): Map<string, Player[]> {
  const playerById = new Map(ALL_PLAYERS_EXPORT.map(p => [p.id, p]));
  const map = new Map<string, Player[]>();
  IPL_TEAMS.forEach(t => {
    const ids = IPL_TEAM_ROSTERS[t.id] ?? [];
    map.set(t.id, ids.map(id => playerById.get(id)).filter(Boolean) as Player[]);
  });
  return map;
}

// ── Match simulation ──────────────────────────────────────────────────────────

function avgRating(players: Player[]): number {
  if (!players.length) return 700;
  return players.reduce((s, p) => s + p.overallRating, 0) / players.length;
}

function simScore(strength: number): number {
  const base = Math.round(strength / 10 + Math.random() * 40);
  return Math.max(40, Math.min(250, base));
}

const DIFFICULTY_BONUS: Record<Difficulty, number> = { easy: 18, medium: 0, hard: -18 };

export function simulateMatch(
  userSquad: CareerPlayer[],
  opponentAvg: number,
  difficulty: Difficulty = "medium"
): { userScore: number; opponentScore: number; won: boolean } {
  const userAvg = avgRating(userSquad.filter(p => p.inXI));
  const bonus = DIFFICULTY_BONUS[difficulty];
  const userScore = Math.max(40, simScore(userAvg) + bonus);
  const oppScore  = Math.max(40, simScore(opponentAvg) - bonus);
  return { userScore, opponentScore: oppScore, won: userScore > oppScore };
}

// ── League table helpers ──────────────────────────────────────────────────────

function buildInitialTable(): LeagueEntry[] {
  return IPL_TEAMS.map(t => ({
    teamId: t.id,
    name: t.name,
    shortName: t.shortName,
    played: 0, won: 0, lost: 0, points: 0,
  }));
}

// ── Build initial career ──────────────────────────────────────────────────────

export function buildCareer(managerName: string, teamId: string, oversPerGame = 20, difficulty: Difficulty = "medium"): Career {
  const team = IPL_TEAMS.find(t => t.id === teamId)!;
  const squads = buildTeamSquads();
  const myPlayers = squads.get(teamId) ?? [];

  const squad: CareerPlayer[] = myPlayers.map((p, i) => ({ ...p, inXI: i < 11 }));
  const battingOrder = squad.filter(p => p.inXI).map(p => p.id);

  const opponents = IPL_TEAMS.filter(t => t.id !== teamId);

  const fixtures: CareerFixture[] = opponents.map((opp, i) => ({
    matchNumber: i + 1,
    opponent: opp.name,
    opponentShortName: opp.shortName,
    opponentTeamId: opp.id,
    played: false,
    won: null,
    userScore: null,
    opponentScore: null,
    result: "",
  }));

  return {
    id: `career_${Date.now()}`,
    managerName,
    teamId,
    teamName: team.name,
    teamShortName: team.shortName,
    season: 1,
    budget: 100,
    points: 0,
    trophies: 0,
    oversPerGame,
    difficulty,
    battingOrder,
    squad,
    fixtures,
    leagueTable: buildInitialTable(),
  };
}

// Get XI players for a given opponent team (for match setup)
export function getOpponentXI(teamId: string): Player[] {
  return (buildTeamSquads().get(teamId) ?? []).slice(0, 11);
}

// Apply a result that was actually played (not simulated)
export function applyPlayedGame(
  career: Career,
  fixtureIndex: number,
  userScore: number,
  opponentScore: number
): { career: Career; seasonComplete: boolean; finalPosition: number } {
  const won = userScore > opponentScore;
  const fixture = career.fixtures[fixtureIndex];
  const result = won ? `W ${userScore}-${opponentScore}` : `L ${userScore}-${opponentScore}`;

  const newFixtures = career.fixtures.map((f, i) =>
    i === fixtureIndex ? { ...f, played: true, won, userScore, opponentScore, result } : f
  );

  const newTable = career.leagueTable.map(entry => ({ ...entry }));
  const userEntry = newTable.find(e => e.teamId === career.teamId)!;
  userEntry.played += 1;
  if (won) { userEntry.won += 1; userEntry.points += 2; }
  else { userEntry.lost += 1; }

  const others = IPL_TEAMS.filter(t => t.id !== career.teamId && t.id !== fixture.opponentTeamId);
  const picks = others.sort(() => Math.random() - 0.5).slice(0, 4);
  for (let p = 0; p < picks.length - 1; p += 2) {
    const a = newTable.find(e => e.teamId === picks[p].id)!;
    const b = newTable.find(e => e.teamId === picks[p + 1].id)!;
    if (a && b) {
      a.played += 1; b.played += 1;
      if (Math.random() > 0.5) { a.won += 1; a.points += 2; b.lost += 1; }
      else { b.won += 1; b.points += 2; a.lost += 1; }
    }
  }
  newTable.sort((a, b) => b.points - a.points || b.won - a.won);

  const seasonComplete = newFixtures.every(f => f.played);
  const finalPosition = seasonComplete ? newTable.findIndex(e => e.teamId === career.teamId) + 1 : 0;
  const newTrophies = career.trophies + (finalPosition === 1 ? 1 : 0);

  const updated: Career = {
    ...career,
    points: career.points + (won ? 2 : 0),
    fixtures: newFixtures,
    leagueTable: newTable,
    trophies: newTrophies,
  };
  saveCareer(updated);
  return { career: updated, seasonComplete, finalPosition };
}

// ── Apply a simulated fixture result ─────────────────────────────────────────

export function applyFixtureResult(
  career: Career,
  fixtureIndex: number
): { career: Career; userScore: number; opponentScore: number; won: boolean; seasonComplete: boolean; finalPosition: number } {
  const fixture = career.fixtures[fixtureIndex];
  const squads = buildTeamSquads();
  const oppAvg = avgRating(squads.get(fixture.opponentTeamId) ?? []);

  const { userScore, opponentScore, won } = simulateMatch(career.squad, oppAvg, career.difficulty ?? "medium");

  const result = won
    ? `W ${userScore}-${opponentScore}`
    : `L ${userScore}-${opponentScore}`;

  const newFixtures = career.fixtures.map((f, i) =>
    i === fixtureIndex
      ? { ...f, played: true, won, userScore, opponentScore, result }
      : f
  );

  // Simulate other teams' results for the same round
  const newTable = career.leagueTable.map(entry => ({ ...entry }));

  const userEntry = newTable.find(e => e.teamId === career.teamId)!;
  userEntry.played += 1;
  if (won) { userEntry.won += 1; userEntry.points += 2; }
  else { userEntry.lost += 1; }

  // Simulate 2 random other games this round (keep table active)
  const others = IPL_TEAMS.filter(t => t.id !== career.teamId && t.id !== fixture.opponentTeamId);
  const picks = others.sort(() => Math.random() - 0.5).slice(0, 4);
  for (let p = 0; p < picks.length - 1; p += 2) {
    const a = newTable.find(e => e.teamId === picks[p].id)!;
    const b = newTable.find(e => e.teamId === picks[p + 1].id)!;
    if (a && b) {
      a.played += 1; b.played += 1;
      if (Math.random() > 0.5) { a.won += 1; a.points += 2; b.lost += 1; }
      else { b.won += 1; b.points += 2; a.lost += 1; }
    }
  }

  newTable.sort((a, b) => b.points - a.points || b.won - a.won);

  const seasonComplete = newFixtures.every(f => f.played);
  const newPoints = career.points + (won ? 2 : 0);
  const finalPosition = seasonComplete
    ? newTable.findIndex(e => e.teamId === career.teamId) + 1
    : 0;
  const newTrophies = career.trophies + (finalPosition === 1 ? 1 : 0);

  const updated: Career = {
    ...career,
    points: newPoints,
    fixtures: newFixtures,
    leagueTable: newTable,
    trophies: newTrophies,
  };

  saveCareer(updated);
  return { career: updated, userScore, opponentScore, won, seasonComplete, finalPosition };
}

// ── Persistence ───────────────────────────────────────────────────────────────

export function saveCareer(career: Career): void {
  localStorage.setItem(`cm_career_${career.id}`, JSON.stringify(career));
}

export function loadCareer(id: string): Career | null {
  try {
    const raw = localStorage.getItem(`cm_career_${id}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}
