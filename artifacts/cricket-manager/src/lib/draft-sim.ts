// Shared by Draft vs AI and 2-Player Draft: local match simulation + card tier lookup.
import { TOTW_IDS, MW_IDS, PRIME_PLAYERS, ICON_PLAYERS } from "@/lib/static-data";
import type { Player } from "@/lib/static-data";

export interface BallEvent {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  description: string;
}

export interface InningsResult {
  teamName: string;
  score: number;
  wickets: number;
  overs: string;
  topScorer: string;
  topScorerRuns: number;
  topBowler: string;
  topBowlerWickets: number;
  ballByBall: BallEvent[];
}

export interface MatchResult {
  winner: string;
  margin: string;
  manOfTheMatch: string;
  innings1: InningsResult;
  innings2: InningsResult;
}
// ── Local simulation ───────────────────────────────────────────────

function simulateInnings(battingTeam: Player[], bowlingTeam: Player[], teamName: string): InningsResult {
  const lineup = [
    ...battingTeam.filter(p => p.role === "wicketkeeper"),
    ...battingTeam.filter(p => p.role === "batsman"),
    ...battingTeam.filter(p => p.role === "allrounder"),
    ...battingTeam.filter(p => p.role === "bowler"),
  ].slice(0, 11);

  const bowlers = [
    ...bowlingTeam.filter(p => p.role === "bowler"),
    ...bowlingTeam.filter(p => p.role === "allrounder"),
  ];

  const batterScores: Record<number, number> = {};
  const bowlerWickets: Record<number, number> = {};
  lineup.forEach(p => { batterScores[p.id] = 0; });
  bowlers.forEach(p => { bowlerWickets[p.id] = 0; });

  const battingStrength = battingTeam.reduce((s, p) => s + p.battingRating, 0) / battingTeam.length;
  const bowlingStrength = bowlers.length > 0
    ? bowlers.reduce((s, p) => s + p.bowlingRating, 0) / bowlers.length
    : 500;

  let totalScore = 0;
  let wickets = 0;
  let batterIdx = 0;
  const ballByBall: BallEvent[] = [];

  for (let over = 0; over < 20 && wickets < 10 && batterIdx < lineup.length; over++) {
    const bowler = bowlers[over % Math.max(bowlers.length, 1)];

    for (let ball = 1; ball <= 6 && wickets < 10 && batterIdx < lineup.length; ball++) {
      const batter = lineup[batterIdx];

      const wicketProb = Math.max(0.04, Math.min(0.16,
        0.08 + (bowlingStrength - battingStrength) / 8000
      ));

      if (Math.random() < wicketProb) {
        wickets++;
        batterIdx++;
        if (bowler) bowlerWickets[bowler.id]++;
        ballByBall.push({
          over, ball, runs: 0, isWicket: true,
          description: `${batter.name} OUT — ${bowler?.name ?? "Unknown"} strikes!`,
        });
      } else {
        const runBias = Math.sqrt(battingStrength / Math.max(bowlingStrength, 1));
        const rand = Math.random();
        let runs: number;
        if      (rand < 0.28) runs = 0;
        else if (rand < 0.54) runs = 1;
        else if (rand < 0.68) runs = 2;
        else if (rand < 0.74) runs = 3;
        else if (rand < 0.86) runs = 4;
        else if (rand < 0.93) runs = 6;
        else                   runs = 1;
        runs = Math.max(0, Math.min(6, Math.round(runs * runBias)));

        totalScore += runs;
        batterScores[batter.id] += runs;
        ballByBall.push({
          over, ball, runs, isWicket: false,
          description: runs === 6
            ? `${batter.name} launches a SIX!`
            : runs === 4
              ? `${batter.name} drives for FOUR!`
              : runs === 0
                ? `Dot ball. Tight bowling from ${bowler?.name ?? "Unknown"}`
                : `${batter.name} takes ${runs}`,
        });
      }
    }
  }

  const topScorerEntry = Object.entries(batterScores).sort((a, b) => +b[1] - +a[1])[0];
  const topBowlerEntry = Object.entries(bowlerWickets).sort((a, b) => +b[1] - +a[1])[0];

  const totalBalls = ballByBall.length;
  const completedOvers = Math.floor(totalBalls / 6);
  const extraBalls = totalBalls % 6;
  const oversStr = extraBalls > 0 ? `${completedOvers}.${extraBalls}` : `${Math.min(20, completedOvers)}`;

  return {
    teamName,
    score: totalScore,
    wickets,
    overs: oversStr,
    topScorer: lineup.find(p => p.id === +topScorerEntry[0])?.name ?? "Unknown",
    topScorerRuns: +topScorerEntry[1],
    topBowler: bowlers.find(p => p.id === +topBowlerEntry[0])?.name ?? "Unknown",
    topBowlerWickets: +topBowlerEntry[1],
    ballByBall,
  };
}

export function runLocalSimulation(xi1: Player[], xi2: Player[], name1: string, name2: string): MatchResult {
  const innings1 = simulateInnings(xi1, xi2, name1);
  const innings2 = simulateInnings(xi2, xi1, name2);

  const p1Wins = innings1.score > innings2.score;
  const winner = p1Wins ? name1 : name2;
  const margin = p1Wins
    ? `${innings1.score - innings2.score} runs`
    : `${10 - innings2.wickets} wickets`;

  const candidates = [
    { name: innings1.topScorer,  value: innings1.topScorerRuns },
    { name: innings1.topBowler,  value: innings1.topBowlerWickets * 25 },
    { name: innings2.topScorer,  value: innings2.topScorerRuns },
    { name: innings2.topBowler,  value: innings2.topBowlerWickets * 25 },
  ];
  const manOfTheMatch = candidates.sort((a, b) => b.value - a.value)[0].name;

  return { winner, margin, manOfTheMatch, innings1, innings2 };
}

// ── Helpers ────────────────────────────────────────────────────────

const PRIME_IDS   = new Set(PRIME_PLAYERS.map(p => p.id));
const ICON_IDS    = new Set(ICON_PLAYERS.map(p => p.id));
// MW players elevated to Icon tier — Brian Lara (763), Stuart Broad (767)
const MW_ICON_IDS = new Set([763, 767]);

export function getCardType(player: Player) {
  if (MW_ICON_IDS.has(player.id)) return "mw-icon" as const;
  if (ICON_IDS.has(player.id))    return "icon"    as const;
  if (PRIME_IDS.has(player.id))   return "prime"   as const;
  if (MW_IDS.has(player.id))      return "mw"      as const;
  if (TOTW_IDS.has(player.id))    return "totw"    as const;
  return "normal" as const;
}
