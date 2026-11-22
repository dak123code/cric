import { motion, animate as animateValue } from "framer-motion";
import { useState, useRef, useCallback, useEffect, useMemo } from "react";
import { RiggedBatter, contactOffset, type BatterPlay, type BatterKit, type BatterStyle } from "@/components/drawn-batter";
import { BatsmenAtWork, lastRunMadeAt, runningDoneAt, type BatterLook, type PitchEnds } from "@/components/batters-running";
import { DrawnBowler, DrawnKeeper, keeperSpot, releasePoint, bowlerSide, type BowlerLook, type BowlerPlay, type FielderLook } from "@/components/drawn-fielders";

/** The striker, drawn and animated in his country's style and kit. */
export interface DrawnBatter { id: string; play: BatterPlay | null; ready: boolean; kit: BatterKit; style: BatterStyle; leftHanded: boolean }

export type ShotDir = "leg" | "straight" | "off";

interface StadiumSceneProps {
  ballProgress: number;       // kept for compat
  ballActive: boolean;
  batAngle: number;           // kept for compat
  shotDirection: ShotDir | null;
  resultFlash?: string | null;
  ballPing?: boolean;         // ball bounced off bat
  // The bowler (and his delivery) and the wicketkeeper
  bowler?: { look: BowlerLook; play: BowlerPlay | null; userMode: boolean } | null;
  keeper?: FielderLook | null;
  // Bowling aim mode
  bowlingMode?: boolean;
  pitchTarget?: { x: number; y: number } | null;   // 0-1 normalised within pitch
  onPitchTarget?: (t: { x: number; y: number }) => void;
  // Fielding animation after a hit
  fieldingAnim?: { runs: number; shotDir: ShotDir } | null;
  fieldingKey?: number;
  // The striker, and the batter at the other end
  drawnBatter?: DrawnBatter | null;
  nonStriker?: BatterLook | null;
}

// ── World ───────────────────────────────────────────────────────────────────
// The viewBox is the screen. Everything else lives in "world" units inside a camera
// group that pans and zooms: tight on the pitch by default, following the ball after a hit.
// Screen-right is the off side; +y runs from the batter towards the bowler.

export const VIEW_W = 640, VIEW_H = 700;

export const FIELD_CX = 320, FIELD_CY = 385;          // middle of the pitch
export const ROPE_RX = 700, ROPE_RY = 400;            // boundary rope
const RING_RX = 380, RING_RY = 250;            // 30-yard circle
const OUTER_RX = 760, OUTER_RY = 445;          // grass beyond the rope, edged by boards

// Pitch: wide and short
const PITCH_TOP = 248, PITCH_BOTTOM = 522;
const PITCH_HALF_TOP = 66, PITCH_HALF_BOTTOM = 78;
const CREASE_BAT = 300, CREASE_BOWL = 470;     // popping creases (aim area runs between them)
const STUMPS_BAT = 286, STUMPS_BOWL = 484;     // stumps stand on the bowling creases

const pitchHalfAt = (y: number) =>
  PITCH_HALF_TOP + (PITCH_HALF_BOTTOM - PITCH_HALF_TOP) * (y - PITCH_TOP) / (PITCH_BOTTOM - PITCH_TOP);

const BATSMAN_X = 320, BATSMAN_Y = CREASE_BAT;  // feet at the crease
// Both ends of the pitch, for the batters (things get a little bigger towards the bowler's end)
export const ENDS: PitchEnds = {
  x: BATSMAN_X, strikerY: CREASE_BAT, bowlerY: CREASE_BOWL,
  perspective: (y: number) => pitchHalfAt(y) / pitchHalfAt(CREASE_BAT),
};
const BOWLER_X = 320, BOWLER_Y = 548;           // feet, at the end of the run-up
export const BAT_X = 320, BAT_Y = BATSMAN_Y - 15;      // where bat meets ball

// Default camera: just bowler, keeper and batter in frame
export const HOME_CAM = { x: 320, y: 380, s: 1.65 };
export const camTransform = (x: number, y: number, s: number) =>
  `translate(${VIEW_W / 2},${VIEW_H / 2}) scale(${s}) translate(${-x},${-y})`;
const HOME_T = camTransform(HOME_CAM.x, HOME_CAM.y, HOME_CAM.s);

// ── Shot angles ─────────────────────────────────────────────────────────────
// Degrees from straight down the ground (towards the bowler); + is the off side.
// Each shot direction can go anywhere in its arc: off covers point, cover and third man.
export const SHOT_SECTOR: Record<ShotDir, [number, number]> = {
  off:      [35, 140],
  leg:      [-140, -35],
  straight: [-13, 13],
};
export const randomShotAngle = (dir: ShotDir) => {
  const [lo, hi] = SHOT_SECTOR[dir];
  return lo + Math.random() * (hi - lo);
};

/** Distance from (ox, oy) along `deg` to the rope ellipse (cx, cy, rx, ry). */
export function distanceToRope(
  ox: number, oy: number, deg: number,
  cx: number, cy: number, rx: number, ry: number,
) {
  const r = (deg * Math.PI) / 180;
  const dx = Math.sin(r), dy = Math.cos(r);
  const px = (ox - cx) / rx, py = (oy - cy) / ry, qx = dx / rx, qy = dy / ry;
  const a = qx * qx + qy * qy, b = 2 * (px * qx + py * qy), c = px * px + py * py - 1;
  return { dx, dy, t: (-b + Math.sqrt(b * b - 4 * a * c)) / (2 * a) };
}

/** A spot on the ground: `deg` from the bat, `f` of the way out to the rope. */
function fieldPoint(deg: number, f: number) {
  const { dx, dy, t } = distanceToRope(BAT_X, BAT_Y, deg, FIELD_CX, FIELD_CY, ROPE_RX, ROPE_RY);
  return { x: BAT_X + dx * t * f, y: BAT_Y + dy * t * f };
}

// ── Field: keeper + 9 fielders as circles, the bowler is the sprite = 11 ─────
// A standard T20 field with five on the boundary (the most allowed after the powerplay).
export interface Fielder { id: string; label: string; deg: number; deep: boolean; x: number; y: number }

export const FIELDERS: Fielder[] = ([
  // Inside the circle
  { id: "point",      label: "Point",           deg: 95,   f: 0.38, deep: false },
  { id: "cover",      label: "Cover",           deg: 58,   f: 0.45, deep: false },
  { id: "midOff",     label: "Mid-off",         deg: 12,   f: 0.64, deep: false },
  { id: "midWkt",     label: "Mid-wicket",      deg: -62,  f: 0.45, deep: false },
  // Boundary riders
  { id: "thirdMan",   label: "Third man",       deg: 145,  f: 0.9,  deep: true },
  { id: "fineLeg",    label: "Fine leg",        deg: -148, f: 0.9,  deep: true },
  { id: "deepCover",  label: "Deep cover",      deg: 68,   f: 0.9,  deep: true },
  { id: "deepMidWkt", label: "Deep mid-wicket", deg: -72,  f: 0.9,  deep: true },
  { id: "longOn",     label: "Long-on",         deg: -14,  f: 0.92, deep: true },
]).map(({ f, ...rest }) => ({ ...rest, ...fieldPoint(rest.deg, f) }));

// ── Fielding play: where the ball goes, who fetches it, and the timeline ─────
const REACH_BY_RUNS   = [0.14, 0.3, 0.62, 0.8];     // how far out the ball stops (of the way to the rope)
const REACH_STRAIGHT  = [0, 0.55, 0.75, 0.86];      // straight hits have to get past the bowler first
const PICK_TIME       = [0.6, 0.8, 1.05, 1.2];      // seconds from the bat to the fielder gathering it
const ROLL_AT_PICK    = 0.7;                         // the ball is gathered while still rolling (70% of its natural roll)
const REACT           = 0.1;                         // fielder's reaction before he sets off
const FOLLOW_SCALE    = [1.55, 1.35, 1.05, 0.95];   // camera pulls back for longer hits

interface Plan {
  runs: number;
  dest: { x: number; y: number };
  chaser: Fielder | null;    // null: the bowler fields it himself
  followScale: number;
  roll: number;              // how much of its natural roll the ball has done when picked up
  tPick: number; tThrow0: number; tThrow1: number; tEnd: number;
}

/**
 * When the fielder gathers, throws and the ball comes back. With runs on, the throw comes in just as
 * the batters make their ground on the last one (a long chase in the deep for two or three).
 */
function fieldTimes(r: number) {
  const throwFor = r >= 2 ? 0.6 : 0.4;
  const tPick = r > 0 ? Math.max(PICK_TIME[r], lastRunMadeAt(r) + 0.05 - 0.12 - throwFor) : PICK_TIME[r];
  const tThrow0 = tPick + 0.12;
  const tThrow1 = tThrow0 + throwFor;
  return { tPick, tThrow0, tThrow1, tEnd: tThrow1 + 0.55 };
}
/** How long a fielded hit takes to play out (ms): the fielding and the batters' running. */
export function fieldedPlayMs(runs: number) {
  const r = Math.max(0, Math.min(3, runs));
  return Math.max(2700, Math.round(Math.max(fieldTimes(r).tEnd, runningDoneAt(r)) * 1000) + 250);
}

function makePlan(runs: number, dir: ShotDir): Plan {
  const r = Math.max(0, Math.min(3, runs));
  const deg = randomShotAngle(dir);
  const straight = dir === "straight";
  // A straight dot ball just rolls back to the bowler's feet
  const dest = straight && r === 0
    ? { x: BOWLER_X + 6, y: BOWLER_Y - 38 }
    : fieldPoint(deg, (straight ? REACH_STRAIGHT : REACH_BY_RUNS)[r]);
  // Short balls are fielded by the nearest infielder, longer ones by a boundary rider.
  const pool = FIELDERS.filter(f => f.deep === r >= 2);
  const chaser = straight && r === 0
    ? null
    : pool.reduce((a, b) => Math.abs(b.deg - deg) < Math.abs(a.deg - deg) ? b : a);
  const { tPick, tThrow0, tThrow1, tEnd } = fieldTimes(r);
  // The bowler lets a straight dot roll to his feet; a fielder attacks it while it's moving
  const roll = chaser ? ROLL_AT_PICK : 1;
  return { runs: r, dest, chaser, followScale: FOLLOW_SCALE[r], roll, tPick, tThrow0, tThrow1, tEnd };
}

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
export const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

// ── Bowling aim: normalise clicks on the pitch (x: 0 leg → 1 off, y: 0 full → 1 short) ──
function worldToPitchNorm(sx: number, sy: number) {
  const ny = (sy - CREASE_BAT) / (CREASE_BOWL - CREASE_BAT);
  const h = pitchHalfAt(sy);
  const nx = (sx - (320 - h)) / (2 * h);
  return { x: clamp01(nx), y: clamp01(ny) };
}

function pitchNormToWorld(nx: number, ny: number) {
  const sy = CREASE_BAT + ny * (CREASE_BOWL - CREASE_BAT);
  const h = pitchHalfAt(sy);
  return { x: 320 - h + nx * 2 * h, y: sy };
}

function isOnPitch(sx: number, sy: number) {
  if (sy < CREASE_BAT || sy > CREASE_BOWL) return false;
  return Math.abs(sx - 320) <= pitchHalfAt(sy) + 4;
}

const ellipseRing = (rx: number, ry: number) =>
  `M ${FIELD_CX - rx},${FIELD_CY} a ${rx},${ry} 0 1,0 ${2 * rx},0 a ${rx},${ry} 0 1,0 ${-2 * rx},0 Z`;

const CROWD = ["#c0392b", "#2980b9", "#f1c40f", "#27ae60", "#8e44ad"];

/**
 * The ground: stands, outfield, rope, pitch, stumps, the keeper and the nine fielders.
 * Shared by the match view and the boundary cutscene so they're the same stadium.
 * `idp` keeps SVG ids unique when both are on screen; `hideFielder` skips the one
 * that's being animated separately.
 */
export function FieldWorld({ idp, hideFielder }: { idp: string; hideFielder?: string | null }) {
  return (
    <g>
      <defs>
        <linearGradient id={`${idp}-pitch`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#c2a35c" />
          <stop offset="100%" stopColor="#cfb171" />
        </linearGradient>
        <clipPath id={`${idp}-field-clip`}>
          <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={ROPE_RX} ry={ROPE_RY} />
        </clipPath>
        <pattern id={`${idp}-crowd`} width="60" height="22" patternUnits="userSpaceOnUse">
          <rect width="60" height="22" fill="#1a1a2e" />
          {CROWD.map((c, i) => <circle key={`a${i}`} cx={6 + i * 12} cy={6} r={4.2} fill={c} opacity={0.75} />)}
          {CROWD.map((c, i) => <circle key={`b${i}`} cx={i * 12} cy={17} r={4.2} fill={CROWD[(i + 2) % 5]} opacity={0.75} />)}
          <circle cx={60} cy={17} r={4.2} fill={CROWD[2]} opacity={0.75} />
        </pattern>
      </defs>

      {/* Stands all round */}
      <rect x={-1600} y={-1400} width={3840} height={3600} fill="#1a1a2e" />
      <path d={`${ellipseRing(1500, 1100)} ${ellipseRing(OUTER_RX + 6, OUTER_RY + 6)}`} fillRule="evenodd" fill={`url(#${idp}-crowd)`} />

      {/* Grass beyond the rope + advertising boards */}
      <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={OUTER_RX} ry={OUTER_RY} fill="#174d17" />
      <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={OUTER_RX - 6} ry={OUTER_RY - 5} fill="none" stroke="#c0392b" strokeWidth={9} strokeDasharray="44 44" />
      <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={OUTER_RX - 6} ry={OUTER_RY - 5} fill="none" stroke="#2471a3" strokeWidth={9} strokeDasharray="44 44" strokeDashoffset={44} />

      {/* Sight screens behind each end */}
      <rect x={262} y={FIELD_CY - ROPE_RY - 36} width={116} height={20} rx={2} fill="#eef0f2" />
      <rect x={262} y={FIELD_CY + ROPE_RY + 16} width={116} height={20} rx={2} fill="#eef0f2" />

      {/* Playing area: mowing stripes inside the rope */}
      <g clipPath={`url(#${idp}-field-clip)`}>
        {Array.from({ length: 26 }).map((_, i) => (
          <rect key={i} x={FIELD_CX - ROPE_RX + i * 56} y={FIELD_CY - ROPE_RY} width={56} height={ROPE_RY * 2}
            fill={i % 2 ? "#1f6420" : "#1b5a1c"} />
        ))}
      </g>
      {/* Boundary rope */}
      <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={ROPE_RX} ry={ROPE_RY} fill="none" stroke="white" strokeWidth={3} opacity={0.85} />
      {/* 30-yard circle */}
      <ellipse cx={FIELD_CX} cy={FIELD_CY} rx={RING_RX} ry={RING_RY} fill="none" stroke="white" strokeWidth={2} strokeDasharray="10 9" opacity={0.35} />

      {/* Pitch — wide and short */}
      <polygon
        points={`${320 - PITCH_HALF_TOP},${PITCH_TOP} ${320 + PITCH_HALF_TOP},${PITCH_TOP} ${320 + PITCH_HALF_BOTTOM},${PITCH_BOTTOM} ${320 - PITCH_HALF_BOTTOM},${PITCH_BOTTOM}`}
        fill={`url(#${idp}-pitch)`}
      />

      {/* Creases: popping, bowling (stump line) and return creases at each end */}
      {[
        { pop: CREASE_BAT, stump: STUMPS_BAT, back: STUMPS_BAT - 12 },
        { pop: CREASE_BOWL, stump: STUMPS_BOWL, back: STUMPS_BOWL + 12 },
      ].map(({ pop, stump, back }, i) => (
        <g key={i} stroke="white" strokeWidth={1.6} opacity={0.9}>
          <line x1={320 - pitchHalfAt(pop) + 8} y1={pop} x2={320 + pitchHalfAt(pop) - 8} y2={pop} />
          <line x1={290} y1={stump} x2={350} y2={stump} />
          <line x1={284} y1={pop} x2={284} y2={back} />
          <line x1={356} y1={pop} x2={356} y2={back} />
        </g>
      ))}

      {/* Stumps — bowler's end (the batter's end are drawn over the keeper: see BattingStumps) */}
      {[314, 320, 326].map(x => <line key={x} x1={x} y1={STUMPS_BOWL - 22} x2={x} y2={STUMPS_BOWL} stroke="#ff6090" strokeWidth={3} />)}
      <line x1={312} y1={STUMPS_BOWL - 22} x2={328} y2={STUMPS_BOWL - 22} stroke="#ff6090" strokeWidth={2} />

      {/* Fielders (off-screen until the camera follows the ball out to them) */}
      {FIELDERS.map(f => f.id === hideFielder ? null : (
        <g key={f.id}>
          <ellipse cx={f.x} cy={f.y + 6} rx={7} ry={2.6} fill="rgba(0,0,0,0.35)" />
          <circle cx={f.x} cy={f.y} r={6.5} fill="white" opacity={0.95} />
        </g>
      ))}
    </g>
  );
}

/** The stumps at the batter's end: in front of the keeper, behind the batter. */
export function BattingStumps() {
  return (
    <g>
      {[313, 320, 327].map(x => <line key={x} x1={x} y1={STUMPS_BAT - 24} x2={x} y2={STUMPS_BAT} stroke="#ff6090" strokeWidth={3} />)}
      <line x1={311} y1={STUMPS_BAT - 24} x2={329} y2={STUMPS_BAT - 24} stroke="#ff6090" strokeWidth={2} />
    </g>
  );
}

/** The striker at the crease (no one before the match starts). */
export function BatterFigure({ drawn }: { drawn: DrawnBatter | null }) {
  if (!drawn) return null;
  return (
    <g transform={`translate(${BATSMAN_X}, ${BATSMAN_Y})`}>
      <RiggedBatter key={drawn.id} play={drawn.play} ready={drawn.ready} kit={drawn.kit} leftHanded={drawn.leftHanded} style={drawn.style} />
    </g>
  );
}

export function StadiumScene({
  ballActive,
  shotDirection,
  resultFlash,
  ballPing = false,
  bowler = null,
  keeper = null,
  bowlingMode = false,
  pitchTarget = null,
  onPitchTarget,
  fieldingAnim,
  fieldingKey,
  drawnBatter = null,
  nonStriker = null,
}: StadiumSceneProps) {
  const cameraGroupRef = useRef<SVGGElement>(null);
  const ballRef = useRef<SVGCircleElement>(null);
  const chaserRef = useRef<SVGCircleElement>(null);
  const throwRef = useRef<SVGCircleElement>(null);
  const [hover, setHover] = useState<{ x: number; y: number } | null>(null);

  // Clicks → world coords (through the camera transform)
  const toWorld = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    const g = cameraGroupRef.current;
    const svg = g?.ownerSVGElement;
    const m = g?.getScreenCTM();
    if (!g || !svg || !m) return null;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const p = pt.matrixTransform(m.inverse());
    return { x: p.x, y: p.y };
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!bowlingMode) return;
    const p = toWorld(e);
    setHover(p && isOnPitch(p.x, p.y) ? p : null);
  }, [bowlingMode, toWorld]);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!bowlingMode || !onPitchTarget) return;
    const p = toWorld(e);
    if (p && isOnPitch(p.x, p.y)) onPitchTarget(worldToPitchNorm(p.x, p.y));
  }, [bowlingMode, onPitchTarget, toWorld]);

  const locked = pitchTarget ? pitchNormToWorld(pitchTarget.x, pitchTarget.y) : null;

  // The delivery ends on the bat: a drawn batter's is wherever his shot meets it
  const playShot = drawnBatter?.play?.shot;
  const lefty = drawnBatter?.leftHanded ?? false;
  const drawnStyle = drawnBatter?.style ?? "smith";
  const deliveryEnd = useMemo(() => {
    if (!playShot) return { cx: BATSMAN_X, cy: BAT_Y };
    const o = contactOffset(playShot, lefty, drawnStyle);
    return { cx: BATSMAN_X + o.x, cy: BATSMAN_Y + o.y };
  }, [playShot, lefty, drawnStyle]);

  // One plan per hit (fixed random angle for that ball)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const plan = useMemo(() => (fieldingAnim ? makePlan(fieldingAnim.runs, fieldingAnim.shotDir) : null), [fieldingKey, fieldingAnim]);

  // The keeper: up to the stumps for spin, back for pace, on the batter's off side. Throws come to him.
  const standingUp = bowler?.look.kind === "spin";
  const keeperPos = keeperSpot(standingUp, drawnBatter?.leftHanded ?? false, ENDS);
  const keeperRef = useRef(keeperPos);
  keeperRef.current = keeperPos;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const throwAt = useMemo(() => (plan ? performance.now() + plan.tThrow1 * 1000 : null), [plan]);
  // The ball leaves the bowler's hand
  const bowlerLook = bowler?.look;
  const deliveryStart = useMemo(
    () => (bowlerLook ? releasePoint(bowlerLook, ENDS) : { x: BOWLER_X + 8, y: BOWLER_Y - 62 }),
    [bowlerLook?.kind, bowlerLook?.style, bowlerLook?.leftArm], // eslint-disable-line react-hooks/exhaustive-deps
  );

  // Drive ball, fielder, throw and camera from one clock so the camera tracks the ball exactly
  useEffect(() => {
    const cam = cameraGroupRef.current;
    if (!cam) return;
    if (!plan) { cam.setAttribute("transform", HOME_T); return; }

    const { dest, chaser, followScale, roll, tPick, tThrow0, tThrow1, tEnd } = plan;
    const from = deliveryEnd;
    const midScale = (followScale + HOME_CAM.s) / 2;
    const easeOutQuad = (x: number) => 1 - (1 - x) * (1 - x);
    // The fielder carries on a stride past the pickup before throwing
    const runDx = chaser ? dest.x - chaser.x : 0, runDy = chaser ? dest.y - chaser.y : 0;
    const runLen = Math.hypot(runDx, runDy) || 1;
    const release = chaser ? { x: dest.x + (runDx / runLen) * 7, y: dest.y + (runDy / runLen) * 7 } : dest;
    const place = (el: SVGCircleElement | null, x: number, y: number, show: boolean) => {
      if (!el) return;
      el.setAttribute("cx", x.toFixed(1));
      el.setAttribute("cy", y.toFixed(1));
      el.setAttribute("opacity", show ? "1" : "0");
    };

    const apply = (t: number) => {
      // Ball runs out and slows down, still rolling when the fielder gets to it
      const e = easeOutQuad(roll * clamp01(t / tPick)) / easeOutQuad(roll);
      const bx = lerp(from.cx, dest.x, e), by = lerp(from.cy, dest.y, e);
      place(ballRef.current, bx, by, t < tPick);

      // Fielder sets off at the hit, meets the ball at full pace, then jogs part of the way back
      if (chaser) {
        let fx: number, fy: number;
        if (t < tPick) {
          const p = clamp01((t - REACT) / (tPick - REACT));
          const k = p * p * (2 - p);                       // quick build-up, still running at the pickup
          fx = lerp(chaser.x, dest.x, k); fy = lerp(chaser.y, dest.y, k);
        } else if (t < tThrow0) {
          const k = easeOutCubic(clamp01((t - tPick) / (tThrow0 - tPick)));
          fx = lerp(dest.x, release.x, k); fy = lerp(dest.y, release.y, k);
        } else {
          const k = 0.6 * easeInOut(clamp01((t - tThrow0) / 0.9));
          fx = lerp(release.x, chaser.x, k); fy = lerp(release.y, chaser.y, k);
        }
        place(chaserRef.current, fx, fy, true);
      }

      // Throw back to the keeper
      const u = clamp01((t - tThrow0) / (tThrow1 - tThrow0));
      const K = keeperRef.current;
      place(throwRef.current, lerp(release.x, K.x, u), lerp(release.y, K.y, u), t >= tThrow0 && t <= tThrow1);

      // Camera: chase the ball → hold on the pickup → follow the throw → settle back home
      let cx: number, cy: number, s: number;
      if (t < tPick) {
        const k = easeInOut(clamp01(t / (tPick * 0.7)));
        cx = lerp(HOME_CAM.x, bx, k); cy = lerp(HOME_CAM.y, by, k);
        s = lerp(HOME_CAM.s, followScale, e);
      } else if (t < tThrow0) {
        const k = easeOutCubic(clamp01((t - tPick) / (tThrow0 - tPick)));
        cx = lerp(dest.x, release.x, k); cy = lerp(dest.y, release.y, k); s = followScale;
      } else if (t < tThrow1) {
        const k = easeInOut(u);
        cx = lerp(release.x, K.x, k); cy = lerp(release.y, K.y, k); s = lerp(followScale, midScale, k);
      } else {
        const k = easeInOut(clamp01((t - tThrow1) / (tEnd - tThrow1)));
        cx = lerp(K.x, HOME_CAM.x, k); cy = lerp(K.y, HOME_CAM.y, k); s = lerp(midScale, HOME_CAM.s, k);
      }
      cam.setAttribute("transform", camTransform(cx, cy, s));
    };

    apply(0);
    const ctrl = animateValue(0, tEnd, { duration: tEnd, ease: "linear", onUpdate: apply });
    return () => { ctrl.stop(); cam.setAttribute("transform", HOME_T); };
  }, [plan]); // eslint-disable-line react-hooks/exhaustive-deps -- start point is read once per hit

  // Little ball off the bat (plays under the boundary cutscene)
  const pingDX = shotDirection === "leg" ? -150 : shotDirection === "off" ? 150 : 0;
  const pingDY = shotDirection === "straight" || !shotDirection ? 170 : 90;

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "640/700", cursor: bowlingMode ? "none" : "default" }}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHover(null)}
        onClick={handleClick}
      >
        <defs>
          <radialGradient id="ss-ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#cc0000" />
          </radialGradient>
        </defs>

        <g ref={cameraGroupRef} transform={HOME_T}>
          <FieldWorld idp="ss" hideFielder={plan?.chaser?.id} />
          {keeper && (
            <DrawnKeeper look={keeper} spot={keeperPos} standingUp={standingUp} ends={ENDS}
              bowlerKind={bowler?.look.kind ?? "pace"} play={bowler?.play ?? null} userMode={bowler?.userMode ?? false} throwAt={throwAt} />
          )}
          <BattingStumps />
          <BatsmenAtWork striker={drawnBatter} nonStriker={nonStriker} ends={ENDS} bowlerSide={bowlerSide(bowler?.look.leftArm ?? false)} />
          {bowler && <DrawnBowler look={bowler.look} play={bowler.play} ends={ENDS} userMode={bowler.userMode} />}

          {/* ── DELIVERY ── */}
          {ballActive && (
            <motion.circle
              r={4.5}
              fill="url(#ss-ballGlow)"
              stroke="#cc0000"
              strokeWidth={1}
              initial={{ cx: deliveryStart.x, cy: deliveryStart.y }}
              animate={deliveryEnd}
              transition={{ duration: 0.52, ease: "easeIn" }}
            />
          )}

          {/* ── BALL OFF THE BAT ── */}
          {ballPing && (
            <motion.circle
              r={5}
              fill="url(#ss-ballGlow)"
              stroke="#ffcc00"
              strokeWidth={1.5}
              initial={{ cx: BAT_X, cy: BAT_Y, opacity: 1 }}
              animate={{ cx: BAT_X + pingDX, cy: BAT_Y + pingDY, opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            />
          )}

          {/* ── FIELDING PLAY (positions driven by the effect above) ── */}
          {plan && (
            <g key={fieldingKey}>
              {plan.chaser && <circle ref={chaserRef} cx={plan.chaser.x} cy={plan.chaser.y} r={6.5} fill="white" />}
              <circle ref={ballRef} cx={deliveryEnd.cx} cy={deliveryEnd.cy} r={4.5}
                fill="#cc2200" stroke="#ff4444" strokeWidth={1.2}
                style={{ filter: "drop-shadow(0 0 4px rgba(255,80,80,0.8))" }} />
              <circle ref={throwRef} cx={plan.dest.x} cy={plan.dest.y} r={3.8} opacity={0}
                fill="#cc2200" stroke="#ff4444" strokeWidth={1} />
            </g>
          )}

          {/* ── BOWLING AIM: hover ghost + locked target ── */}
          {bowlingMode && hover && (
            <g pointerEvents="none">
              <circle cx={hover.x} cy={hover.y} r={7} fill="none" stroke="rgba(255,255,255,0.85)" strokeWidth={1.2} strokeDasharray="2.5 1.5" />
              <circle cx={hover.x} cy={hover.y} r={3.2} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.5)" strokeWidth={0.8} />
              <line x1={hover.x - 10} y1={hover.y} x2={hover.x - 8} y2={hover.y} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
              <line x1={hover.x + 8} y1={hover.y} x2={hover.x + 10} y2={hover.y} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
              <line x1={hover.x} y1={hover.y - 10} x2={hover.x} y2={hover.y - 8} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
              <line x1={hover.x} y1={hover.y + 8} x2={hover.x} y2={hover.y + 10} stroke="rgba(255,255,255,0.6)" strokeWidth={0.8} />
            </g>
          )}
          {bowlingMode && locked && (
            <g pointerEvents="none">
              <circle cx={locked.x} cy={locked.y} r={7} fill="none" stroke="#ff7820" strokeWidth={1.5} />
              <circle cx={locked.x} cy={locked.y} r={3.2} fill="rgba(255,120,30,0.25)" stroke="#ff7820" strokeWidth={1} />
              <circle cx={locked.x} cy={locked.y} r={9.5} fill="none" stroke="rgba(255,120,30,0.35)" strokeWidth={2.2} />
            </g>
          )}
        </g>

        {/* ── Screen-space text (doesn't move with the camera) ── */}
        {plan && plan.runs > 0 && (
          <motion.text
            key={`runs-${fieldingKey}`}
            x={VIEW_W / 2} y={120}
            textAnchor="middle" fontSize={42} fontWeight="900"
            fill={plan.runs >= 2 ? "#fde68a" : "white"}
            stroke="rgba(0,0,0,0.85)" strokeWidth={3} paintOrder="stroke"
            initial={{ opacity: 0 }}
            animate={{ opacity: [0, 1, 1, 0] }}
            transition={{ delay: plan.tThrow0, duration: 1.2, times: [0, 0.12, 0.7, 1] }}
          >
            {plan.runs === 1 ? "1 RUN" : `${plan.runs} RUNS`}
          </motion.text>
        )}

        {resultFlash && (
          <motion.text
            x={VIEW_W / 2}
            textAnchor="middle"
            fontSize="36"
            fontWeight="900"
            fill={
              resultFlash.includes("SIX") ? "#fbbf24"
              : resultFlash.includes("FOUR") ? "#22c55e"
              : resultFlash.includes("WICKET") || resultFlash.includes("OUT") ? "#ef4444"
              : "white"
            }
            stroke="rgba(0,0,0,0.8)"
            strokeWidth={3}
            paintOrder="stroke"
            initial={{ opacity: 0, y: 140 }}
            animate={{ opacity: 1, y: 125 }}
            exit={{ opacity: 0 }}
          >
            {resultFlash}
          </motion.text>
        )}
      </svg>
    </div>
  );
}
