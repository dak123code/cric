import { db } from "@workspace/db";
import { careersTable } from "@workspace/db/schema";
import { eq } from "drizzle-orm";
import { buildIPLSquad, selectXIFromSquad, getAllPlayers, getRandomPool, IPL_TEAMS, type Player } from "./players.js";
import { simulateMatch } from "./matchEngine.js";

export interface CareerPlayer {
  playerId: number;
  name: string;
  role: string;
  overallRating: number;
  salary: number;
  inSquad: boolean;
  inXI: boolean;
}

export interface SeasonFixture {
  matchNumber: number;
  opponent: string;
  opponentShortName: string;
  played: boolean;
  won: boolean;
  result: string;
}

export interface CareerData {
  id: number;
  managerName: string;
  teamId: string;
  teamName: string;
  season: number;
  budget: number;
  trophies: number;
  points: number;
  wins: number;
  losses: number;
  fixtures: SeasonFixture[];
  squad: CareerPlayer[];
  availablePlayers: Player[];
}

function generateFixtures(teamId: string): SeasonFixture[] {
  const opponents = IPL_TEAMS.filter(t => t.id !== teamId);
  const fixtures: SeasonFixture[] = [];
  let matchNum = 1;
  // Each team plays 14 matches (each opponent once + 4 rematches)
  const schedule = [...opponents, ...opponents.slice(0, 4)];
  for (const opp of schedule) {
    fixtures.push({
      matchNumber: matchNum++,
      opponent: opp.name,
      opponentShortName: opp.shortName,
      played: false,
      won: false,
      result: "",
    });
  }
  return fixtures;
}

function buildAvailablePlayers(squadPlayerIds: number[]): Player[] {
  return getAllPlayers()
    .filter(p => !squadPlayerIds.includes(p.id))
    .sort(() => Math.random() - 0.5)
    .slice(0, 25);
}

export async function createCareer(managerName: string, teamId: string): Promise<CareerData> {
  const team = IPL_TEAMS.find(t => t.id === teamId);
  if (!team) throw new Error("Invalid team ID");

  const squadPlayers = buildIPLSquad(teamId);
  const xi = selectXIFromSquad(squadPlayers);
  const xiIds = new Set(xi.map(p => p.id));

  const squad: CareerPlayer[] = squadPlayers.map(p => ({
    playerId: p.id,
    name: p.name,
    role: p.role,
    overallRating: p.overallRating,
    salary: p.salary,
    inSquad: true,
    inXI: xiIds.has(p.id),
  }));

  const squadIds = squadPlayers.map(p => p.id);
  const availablePlayers = buildAvailablePlayers(squadIds);
  const fixtures = generateFixtures(teamId);

  const [created] = await db.insert(careersTable).values({
    managerName,
    teamId,
    teamName: team.name,
    season: 1,
    budget: 1000,
    trophies: 0,
    points: 0,
    wins: 0,
    losses: 0,
    fixtures: fixtures as any,
    squad: squad as any,
    availablePlayers: availablePlayers as any,
  }).returning();

  return {
    id: created.id,
    managerName: created.managerName,
    teamId: created.teamId,
    teamName: created.teamName,
    season: created.season,
    budget: created.budget,
    trophies: created.trophies,
    points: created.points,
    wins: created.wins,
    losses: created.losses,
    fixtures: created.fixtures as SeasonFixture[],
    squad: created.squad as CareerPlayer[],
    availablePlayers: created.availablePlayers as Player[],
  };
}

export async function getCareer(careerId: number): Promise<CareerData | null> {
  const [career] = await db.select().from(careersTable).where(eq(careersTable.id, careerId));
  if (!career) return null;
  return {
    id: career.id,
    managerName: career.managerName,
    teamId: career.teamId,
    teamName: career.teamName,
    season: career.season,
    budget: career.budget,
    trophies: career.trophies,
    points: career.points,
    wins: career.wins,
    losses: career.losses,
    fixtures: career.fixtures as SeasonFixture[],
    squad: career.squad as CareerPlayer[],
    availablePlayers: career.availablePlayers as Player[],
  };
}

export async function simulateSeasonMatch(careerId: number, matchNumber: number) {
  const career = await getCareer(careerId);
  if (!career) throw new Error("Career not found");

  const fixture = career.fixtures.find(f => f.matchNumber === matchNumber);
  if (!fixture) throw new Error("Fixture not found");
  if (fixture.played) throw new Error("Match already played");

  const allPlayers = getAllPlayers();
  const xiPlayerIds = career.squad.filter(p => p.inXI).map(p => p.playerId);
  const userXI: Player[] = xiPlayerIds
    .map(id => allPlayers.find(p => p.id === id))
    .filter((p): p is Player => p !== undefined);

  // Build opponent XI
  const oppTeam = IPL_TEAMS.find(t => t.name === fixture.opponent || t.shortName === fixture.opponentShortName);
  const oppSquad = buildIPLSquad(oppTeam?.id ?? "csk");
  const oppXI = selectXIFromSquad(oppSquad);

  if (userXI.length < 11) {
    // Fill with squad members
    const remaining = career.squad
      .filter(p => !xiPlayerIds.includes(p.playerId))
      .map(p => allPlayers.find(pl => pl.id === p.playerId))
      .filter((p): p is Player => p !== undefined);
    while (userXI.length < 11 && remaining.length > 0) {
      userXI.push(remaining.shift()!);
    }
  }

  const matchResult = simulateMatch(userXI, oppXI, career.teamName, fixture.opponent, "t20");

  const won = matchResult.winner === career.teamName;
  const pointsEarned = won ? 2 : 0;

  // Update fixture
  fixture.played = true;
  fixture.won = won;
  fixture.result = `${matchResult.innings1.score}/${matchResult.innings1.wickets} vs ${matchResult.innings2.score}/${matchResult.innings2.wickets} - ${matchResult.winner} won by ${matchResult.margin}`;

  const updatedFixtures = career.fixtures.map(f =>
    f.matchNumber === matchNumber ? fixture : f
  );

  const updatedCareer = {
    ...career,
    points: career.points + pointsEarned,
    wins: career.wins + (won ? 1 : 0),
    losses: career.losses + (won ? 0 : 1),
    fixtures: updatedFixtures,
  };

  const seasonComplete = updatedFixtures.every(f => f.played);
  let qualified = false;
  let trophiesIncrement = 0;
  let userPosition = 0;

  if (seasonComplete) {
    // Check if qualified for playoffs (top 4)
    qualified = updatedCareer.points >= 14; // roughly top 4
    if (qualified) {
      // Simulate playoffs - 50% chance to win
      trophiesIncrement = Math.random() > 0.5 ? 1 : 0;
    }
    // Estimate league position from points (14 games, max 28 pts)
    const pts = updatedCareer.points;
    if (pts >= 22) userPosition = 1;
    else if (pts >= 18) userPosition = 2;
    else if (pts >= 16) userPosition = 3;
    else if (pts >= 14) userPosition = 4;
    else if (pts >= 12) userPosition = 5;
    else if (pts >= 10) userPosition = 6;
    else if (pts >= 8)  userPosition = 7;
    else if (pts >= 6)  userPosition = 8;
    else if (pts >= 4)  userPosition = 9;
    else                userPosition = 10;
  }

  // Save to DB
  await db.update(careersTable).set({
    points: updatedCareer.points,
    wins: updatedCareer.wins,
    losses: updatedCareer.losses,
    fixtures: updatedFixtures as any,
    trophies: career.trophies + trophiesIncrement,
    updatedAt: new Date(),
  }).where(eq(careersTable.id, careerId));

  const finalCareer = await getCareer(careerId);

  return {
    matchResult,
    career: finalCareer!,
    pointsEarned,
    seasonComplete,
    qualified,
    userPosition,
  };
}

export async function transferPlayer(careerId: number, action: string, playerId?: number, xi?: number[]) {
  const career = await getCareer(careerId);
  if (!career) throw new Error("Career not found");

  const allPlayers = getAllPlayers();

  if (action === "sign" && playerId !== undefined) {
    const player = career.availablePlayers.find(p => p.id === playerId);
    if (!player) throw new Error("Player not available");
    if (career.budget < player.salary) throw new Error("Insufficient budget");

    const newSquadPlayer: CareerPlayer = {
      playerId: player.id,
      name: player.name,
      role: player.role,
      overallRating: player.overallRating,
      salary: player.salary,
      inSquad: true,
      inXI: false,
    };

    const updatedSquad = [...career.squad, newSquadPlayer];
    const updatedAvailable = career.availablePlayers.filter(p => p.id !== playerId);
    const newBudget = career.budget - player.salary;

    await db.update(careersTable).set({
      squad: updatedSquad as any,
      availablePlayers: updatedAvailable as any,
      budget: newBudget,
      updatedAt: new Date(),
    }).where(eq(careersTable.id, careerId));

    return {
      success: true,
      message: `${player.name} signed successfully`,
      career: (await getCareer(careerId))!,
    };
  }

  if (action === "release" && playerId !== undefined) {
    const player = career.squad.find(p => p.playerId === playerId);
    if (!player) throw new Error("Player not in squad");

    const updatedSquad = career.squad.filter(p => p.playerId !== playerId);
    const releasedPlayer = allPlayers.find(p => p.id === playerId);
    const updatedAvailable = releasedPlayer
      ? [...career.availablePlayers, releasedPlayer]
      : career.availablePlayers;
    const newBudget = career.budget + player.salary;

    await db.update(careersTable).set({
      squad: updatedSquad as any,
      availablePlayers: updatedAvailable as any,
      budget: newBudget,
      updatedAt: new Date(),
    }).where(eq(careersTable.id, careerId));

    return {
      success: true,
      message: `${player.name} released`,
      career: (await getCareer(careerId))!,
    };
  }

  if (action === "setXI" && xi) {
    if (xi.length !== 11) throw new Error("XI must have exactly 11 players");

    const xiSet = new Set(xi);
    const updatedSquad = career.squad.map(p => ({
      ...p,
      inXI: xiSet.has(p.playerId),
    }));

    await db.update(careersTable).set({
      squad: updatedSquad as any,
      updatedAt: new Date(),
    }).where(eq(careersTable.id, careerId));

    return {
      success: true,
      message: "Playing XI updated",
      career: (await getCareer(careerId))!,
    };
  }

  throw new Error("Invalid action");
}
