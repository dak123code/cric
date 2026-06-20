import type { Player } from "./players.js";

export interface BallEvent {
  over: number;
  ball: number;
  runs: number;
  isWicket: boolean;
  batsmanName: string;
  bowlerName: string;
  description: string;
}

export interface InningsResult {
  teamName: string;
  score: number;
  wickets: number;
  overs: number;
  ballByBall: BallEvent[];
  topScorer: string;
  topScorerRuns: number;
  topBowler: string;
  topBowlerWickets: number;
}

export interface MatchResult {
  innings1: InningsResult;
  innings2: InningsResult;
  winner: string;
  margin: string;
  manOfTheMatch: string;
}

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pickBatsmen(team: Player[]): Player[] {
  const order: Player[] = [];
  const wk = team.find(p => p.role === "wicketkeeper");
  const batsmen = team.filter(p => p.role === "batsman");
  const allrounders = team.filter(p => p.role === "allrounder");
  const bowlers = team.filter(p => p.role === "bowler");
  if (wk) order.push(wk);
  order.push(...batsmen);
  order.push(...allrounders);
  order.push(...bowlers);
  return order;
}

function pickBowlers(team: Player[]): Player[] {
  const bowlers = team.filter(p => p.role === "bowler" || p.role === "allrounder");
  return bowlers.sort((a, b) => b.bowlingRating - a.bowlingRating).slice(0, 5);
}

function simulateInnings(
  battingTeam: Player[],
  bowlingTeam: Player[],
  teamName: string,
  target?: number,
  maxOvers: number = 20
): InningsResult {
  const battingOrder = pickBatsmen(battingTeam);
  const availableBowlers = pickBowlers(bowlingTeam);

  const ballByBall: BallEvent[] = [];
  let totalScore = 0;
  let wickets = 0;
  let currentBatsmanIdx = 0;
  let nextBatsmanIdx = 1;

  const batsmanRuns: Record<string, number> = {};
  const bowlerWickets: Record<string, number> = {};

  for (const p of battingOrder) batsmanRuns[p.name] = 0;
  for (const p of availableBowlers) bowlerWickets[p.name] = 0;

  // Track overs per bowler - max 4 per bowler in T20
  const bowlerOvers: Record<string, number> = {};
  for (const p of availableBowlers) bowlerOvers[p.name] = 0;

  let overCount = 0;
  let currentBatsmanName = battingOrder[currentBatsmanIdx]?.name ?? "Player";
  const striker = { name: currentBatsmanName, rating: battingOrder[currentBatsmanIdx]?.battingRating ?? 50 };

  for (let over = 0; over < maxOvers; over++) {
    if (wickets >= 10) break;
    if (target && totalScore >= target) break;

    // Pick bowler for this over
    const eligibleBowlers = availableBowlers.filter(b => (bowlerOvers[b.name] ?? 0) < 4);
    if (eligibleBowlers.length === 0) break;
    const bowler = eligibleBowlers[rand(0, eligibleBowlers.length - 1)];
    bowlerOvers[bowler.name] = (bowlerOvers[bowler.name] ?? 0) + 1;

    for (let ball = 1; ball <= 6; ball++) {
      if (wickets >= 10) break;
      if (target && totalScore >= target) break;

      // All ratings now stored as ICC-style ×10 values (battingRating 0–990, bowlingRating 0–990)
      // Normalise both to 0–9.9 scale before computing advantage
      const batsmanRating = battingOrder[currentBatsmanIdx]?.battingRating ?? 500;
      const bowlerRating = bowler.bowlingRating;
      const normalizedBatting = batsmanRating / 100;   // 0–9.9
      const advantage = (normalizedBatting - bowlerRating / 100) / 10;
      const wicketProb = Math.max(0.04, 0.12 - advantage * 0.08);
      const dotProb = Math.max(0.20, 0.35 - advantage * 0.1);
      const fourProb = Math.min(0.18, 0.10 + advantage * 0.08);
      const sixProb = Math.min(0.12, 0.06 + advantage * 0.06);

      const roll = Math.random();
      let runs = 0;
      let isWicket = false;
      let desc = "";

      if (roll < wicketProb) {
        isWicket = true;
        const wicketTypes = ["bowled", "caught", "lbw", "caught behind", "run out"];
        const wType = wicketTypes[rand(0, wicketTypes.length - 1)];
        desc = `OUT! ${battingOrder[currentBatsmanIdx]?.name ?? "Batsman"} ${wType} ${bowler.name}`;
        bowlerWickets[bowler.name] = (bowlerWickets[bowler.name] ?? 0) + 1;
        wickets++;
        nextBatsmanIdx++;
        currentBatsmanIdx = nextBatsmanIdx - 1;
        if (currentBatsmanIdx < battingOrder.length) {
          batsmanRuns[battingOrder[currentBatsmanIdx].name] = 0;
        }
      } else if (roll < wicketProb + dotProb) {
        runs = 0;
        desc = `Dot ball - tight line from ${bowler.name}`;
      } else if (roll < wicketProb + dotProb + 0.20) {
        runs = 1;
        desc = `Single taken`;
      } else if (roll < wicketProb + dotProb + 0.32) {
        runs = 2;
        desc = `Good running, two runs`;
      } else if (roll < wicketProb + dotProb + 0.35) {
        runs = 3;
        desc = `Three runs! Great effort in the field`;
      } else if (roll < wicketProb + dotProb + 0.35 + fourProb) {
        runs = 4;
        desc = `FOUR! Brilliant shot by ${battingOrder[currentBatsmanIdx]?.name ?? "Batsman"}`;
      } else if (roll < wicketProb + dotProb + 0.35 + fourProb + sixProb) {
        runs = 6;
        desc = `SIX! What a shot! ${battingOrder[currentBatsmanIdx]?.name ?? "Batsman"} sends it into the stands`;
      } else {
        runs = 1;
        desc = `Quick single`;
      }

      totalScore += runs;
      if (!isWicket && currentBatsmanIdx < battingOrder.length) {
        batsmanRuns[battingOrder[currentBatsmanIdx].name] = (batsmanRuns[battingOrder[currentBatsmanIdx].name] ?? 0) + runs;
      }

      ballByBall.push({
        over,
        ball,
        runs,
        isWicket,
        batsmanName: battingOrder[currentBatsmanIdx]?.name ?? "Unknown",
        bowlerName: bowler.name,
        description: desc,
      });
    }

    overCount = over + 1;
  }

  // Find top scorer
  let topScorer = "";
  let topScorerRuns = 0;
  for (const [name, runs] of Object.entries(batsmanRuns)) {
    if (runs > topScorerRuns) {
      topScorerRuns = runs;
      topScorer = name;
    }
  }

  // Find top bowler
  let topBowler = "";
  let topBowlerWickets = 0;
  for (const [name, wkts] of Object.entries(bowlerWickets)) {
    if (wkts > topBowlerWickets) {
      topBowlerWickets = wkts;
      topBowler = name;
    }
  }
  if (!topBowler && availableBowlers.length > 0) {
    topBowler = availableBowlers[0].name;
  }

  return {
    teamName,
    score: totalScore,
    wickets,
    overs: overCount,
    ballByBall,
    topScorer: topScorer || (battingOrder[0]?.name ?? "Unknown"),
    topScorerRuns,
    topBowler,
    topBowlerWickets,
  };
}

export function simulateMatch(
  team1: Player[],
  team2: Player[],
  team1Name: string,
  team2Name: string,
  format: "t20" | "odi" | "test" = "t20"
): MatchResult {
  const maxOvers = format === "t20" ? 20 : format === "odi" ? 50 : 90;

  const innings1 = simulateInnings(team1, team2, team1Name, undefined, maxOvers);
  const target = innings1.score + 1;
  const innings2 = simulateInnings(team2, team1, team2Name, target, maxOvers);

  let winner: string;
  let margin: string;

  if (innings2.score >= target) {
    winner = team2Name;
    const wicketsLeft = 10 - innings2.wickets;
    margin = `${wicketsLeft} wickets`;
  } else if (innings2.wickets >= 10 || innings2.overs >= maxOvers) {
    winner = team1Name;
    const runDiff = innings1.score - innings2.score;
    margin = `${runDiff} runs`;
  } else {
    // Chase completed
    winner = team2Name;
    margin = `${10 - innings2.wickets} wickets`;
  }

  // Man of the match - pick best performer
  const candidates = [
    { name: innings1.topScorer, score: innings1.topScorerRuns * 1.5 },
    { name: innings2.topScorer, score: innings2.topScorerRuns * 1.5 },
    { name: innings1.topBowler, score: innings1.topBowlerWickets * 25 },
    { name: innings2.topBowler, score: innings2.topBowlerWickets * 25 },
  ];
  candidates.sort((a, b) => b.score - a.score);
  const manOfTheMatch = candidates[0]?.name ?? "Unknown";

  return { innings1, innings2, winner, margin, manOfTheMatch };
}
