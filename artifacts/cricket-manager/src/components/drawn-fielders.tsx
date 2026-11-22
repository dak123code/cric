/**
 * The bowler and the wicketkeeper, drawn with the same rig as the batters.
 *
 * Bowler poses are authored right-arm over the wicket, in metres from the bowler's popping crease:
 * x screen-right, y up, z back towards the camera (he runs in towards −z). A left-armer is the mirror
 * image. Times are seconds from the ball leaving his hand.
 */
import { useEffect, useId, useState } from "react";
import {
  RigFigure, handOnScreen, footAt as F, deg as d, makeTrack, sampleTrack, blendPose, runPose,
  PITCH_DEPTH_UNITS, styleScale,
  type Pose, type PoseKey, type Outfit, type BatterKit, type BatterStyle,
} from "@/components/drawn-batter";
import type { PitchEnds } from "@/components/batters-running";

export type BowlerKind = "pace" | "spin";
export interface BowlerLook { kit: BatterKit; style: BatterStyle; kind: BowlerKind; leftArm: boolean }
export interface FielderLook { kit: BatterKit; style: BatterStyle }
/**
 * A delivery. "auto": the ball leaves his hand at releaseAt. "user": he runs in from runStartAt and
 * waits at his gather until releaseAt is known (the batter's swing decides it).
 */
export interface BowlerPlay { mode: "auto" | "user"; runStartAt: number; releaseAt: number | null }

const PITCH = 17.68;
const BALL_FLIGHT = 0.52;   // seconds from his hand to the bat

// ── The run-up: a stride cycle, his body moving in along the line ──
interface RunUp { from: number; t0: number; to: number; t1: number; vFrom: number }
const RUN_UP: Record<BowlerKind, RunUp> = {
  pace: { from: 9.0, t0: -1.6, to: 2.7, t1: -0.45, vFrom: 0.55 },
  spin: { from: 4.2, t0: -0.95, to: 1.7, t1: -0.32, vFrom: 0.45 },
};
/** In user mode he starts nearer and holds at his gather (back foot down) until the release is known. */
const USER_START: Record<BowlerKind, number> = { pace: -0.9, spin: -0.7 };
const HOLD: Record<BowlerKind, number> = { pace: -0.2, spin: -0.1 };
const LINE = -0.35;   // right-arm over: running in just left of the stumps (screen-left)

function runUpAt(k: BowlerKind, t: number) {
  const r = RUN_UP[k], dur = r.t1 - r.t0;
  const u = Math.max(0, Math.min(1, (t - r.t0) / dur));
  // speeding up: p = a·u + (1−a)·u²
  const a = r.vFrom;
  const p = a * u + (1 - a) * u * u;
  const v = ((r.from - r.to) * (a + 2 * (1 - a) * u)) / dur;   // m/s towards the batter
  return { z: r.from - (r.from - r.to) * p, v: t < r.t0 ? 0 : v };
}

// ── The delivery stride and follow-through, keyframed ──
const BASE: Pose = {
  pel: [LINE, 0.93, 2.7], pelYaw: d(265), pelTilt: d(6), pelRoll: 0, chestYaw: d(260), bend: d(12), side: 0,
  look: [0, 1, -20],
  lf: F(-0.28, 2.75, 270), rf: F(-0.42, 2.35, 270, 0.22),
  batTop: [0, 1, 0], batDir: [0, -1, 0], batFace: [0, 0, 1],
  lPole: [-0.4, -0.3, 0.8], rPole: [0.4, -0.3, 0.8],
  rFree: 1, rHand: [-0.25, 1.32, 2.4], lFree: 1, lHand: [-0.45, 1.32, 2.42],
};

const PACE: PoseKey[] = [
  { t: -0.45 },
  // Bound: off the ground, turning side-on, front arm reaching up
  { t: -0.3, pel: [-0.37, 1.12, 1.85], pelYaw: d(215), chestYaw: d(200), bend: d(4), side: d(-10), look: [-0.2, 1, -18],
    lf: F(-0.27, 2.05, 250, 0.38), rf: F(-0.45, 1.55, 200, 0.3), lHand: [-0.32, 2.12, 1.5], rHand: [-0.52, 1.18, 2.1] },
  // Back foot lands side-on, leaning back, front arm high, ball hand down by the hip
  { t: -0.2, pel: [-0.38, 0.92, 1.25], pelYaw: d(185), chestYaw: d(180), bend: d(-6), side: d(-12),
    rf: F(-0.42, 1.2, 180), lf: F(-0.3, 0.6, 250, 0.22), lHand: [-0.33, 2.05, 0.75], rHand: [-0.5, 0.98, 1.75] },
  // Front foot lands; front arm pulls down as the bowling arm comes up behind
  { t: -0.08, pel: [-0.34, 0.9, 0.55], pelYaw: d(215), chestYaw: d(205), bend: 0, side: d(-6),
    lf: F(-0.28, 0, 255), rf: F(-0.42, 1.2, 180, 0, 30), lHand: [-0.38, 1.55, 0.2], rHand: [-0.56, 1.8, 1.05],
    rPole: [0.6, -0.6, 0.5] },
  // Release: chest to the batter, arm high over the top
  { t: 0, pel: [-0.3, 0.95, 0.15], pelYaw: d(255), chestYaw: d(270), bend: d(20), side: d(10),
    rf: F(-0.42, 0.95, 200, 0.05, 60), rHand: [-0.2, 2.22, -0.05], lHand: [-0.52, 1.0, 0.35] },
  // Arm down across the body, back leg through
  { t: 0.12, pel: [-0.33, 0.88, -0.25], pelYaw: d(300), chestYaw: d(320), bend: d(40),
    rf: F(-0.45, 0.15, 260, 0.2), rHand: [-0.58, 0.95, -0.35], lHand: [-0.75, 1.1, 0.35], rPole: [0.4, -0.3, 0.8] },
  // Running on, off the pitch to the side
  { t: 0.3, pel: [-0.6, 0.9, -0.9], pelYaw: d(305), chestYaw: d(305), bend: d(20),
    rf: F(-0.55, -0.75, 300), lf: F(-0.72, -0.4, 290, 0.2), rHand: [-0.4, 1.0, -0.95], lHand: [-0.85, 1.0, -0.7] },
  { t: 0.6, pel: [-1.35, 0.92, -1.8], bend: d(12),
    lf: F(-1.3, -1.9, 305), rf: F(-1.45, -1.5, 305, 0.15), rHand: [-1.15, 0.95, -1.8], lHand: [-1.55, 0.95, -1.75] },
  { t: 1.1, pel: [-1.95, 0.94, -2.1], pelYaw: d(290), chestYaw: d(285), bend: d(6),
    lf: F(-1.85, -2.05, 290), rf: F(-2.05, -2.15, 290), rHand: [-1.75, 0.85, -2.1], lHand: [-2.15, 0.85, -2.1] },
];

const SPIN: PoseKey[] = [
  { t: -0.32, pel: [-0.3, 0.92, 1.7], pelYaw: d(255), chestYaw: d(245),
    lf: F(-0.24, 1.75, 270), rf: F(-0.38, 1.45, 260, 0.12), lHand: [-0.22, 1.3, 1.5], rHand: [-0.32, 1.3, 1.5] },
  // A little hop, turning side-on, front arm up
  { t: -0.2, pel: [-0.32, 1.02, 1.2], pelYaw: d(215), chestYaw: d(205), bend: d(4),
    lf: F(-0.26, 1.25, 255, 0.15), rf: F(-0.4, 1.1, 200, 0.12), lHand: [-0.25, 1.85, 0.9], rHand: [-0.45, 1.45, 1.45] },
  // Back foot down, ball up by the ear
  { t: -0.1, pel: [-0.35, 0.9, 0.7], pelYaw: d(195), chestYaw: d(190), bend: 0, side: d(-6),
    rf: F(-0.4, 0.75, 190), lf: F(-0.28, 0.3, 255, 0.12), lHand: [-0.28, 1.8, 0.35], rHand: [-0.5, 1.5, 1.05] },
  { t: -0.03, pel: [-0.32, 0.9, 0.35], pelYaw: d(220), chestYaw: d(225),
    lf: F(-0.27, 0, 250), lHand: [-0.35, 1.4, 0.1], rHand: [-0.45, 1.95, 0.7], rPole: [0.6, -0.6, 0.5] },
  // Release: arm high, body turning through
  { t: 0, pel: [-0.3, 0.92, 0.2], pelYaw: d(250), chestYaw: d(265), bend: d(18),
    rf: F(-0.4, 0.7, 200, 0, 45), rHand: [-0.25, 2.05, 0.05], lHand: [-0.55, 1.05, 0.35] },
  { t: 0.14, pel: [-0.36, 0.88, -0.05], pelYaw: d(290), chestYaw: d(320), bend: d(35),
    rf: F(-0.45, 0.15, 260, 0.15), rHand: [-0.6, 1.0, -0.15], lHand: [-0.72, 1.1, 0.3], rPole: [0.4, -0.3, 0.8] },
  { t: 0.35, pel: [-0.6, 0.9, -0.4], pelYaw: d(300), chestYaw: d(305), bend: d(18),
    rf: F(-0.55, -0.4, 295), lf: F(-0.7, -0.15, 290, 0.12), rHand: [-0.45, 0.95, -0.45], lHand: [-0.9, 0.95, -0.3] },
  { t: 0.85, pel: [-1.85, 0.94, -0.85], pelYaw: d(290), chestYaw: d(290), bend: d(6),
    lf: F(-1.73, -0.8, 290), rf: F(-1.95, -0.9, 290), rHand: [-1.65, 0.85, -0.85], lHand: [-2.07, 0.85, -0.85] },
];

const DELIVERY = { pace: makeTrack(BASE, PACE, 1), spin: makeTrack(BASE, SPIN, 1) };

/** Where he is in his action at `now` (seconds from release). */
export function bowlerTime(kind: BowlerKind, play: BowlerPlay | null, now: number, userMode: boolean) {
  if (!play) return userMode ? USER_START[kind] : RUN_UP[kind].t0 - 0.01;
  const tRun = Math.min(HOLD[kind], USER_START[kind] + (now - play.runStartAt) / 1000);
  if (play.mode === "user") return play.releaseAt === null ? tRun : Math.max(tRun, (now - play.releaseAt) / 1000);
  return play.releaseAt === null ? RUN_UP[kind].t0 : (now - play.releaseAt) / 1000;
}
/** In user mode, the earliest the ball can leave his hand (he has to get to his gather first). */
export function earliestRelease(kind: BowlerKind, runStartAt: number) {
  return runStartAt - USER_START[kind] * 1000;
}

const BOWLER_OUTFIT: Outfit = { pads: "none", gloves: "none", head: "bare", bat: false, ball: "R" };
const SLIDE = 0.75;   // compress depth so a planted foot doesn't slide as the figure moves along the pitch

/** His pose in his own frame (spot under his hips is the origin), and where that spot is. */
function bowlerPoseAt(kind: BowlerKind, t: number, ends: PitchEnds, style: BatterStyle) {
  const run = RUN_UP[kind];
  const yPerM = (ends.bowlerY - ends.strikerY) / PITCH;
  const toLocal = (p: Pose, z0: number): Pose => {
    const zl = (v: [number, number, number]): [number, number, number] => [v[0], v[1], (v[2] - z0) * SLIDE];
    return {
      ...p, pel: zl(p.pel), look: zl(p.look), rHand: zl(p.rHand), lHand: zl(p.lHand),
      lf: { ...p.lf, z: (p.lf.z - z0) * SLIDE }, rf: { ...p.rf, z: (p.rf.z - z0) * SLIDE },
    };
  };
  const runPoseAt = (tt: number) => {
    const { z, v } = runUpAt(kind, tt);
    const persp = ends.perspective(ends.bowlerY + z * yPerM);
    const speed = (Math.abs(v) * yPerM) / (PITCH_DEPTH_UNITS * styleScale(style) * persp);
    const moving = tt >= run.t0;
    const pose = runPose({
      x: LINE, yaw: 1.5 * Math.PI, phase: (tt - run.t0) * 2.4, pace: moving ? Math.min(1, 0.45 + Math.abs(v) / 9) : 0,
      speed: moving ? speed : 0, cadence: 2.4, ground: 0, hands: "free",
    });
    return { pose, z };
  };
  if (t < run.t1 - 0.06) return runPoseAt(t);
  const keyed = sampleTrack(DELIVERY[kind], Math.max(t, run.t1));
  const z = keyed.pel[2];
  const local = toLocal(keyed, z);
  if (t < run.t1 + 0.06) {
    const r = runPoseAt(t);
    return { pose: blendPose(r.pose, local, (t - (run.t1 - 0.06)) / 0.12), z: r.z + (z - r.z) * ((t - (run.t1 - 0.06)) / 0.12) };
  }
  return { pose: local, z };
}

/** Where the ball leaves his hand, on the field. */
export function releasePoint(look: BowlerLook, ends: PitchEnds) {
  const { pose, z } = bowlerPoseAt(look.kind, 0, ends, look.style);
  const y = ends.bowlerY + z * ((ends.bowlerY - ends.strikerY) / PITCH);
  const persp = ends.perspective(y);
  const h = handOnScreen(pose, "R", { kit: look.kit, style: look.style, mirror: look.leftArm });
  return { x: ends.x + h.x * persp, y: y + h.y * persp };
}
/** Which side of the stumps he runs in on: −1 screen-left (right-arm over), +1 screen-right (left-arm over). */
export const bowlerSide = (leftArm: boolean) => (leftArm ? 1 : -1);

/** The bowler, running in and bowling. Between balls he waits at the top of his mark. */
export function DrawnBowler({ look, play, ends, userMode, still }: {
  look: BowlerLook; play: BowlerPlay | null; ends: PitchEnds; userMode: boolean;
  still?: number;   // draw him frozen at this moment of his action instead (cutscenes)
}) {
  const uid = "bo" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!play || still !== undefined) return;
    let id = 0;
    const loop = (ts: number) => { setNow(ts); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [play, still]);

  const t = still ?? bowlerTime(look.kind, play, now, userMode);
  const { pose, z } = bowlerPoseAt(look.kind, t, ends, look.style);
  const y = ends.bowlerY + z * ((ends.bowlerY - ends.strikerY) / PITCH);
  const persp = ends.perspective(y);
  return (
    <g transform={`translate(${ends.x}, ${y.toFixed(2)}) scale(${persp.toFixed(3)})`}>
      <RigFigure pose={pose} uid={uid} look={{ kit: look.kit, style: look.style, mirror: look.leftArm }}
        outfit={{ ...BOWLER_OUTFIT, ball: t < 0 ? "R" : "" }} />
    </g>
  );
}

// ── Wicketkeeper ────────────────────────────────────────────────────────────
// Facing the bowler (the camera), in his own frame. His left is screen-right.
const KEEPER_IDLE: Pose = {
  ...BASE,
  pel: [0, 0.82, -0.08], pelYaw: d(90), pelTilt: d(18), pelRoll: 0, chestYaw: d(90), bend: d(32), side: 0,
  look: [0, 1.2, 20],
  lf: F(0.22, 0.02, 100), rf: F(-0.22, 0.02, 80),
  lPole: [0.7, -0.2, 0.3], rPole: [-0.7, -0.2, 0.3],
  lFree: 1, lHand: [0.17, 0.5, 0.14], rFree: 1, rHand: [-0.17, 0.5, 0.14],
};
const KEEPER_CROUCH: Partial<Pose> = {
  pel: [0, 0.42, -0.05], pelTilt: d(25), bend: d(38),
  lf: F(0.24, 0.02, 100), rf: F(-0.24, 0.02, 80), lHand: [0.05, 0.3, 0.33], rHand: [-0.05, 0.3, 0.33],
};
const KEEPER_READY: Partial<Pose> = {
  pel: [0, 0.68, -0.02], pelTilt: d(18), bend: d(30), lHand: [0.06, 0.78, 0.36], rHand: [-0.06, 0.78, 0.36],
};
const KEEPER_TAKE: Partial<Pose> = {
  pel: [0, 0.8, 0], pelTilt: d(12), bend: d(15), lHand: [0.06, 1.12, 0.32], rHand: [-0.06, 1.12, 0.32],
};

/** Where the keeper stands: just to the off side of the stumps, back for pace or up to the stumps for spin. */
export function keeperSpot(standingUp: boolean, strikerLeftHanded: boolean, ends: PitchEnds) {
  const yPerM = (ends.bowlerY - ends.strikerY) / PITCH;
  return { x: ends.x + (strikerLeftHanded ? 14 : -14), y: ends.strikerY - (standingUp ? 2.7 : 6.7) * yPerM };
}

/**
 * The keeper: hands on knees between balls, down into his crouch as the bowler comes in, up with the
 * ball, and the throw back into his gloves.
 */
export function DrawnKeeper({ look, spot, standingUp, bowlerKind, play, userMode, throwAt, ends, still }: {
  look: FielderLook; spot: { x: number; y: number }; standingUp: boolean; ends: PitchEnds;
  still?: number;   // frozen at this moment of the bowler's action (cutscenes)
  bowlerKind: BowlerKind; play: BowlerPlay | null; userMode: boolean;
  throwAt?: number | null;   // when a throw reaches him (performance.now() ms)
}) {
  const uid = "kp" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!play) return;
    let id = 0;
    const loop = (ts: number) => { setNow(ts); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [play]);

  const t = still ?? (play ? bowlerTime(bowlerKind, play, now, userMode) : -9);
  const k = (a: number, b: number) => Math.max(0, Math.min(1, (t - a) / (b - a)));
  const ease = (x: number) => (x < 0.5 ? 2 * x * x : 1 - Math.pow(-2 * x + 2, 2) / 2);
  const with_ = (p: Partial<Pose>): Pose => ({ ...KEEPER_IDLE, ...p });
  // Down as the bowler gathers, up as the ball arrives (sooner when he's standing back)
  let pose = blendPose(KEEPER_IDLE, with_(KEEPER_CROUCH), ease(k(-0.7, -0.35)));
  const up0 = standingUp ? BALL_FLIGHT - 0.05 : 0.05, up1 = standingUp ? BALL_FLIGHT + 0.15 : 0.35;
  pose = blendPose(pose, with_(KEEPER_READY), ease(k(up0, up1)));
  if (throwAt) {
    const tt = (now - throwAt) / 1000;
    const take = tt < -0.2 ? 0 : tt < 0 ? (tt + 0.2) / 0.2 : tt < 0.35 ? 1 : Math.max(0, 1 - (tt - 0.35) / 0.4);
    pose = blendPose(pose, with_(KEEPER_TAKE), ease(take));
    if (tt > 0.35) pose = blendPose(pose, KEEPER_IDLE, ease(Math.min(1, (tt - 0.35) / 0.4)));
  } else {
    pose = blendPose(pose, KEEPER_IDLE, ease(k(1.3, 1.8)));
  }
  const persp = ends.perspective(spot.y);
  return (
    <g transform={`translate(${spot.x}, ${spot.y}) scale(${persp})`}>
      <RigFigure pose={pose} uid={uid} look={{ kit: look.kit, style: look.style }}
        outfit={{ pads: "keep", gloves: "keep", head: standingUp ? "helmet" : "cap", bat: false, ball: "" }} />
    </g>
  );
}

