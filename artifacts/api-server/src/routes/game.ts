import { Router, type IRouter } from "express";
import {
  GetPlayerPoolResponse,
  SimulateMatchBody,
  SimulateMatchResponse,
  GetCountriesResponse,
  GetIplTeamsResponse,
  CreateCareerBody,
  CreateCareerResponse,
  GetCareerResponse,
  SimulateSeasonBody,
  SimulateSeasonResponse,
  TransferPlayerBody,
  TransferPlayerResponse,
  GetCareerParams,
  SimulateSeasonParams,
  TransferPlayerParams,
} from "@workspace/api-zod";
import {
  getRandomPool,
  COUNTRIES,
  IPL_TEAMS,
  buildCountryXI,
  getAllPlayers,
  type Player,
} from "../lib/players.js";
import { simulateMatch } from "../lib/matchEngine.js";
import {
  createCareer,
  getCareer,
  simulateSeasonMatch,
  transferPlayer,
} from "../lib/careerManager.js";

const router: IRouter = Router();

// GET /game/players  — full card database
router.get("/players", async (_req, res) => {
  res.json({ players: getAllPlayers() });
});

// GET /game/players/pool
router.get("/players/pool", async (req, res) => {
  const count = parseInt(req.query["count"] as string) || 30;
  const players = getRandomPool(count);
  const data = GetPlayerPoolResponse.parse({ players });
  res.json(data);
});

// GET /game/countries
router.get("/countries", async (_req, res) => {
  const countries = COUNTRIES.map(c => ({
    ...c,
    players: buildCountryXI(c.id),
  }));
  const data = GetCountriesResponse.parse({ countries });
  res.json(data);
});

// GET /game/ipl-teams
router.get("/ipl-teams", async (_req, res) => {
  const data = GetIplTeamsResponse.parse({ teams: IPL_TEAMS });
  res.json(data);
});

// POST /game/simulate
router.post("/simulate", async (req, res) => {
  const body = SimulateMatchBody.parse(req.body);
  const result = simulateMatch(
    body.team1 as Player[],
    body.team2 as Player[],
    body.team1Name,
    body.team2Name,
    body.format ?? "t20"
  );
  const data = SimulateMatchResponse.parse(result);
  res.json(data);
});

// POST /game/career
router.post("/career", async (req, res) => {
  const body = CreateCareerBody.parse(req.body);
  const career = await createCareer(body.managerName, body.teamId);
  const data = CreateCareerResponse.parse(career);
  res.json(data);
});

// GET /game/career/:careerId
router.get("/career/:careerId", async (req, res) => {
  const params = GetCareerParams.parse(req.params);
  const career = await getCareer(params.careerId);
  if (!career) {
    res.status(404).json({ error: "Career not found" });
    return;
  }
  const data = GetCareerResponse.parse(career);
  res.json(data);
});

// POST /game/career/:careerId/simulate-season
router.post("/career/:careerId/simulate-season", async (req, res) => {
  const params = SimulateSeasonParams.parse(req.params);
  const body = SimulateSeasonBody.parse(req.body);
  const result = await simulateSeasonMatch(params.careerId, body.matchNumber);
  const data = SimulateSeasonResponse.parse(result);
  res.json(data);
});

// POST /game/career/:careerId/transfer
router.post("/career/:careerId/transfer", async (req, res) => {
  const params = TransferPlayerParams.parse(req.params);
  const body = TransferPlayerBody.parse(req.body);
  const result = await transferPlayer(params.careerId, body.action, body.playerId ?? undefined, body.xi ?? undefined);
  const data = TransferPlayerResponse.parse(result);
  res.json(data);
});

export default router;
