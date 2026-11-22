import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useLocation } from "wouter";
import { motion, AnimatePresence, animate as animateValue } from "framer-motion";
import {
  StadiumScene, FieldWorld, BatterFigure, BattingStumps, ENDS, FIELDERS, BAT_X, BAT_Y, HOME_CAM, VIEW_W, VIEW_H,
  FIELD_CX, FIELD_CY, ROPE_RX, ROPE_RY, camTransform, distanceToRope, randomShotAngle, lerp, clamp01, easeOutCubic,
  fieldedPlayMs, type DrawnBatter,
} from "@/components/stadium-scene";
import { getMatchSetup } from "@/lib/match-store";
import { Button } from "@/components/shared";
import { TossCutscene } from "@/components/toss-cutscene";
import { shotWhenBowledTo, shotForJoystick, type BatterPlay, type BatterKit, type BatterStyle } from "@/components/drawn-batter";
import type { BatterLook } from "@/components/batters-running";
import { DrawnBowler, DrawnKeeper, keeperSpot, earliestRelease, type BowlerLook, type BowlerPlay, type FielderLook } from "@/components/drawn-fielders";
import { LEFT_HANDED_BATTERS, SPINNERS, LEFT_ARM_BOWLERS, type Player as StaticPlayer } from "@/lib/static-data";
import type { Player } from "@workspace/api-client-react/src/generated/api.schemas";
import { addCoins, MATCH_COIN_REWARDS, grantUnlock, hasUnlock, incrementWins, CAREER_COIN_REWARDS } from "@/lib/game-store";
import { loadCareer, applyPlayedGame } from "@/lib/career-store";

// Every batter is drawn: each country bats like one of its signature players, in its own kit
const DRAWN_LOOKS: Record<string, { kit: BatterKit; style: BatterStyle }> = {
  "australia": { kit: "aus", style: "smith" },
  "new zealand": { kit: "nz", style: "latham" },
  "south africa": { kit: "sa", style: "bavuma" },
  "india": { kit: "ind", style: "kohli" },
  "england": { kit: "eng", style: "root" },
  "west indies": { kit: "wi", style: "gayle" },
  "pakistan": { kit: "pak", style: "babar" },
  "sri lanka": { kit: "sl", style: "sangakkara" },
  "bangladesh": { kit: "ban", style: "mushfiqur" },
  "afghanistan": { kit: "afg", style: "gurbaz" },
  "ireland": { kit: "ire", style: "stirling" },
  "zimbabwe": { kit: "zim", style: "raza" },
  "netherlands": { kit: "ned", style: "edwards" },
};
const OTHER_LOOK = { kit: "neutral" as BatterKit, style: "generic" as BatterStyle };
const drawnLookFor = (p?: { country?: string } | null) =>
  p ? DRAWN_LOOKS[(p.country ?? "").toLowerCase()] ?? OTHER_LOOK : undefined;
const isLefty = (p?: { name?: string } | null) => !!p?.name && LEFT_HANDED_BATTERS.has(p.name);
/** Runs the batters actually run: a fielded 1, 2 or 3 (not boundaries, wickets or extras). */
const runsToRun = (o: { runs: number; isWicket: boolean; isExtra: boolean }) =>
  !o.isWicket && !o.isExtra && o.runs > 0 && o.runs < 4 ? o.runs : 0;

// ─── Types ──────────────────────────────────────────────────────────────────

type ShotDir = "leg" | "straight" | "off";
type JoystickDir = "bottom-left" | "bottom-right" | "top-right" | "top-left" | "straight";
type PitchLen = "short" | "good" | "full";
type PitchLine = "leg" | "middle" | "off";
type Timing = "perfect" | "good" | "early" | "late" | "miss";
type Phase = "toss" | "match" | "innings_break" | "result";
type BallStep = "idle" | "direction" | "timing" | "bowling_anim" | "result" | "choose_batsman";
type BowlStep = "select_target" | "bowling_anim" | "result" | "choose_bowler";

// Joystick → shot direction for game logic
const JOYSTICK_TO_SHOT: Record<JoystickDir, ShotDir> = {
  "bottom-left": "leg",
  "bottom-right": "off",
  "top-right": "off",
  "top-left": "leg",
  "straight": "straight",
};


interface BallOutcome {
  runs: number;
  isWicket: boolean;
  isExtra: boolean;
  description: string;
  timingQuality?: Timing;
}

interface BatsmanScore {
  playerIdx: number;
  runs: number;
  balls: number;
  fours: number;
  sixes: number;
  out: boolean;
  outDesc: string;
}

interface BowlerScore {
  playerIdx: number;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
}

interface InningsState {
  battingTeam: 1 | 2;
  score: number;
  wickets: number;
  legalBalls: number;
  extras: number;
  strikerIdx: number;
  nonStrikerIdx: number;
  currentBowlerIdx: number;
  nextBatsmanIdx: number;
  batsmanScores: BatsmanScore[];
  bowlerScores: BowlerScore[];
  partnershipRuns: number;
  partnershipBalls: number;
  currentOverBalls: string[];
  currentOverRuns: number;
  overHistory: number[];
}

// ─── Difficulty presets ───────────────────────────────────────────────────────

interface DiffPreset {
  barDuration: number;    // ms for timing bar to travel full width
  perfectLow: number;     // left edge of perfect zone (0-100)
  perfectHigh: number;    // right edge of perfect zone
  goodLow: number;        // left edge of good zone
  goodHigh: number;       // right edge of good zone
  missWicket: number;     // base wicket chance on miss
  edgeWicket: number;     // base wicket chance on early/late
  cpuMult: number;        // multiplier on CPU bowling difficulty (>1 = easier for user to bowl)
}

const DIFFICULTY_PRESETS: Record<string, DiffPreset> = {
  easy:   { barDuration: 1500, perfectLow: 35, perfectHigh: 65, goodLow: 15, goodHigh: 85, missWicket: 0.30, edgeWicket: 0.10, cpuMult: 1.5 },
  medium: { barDuration: 1200, perfectLow: 40, perfectHigh: 60, goodLow: 25, goodHigh: 75, missWicket: 0.48, edgeWicket: 0.16, cpuMult: 1.0 },
  hard:   { barDuration: 1000, perfectLow: 43, perfectHigh: 57, goodLow: 28, goodHigh: 72, missWicket: 0.65, edgeWicket: 0.22, cpuMult: 0.7 },
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortBattingOrder(players: Player[]): Player[] {
  const order = ["batsman", "wicketkeeper", "allrounder", "bowler"];
  return [...players].sort(
    (a, b) =>
      order.indexOf(a.role ?? "") - order.indexOf(b.role ?? "") ||
      (b.battingRating ?? 0) - (a.battingRating ?? 0)
  );
}

function sortBowlingOrder(players: Player[]): number[] {
  const scoreMap = players.map((p, i) => ({
    i,
    v: (p.bowlingRating ?? 0) * 10 + (p.role === "bowler" ? 20 : p.role === "allrounder" ? 10 : 0),
  }));
  scoreMap.sort((a, b) => b.v - a.v);
  return scoreMap.map((x) => x.i);
}

function getOverStr(legalBalls: number): string {
  return `${Math.floor(legalBalls / 6)}.${legalBalls % 6}`;
}

function computeBattingResult(
  dir: ShotDir, timing: Timing, bat: number, bowl: number,
  missWicketBase = 0.65, edgeWicketBase = 0.22
): BallOutcome {
  // Normalise to 0-1. Ratings go up to ~880 for regular players, 990 for primes.
  const b   = Math.min(bat  / 880, 1);
  const bwl = Math.min(bowl / 880, 1);

  // MISS — high wicket chance
  if (timing === "miss") {
    if (Math.random() < 0.12) return { runs: 1, isWicket: false, isExtra: true, description: "Wide! +1" };
    if (Math.random() < missWicketBase + bwl * 0.18 - b * 0.06) {
      const desc = dir === "straight" ? "BOWLED! 🎯" : dir === "off" ? "Caught behind! 🤲" : "LBW! 🏏";
      return { runs: 0, isWicket: true, isExtra: false, description: desc };
    }
    return { runs: 0, isWicket: false, isExtra: false, description: "Missed! Dot ball" };
  }

  // EARLY / LATE — significant wicket risk, rarely score
  if (timing === "early" || timing === "late") {
    const wProb = (edgeWicketBase + bwl * 0.14) * (1 - b * 0.25);
    if (Math.random() < wProb) {
      return { runs: 0, isWicket: true, isExtra: false, description: "Caught! 🤲" };
    }
    // Mostly dots, rare single
    const p = Math.random();
    if (p < 0.25) return { runs: 1, isWicket: false, isExtra: false, description: "1 run" };
    return { runs: 0, isWicket: false, isExtra: false, description: "Dot ball" };
  }

  // GOOD timing — some runs but no easy boundaries
  if (timing === "good") {
    const r = Math.random();
    const sixProb  = 0.04 * (0.3 + b * 0.7);
    const fourProb = 0.14 * (0.3 + b * 0.7);
    if (r < sixProb) return { runs: 6, isWicket: false, isExtra: false, description: "SIX! 💥" };
    if (r < sixProb + fourProb) return { runs: 4, isWicket: false, isExtra: false, description: "FOUR! 🏏" };
    if (r < 0.40) return { runs: 1, isWicket: false, isExtra: false, description: "1 run" };
    if (r < 0.52) return { runs: 2, isWicket: false, isExtra: false, description: "2 runs" };
    return { runs: 0, isWicket: false, isExtra: false, description: "Dot ball" };
  }

  // PERFECT timing — rewarded but still hard
  const r = Math.random();
  const sixProb  = 0.18 * (0.35 + b * 0.65);
  const fourProb = 0.28 * (0.35 + b * 0.65);
  if (r < sixProb) return { runs: 6, isWicket: false, isExtra: false, description: "SIX! 💥" };
  if (r < sixProb + fourProb) return { runs: 4, isWicket: false, isExtra: false, description: "FOUR! 🏏" };
  if (r < sixProb + fourProb + 0.22) return { runs: 2, isWicket: false, isExtra: false, description: "2 runs" };
  if (r < sixProb + fourProb + 0.22 + 0.28) return { runs: 1, isWicket: false, isExtra: false, description: "1 run" };
  return { runs: 0, isWicket: false, isExtra: false, description: "Dot ball" };
}

// x: 0=leg, 1=off  y: 0=full, 1=short
function targetToLenLine(t: { x: number; y: number }): { len: PitchLen; line: PitchLine } {
  const len: PitchLen = t.y < 0.33 ? "full" : t.y < 0.67 ? "good" : "short";
  const line: PitchLine = t.x < 0.33 ? "leg" : t.x < 0.67 ? "middle" : "off";
  return { len, line };
}

function computeBowlingResult(
  len: PitchLen, line: PitchLine, bowlerRating: number, batsmanRating: number,
  cpuMult = 1.0
): BallOutcome {
  // difficulty = chance of being a "good" delivery (higher = user more likely to take wicket)
  // Kept low so CPU batsmen are hard to dismiss
  const difficulty: Record<string, number> = {
    "short-off": 0.38, "short-middle": 0.30, "short-leg": 0.20,
    "good-off": 0.58, "good-middle": 0.50, "good-leg": 0.38,
    "full-off": 0.30, "full-middle": 0.22, "full-leg": 0.16,
  };
  const diff = (difficulty[`${len}-${line}`] ?? 0.4) * Math.min(bowlerRating / 880, 1) * cpuMult;
  const bat  = Math.min(batsmanRating / 880, 1);
  const r = Math.random();

  // Wicket probability — tight even on best lines
  if (r < diff * 0.18) {
    const descs = ["Bowled! 🎯", "Caught! 🤲", "LBW! 🏏", "Caught & Bowled! 🏏"];
    return { runs: 0, isWicket: true, isExtra: false, description: descs[Math.floor(Math.random() * descs.length)] };
  }
  // CPU hits boundaries freely on loose deliveries
  const sixChance  = (1 - diff) * bat * (len === "short" ? 0.40 : 0.18);
  const fourChance = (1 - diff) * bat * (len === "short" ? 0.72 : 0.55);
  if (r < diff * 0.18 + sixChance) {
    return { runs: 6, isWicket: false, isExtra: false, description: "SIX! 💥" };
  }
  if (r < diff * 0.18 + fourChance) {
    return { runs: 4, isWicket: false, isExtra: false, description: "FOUR! 🏏" };
  }
  const p = Math.random();
  if (p < 0.42) return { runs: 1, isWicket: false, isExtra: false, description: "1 run" };
  if (p < 0.58) return { runs: 2, isWicket: false, isExtra: false, description: "2 runs" };
  if (p < 0.68) return { runs: 3, isWicket: false, isExtra: false, description: "3 runs" };
  return { runs: 0, isWicket: false, isExtra: false, description: "Dot ball" };
}

function timingFromPosition(pos: number, preset: DiffPreset): Timing {
  if (pos >= preset.perfectLow && pos <= preset.perfectHigh) return "perfect";
  if (pos >= preset.goodLow    && pos <= preset.goodHigh)    return "good";
  if (pos >= 8                 && pos <= 92)                 return (pos < preset.perfectLow ? "early" : "late");
  return "miss";
}

function initInnings(battingTeam: 1 | 2, squad: Player[], bowlingSquad: Player[]): InningsState {
  const ordered = sortBattingOrder(squad);
  return {
    battingTeam,
    score: 0, wickets: 0, legalBalls: 0, extras: 0,
    strikerIdx: 0, nonStrikerIdx: 1, currentBowlerIdx: 0,
    nextBatsmanIdx: 2,
    batsmanScores: ordered.map((_, i) => ({
      playerIdx: i, runs: 0, balls: 0, fours: 0, sixes: 0, out: false, outDesc: "",
    })),
    // The fielding side bowls (indexes into their squad)
    bowlerScores: sortBowlingOrder(bowlingSquad).map((pi) => ({
      playerIdx: pi, overs: 0, balls: 0, runs: 0, wickets: 0,
    })),
    partnershipRuns: 0,
    partnershipBalls: 0,
    currentOverBalls: [],
    currentOverRuns: 0,
    overHistory: [],
  };
}

function isInningsOver(inn: InningsState, maxBalls: number, target?: number): boolean {
  if (inn.wickets >= 10) return true;
  if (inn.legalBalls >= maxBalls) return true;
  if (target !== undefined && inn.score >= target) return true;
  return false;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MatchPlay() {
  const [, navigate] = useLocation();
  const setup = getMatchSetup();

  useEffect(() => {
    if (!setup) navigate("/quick-match");
  }, [setup, navigate]);

  if (!setup) return null;

  const t1 = sortBattingOrder(setup.team1Players.slice(0, 11));
  const t2 = sortBattingOrder(setup.team2Players.slice(0, 11));

  return <MatchGame t1={t1} t2={t2} setup={setup} />;
}

function MatchGame({
  t1, t2, setup,
}: { t1: Player[]; t2: Player[]; setup: ReturnType<typeof getMatchSetup> & {} }) {
  const [, navigate] = useLocation();

  const [phase, setPhase] = useState<Phase>("toss");
  const [userBatFirst, setUserBatFirst] = useState(true);

  const [inn1, setInn1] = useState<InningsState | null>(null);
  const [inn2, setInn2] = useState<InningsState | null>(null);
  const [activeInn, setActiveInn] = useState<1 | 2>(1);

  const [ballStep, setBallStep] = useState<BallStep>("idle");
  const [bowlStep, setBowlStep] = useState<BowlStep>("select_target");
  const [shotDir, setShotDir] = useState<ShotDir | null>(null);
  const [joystickDir, setJoystickDir] = useState<JoystickDir | null>(null);
  const [pitchTarget, setPitchTarget] = useState<{ x: number; y: number } | null>(null);
  const [lastOutcome, setLastOutcome] = useState<BallOutcome | null>(null);

  // Visual state
  const [ballActive, setBallActive] = useState(false);
  const [batAngle, setBatAngle] = useState(0);
  const [resultFlash, setResultFlash] = useState<string | null>(null);
  const [coinsEarned, setCoinsEarned] = useState(0);
  const coinsAwardedRef = useRef(false);
  const careerResultAppliedRef = useRef(false);
  const [careerResult, setCareerResult] = useState<{
    seasonComplete: boolean; finalPosition: number; coinsEarned: number;
  } | null>(null);
  const [milestone, setMilestone] = useState<string | null>(null);
  const [showScorecard, setShowScorecard] = useState(false);
  // The bowler's delivery: when he set off and when the ball leaves his hand
  const [bowlerPlay, setBowlerPlay] = useState<BowlerPlay | null>(null);
  const bowlerPlayRef = useRef<BowlerPlay | null>(null);
  bowlerPlayRef.current = bowlerPlay;
  const [boundaryType, setBoundaryType] = useState<"four" | "six" | null>(null);
  const boundaryDoneRef = useRef<(() => void) | null>(null);

  // Drawn batters (Australia/New Zealand): the shot being played, timed to the ball
  const [batterPlay, setBatterPlay] = useState<BatterPlay | null>(null);
  // The pair at the crease stay where they were until the ball's dead (the strike can change on the result)
  const [facing, setFacing] = useState<{ s: number; n: number } | null>(null);
  const [ballPing, setBallPing] = useState(false);

  // Fielding animation state
  const [fieldingAnim, setFieldingAnim] = useState<{ runs: number; shotDir: ShotDir } | null>(null);
  const [fieldingKey, setFieldingKey] = useState(0);

  // Timing bar
  const [, setTimingActive] = useState(false);
  const [timingPos, setTimingPos] = useState(0);
  const animRef = useRef<number | undefined>(undefined);
  const startRef = useRef<number>(0);
  const swingFiredRef = useRef(false);

  const diffPreset = DIFFICULTY_PRESETS[setup.difficulty ?? "medium"] ?? DIFFICULTY_PRESETS.medium;

  const currentInn = activeInn === 1 ? inn1 : inn2;
  const setCurrentInn = activeInn === 1 ? setInn1 : setInn2;
  const is2P = setup.twoPlayer ?? false;
  // In 2-player mode both teams always bat manually; in 1-player mode only the user's team does
  const isUserBatting = is2P
    ? true
    : (activeInn === 1 && userBatFirst) || (activeInn === 2 && !userBatFirst);


  const battingSquadNow = currentInn ? (currentInn.battingTeam === 1 ? t1 : t2) : [];
  const strikerNow = currentInn ? battingSquadNow[facing?.s ?? currentInn.strikerIdx] : undefined;
  const nonStrikerNow = currentInn ? battingSquadNow[facing?.n ?? currentInn.nonStrikerIdx] : undefined;
  const nonStrikerLookNow = drawnLookFor(nonStrikerNow);
  // The fielding side's bowler (pace or spin, which arm) and wicketkeeper, in their own country's kit
  const fieldingSquadNow = currentInn ? (currentInn.battingTeam === 1 ? t2 : t1) : [];
  const bowlerEntryNow = currentInn?.bowlerScores[currentInn.currentBowlerIdx];
  const bowlerNow = bowlerEntryNow ? fieldingSquadNow[bowlerEntryNow.playerIdx] : undefined;
  const bowlerLook: BowlerLook | null = bowlerNow
    ? { ...(drawnLookFor(bowlerNow) ?? OTHER_LOOK), kind: SPINNERS.has(bowlerNow.name) ? "spin" : "pace", leftArm: LEFT_ARM_BOWLERS.has(bowlerNow.name) }
    : null;
  const bowlerLookRef = useRef<BowlerLook | null>(null);
  bowlerLookRef.current = bowlerLook;
  const keeperNow = fieldingSquadNow.find(p => p.role === "wicketkeeper") ?? fieldingSquadNow[0];
  const keeperLook: FielderLook | null = keeperNow ? drawnLookFor(keeperNow) ?? OTHER_LOOK : null;
  const nonStrikerLook: BatterLook | null = nonStrikerNow && nonStrikerLookNow
    ? { id: nonStrikerNow.name, ...nonStrikerLookNow, leftHanded: isLefty(nonStrikerNow) }
    : null;
  const strikerLook = drawnLookFor(strikerNow);
  const drawnBatter: DrawnBatter | null = strikerLook
    ? { id: strikerNow?.name ?? "", play: batterPlay, ready: isUserBatting && ballStep === "timing", ...strikerLook, leftHanded: isLefty(strikerNow) }
    : null;

  // Which player label is currently batting (2P only)
  const activeBatter = is2P
    ? ((activeInn === 1 && userBatFirst) || (activeInn === 2 && !userBatFirst) ? "Player 1" : "Player 2")
    : null;


  // ─── Timing bar ───
  const stopTiming = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    setTimingActive(false);
  }, []);

  const startTimingBar = useCallback(() => {
    if (animRef.current) cancelAnimationFrame(animRef.current);
    swingFiredRef.current = false;
    setTimingPos(0);
    setTimingActive(true);
    startRef.current = performance.now();
    const barDuration = diffPreset.barDuration;
    const animate = (now: number) => {
      const elapsed = now - startRef.current;
      const pos = Math.min((elapsed / barDuration) * 100, 100);
      setTimingPos(pos);
      if (pos < 100) {
        animRef.current = requestAnimationFrame(animate);
      } else {
        setTimingActive(false);
        handleSwingRef.current(100);
      }
    };
    animRef.current = requestAnimationFrame(animate);
  }, []); // eslint-disable-line

  useEffect(() => () => { if (animRef.current) cancelAnimationFrame(animRef.current); }, []);

  useEffect(() => {
    if (phase !== "result" || !inn1 || !inn2 || coinsAwardedRef.current) return;
    coinsAwardedRef.current = true;
    const s1 = inn1.score;
    const s2 = inn2.score;
    const bat1IsTeam1 = inn1.battingTeam === 1;
    const team1Won =
      (bat1IsTeam1 && s1 > s2) || (!bat1IsTeam1 && s2 > s1);
    if (team1Won) {
      const reward = MATCH_COIN_REWARDS[setup.overs] ?? 0;
      if (reward > 0) {
        addCoins(reward);
        setCoinsEarned(reward);
        window.dispatchEvent(new Event("cm-coins-updated"));
      }
      // Increment win counter (used by quests)
      const newWins = incrementWins();

      // Quest: win by 100+ runs → Labuschagne
      const winMargin = s1 > s2 ? s1 - s2 : s2 - s1;
      if (winMargin >= 100 && !hasUnlock("quest_labuschagne")) {
        grantUnlock("quest_labuschagne");
      }

      // Quest: 3 wins → icon pick
      if (newWins >= 3 && !hasUnlock("quest_icon_pick")) {
        grantUnlock("quest_icon_pick");
      }

      // Quest: Stokes MW — win 5 or 10 over match with English team, Stokes (id 762) scores 30+
      if (
        !hasUnlock("quest_stokes_mw") &&
        (setup.overs === 5 || setup.overs === 10) &&
        setup.team1Name?.toLowerCase().includes("england")
      ) {
        const stokesIdx = setup.team1Players.findIndex((p: { id: number }) => p.id === 27);
        if (stokesIdx !== -1) {
          const userBatsInInn1 = inn1.battingTeam === 1;
          const userInn = userBatsInInn1 ? inn1 : inn2;
          const stokesBat = userInn.batsmanScores.find((b: { playerIdx: number }) => b.playerIdx === stokesIdx);
          if (stokesBat && stokesBat.runs >= 30) {
            grantUnlock("quest_stokes_mw");
          }
        }
      }
    }
  }, [phase, inn1, inn2, setup.overs]);

  // ─── Career result application ───
  useEffect(() => {
    if (phase !== "result" || !inn1 || !inn2 || !setup.careerId || careerResultAppliedRef.current) return;
    careerResultAppliedRef.current = true;

    const career = loadCareer(setup.careerId);
    if (!career || setup.fixtureIndex == null) return;

    // Determine user score vs opponent score
    // team1 = user; userBatFirst means inn1 = user batting
    const userBatFirst = inn1.battingTeam === 1;
    const userScore = userBatFirst ? inn1.score : inn2.score;
    const opponentScore = userBatFirst ? inn2.score : inn1.score;

    const { career: updated, seasonComplete, finalPosition } = applyPlayedGame(
      career, setup.fixtureIndex, userScore, opponentScore
    );

    let careerCoins = 0;
    if (seasonComplete) {
      const reward = CAREER_COIN_REWARDS[finalPosition] ?? 0;
      if (reward !== 0) {
        addCoins(reward);
        careerCoins = reward;
        window.dispatchEvent(new Event("cm-coins-updated"));
      }
    }
    setCareerResult({ seasonComplete, finalPosition, coinsEarned: careerCoins });
    // suppress unused var warning — updated is saved inside applyPlayedGame
    void updated;
  }, [phase, inn1, inn2, setup.careerId, setup.fixtureIndex]);

  const maxBalls = setup.overs * 6;

  const applyOutcome = useCallback(
    (outcome: BallOutcome, inn: InningsState, target?: number, userIsBatting = false): InningsState => {
      const next = {
        ...inn,
        batsmanScores: inn.batsmanScores.map((s) => ({ ...s })),
        bowlerScores:  inn.bowlerScores.map((s)  => ({ ...s })),
        currentOverBalls: [...inn.currentOverBalls],
        overHistory: [...inn.overHistory],
      };
      const striker    = next.batsmanScores[next.strikerIdx];
      const bowlerEntry = next.bowlerScores[next.currentBowlerIdx];

      if (outcome.isExtra) {
        next.extras += outcome.runs;
        next.score += outcome.runs;
        next.currentOverBalls.push("wd");
      } else {
        next.legalBalls += 1;
        striker.balls += 1;
        bowlerEntry.balls += 1;

        // Ball symbol for over tracker
        const sym = outcome.isWicket ? "W"
          : outcome.runs === 0 ? "·"
          : outcome.runs === 4 ? "4"
          : outcome.runs === 6 ? "6"
          : String(outcome.runs);
        next.currentOverBalls.push(sym);

        if (outcome.isWicket) {
          striker.out = true;
          striker.outDesc = outcome.description;
          next.wickets += 1;
          bowlerEntry.wickets += 1;
          next.partnershipRuns = 0;
          next.partnershipBalls = 0;
          // When user is batting, leave strikerIdx as-is — UI will prompt for new batsman
          if (!userIsBatting && next.nextBatsmanIdx < 11 && next.wickets < 10) {
            next.strikerIdx = next.nextBatsmanIdx;
            next.nextBatsmanIdx += 1;
          }
        } else {
          striker.runs += outcome.runs;
          next.score += outcome.runs;
          bowlerEntry.runs += outcome.runs;
          next.currentOverRuns += outcome.runs;
          next.partnershipRuns += outcome.runs;
          next.partnershipBalls += 1;
          if (outcome.runs === 4) striker.fours += 1;
          if (outcome.runs === 6) striker.sixes += 1;
          if (outcome.runs % 2 === 1) {
            const tmp = next.strikerIdx;
            next.strikerIdx = next.nonStrikerIdx;
            next.nonStrikerIdx = tmp;
          }
        }

        if (next.legalBalls % 6 === 0 && next.legalBalls > 0) {
          bowlerEntry.overs += 1;
          next.overHistory.push(next.currentOverRuns);
          next.currentOverBalls = [];
          next.currentOverRuns = 0;
          // Always swap ends at over-end
          const tmp = next.strikerIdx;
          next.strikerIdx = next.nonStrikerIdx;
          next.nonStrikerIdx = tmp;
          // Auto-pick next bowler only when CPU bowling (user batting)
          if (userIsBatting) {
            let nextBowler = (next.currentBowlerIdx + 1) % next.bowlerScores.length;
            let tries = 0;
            while (next.bowlerScores[nextBowler].overs >= 4 && tries < next.bowlerScores.length) {
              nextBowler = (nextBowler + 1) % next.bowlerScores.length;
              tries++;
            }
            next.currentBowlerIdx = nextBowler;
          }
          // When user is bowling, leave currentBowlerIdx as-is — UI will prompt for new bowler
        }
      }
      return next;
    },
    []
  );

  // ─── Toss ───
  const handleToss = (batFirst: boolean) => {
    setUserBatFirst(batFirst);
    const firstBatTeam: 1 | 2 = batFirst ? 1 : 2;
    const firstBatSquad = firstBatTeam === 1 ? t1 : t2;
    setInn1(initInnings(firstBatTeam, firstBatSquad, firstBatTeam === 1 ? t2 : t1));
    setActiveInn(1);
    setPhase("match");
    setBallStep("idle");
    setBowlStep("select_target");
  };

  const handleSwingRef = useRef<(pos?: number) => void>(() => {});

  // ─── User batting: joystick select ───
  const handleJoystickSelect = (jDir: JoystickDir) => {
    setJoystickDir(jDir);
    setShotDir(JOYSTICK_TO_SHOT[jDir]);
    setBallStep("timing");
    setBowlerPlay({ mode: "user", runStartAt: performance.now(), releaseAt: null });
    startTimingBar();
  };

  // ─── User batting: swing ───
  const handleSwing = useCallback(
    (pos?: number) => {
      if (swingFiredRef.current) return;
      swingFiredRef.current = true;
      stopTiming();
      const p = pos !== undefined ? pos : timingPos;
      const timing = timingFromPosition(p, diffPreset);

      if (!currentInn) return;
      const squad = currentInn.battingTeam === 1 ? t1 : t2;
      const opposingSquad = currentInn.battingTeam === 1 ? t2 : t1;
      const batsman = squad[currentInn.strikerIdx];
      setFacing({ s: currentInn.strikerIdx, n: currentInn.nonStrikerIdx });
      const bowlerEntry = currentInn.bowlerScores[currentInn.currentBowlerIdx];
      const bowler = opposingSquad[bowlerEntry.playerIdx];

      const outcome = computeBattingResult(
        shotDir ?? "straight",
        timing,
        batsman?.battingRating ?? 50,
        bowler?.bowlingRating ?? 5,
        diffPreset.missWicket,
        diffPreset.edgeWicket
      );

      setBatAngle(timing === "miss" ? 0 : 55);
      // The ball leaves the bowler's hand just after the swing (once he's got to his gather)
      const now = performance.now();
      const bp = bowlerPlayRef.current, bk = bowlerLookRef.current?.kind;
      const releaseAt = Math.max(now + 200, bp && bk ? earliestRelease(bk, bp.runStartAt) : 0);
      const delay = releaseAt - now;
      setBowlerPlay(prev => (prev ? { ...prev, releaseAt } : { mode: "user", runStartAt: now, releaseAt }));
      if (drawnLookFor(batsman)) {
        setBatterPlay({ shot: shotForJoystick(joystickDir, isLefty(batsman)), contactAt: releaseAt + 500, key: Date.now(), runs: runsToRun(outcome) });
      }
      setTimeout(() => setBallActive(true), delay);
      setBallStep("bowling_anim");
      setLastOutcome(outcome);

      setTimeout(() => {
        setBallActive(false);
        setBatAngle(0);

        const isBoundary = (outcome.runs === 4 || outcome.runs === 6) && !outcome.isWicket && !outcome.isExtra;
        const isFielding  = !isBoundary && !outcome.isWicket && !outcome.isExtra;

        if (isBoundary) {
          setBallPing(true); // plays under BoundaryScene
        } else if (isFielding) {
          setFieldingAnim({ runs: outcome.runs, shotDir: shotDir ?? "straight" });
          setFieldingKey(k => k + 1);
        } else {
          // wicket or extra
          setResultFlash(outcome.description);
        }
        setBallStep("result");

        const target = activeInn === 2 ? (inn1?.score ?? 0) + 1 : undefined;
        const prevStrikerIdx = currentInn.strikerIdx;
        const prevRuns = currentInn.batsmanScores[prevStrikerIdx]?.runs ?? 0;
        const nextInn = applyOutcome(outcome, currentInn, target, true);
        setCurrentInn(nextInn);

        // Milestone detection (user batting only)
        if (isUserBatting && !outcome.isWicket && !outcome.isExtra) {
          const newRuns = nextInn.batsmanScores[prevStrikerIdx]?.runs ?? 0;
          if (prevRuns < 100 && newRuns >= 100) {
            setMilestone("CENTURY! 🏆");
            setTimeout(() => setMilestone(null), 2500);
          } else if (prevRuns < 50 && newRuns >= 50) {
            setMilestone("FIFTY! 🏅");
            setTimeout(() => setMilestone(null), 2000);
          } else if (prevRuns < 25 && newRuns >= 25) {
            setMilestone("25 UP! ⚡");
            setTimeout(() => setMilestone(null), 1800);
          }
        }

        const continueGame = () => {
          setResultFlash(null);
          setBallPing(false);
          setBowlerPlay(null);
          setBatterPlay(null);
          setFacing(null);
          setBoundaryType(null);
          setFieldingAnim(null);

          if (isInningsOver(nextInn, maxBalls, target)) {
            if (activeInn === 1) {
              const secBatTeam: 1 | 2 = nextInn.battingTeam === 1 ? 2 : 1;
              const secSquad = secBatTeam === 1 ? t1 : t2;
              setInn2(initInnings(secBatTeam, secSquad, secBatTeam === 1 ? t2 : t1));
              setActiveInn(2);
              setBallStep("idle");
              setBowlStep("select_target");
              setPhase("innings_break");
            } else {
              setPhase("result");
            }
          } else if (outcome.isWicket && nextInn.wickets < 10) {
            setShotDir(null);
            setJoystickDir(null);
            setBallStep("choose_batsman");
          } else {
            setShotDir(null);
            setJoystickDir(null);
            setBallStep("direction");
          }
        };

        if (isBoundary) {
          boundaryDoneRef.current = continueGame;
          setBoundaryType(outcome.runs === 4 ? "four" : "six");
        } else if (isFielding) {
          setTimeout(continueGame, fieldedPlayMs(outcome.runs)); // fielding and running
        } else {
          setTimeout(continueGame, 800); // wickets / extras
        }
      }, 500 + delay);
    },
    [timingPos, currentInn, shotDir, joystickDir, activeInn, inn1, t1, t2, applyOutcome, stopTiming, setCurrentInn]
  );
  handleSwingRef.current = handleSwing;

  const startBall = () => {
    setShotDir(null);
    setJoystickDir(null);
    setBallStep("direction");
  };

  // Choose new incoming batsman after wicket
  const handleChooseBatsman = (batsmanScoreIdx: number) => {
    if (!currentInn) return;
    setCurrentInn(prev => {
      if (!prev) return prev;
      const next = { ...prev, batsmanScores: prev.batsmanScores.map(s => ({ ...s })) };
      next.strikerIdx = batsmanScoreIdx;
      // Track highest used idx for future auto-fills
      if (batsmanScoreIdx >= next.nextBatsmanIdx) {
        next.nextBatsmanIdx = batsmanScoreIdx + 1;
      }
      return next;
    });
    setShotDir(null);
    setJoystickDir(null);
    setBallStep("direction");
  };

  // Swap who is on strike
  const handleSwapStrike = () => {
    if (!currentInn) return;
    setCurrentInn(prev => {
      if (!prev) return prev;
      return { ...prev, strikerIdx: prev.nonStrikerIdx, nonStrikerIdx: prev.strikerIdx };
    });
  };

  // Choose bowler for next over
  const handleChooseBowler = (bowlerScoreIdx: number) => {
    if (!currentInn) return;
    setCurrentInn(prev => {
      if (!prev) return prev;
      return { ...prev, currentBowlerIdx: bowlerScoreIdx };
    });
    setBowlStep("select_target");
  };

  // ─── User bowling ───
  const handleBowl = () => {
    if (!currentInn) return;
    const squad = currentInn.battingTeam === 1 ? t1 : t2;
    const opposingSquad = currentInn.battingTeam === 1 ? t2 : t1;
    const batsman = squad[currentInn.strikerIdx];
    setFacing({ s: currentInn.strikerIdx, n: currentInn.nonStrikerIdx });
    const bowlerEntry = currentInn.bowlerScores[currentInn.currentBowlerIdx];
    const bowler = opposingSquad[bowlerEntry.playerIdx];

    const { len: pLen, line: pLine } = pitchTarget ? targetToLenLine(pitchTarget) : { len: "good" as PitchLen, line: "off" as PitchLine };
    const outcome = computeBowlingResult(
      pLen, pLine,
      bowler?.bowlingRating ?? 5,
      batsman?.battingRating ?? 50,
      diffPreset.cpuMult
    );

    setBowlStep("bowling_anim");

    // Animate all 19 run-up frames at 85ms each — slightly longer run-up
    const FRAME_MS = 85;
    if (drawnLookFor(batsman)) {
      const side: ShotDir = pLine === "off" ? "leg" : pLine === "leg" ? "off" : "straight";
      // ball is released after the run-up and takes 0.52s to reach him
      setBatterPlay({ shot: shotWhenBowledTo(side, pLen, outcome, isLefty(batsman)), contactAt: performance.now() + 19 * FRAME_MS + 520, key: Date.now(), runs: runsToRun(outcome) });
    }
    setBowlerPlay({ mode: "auto", runStartAt: performance.now(), releaseAt: performance.now() + 19 * FRAME_MS });

    // After last frame, release the ball
    setTimeout(() => {
      setBallActive(true);

      setTimeout(() => {
        setBallActive(false);

        const isBoundary = (outcome.runs === 4 || outcome.runs === 6) && !outcome.isWicket && !outcome.isExtra;
        const isFielding  = !isBoundary && !outcome.isWicket && !outcome.isExtra;
        // derive CPU shot direction from pitch line (opposite side typically)
        const cpuShotDir: ShotDir = pLine === "off" ? "leg" : pLine === "leg" ? "off" : "straight";

        if (isFielding) {
          setFieldingAnim({ runs: outcome.runs, shotDir: cpuShotDir });
          setFieldingKey(k => k + 1);
        } else if (!isBoundary) {
          setResultFlash(outcome.description);
        }
        setBowlStep("result");

        const target = activeInn === 2 ? (inn1?.score ?? 0) + 1 : undefined;
        const nextInn = applyOutcome(outcome, currentInn, target, false);
        setCurrentInn(nextInn);
        const overJustEnded = nextInn.legalBalls % 6 === 0 && nextInn.legalBalls > 0;

        const continueGame = () => {
          setResultFlash(null);
          setBowlerPlay(null);
          setBatterPlay(null);
          setFacing(null);
          setPitchTarget(null);
          setBoundaryType(null);
          setFieldingAnim(null);

          if (isInningsOver(nextInn, maxBalls, target)) {
            if (activeInn === 1) {
              const secBatTeam: 1 | 2 = nextInn.battingTeam === 1 ? 2 : 1;
              const secSquad = secBatTeam === 1 ? t1 : t2;
              setInn2(initInnings(secBatTeam, secSquad, secBatTeam === 1 ? t2 : t1));
              setActiveInn(2);
              setBallStep("idle");
              setBowlStep("select_target");
              setPhase("innings_break");
            } else {
              setPhase("result");
            }
          } else if (overJustEnded) {
            setBowlStep("choose_bowler");
          } else {
            setBowlStep("select_target");
          }
        };

        if (isBoundary) {
          boundaryDoneRef.current = continueGame;
          setShotDir(cpuShotDir); // so the cutscene goes where the CPU actually hit it
          setBoundaryType(outcome.runs === 4 ? "four" : "six");
        } else if (isFielding) {
          setTimeout(continueGame, fieldedPlayMs(outcome.runs));
        } else {
          setTimeout(continueGame, 800);
        }
      }, 500);
    }, 19 * FRAME_MS); // 1330ms for full run-up
  };

  // ─── Result helpers ───
  const getWinner = (): { name: string; margin: string } | "tie" => {
    const s1 = inn1?.score ?? 0;
    const s2 = inn2?.score ?? 0;
    const w2 = inn2?.wickets ?? 0;
    const bat1 = inn1?.battingTeam === 1 ? setup.team1Name : setup.team2Name;
    const bat2 = inn2?.battingTeam === 1 ? setup.team1Name : setup.team2Name;
    if (s1 === s2) return "tie";
    if (s1 > s2) return { name: bat1, margin: `by ${s1 - s2} runs` };
    return { name: bat2, margin: `by ${10 - w2} wickets` };
  };

  const squad1 = (inn: InningsState) => (inn.battingTeam === 1 ? t1 : t2);
  const squad2 = (inn: InningsState) => (inn.battingTeam === 1 ? t2 : t1);

  // ─── TOSS SCREEN ───
  if (phase === "toss") {
    const cap1 = [...t1].sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))[0] as unknown as StaticPlayer;
    const cap2 = [...t2].sort((a, b) => (b.overallRating ?? 0) - (a.overallRating ?? 0))[0] as unknown as StaticPlayer;
    return (
      <TossCutscene
        captain1={cap1 ?? null}
        captain2={cap2 ?? null}
        label1={is2P ? "Player 1" : "You"}
        label2={is2P ? "Player 2" : setup.team2Name}
        showBatChoice={true}
        is1P={!is2P}
        onComplete={(team1BatsFirst) => handleToss(team1BatsFirst)}
      />
    );
  }

  // ─── INNINGS BREAK ───
  if (phase === "innings_break" && inn1) {
    const batName = inn1.battingTeam === 1 ? setup.team1Name : setup.team2Name;
    // In 2P, whoever bats in inn2 is the "other" player
    const nextBatter = is2P
      ? (inn1.battingTeam === 1 ? "Player 2" : "Player 1")
      : null;
    const nextTeam = inn1.battingTeam === 1 ? setup.team2Name : setup.team1Name;
    return (
      <div className="max-w-lg mx-auto py-12 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <h1 className="text-3xl font-display font-black text-white mb-2">Innings Break</h1>
          <p className="text-muted-foreground mb-6">1st innings complete</p>
          <div className="p-6 rounded-2xl bg-card border border-border/40 mb-6">
            <div className="text-5xl font-display font-black text-white mb-1">
              {inn1.score}/{inn1.wickets}
            </div>
            <div className="text-muted-foreground">{batName} · {getOverStr(inn1.legalBalls)} overs</div>
            <div className="mt-4 text-primary font-bold text-xl">Target: {inn1.score + 1}</div>
          </div>
          {nextBatter && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-6 p-4 rounded-2xl border-2 border-accent/50 bg-accent/10"
            >
              <div className="text-2xl mb-1">👋</div>
              <div className="font-black text-accent text-lg">{nextBatter}'s turn!</div>
              <div className="text-sm text-muted-foreground mt-1">
                Pass the device — <span className="text-white font-bold">{nextTeam}</span> need {inn1.score + 1} to win
              </div>
            </motion.div>
          )}
          <Button onClick={() => setPhase("match")} size="lg" className="w-full">
            {nextBatter ? `${nextBatter}: Start 2nd Innings` : "Start 2nd Innings"}
          </Button>
        </motion.div>
      </div>
    );
  }

  // ─── RESULT SCREEN ───
  if (phase === "result" && inn1 && inn2) {
    const winner = getWinner();
    const bat1Name = inn1.battingTeam === 1 ? setup.team1Name : setup.team2Name;
    const bat2Name = inn2.battingTeam === 1 ? setup.team1Name : setup.team2Name;
    return (
      <div className="max-w-lg mx-auto py-8 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}>
          {winner === "tie" ? (
            <h1 className="text-4xl font-display font-black text-yellow-400 mb-2">IT'S A TIE!</h1>
          ) : (
            <>
              <div className="text-5xl mb-2">🏆</div>
              <h1 className="text-4xl font-display font-black text-primary mb-1">{winner.name}</h1>
              <p className="text-xl text-white font-bold mb-1">Wins {winner.margin}!</p>
            </>
          )}
          <div className="grid grid-cols-2 gap-4 mt-8 mb-8">
            {[{ name: bat1Name, inn: inn1, label: "1st Innings" }, { name: bat2Name, inn: inn2, label: "2nd Innings" }].map(({ name, inn, label }) => (
              <div key={label} className="p-5 rounded-2xl bg-card border border-border/40">
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider mb-2">{label}</div>
                <div className="font-bold text-white text-sm mb-1">{name}</div>
                <div className="text-3xl font-display font-black text-white">{inn.score}/{inn.wickets}</div>
                <div className="text-xs text-muted-foreground mt-1">{getOverStr(inn.legalBalls)} overs</div>
              </div>
            ))}
          </div>
          {coinsEarned > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3, type: "spring" }}
              className="flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 rounded-2xl px-6 py-3 mb-4"
            >
              <span className="text-2xl">🪙</span>
              <div>
                <div className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Coins Earned</div>
                <div className="text-2xl font-display font-black text-primary">+{coinsEarned}</div>
              </div>
            </motion.div>
          )}
          {careerResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-4 rounded-2xl border mb-4"
              style={{ background: "rgba(255,180,0,0.07)", borderColor: "rgba(255,180,0,0.25)" }}
            >
              {careerResult.seasonComplete ? (
                <>
                  <p className="font-black text-primary text-base">Season Complete!</p>
                  <p className="text-white font-bold mt-1 text-sm">
                    Final Position: #{careerResult.finalPosition}
                    {careerResult.finalPosition === 1 ? " 🏆 Champions!" : ""}
                  </p>
                </>
              ) : (
                <p className="font-black text-primary text-sm">Result saved to career ✓</p>
              )}
              {careerResult.coinsEarned !== 0 && (
                <p className="text-sm font-black mt-1" style={{ color: careerResult.coinsEarned > 0 ? "#4ade80" : "#f87171" }}>
                  {careerResult.coinsEarned > 0 ? "+" : ""}{careerResult.coinsEarned} 🪙
                </p>
              )}
            </motion.div>
          )}
          <div className="flex gap-4">
            {setup.careerId ? (
              <Button className="flex-1" onClick={() => navigate(`/career/${setup.careerId}`)}>
                Back to Career
              </Button>
            ) : (
              <>
                <Button variant="secondary" className="flex-1" onClick={() => navigate("/")}>
                  Main Menu
                </Button>
                <Button className="flex-1" onClick={() => navigate(setup.returnTo ?? "/quick-match")}>
                  {setup.returnLabel ?? "Play Again"}
                </Button>
              </>
            )}
          </div>
        </motion.div>
      </div>
    );
  }

  // ─── MATCH SCREEN ───
  if (!currentInn) return null;

  const battingSquad = squad1(currentInn);
  const bowlingSquad = squad2(currentInn);
  const striker = battingSquad[currentInn.strikerIdx];
  const bowlerEntry = currentInn.bowlerScores[currentInn.currentBowlerIdx];
  const bowler = bowlingSquad[bowlerEntry?.playerIdx ?? 0];
  const target = activeInn === 2 ? (inn1?.score ?? 0) + 1 : undefined;
  const needed = target ? target - currentInn.score : null;
  const ballsLeft = maxBalls - currentInn.legalBalls;

  const crr = currentInn.legalBalls > 0
    ? ((currentInn.score / currentInn.legalBalls) * 6).toFixed(1)
    : "0.0";
  const rrr = target && ballsLeft > 0
    ? (((needed ?? 0) / ballsLeft) * 6).toFixed(1)
    : null;

  return (
    <div className="max-w-3xl mx-auto">
      {/* ── Boundary scene overlay ── */}
      <AnimatePresence>
        {boundaryType && (
          <BoundaryScene
            type={boundaryType}
            shotDir={shotDir}
            onDone={() => { boundaryDoneRef.current?.(); }}
            drawnBatter={drawnBatter}
            bowlerLook={bowlerLook}
            keeperLook={keeperLook}
          />
        )}
      </AnimatePresence>

      {/* ── Milestone overlay ── */}
      <AnimatePresence>
        {milestone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.7, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 1.2, y: -30 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
          >
            <div className="bg-primary/90 text-black font-display font-black text-4xl px-10 py-6 rounded-3xl shadow-2xl">
              {milestone}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scorecard overlay ── */}
      <AnimatePresence>
        {showScorecard && currentInn && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4"
            onClick={() => setShowScorecard(false)}
          >
            <motion.div
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.92, y: 20 }}
              onClick={e => e.stopPropagation()}
              className="bg-card border border-border/50 rounded-2xl p-5 w-full max-w-lg max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-black text-white text-lg">Scorecard</h2>
                <button onClick={() => setShowScorecard(false)} className="text-muted-foreground hover:text-white text-sm font-bold">✕ Close</button>
              </div>
              <ScorecardView
                inn={currentInn}
                battingSquad={battingSquad}
                bowlingSquad={bowlingSquad}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Scoreboard ── */}
      <div className="flex items-center justify-between mb-2 px-1">
        <div>
          <span className="text-sm text-muted-foreground font-bold uppercase tracking-wider">
            {currentInn.battingTeam === 1 ? setup.team1Name : setup.team2Name}
          </span>
          <div className="text-3xl font-display font-black text-white leading-none">
            {currentInn.score}/{currentInn.wickets}
            <span className="text-base text-muted-foreground font-normal ml-2">
              ({getOverStr(currentInn.legalBalls)}/{setup.overs})
            </span>
          </div>
        </div>
        <div className="flex flex-col items-center gap-1">
          {target ? (
            <>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Need</div>
              <div className="text-2xl font-display font-black text-primary">{needed}</div>
              <div className="text-xs text-muted-foreground">{ballsLeft}b · RRR {rrr}</div>
            </>
          ) : (
            <>
              <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">CRR</div>
              <div className="text-xl font-display font-black text-white">{crr}</div>
            </>
          )}
        </div>
        <div className="text-right flex flex-col items-end gap-1">
          <div>
            <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Bowling</div>
            <div className="text-sm font-bold text-white">{bowler?.name ?? "?"}</div>
            <div className="text-xs text-muted-foreground">
              {Math.floor((bowlerEntry?.balls ?? 0) / 6)}-{(bowlerEntry?.balls ?? 0) % 6} · {bowlerEntry?.wickets ?? 0}W
            </div>
          </div>
          <button
            onClick={() => setShowScorecard(true)}
            className="text-[10px] font-black uppercase tracking-widest text-primary border border-primary/30 px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
          >
            Scorecard
          </button>
        </div>
      </div>

      {/* ── Over ball tracker ── */}
      <div className="flex items-center gap-2 mb-2 px-1">
        <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">
          Over {Math.floor(currentInn.legalBalls / 6) + 1}
        </span>
        <div className="flex gap-1">
          {currentInn.currentOverBalls.map((b, i) => (
            <span
              key={i}
              className={`text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full ${
                b === "W" ? "bg-red-600 text-white" :
                b === "4" ? "bg-blue-600 text-white" :
                b === "6" ? "bg-green-600 text-white" :
                b === "wd" ? "bg-yellow-600 text-black" :
                b === "·" ? "bg-white/10 text-muted-foreground" :
                "bg-white/20 text-white"
              }`}
            >
              {b}
            </span>
          ))}
          {Array.from({ length: 6 - currentInn.currentOverBalls.filter(b => b !== "wd").length }).map((_, i) => (
            <span key={"empty-" + i} className="w-5 h-5 rounded-full border border-white/10" />
          ))}
        </div>
        {currentInn.partnershipRuns > 0 && (
          <span className="ml-auto text-[10px] text-muted-foreground font-bold">
            Pship: {currentInn.partnershipRuns}({currentInn.partnershipBalls})
          </span>
        )}
      </div>

      {/* ── Stadium scene ── */}
      <div className="relative rounded-2xl overflow-hidden border border-border/40">
        <motion.div
          animate={
            fieldingAnim && fieldingAnim.runs >= 2
              ? { scale: 1, y: 0 }
              : ballStep === "timing" || ballStep === "bowling_anim" || ballStep === "result"
                ? { scale: 1.14, y: -12 }
                : { scale: 1, y: 0 }
          }
          transition={{ duration: fieldingAnim && fieldingAnim.runs >= 2 ? 0.4 : 1.8, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transformOrigin: "50% 42%" }}
        >
          <StadiumScene
            ballProgress={ballActive ? 1 : 0}
            ballActive={ballActive}
            batAngle={batAngle}
            shotDirection={shotDir}
            resultFlash={resultFlash}
            ballPing={ballPing}
            bowler={bowlerLook ? { look: bowlerLook, play: bowlerPlay, userMode: isUserBatting } : null}
            keeper={keeperLook}
            bowlingMode={!isUserBatting && bowlStep === "select_target"}
            pitchTarget={pitchTarget}
            onPitchTarget={setPitchTarget}
            fieldingAnim={fieldingAnim}
            fieldingKey={fieldingKey}
            drawnBatter={drawnBatter}
            nonStriker={nonStrikerLook}
          />
        </motion.div>

        <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur rounded-xl px-3 py-2">
          <div className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Batting</div>
          <div className="text-white font-bold text-sm">{striker?.name ?? "?"}</div>
          <div className="text-primary font-display font-black text-xl leading-none">
            {currentInn.batsmanScores[currentInn.strikerIdx]?.runs ?? 0}
            <span className="text-xs text-muted-foreground font-normal ml-1">
              ({currentInn.batsmanScores[currentInn.strikerIdx]?.balls ?? 0}b)
            </span>
          </div>
        </div>
        <div className="absolute top-3 right-3 bg-black/70 backdrop-blur rounded-xl px-3 py-1 flex items-center gap-2">
          {activeBatter && (
            <span className="text-xs text-accent font-black">{activeBatter}</span>
          )}
          <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">
            {activeInn === 1 ? "1st Innings" : "2nd Innings"}
          </span>
        </div>
      </div>

      {/* ── Controls ── */}
      <div className="mt-4">
        {isUserBatting ? (
          <BattingControls
            ballStep={ballStep}
            joystickDir={joystickDir}
            timingPos={timingPos}
            onStart={startBall}
            onJoystickSelect={handleJoystickSelect}
            onSwing={() => handleSwing()}
            onSwapStrike={handleSwapStrike}
            onChooseBatsman={handleChooseBatsman}
            inn={currentInn}
            battingSquad={battingSquad}
            playerLabel={activeBatter}
          />
        ) : (
          <BowlingControls
            bowlStep={bowlStep}
            pitchTarget={pitchTarget}
            onBowl={handleBowl}
            onChooseBowler={handleChooseBowler}
            inn={currentInn}
            bowlingSquad={bowlingSquad}
          />
        )}
      </div>
    </div>
  );
}

// ─── Joystick Pad ─────────────────────────────────────────────────────────────

function dirFromXY(dx: number, dy: number): JoystickDir {
  // angle: 0=up, clockwise in degrees
  let angle = Math.atan2(dx, -dy) * (180 / Math.PI);
  if (angle < 0) angle += 360;
  if (angle >= 337.5 || angle < 22.5) return "straight";
  if (angle >= 22.5 && angle < 112.5) return "top-right";
  if (angle >= 112.5 && angle < 202.5) return "bottom-right";
  if (angle >= 202.5 && angle < 292.5) return "bottom-left";
  return "top-left";
}

function JoystickPad({
  selected,
  onSelect,
}: {
  selected: JoystickDir | null;
  onSelect: (d: JoystickDir) => void;
}) {
  const baseRef = useRef<HTMLDivElement>(null);
  const [knobPos, setKnobPos] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);

  const RADIUS = 44; // max knob travel in px

  const knobXY = useMemo(() => {
    if (!selected) return { x: 0, y: 0 };
    const map: Record<JoystickDir, [number, number]> = {
      "straight":     [0, -1],
      "top-right":    [0.7, -0.7],
      "bottom-right": [0.7, 0.7],
      "bottom-left":  [-0.7, 0.7],
      "top-left":     [-0.7, -0.7],
    };
    const [nx, ny] = map[selected];
    return { x: nx * RADIUS, y: ny * RADIUS };
  }, [selected]);

  const handlePointerDown = (e: React.PointerEvent) => {
    dragging.current = true;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    updateFromEvent(e);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return;
    updateFromEvent(e);
  };

  const handlePointerUp = () => {
    dragging.current = false;
    setKnobPos({ x: 0, y: 0 });
  };

  const updateFromEvent = (e: React.PointerEvent) => {
    if (!baseRef.current) return;
    const rect = baseRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const clamped = Math.min(dist, RADIUS);
    const ratio = clamped / (dist || 1);
    const kx = dx * ratio;
    const ky = dy * ratio;
    setKnobPos({ x: kx, y: ky });
    if (dist > 12) {
      onSelect(dirFromXY(dx, dy));
    }
  };

  const displayX = dragging.current ? knobPos.x : knobXY.x;
  const displayY = dragging.current ? knobPos.y : knobXY.y;

  return (
    <div className="relative w-44 h-44 mx-auto select-none touch-none">
      {/* Outer base */}
      <div
        ref={baseRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        className="absolute inset-0 rounded-full bg-secondary border-2 border-border/60 shadow-inner cursor-pointer"
        style={{ boxShadow: "inset 0 4px 16px rgba(0,0,0,0.4)" }}
      >
        {/* Guide ring */}
        <div className="absolute inset-[18%] rounded-full border border-border/30" />

        {/* Knob */}
        <div
          className="absolute rounded-full"
          style={{
            width: 52,
            height: 52,
            left: "50%",
            top: "50%",
            transform: `translate(calc(-50% + ${displayX}px), calc(-50% + ${displayY}px))`,
            background: selected
              ? "radial-gradient(circle at 35% 35%, #fde68a, #f59e0b)"
              : "radial-gradient(circle at 35% 35%, #94a3b8, #475569)",
            boxShadow: selected
              ? "0 4px 16px rgba(245,158,11,0.6), 0 2px 4px rgba(0,0,0,0.5)"
              : "0 4px 10px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
            transition: dragging.current ? "none" : "transform 0.15s ease, background 0.2s",
          }}
        />
      </div>
    </div>
  );
}

// ─── Batting Controls ─────────────────────────────────────────────────────────

const ROLE_COLORS_SMALL: Record<string, string> = {
  batsman:      "text-blue-300",
  bowler:       "text-red-300",
  allrounder:   "text-green-300",
  wicketkeeper: "text-purple-300",
};

function BattingControls({
  ballStep, joystickDir, timingPos, onStart, onJoystickSelect, onSwing,
  onSwapStrike, onChooseBatsman, inn, battingSquad, playerLabel,
}: {
  ballStep: BallStep;
  joystickDir: JoystickDir | null;
  timingPos: number;
  onStart: () => void;
  onJoystickSelect: (dir: JoystickDir) => void;
  onSwing: () => void;
  onSwapStrike: () => void;
  onChooseBatsman: (idx: number) => void;
  inn: InningsState;
  battingSquad: Player[];
  playerLabel?: string | null;
}) {
  const striker    = battingSquad[inn.strikerIdx];
  const nonStriker = battingSquad[inn.nonStrikerIdx];
  const strikerScore    = inn.batsmanScores[inn.strikerIdx];
  const nonStrikerScore = inn.batsmanScores[inn.nonStrikerIdx];

  return (
    <div className="p-4 rounded-2xl bg-card border border-border/40">
      <AnimatePresence mode="wait">
        {ballStep === "idle" && (
          <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center">
            {playerLabel && (
              <p className="text-accent font-black text-base mb-1">{playerLabel}'s turn to bat</p>
            )}
            <p className="text-muted-foreground text-sm mb-3">{playerLabel ? "" : "Your turn to bat"}</p>
            <Button onClick={onStart} size="lg" className="w-full">
              {playerLabel ? `${playerLabel}: Ready to Bat →` : "Ready to Bat →"}
            </Button>
          </motion.div>
        )}

        {/* ── New batsman chooser after a wicket ── */}
        {ballStep === "choose_batsman" && (
          <motion.div key="choose_bat" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-sm font-black uppercase tracking-wider text-red-400 mb-3">
              Wicket! Choose next batsman
            </p>
            <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto">
              {inn.batsmanScores.map((s, i) => {
                const p = battingSquad[i];
                if (!p || s.out || i === inn.nonStrikerIdx) return null;
                if (s.balls > 0 && !s.out) return null; // already batted and not out = in
                const rating = Math.round((p.battingRating ?? 0) / 10);
                return (
                  <button key={i} onClick={() => onChooseBatsman(i)}
                    className="flex items-center justify-between px-3 py-2 rounded-xl border border-border/40 bg-secondary hover:border-primary/50 hover:bg-primary/10 transition-all text-left">
                    <span className="font-bold text-white text-sm">{p.name}</span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-black uppercase ${ROLE_COLORS_SMALL[p.role ?? "batsman"]}`}>
                        {p.role === "wicketkeeper" ? "WK" : (p.role ?? "BAT").slice(0,3).toUpperCase()}
                      </span>
                      <span className="text-xs font-black text-primary tabular-nums">{rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {ballStep === "direction" && (
          <motion.div key="dir" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            {/* At-crease info + swap */}
            <div className="flex items-center justify-between mb-3 px-1">
              <div className="text-center flex-1">
                <div className="text-[10px] text-primary font-black uppercase tracking-widest">On Strike ⚡</div>
                <div className="text-white font-bold text-sm truncate">{striker?.name ?? "?"}</div>
                <div className="text-xs text-muted-foreground">
                  {strikerScore?.runs ?? 0}({strikerScore?.balls ?? 0})
                  <span className={`ml-1.5 text-[10px] font-black ${ROLE_COLORS_SMALL[striker?.role ?? "batsman"]}`}>
                    {Math.round((striker?.battingRating ?? 0) / 10)}
                  </span>
                </div>
              </div>
              <button onClick={onSwapStrike}
                className="px-3 py-1.5 rounded-xl border border-border/40 bg-secondary hover:border-primary/40 text-muted-foreground hover:text-white text-xs font-black transition-all mx-2">
                ⇄ Swap
              </button>
              <div className="text-center flex-1">
                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Non-striker</div>
                <div className="text-white/70 font-bold text-sm truncate">{nonStriker?.name ?? "?"}</div>
                <div className="text-xs text-muted-foreground">
                  {nonStrikerScore?.runs ?? 0}({nonStrikerScore?.balls ?? 0})
                  <span className={`ml-1.5 text-[10px] font-black ${ROLE_COLORS_SMALL[nonStriker?.role ?? "batsman"]}`}>
                    {Math.round((nonStriker?.battingRating ?? 0) / 10)}
                  </span>
                </div>
              </div>
            </div>
            <p className="text-center text-xs text-muted-foreground mb-3 font-bold uppercase tracking-wider">
              Choose Shot Direction
            </p>
            <JoystickPad selected={joystickDir} onSelect={onJoystickSelect} />
          </motion.div>
        )}

        {ballStep === "timing" && (
          <motion.div key="timing" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <div className="relative h-10 rounded-full overflow-hidden mb-4 border border-border/50">
              <div className="absolute inset-0 flex">
                <div className="h-full bg-red-900/80"    style={{ width: "12%" }} />
                <div className="h-full bg-orange-800/65" style={{ width: "16%" }} />
                <div className="h-full bg-yellow-700/55" style={{ width: "15%" }} />
                <div className="h-full bg-green-600/90"  style={{ width: "14%" }} />
                <div className="h-full bg-yellow-700/55" style={{ width: "15%" }} />
                <div className="h-full bg-orange-800/65" style={{ width: "16%" }} />
                <div className="h-full bg-red-900/80"    style={{ width: "12%" }} />
              </div>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <span className="text-xs text-green-300 font-bold opacity-60">PERFECT</span>
              </div>
              <div
                className="absolute top-1 bottom-1 w-3 rounded-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)] pointer-events-none"
                style={{ left: `${timingPos}%`, transform: "translateX(-50%)", transition: "left 16ms linear" }}
              />
            </div>
            <button
              onClick={onSwing}
              className="w-full py-5 rounded-xl font-display font-black text-2xl bg-primary text-background hover:bg-primary/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,180,0,0.4)]"
            >
              🏏 SWING!
            </button>
          </motion.div>
        )}

        {(ballStep === "bowling_anim" || ballStep === "result") && (
          <motion.div key="res" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
            <div className="text-muted-foreground text-sm font-bold animate-pulse">
              {ballStep === "bowling_anim" ? "Ball in flight..." : "..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Bowling Controls ─────────────────────────────────────────────────────────

const LENGTH_LABELS: Record<PitchLen, string> = { short: "Short", good: "Good Length", full: "Full" };
const LINE_LABELS: Record<PitchLine, string> = { leg: "Leg", middle: "Middle", off: "Off" };

function BowlingControls({
  bowlStep, pitchTarget, onBowl, onChooseBowler, inn, bowlingSquad,
}: {
  bowlStep: BowlStep;
  pitchTarget: { x: number; y: number } | null;
  onBowl: () => void;
  onChooseBowler: (idx: number) => void;
  inn: InningsState;
  bowlingSquad: Player[];
}) {
  const currentBowler = bowlingSquad[inn.bowlerScores[inn.currentBowlerIdx]?.playerIdx ?? 0];
  const derived = pitchTarget ? targetToLenLine(pitchTarget) : null;

  return (
    <div className="p-4 rounded-2xl bg-card border border-border/40">
      <AnimatePresence mode="wait">
        {/* ── Bowler chooser at end of each over ── */}
        {bowlStep === "choose_bowler" && (
          <motion.div key="choose_bowl" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
            <p className="text-center text-sm font-black uppercase tracking-wider text-primary mb-3">
              Over complete — choose next bowler
            </p>
            <div className="flex flex-col gap-1.5 max-h-52 overflow-y-auto">
              {inn.bowlerScores.map((bs, i) => {
                const p = bowlingSquad[bs.playerIdx];
                if (!p) return null;
                const overLimit = 4;
                const exhausted = bs.overs >= overLimit;
                const justBowled = i === inn.currentBowlerIdx;
                const overs = `${bs.overs}.${bs.balls % 6}`;
                const rating = Math.round((p.bowlingRating ?? 0) / 10);
                return (
                  <button key={i}
                    disabled={exhausted || justBowled}
                    onClick={() => onChooseBowler(i)}
                    className={`flex items-center justify-between px-3 py-2 rounded-xl border transition-all text-left ${
                      exhausted || justBowled
                        ? "border-border/20 bg-card opacity-30 cursor-not-allowed"
                        : "border-border/40 bg-secondary hover:border-primary/50 hover:bg-primary/10"
                    }`}>
                    <div>
                      <span className="font-bold text-white text-sm">{p.name}</span>
                      {justBowled && <span className="ml-2 text-[10px] text-muted-foreground">(just bowled)</span>}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs text-muted-foreground tabular-nums">{overs}ov · {bs.wickets}W · {bs.runs}R</span>
                      <span className={`text-[10px] font-black ${ROLE_COLORS_SMALL[p.role ?? "bowler"]}`}>{rating}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}

        {bowlStep === "select_target" && (
          <motion.div key="target" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            {/* Bowler info */}
            <div className="flex items-center justify-between mb-2 px-1">
              <div>
                <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">Bowling: </span>
                <span className="text-white font-bold text-sm">{currentBowler?.name ?? "?"}</span>
              </div>
              <span className={`text-xs font-black ${ROLE_COLORS_SMALL[currentBowler?.role ?? "bowler"]}`}>
                {Math.round((currentBowler?.bowlingRating ?? 0) / 10)} rating
              </span>
            </div>

            {/* Target indicator */}
            <div className="text-center text-xs text-muted-foreground mb-3 h-4">
              {derived ? (
                <span>
                  Target: <span className="text-white font-bold">{LENGTH_LABELS[derived.len]}</span>
                  <span className="mx-1">·</span>
                  <span className="text-white font-bold">{LINE_LABELS[derived.line]} stump</span>
                  {derived.len === "good" && derived.line === "off" && <span className="text-primary ml-1">⭐</span>}
                </span>
              ) : (
                <span className="animate-pulse">Click on the pitch above to aim</span>
              )}
            </div>

            <button
              disabled={!pitchTarget}
              onClick={onBowl}
              className="w-full py-5 rounded-xl font-display font-black text-2xl bg-accent text-background hover:bg-accent/90 active:scale-95 transition-all shadow-[0_0_20px_rgba(255,120,0,0.4)] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              🎯 BOWL!
            </button>
          </motion.div>
        )}

        {(bowlStep === "bowling_anim" || bowlStep === "result") && (
          <motion.div key="bowling" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-4">
            <div className="text-muted-foreground text-sm font-bold animate-pulse">
              {bowlStep === "bowling_anim" ? "Bowling..." : "..."}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Scorecard View ────────────────────────────────────────────────────────────

function ScorecardView({
  inn,
  battingSquad,
  bowlingSquad,
}: {
  inn: InningsState;
  battingSquad: Player[];
  bowlingSquad: Player[];
}) {
  const [tab, setTab] = useState<"bat" | "bowl">("bat");

  return (
    <div>
      <div className="flex gap-2 mb-4">
        {(["bat", "bowl"] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border transition-all ${
              tab === t
                ? "bg-primary text-black border-primary"
                : "bg-card text-muted-foreground border-border/40 hover:text-white"
            }`}
          >
            {t === "bat" ? "Batting" : "Bowling"}
          </button>
        ))}
      </div>

      {tab === "bat" && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/30">
              <th className="text-left pb-2 font-black">Batsman</th>
              <th className="text-right pb-2 font-black">R</th>
              <th className="text-right pb-2 font-black">B</th>
              <th className="text-right pb-2 font-black">4s</th>
              <th className="text-right pb-2 font-black">6s</th>
              <th className="text-right pb-2 font-black">SR</th>
            </tr>
          </thead>
          <tbody>
            {inn.batsmanScores.map((s, i) => {
              const player = battingSquad[s.playerIdx];
              if (!player) return null;
              const isStriker = i === inn.strikerIdx;
              const isNon = i === inn.nonStrikerIdx;
              const sr = s.balls > 0 ? ((s.runs / s.balls) * 100).toFixed(0) : "-";
              return (
                <tr key={i} className={`border-b border-border/20 ${s.out ? "opacity-50" : ""}`}>
                  <td className="py-1.5 text-white font-bold pr-2">
                    {player.name}
                    {isStriker && <span className="ml-1 text-primary text-[9px]">*</span>}
                    {isNon && <span className="ml-1 text-primary/60 text-[9px]">†</span>}
                    {s.out && <span className="ml-1 text-red-400 text-[9px] block font-normal">{s.outDesc}</span>}
                    {!s.out && !isStriker && !isNon && s.balls === 0 && (
                      <span className="ml-1 text-muted-foreground text-[9px]">dnb</span>
                    )}
                  </td>
                  <td className="py-1.5 text-right font-black text-white">{s.out || s.balls > 0 ? s.runs : "-"}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{s.balls > 0 ? s.balls : "-"}</td>
                  <td className="py-1.5 text-right text-blue-400">{s.fours || "-"}</td>
                  <td className="py-1.5 text-right text-green-400">{s.sixes || "-"}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{sr}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-border/40">
              <td colSpan={6} className="pt-2 text-muted-foreground">
                Extras: {inn.extras} · Total: {inn.score}/{inn.wickets} ({getOverStr(inn.legalBalls)} ov)
              </td>
            </tr>
          </tfoot>
        </table>
      )}

      {tab === "bowl" && (
        <table className="w-full text-xs">
          <thead>
            <tr className="text-muted-foreground text-[10px] uppercase tracking-wider border-b border-border/30">
              <th className="text-left pb-2 font-black">Bowler</th>
              <th className="text-right pb-2 font-black">O</th>
              <th className="text-right pb-2 font-black">R</th>
              <th className="text-right pb-2 font-black">W</th>
              <th className="text-right pb-2 font-black">Econ</th>
            </tr>
          </thead>
          <tbody>
            {inn.bowlerScores.filter(s => s.balls > 0).map((s, i) => {
              const player = bowlingSquad[s.playerIdx];
              if (!player) return null;
              const overs = `${Math.floor(s.balls / 6)}.${s.balls % 6}`;
              const econ = s.balls > 0 ? ((s.runs / s.balls) * 6).toFixed(1) : "-";
              return (
                <tr key={i} className="border-b border-border/20">
                  <td className="py-1.5 text-white font-bold">{player.name}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{overs}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{s.runs}</td>
                  <td className="py-1.5 text-right font-black text-primary">{s.wickets}</td>
                  <td className="py-1.5 text-right text-muted-foreground">{econ}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}

// ─── Boundary Scene ────────────────────────────────────────────────────────────

type ShotDirType = "leg" | "straight" | "off" | null;

// Full-screen cutscene on the same stadium as the match view. It starts on the same
// shot, then the camera follows the ball to the rope: over it on a six, into the crowd.
function BoundaryScene({
  type,
  shotDir,
  onDone,
  drawnBatter,
  bowlerLook,
  keeperLook,
}: {
  type: "four" | "six";
  shotDir: ShotDirType;
  onDone: () => void;
  drawnBatter: DrawnBatter | null;
  bowlerLook: BowlerLook | null;
  keeperLook: FielderLook | null;
}) {
  const isSix = type === "six";

  useEffect(() => {
    const t = setTimeout(onDone, 3100);
    return () => clearTimeout(t);
  }, [onDone]);

  // Where it goes (a random angle within the chosen side) and who chases it — fixed per cutscene
  const plan = useMemo(() => {
    const deg = randomShotAngle(shotDir ?? "straight");
    const { dx, dy, t } = distanceToRope(BAT_X, BAT_Y, deg, FIELD_CX, FIELD_CY, ROPE_RX, ROPE_RY);
    const at = (k: number) => ({ x: BAT_X + dx * t * k, y: BAT_Y + dy * t * k });
    const end = at(isSix ? 1.32 : 1.05);          // six lands in the crowd, four just over the rope
    const rope = at(0.97);
    const chaser = FIELDERS.filter(f => f.deep)
      .reduce((a, b) => Math.abs(b.deg - deg) < Math.abs(a.deg - deg) ? b : a);
    // Four: sprints and dives just short. Six: backs up to the rope and leaps as it goes over.
    const stop = isSix ? rope : { x: lerp(rope.x, chaser.x, 0.15), y: lerp(rope.y, chaser.y, 0.15) };
    // Camera ends on the ball for a four; between the rope and the crowd for a six
    const focusEnd = isSix ? { x: lerp(rope.x, end.x, 0.45), y: lerp(rope.y, end.y, 0.45) } : end;
    return { end, chaser, stop, focusEnd };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const camRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const shadowRef = useRef<SVGEllipseElement>(null);

  // One clock for ball + camera so the camera stays locked on the ball
  useEffect(() => {
    const cam = camRef.current;
    if (!cam) return;
    const DUR = isSix ? 1.65 : 1.5;
    const sEnd = isSix ? 1.3 : 1.8;
    const apply = (time: number) => {
      const e = easeOutCubic(clamp01(time / DUR));
      const gx = lerp(BAT_X, plan.end.x, e), gy = lerp(BAT_Y, plan.end.y, e);
      const arc = isSix ? Math.sin(Math.PI * e) : 0;           // height of a lofted six
      const ball = ballRef.current, shadow = shadowRef.current;
      if (ball) {
        ball.setAttribute("cx", gx.toFixed(1));
        ball.setAttribute("cy", (gy - arc * 90).toFixed(1));
        ball.setAttribute("r", (5 + arc * 4).toFixed(2));
      }
      if (shadow) { shadow.setAttribute("cx", gx.toFixed(1)); shadow.setAttribute("cy", gy.toFixed(1)); }

      // Lock onto the ball almost at once, then ride with it
      const lock = easeOutCubic(clamp01(time / 0.3));
      const tx = lerp(BAT_X, plan.focusEnd.x, e), ty = lerp(BAT_Y, plan.focusEnd.y, e) - arc * 45;
      const cx = lerp(HOME_CAM.x, tx, lock), cy = lerp(HOME_CAM.y, ty, lock);
      // Pull back mid-flight to show the field rushing past, then settle on the rope
      const s = lerp(HOME_CAM.s, sEnd, e) - 0.4 * Math.sin(Math.PI * e);
      cam.setAttribute("transform", camTransform(cx, cy, s));
    };
    apply(0);
    const ctrl = animateValue(0, DUR, { duration: DUR, ease: "linear", onUpdate: apply });
    return () => ctrl.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { chaser, stop } = plan;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-[80] overflow-hidden cursor-pointer select-none bg-black"
      onClick={onDone}
    >
      <svg viewBox={`0 0 ${VIEW_W} ${VIEW_H}`} className="w-full h-full" preserveAspectRatio="xMidYMid slice">
        <g ref={camRef} transform={camTransform(HOME_CAM.x, HOME_CAM.y, HOME_CAM.s)}>
          <FieldWorld idp="bsc" hideFielder={chaser.id} />
          {keeperLook && (
            <DrawnKeeper look={keeperLook} standingUp={bowlerLook?.kind === "spin"} ends={ENDS} bowlerKind={bowlerLook?.kind ?? "pace"}
              spot={keeperSpot(bowlerLook?.kind === "spin", drawnBatter?.leftHanded ?? false, ENDS)} play={null} userMode={false} />
          )}
          <BattingStumps />
          <BatterFigure drawn={drawnBatter} />
          {bowlerLook && <DrawnBowler look={bowlerLook} play={null} ends={ENDS} userMode={false} still={1.0} />}

          {/* The chasing fielder */}
          <motion.ellipse
            fill="white"
            initial={{ cx: chaser.x, cy: chaser.y, rx: 6.5, ry: 6.5 }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            animate={(isSix
              ? { cx: [chaser.x, stop.x, stop.x, stop.x], cy: [chaser.y, stop.y, stop.y - 9, stop.y], rx: 6.5, ry: 6.5 }
              : { cx: [chaser.x, stop.x, stop.x], cy: [chaser.y, stop.y, stop.y + 2], rx: [6.5, 6.5, 10.5], ry: [6.5, 6.5, 3.8] }) as any}
            transition={isSix
              ? { delay: 0.1, duration: 1.6, times: [0, 0.62, 0.8, 1], ease: "easeOut" }
              : { delay: 0.1, duration: 1.45, times: [0, 0.85, 1], ease: "easeOut" }}
          />

          {/* Ball (and its shadow on the ground for a lofted six) — positioned by the effect */}
          {isSix && <ellipse ref={shadowRef} cx={BAT_X} cy={BAT_Y} rx={5} ry={2} fill="rgba(0,0,0,0.45)" />}
          <circle
            ref={ballRef}
            cx={BAT_X} cy={BAT_Y} r={5}
            fill="#cc2200" stroke="#ff5555" strokeWidth={1.4}
            style={{ filter: "drop-shadow(0 0 6px rgba(255,80,80,0.9))" }}
          />
        </g>
      </svg>

      {/* Screen-space glow (stays fixed, not zoomed) */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, isSix ? 0.45 : 0.28, 0] }}
        transition={{ duration: 3.1, times: [0, 0.46, 0.62, 1] }}
        style={{
          background: isSix
            ? "radial-gradient(ellipse at 50% 50%,rgba(251,191,36,0.2) 0%,transparent 68%)"
            : "radial-gradient(ellipse at 50% 50%,rgba(74,222,128,0.15) 0%,transparent 68%)",
        }}
      />

      {/* FOUR! / SIX! */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <motion.div
          initial={{ scale: 0.1, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 1.55, type: "spring", bounce: 0.55, damping: 11 }}
          className="font-display font-black select-none text-center leading-none"
          style={{
            fontSize: isSix ? "clamp(5rem,18vw,9rem)" : "clamp(4rem,15vw,7.5rem)",
            color: isSix ? "#fbbf24" : "#4ade80",
            textShadow: isSix
              ? "0 0 60px rgba(251,191,36,0.95),0 0 130px rgba(251,191,36,0.45)"
              : "0 0 60px rgba(74,222,128,0.95),0 0 130px rgba(74,222,128,0.45)",
          }}
        >
          {isSix ? "SIX!" : "FOUR!"}
        </motion.div>
      </div>

      {/* Skip hint */}
      <div className="absolute bottom-3 inset-x-0 text-center pointer-events-none">
        <span className="text-white/22 text-[10px] font-bold uppercase tracking-[0.3em]">
          Tap to skip
        </span>
      </div>
    </motion.div>
  );
}
