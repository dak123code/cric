/**
 * Drawn batters: every country bats like one of its signature players (Smith, Bavuma, Kohli, Root…),
 * in its own kit.
 *
 * A small 3D rig (pelvis, spine, head, two-bone IK legs and arms, a real-sized bat) posed by
 * keyframes and seen through the end-on camera behind the bowler, then painted in SVG with
 * cylinder shading, kit, pads, gloves, helmet and a ground shadow.
 *
 * World, in metres: x → screen-right, y up, z towards the bowler. Origin is the middle-stump
 * line on the popping crease, at ground level. Poses are authored right-handed, so from this end
 * his OFF side is screen-LEFT (−x) and his leg side is screen-right; left-handers are mirrored.
 */
import { useEffect, useId, useRef, useState, type ReactElement } from "react";

export type BatterShot = "coverDrive" | "straightDrive" | "flick" | "pull" | "cut" | "defence" | "leave";
/** A delivery to play: the shot, and when the ball reaches the batter (performance.now() ms). */
export interface BatterPlay {
  shot: BatterShot; contactAt: number; key: number;
  runs?: number;   // runs the batters will run for it (0 or missing: they stay put)
}

// ── Vector maths ────────────────────────────────────────────────────────────
export type V3 = [number, number, number];
const add = (a: V3, b: V3): V3 => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a: V3, s: number): V3 => [a[0] * s, a[1] * s, a[2] * s];
const madd = (a: V3, b: V3, s: number): V3 => [a[0] + b[0] * s, a[1] + b[1] * s, a[2] + b[2] * s];
const dot = (a: V3, b: V3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a: V3, b: V3): V3 => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a: V3) => Math.hypot(a[0], a[1], a[2]);
const norm = (a: V3): V3 => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
const lerp3 = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
/** Part of v at right angles to the unit vector n. */
const perp = (v: V3, n: V3): V3 => madd(v, n, -dot(v, n));
const clamp = (x: number, a: number, b: number) => Math.max(a, Math.min(b, x));
const UP: V3 = [0, 1, 0];
const DEG = Math.PI / 180;
const d = (deg: number) => deg * DEG;
/** Horizontal facing for a yaw: 0 = side-on (towards the off side, −x), 90° = chest to the bowler. */
const yawDir = (yaw: number): V3 => [-Math.cos(yaw), 0, Math.sin(yaw)];
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Two-bone IK: root → joint → end, the joint bending towards `pole`. */
function ik(root: V3, target: V3, l1: number, l2: number, pole: V3) {
  const toT = sub(target, root);
  let dist = len(toT);
  const dir: V3 = dist > 1e-6 ? mul(toT, 1 / dist) : [0, -1, 0];
  dist = clamp(dist, Math.abs(l1 - l2) + 1e-4, l1 + l2 - 1e-4);
  const cosA = (l1 * l1 + dist * dist - l2 * l2) / (2 * l1 * dist);
  const sinA = Math.sqrt(Math.max(0, 1 - cosA * cosA));
  let bend = perp(pole, dir);
  if (len(bend) < 1e-6) bend = perp([0, 0, 1], dir);
  bend = norm(bend);
  return { joint: add(root, add(mul(dir, l1 * cosA), mul(bend, l1 * sinA))), end: madd(root, dir, dist) };
}

// ── Body (Smith is about 1.74 m) ────────────────────────────────────────────
const DIM = {
  hipHalf: 0.092, hipDrop: 0.03, thigh: 0.45, shin: 0.45,
  lumbar: 0.13, spine: 0.34, shoulderHalf: 0.185,
  upperArm: 0.29, forearm: 0.265, hand: 0.075,
  bat: 0.965, handle: 0.31, gripTop: 0.065, gripBottom: 0.165, sweet: 0.76,
};
const ARM_REACH = DIM.upperArm + DIM.forearm + DIM.hand - 0.004;

// ── Poses ───────────────────────────────────────────────────────────────────
export interface Foot { x: number; z: number; yaw: number; lift: number; heel: number }
export interface Pose {
  pel: V3;            // hip centre
  pelYaw: number;     // 0 side-on, + opens towards the bowler
  pelTilt: number;    // forward tilt of the pelvis
  pelRoll: number;    // + drops the front (left) hip
  chestYaw: number;
  bend: number;       // spine bend forward
  side: number;       // spine bend towards the front shoulder
  look: V3;           // where the eyes are
  lf: Foot; rf: Foot; // ball of each foot on the ground, toe direction, lift, heel raise
  batTop: V3;         // top of the handle
  batDir: V3;         // handle → toe
  batFace: V3;        // which way the hitting face points
  lPole: V3; rPole: V3; // elbow directions
  rFree: number;      // 0 bottom hand on the bat … 1 let go (running)
  rHand: V3;          // where the free hand is
  lFree: number;      // 0 top hand on the bat … 1 free (bowlers, keepers)
  lHand: V3;
}
/** A foot: ball of the foot at (x, z), toes pointing `yaw` degrees, lifted, heel raised. */
const F = (x: number, z: number, yawDeg: number, lift = 0, heelDeg = 0): Foot =>
  ({ x, z, yaw: d(yawDeg), lift, heel: d(heelDeg) });

// Guard: just outside leg stump, side-on, bat grounded by the back toe, eyes level on the bowler.
const STANCE: Pose = {
  pel: [0.34, 0.93, 0], pelYaw: d(8), pelTilt: d(10), pelRoll: 0,
  chestYaw: d(18), bend: d(24), side: 0,
  look: [0, 1.7, 20],
  lf: F(0.15, 0.21, 12), rf: F(0.13, -0.21, 0),
  batTop: [0.07, 0.93, 0.12], batDir: norm([-0.07, -0.92, -0.28]), batFace: [0, 0, 1],
  lPole: [-0.4, -0.4, 0.8], rPole: [0.3, -0.7, -0.6],
  rFree: 0, rHand: [0, 0, 0], lFree: 0, lHand: [0, 0, 0],
};

export type PoseKey = { t: number } & Partial<Pose>;

// Seconds relative to the ball reaching him. Smith's trigger: a big shuffle across to off stump,
// head still, the bat going up high with the face open towards gully.
const START_T = -0.95;
const SET_T = -0.45;
const TRIGGER: PoseKey[] = [
  { t: START_T },
  { t: -0.74, rf: F(0.03, -0.23, 3, 0.035), pel: [0.27, 0.92, -0.01],
    batTop: [0.07, 0.98, 0.08], batDir: norm([-0.12, -0.55, -0.8]) },
  { t: -0.6, rf: F(-0.1, -0.24, 4), lf: F(0.03, 0.22, 14, 0.03), pel: [0.19, 0.91, 0],
    batTop: [0.05, 1.0, 0.05], batDir: norm([-0.2, 0.1, -0.97]), batFace: [-1, 0, 0.3] },
  { t: SET_T, lf: F(-0.06, 0.22, 15), pel: [0.13, 0.91, 0], chestYaw: d(16), bend: d(22),
    batTop: [0.04, 1.02, 0.04], batDir: norm([-0.22, 0.62, -0.75]), batFace: [-1, 0, 0] },
];

const SHOTS: Record<BatterShot, PoseKey[]> = {
  // Front foot to the pitch, high elbow, through cover, held high finish
  coverDrive: [
    { t: -0.3, lf: F(-0.14, 0.42, 22, 0.07), pel: [0.08, 0.88, 0.12], bend: d(26),
      batTop: [0.05, 1.1, 0.02], batDir: norm([-0.18, 0.72, -0.67]) },
    { t: -0.15, lf: F(-0.24, 0.78, 35), rf: F(-0.1, -0.24, 4, 0, 12), pel: [-0.02, 0.82, 0.36],
      pelYaw: d(14), chestYaw: d(14), bend: d(34), side: d(6), look: [-0.25, 0.2, 0.9],
      batTop: [-0.04, 1.12, 0.34], batDir: norm([-0.12, 0.6, -0.8]), batFace: [-1, 0, 0.1] },
    { t: -0.06, batTop: [-0.22, 0.98, 0.62], batDir: norm([-0.06, 0, -1]), batFace: [-0.7, -0.7, 0] },
    { t: 0, pel: [-0.05, 0.8, 0.44], pelYaw: d(18), chestYaw: d(22), bend: d(40), side: d(8),
      rf: F(-0.09, -0.2, 6, 0, 25), look: [-0.36, 0.2, 0.7],
      batTop: [-0.3, 0.93, 0.84], batDir: norm([-0.1, -0.94, -0.3]), batFace: [-0.6, 0, 0.8] },
    { t: 0.05, batTop: [-0.36, 0.99, 0.86], batDir: norm([-0.3, -0.6, 0.75]) },
    { t: 0.12, batTop: [-0.34, 1.2, 0.9], batDir: norm([-0.5, 0.55, 0.67]), chestYaw: d(30), bend: d(34) },
    { t: 0.2, batTop: [-0.3, 1.42, 0.8], batDir: norm([-0.25, 0.95, 0.1]),
      lPole: [-0.3, 0.4, 0.8], rPole: [0.3, -0.3, 0.6] },
    { t: 0.32, pel: [-0.06, 0.82, 0.45], pelYaw: d(30), chestYaw: d(42), bend: d(24), side: d(4),
      rf: F(-0.07, -0.13, 20, 0, 50), look: [-5, 0.6, 7],
      batTop: [-0.2, 1.56, 0.62], batDir: norm([0.3, 0.62, -0.72]), lPole: [-0.3, 0.6, 0.6], rPole: [0.4, -0.2, 0.5] },
    { t: 0.7, bend: d(20), batTop: [-0.18, 1.54, 0.6] },
  ],

  // The same, straight back past the bowler
  straightDrive: [
    { t: -0.3, lf: F(-0.08, 0.42, 18, 0.07), pel: [0.08, 0.88, 0.12], bend: d(26),
      batTop: [0.05, 1.1, 0.02], batDir: norm([-0.14, 0.72, -0.68]) },
    { t: -0.15, lf: F(-0.12, 0.76, 22), rf: F(-0.1, -0.24, 4, 0, 12), pel: [0.0, 0.82, 0.36],
      pelYaw: d(14), chestYaw: d(16), bend: d(34), side: d(4), look: [-0.1, 0.2, 0.9],
      batTop: [-0.02, 1.12, 0.34], batDir: norm([-0.08, 0.6, -0.8]), batFace: [-1, 0, 0.1] },
    { t: -0.06, batTop: [-0.15, 0.98, 0.62], batDir: norm([-0.02, 0, -1]), batFace: [-0.5, -0.85, 0] },
    { t: 0, pel: [-0.02, 0.8, 0.48], pelYaw: d(20), chestYaw: d(26), bend: d(40), side: d(4),
      rf: F(-0.09, -0.2, 6, 0, 25), look: [-0.08, 0.2, 0.8],
      batTop: [-0.19, 0.93, 0.86], batDir: norm([-0.03, -0.95, -0.3]), batFace: [0, 0, 1] },
    { t: 0.05, batTop: [-0.2, 0.99, 0.88], batDir: norm([-0.08, -0.6, 0.8]) },
    { t: 0.12, batTop: [-0.14, 1.22, 0.88], batDir: norm([-0.14, 0.58, 0.8]), chestYaw: d(30), bend: d(34) },
    { t: 0.2, batTop: [-0.12, 1.45, 0.8], batDir: norm([-0.05, 0.97, 0.15]),
      lPole: [-0.3, 0.4, 0.8], rPole: [0.3, -0.3, 0.6] },
    { t: 0.32, pel: [-0.03, 0.82, 0.45], pelYaw: d(26), chestYaw: d(36), bend: d(24),
      rf: F(-0.07, -0.13, 18, 0, 50), look: [0, 0.6, 12],
      batTop: [-0.08, 1.58, 0.62], batDir: norm([0.2, 0.66, -0.72]), lPole: [-0.3, 0.6, 0.6], rPole: [0.4, -0.2, 0.5] },
    { t: 0.7, bend: d(20), batTop: [-0.07, 1.56, 0.6] },
  ],

  // Forward defence: smaller backlift, bat next to the pad, soft hands, held
  defence: [
    { t: -0.3, lf: F(-0.12, 0.36, 22, 0.05), pel: [0.07, 0.88, 0.1],
      batTop: [0.03, 1.02, 0.06], batDir: norm([-0.15, 0.4, -0.9]) },
    { t: -0.14, lf: F(-0.22, 0.62, 28), pel: [-0.01, 0.83, 0.3], bend: d(34), look: [-0.12, 0.2, 0.9],
      batTop: [-0.07, 0.98, 0.44], batDir: norm([-0.05, -0.2, -0.98]), batFace: [-0.5, -0.6, 0.6] },
    { t: 0, pel: [-0.03, 0.8, 0.42], pelYaw: d(16), chestYaw: d(22), bend: d(40), side: d(6),
      rf: F(-0.1, -0.23, 4, 0, 10), look: [-0.12, 0.15, 0.75],
      batTop: [-0.16, 0.93, 0.86], batDir: norm([-0.03, -0.95, -0.3]), batFace: [-0.15, -0.2, 1] },
    { t: 0.15, batTop: [-0.16, 0.92, 0.82] },
    { t: 0.7, bend: d(36), batTop: [-0.15, 0.93, 0.82] },
  ],

  // Across his stumps, straight bat, face closed late, wrists roll the ball through mid-wicket
  flick: [
    { t: -0.3, lf: F(-0.06, 0.4, 18, 0.06), pel: [0.1, 0.88, 0.1],
      batTop: [0.05, 1.08, 0.04], batDir: norm([-0.15, 0.7, -0.7]) },
    { t: -0.15, lf: F(-0.1, 0.66, 20), pel: [0.02, 0.82, 0.32], bend: d(32), look: [0, 0.2, 0.9],
      batTop: [0, 1.08, 0.3], batDir: norm([-0.05, 0.55, -0.83]) },
    { t: -0.06, batTop: [-0.02, 0.98, 0.56], batDir: norm([0, 0, -1]), batFace: [-0.3, -0.9, 0.2] },
    { t: 0, pel: [0, 0.8, 0.46], pelYaw: d(26), chestYaw: d(34), bend: d(38), rf: F(-0.1, -0.22, 6, 0, 15),
      look: [0.02, 0.2, 0.75],
      batTop: [0, 0.93, 0.9], batDir: norm([0.02, -0.95, -0.3]), batFace: [0.75, -0.05, 0.65] },
    { t: 0.1, chestYaw: d(40), pelYaw: d(32),
      batTop: [0.12, 0.99, 0.86], batDir: norm([0.85, -0.38, 0.32]), batFace: [0.2, -0.9, 0.3],
      rPole: [0.5, -0.7, 0] },
    { t: 0.26, pel: [0, 0.82, 0.44], chestYaw: d(62), pelYaw: d(45), bend: d(24), look: [6, 0.4, 6],
      rf: F(-0.08, -0.17, 30, 0, 35),
      batTop: [0.24, 1.2, 0.6], batDir: norm([0.6, 0.25, -0.76]), batFace: [0.3, -0.6, 0.5],
      lPole: [0.2, -0.3, 0.9], rPole: [0.7, -0.5, 0.2] },
    { t: 0.7, bend: d(20), batTop: [0.23, 1.22, 0.58] },
  ],

  // Back and across, up tall, swivel: the ball pulled in front of square, bat wrapped round the shoulder
  pull: [
    { t: -0.3, rf: F(-0.2, -0.4, 10, 0.05), pel: [0.1, 0.92, -0.08],
      batTop: [0.05, 1.2, 0], batDir: norm([-0.22, 0.72, -0.66]) },
    { t: -0.16, rf: F(-0.22, -0.44, 40), lf: F(0.02, 0.18, 30, 0.05), pel: [0.02, 0.97, -0.16],
      pelYaw: d(32), chestYaw: d(30), bend: d(14), side: d(-4), look: [-0.2, 1.3, 3],
      batTop: [0.04, 1.42, -0.04], batDir: norm([-0.32, 0.6, -0.73]),
      lPole: [-0.3, -0.2, 0.9], rPole: [0.4, -0.6, -0.6] },
    { t: -0.05, batTop: [0, 1.36, 0.2], batDir: norm([-0.78, 0.2, -0.58]), batFace: [-0.3, 0, 1] },
    { t: 0, lf: F(0.12, 0.2, 70, 0.04), pel: [0.04, 0.96, -0.12], pelYaw: d(55), chestYaw: d(70),
      look: [-0.4, 1.25, 0.9],
      batTop: [0.18, 1.3, 0.4], batDir: norm([-0.88, -0.05, 0.47]), batFace: [0.45, 0, 0.9] },
    { t: 0.1, chestYaw: d(98), pelYaw: d(75),
      batTop: [0.3, 1.3, 0.3], batDir: norm([0.3, -0.1, 0.95]), batFace: [0.6, -0.7, -0.2] },
    { t: 0.22, batTop: [0.32, 1.32, 0.12], batDir: norm([0.95, 0.15, -0.25]), batFace: [0, -1, 0] },
    { t: 0.4, lf: F(0.18, 0.24, 80), chestYaw: d(115), pelYaw: d(85), look: [8, 1.4, 3],
      batTop: [0.2, 1.45, 0.04], batDir: norm([0.3, 0.55, -0.78]),
      lPole: [0.4, 0.5, 0.7], rPole: [0.8, -0.2, 0.3] },
    { t: 0.8, batTop: [0.19, 1.44, 0.05] },
  ],

  // Back foot across to the line, hands high, slashed down hard behind point
  cut: [
    { t: -0.3, rf: F(-0.3, -0.36, -10, 0.05), pel: [0.05, 0.91, -0.06],
      batTop: [0.04, 1.25, -0.02], batDir: norm([-0.28, 0.7, -0.66]) },
    { t: -0.16, rf: F(-0.4, -0.4, -35), lf: F(-0.08, 0.16, 15), pel: [-0.08, 0.9, -0.12],
      pelYaw: d(-8), chestYaw: d(-10), bend: d(22), side: d(-8), look: [-0.6, 0.9, 1.5],
      batTop: [0, 1.46, -0.04], batDir: norm([-0.3, 0.6, -0.74]) },
    { t: -0.05, batTop: [-0.22, 1.3, 0.12], batDir: norm([-0.5, 0.5, -0.7]), batFace: [-0.8, -0.2, 0.4] },
    { t: 0, bend: d(30), side: d(-14), chestYaw: d(-5), look: [-0.85, 0.85, 0.4],
      batTop: [-0.26, 1.08, 0.12], batDir: norm([-0.78, -0.3, 0.52]), batFace: [-0.9, -0.35, -0.2] },
    { t: 0.1, batTop: [-0.4, 0.95, 0.1], batDir: norm([-0.55, -0.65, -0.5]), batFace: [-0.5, -0.5, -0.7] },
    { t: 0.26, look: [-8, 0.4, -2], batTop: [-0.36, 0.96, 0.04], batDir: norm([-0.3, -0.75, -0.6]) },
    { t: 0.7, batTop: [-0.35, 0.97, 0.04] },
  ],

  // The Smith leave: bat flung up over his head, a little shimmy, then down again
  leave: [
    { t: -0.3, batTop: [0.06, 1.3, 0.04], batDir: norm([-0.15, 0.8, -0.58]),
      lPole: [-0.5, 0.3, 0.8], rPole: [0.4, 0.3, -0.8] },
    { t: -0.12, pel: [0.16, 0.92, 0], chestYaw: d(35), bend: d(8), look: [-0.2, 0.9, 3],
      batTop: [0.1, 1.7, 0], batDir: norm([-0.05, 0.55, -0.84]) },
    { t: 0.06, lf: F(0.02, 0.26, 25, 0.1), pel: [0.2, 0.94, 0], pelYaw: d(25), look: [-0.6, 0.6, -2] },
    { t: 0.26, lf: F(0.04, 0.24, 25), batTop: [0.12, 1.65, 0.02] },
    { t: 0.55, chestYaw: d(25), bend: d(14), look: [0, 1.5, 12],
      batTop: [0.1, 1.25, 0.08], batDir: norm([-0.2, 0.75, -0.62]), lPole: [-0.4, -0.4, 0.8], rPole: [0.3, -0.7, -0.6] },
    { t: 0.9 },
  ],
};

// ── Temba Bavuma: compact (about 1.62 m). Stands still, a small back-and-across press, a straight
// backlift a touch lower than Smith's, and a plain bat-up leave. Same strokes as Smith, played
// from a set position a little further to leg. ──
const BAVUMA_STANCE: Pose = {
  ...STANCE,
  pel: [0.3, 0.94, 0], pelYaw: d(10), pelTilt: d(8), chestYaw: d(16), bend: d(20),
  lf: F(0.12, 0.17, 10), rf: F(0.11, -0.17, 0),
  batTop: [0.05, 0.93, 0.1], batDir: norm([-0.06, -0.92, -0.28]),
};
const BAVUMA_TRIGGER: PoseKey[] = [
  { t: START_T },
  { t: -0.72, rf: F(0.05, -0.22, 3, 0.025), pel: [0.26, 0.93, -0.02],
    batTop: [0.06, 0.98, 0.06], batDir: norm([-0.1, -0.5, -0.86]) },
  { t: -0.6, rf: F(0.02, -0.23, 4), lf: F(0.08, 0.2, 12, 0.02), pel: [0.23, 0.92, -0.01],
    batTop: [0.06, 1.0, 0.04], batDir: norm([-0.18, 0.15, -0.97]), batFace: [-1, 0, 0.3] },
  { t: SET_T, lf: F(0.06, 0.2, 12), pel: [0.22, 0.92, 0], chestYaw: d(15), bend: d(20),
    batTop: [0.06, 1.03, 0.03], batDir: norm([-0.2, 0.55, -0.81]), batFace: [-1, 0, 0] },
];
/** Move a shot's positions sideways (directions stay as they are). */
function shiftX(keys: PoseKey[], dx: number): PoseKey[] {
  const mv = (v: V3): V3 => [v[0] + dx, v[1], v[2]];
  return keys.map(k => ({
    ...k,
    ...(k.pel && { pel: mv(k.pel) }),
    ...(k.batTop && { batTop: mv(k.batTop) }),
    ...(k.look && { look: mv(k.look) }),
    ...(k.lf && { lf: { ...k.lf, x: k.lf.x + dx } }),
    ...(k.rf && { rf: { ...k.rf, x: k.rf.x + dx } }),
  }));
}
const BAVUMA_SHOTS: Record<BatterShot, PoseKey[]> = {
  ...(Object.fromEntries((Object.keys(SHOTS) as BatterShot[]).map(s => [s, shiftX(SHOTS[s], 0.1)])) as Record<BatterShot, PoseKey[]>),
  // Shoulder arms: a short step in, bat lifted out of the way, eyes following it past off stump
  leave: [
    { t: -0.3, batTop: [0.1, 1.2, 0.04], batDir: norm([-0.1, 0.85, -0.5]),
      lPole: [-0.5, 0.2, 0.8], rPole: [0.4, 0.2, -0.8] },
    { t: -0.1, lf: F(0.04, 0.32, 14), pel: [0.22, 0.9, 0.08], chestYaw: d(18), bend: d(16), look: [-0.4, 0.9, 1],
      batTop: [0.14, 1.5, 0.02], batDir: norm([0, 0.75, -0.66]) },
    { t: 0.1, look: [-0.7, 0.8, -2] },
    { t: 0.4, batTop: [0.14, 1.48, 0.03] },
    { t: 0.7, chestYaw: d(18), bend: d(18), batTop: [0.1, 1.15, 0.08], batDir: norm([-0.15, 0.8, -0.58]),
      lPole: [-0.4, -0.4, 0.8], rPole: [0.3, -0.7, -0.6] },
    { t: 0.9 },
  ],
};

/** How a batter stands and moves, and how he looks. */
interface StyleDef { stance: Pose; trigger: PoseKey[]; shots: Record<BatterShot, PoseKey[]>; scale: number; skin: string }

// ── Everyone else: built from a few settings that describe how a batter stands and moves ──
interface StyleParams {
  scale: number;     // height relative to Smith (1.74 m)
  skin: string;
  guard: number;     // where he stands: hip centre's x in his stance (m); Smith 0.34, outside leg
  crouch: number;    // 0 upright … 1 deep crouch
  open: number;      // how open his chest is to the bowler in his stance (degrees); Smith 18
  width: number;     // how far each foot is from the crease (m)
  move: number;      // how far across his trigger takes him (m); Smith 0.21
  press: boolean;    // a front-foot press in the trigger
  backlift: number;  // 0 low … 1 high
  finish: "high" | "checked";
}

// A checked drive: the bat stops pointing up towards where the ball went, hands at chest height
const CHECKED: Partial<Record<BatterShot, PoseKey[]>> = {
  coverDrive: [
    { t: 0.12, batTop: [-0.34, 1.12, 0.9], batDir: norm([-0.45, 0.45, 0.77]), chestYaw: d(28), bend: d(36) },
    { t: 0.26, batTop: [-0.32, 1.24, 0.86], batDir: norm([-0.35, 0.8, 0.5]), look: [-5, 0.5, 7],
      rf: F(-0.08, -0.17, 12, 0, 35), lPole: [-0.3, 0.2, 0.9], rPole: [0.3, -0.4, 0.6] },
    { t: 0.7, bend: d(32) },
  ],
  straightDrive: [
    { t: 0.12, batTop: [-0.14, 1.12, 0.92], batDir: norm([-0.1, 0.45, 0.89]), chestYaw: d(28), bend: d(36) },
    { t: 0.26, batTop: [-0.13, 1.24, 0.88], batDir: norm([-0.08, 0.82, 0.57]), look: [0, 0.5, 12],
      rf: F(-0.08, -0.17, 12, 0, 35), lPole: [-0.3, 0.2, 0.9], rPole: [0.3, -0.4, 0.6] },
    { t: 0.7, bend: d(32) },
  ],
};

function buildStyle(p: StyleParams): StyleDef {
  const pelY = 0.96 - 0.1 * p.crouch, bend = d(16 + 20 * p.crouch);
  const lfX = p.guard - 0.19, rfX = p.guard - 0.21;
  const setX = p.guard - p.move;                       // hip centre once he's set
  const stance: Pose = {
    ...STANCE,
    pel: [p.guard, pelY, 0], pelTilt: d(8 + 6 * p.crouch), bend, pelYaw: d(p.open * 0.6), chestYaw: d(p.open),
    lf: F(lfX, p.width, 12), rf: F(rfX, -p.width, 0),
    batTop: [p.guard - 0.27, 0.93, 0.12],
  };
  const trigger: PoseKey[] = [
    { t: START_T },
    { t: -0.74, rf: F(rfX - p.move * 0.55, -p.width - 0.02, 3, 0.03), pel: [p.guard - p.move * 0.35, pelY - 0.01, -0.01],
      batTop: [p.guard - 0.27, 0.98, 0.08], batDir: norm([-0.12, -0.55, -0.8]) },
    { t: -0.6, rf: F(rfX - p.move * 1.1, -p.width - 0.03, 4),
      lf: F(lfX - p.move * 0.6, p.width + (p.press ? 0.05 : 0.01), 14, 0.03),
      pel: [p.guard - p.move * 0.75, pelY - 0.02, 0],
      batTop: [setX - 0.08, 1.0, 0.05], batDir: norm([-0.2, 0.1, -0.97]), batFace: [-1, 0, 0.3] },
    { t: SET_T, lf: F(lfX - p.move, p.width + (p.press ? 0.04 : 0.01), 15),
      pel: [setX, pelY - 0.02, p.press ? 0.03 : 0], chestYaw: d(p.open - 2), bend: bend - d(2),
      batTop: [setX - 0.09, 0.96 + 0.07 * p.backlift, 0.04],
      batDir: norm(lerp3([-0.2, 0.1, -0.97], [-0.22, 0.62, -0.75], p.backlift)), batFace: [-1, 0, 0] },
  ];
  // Smith's strokes, played from where this batter is set; a plain leave; checked drives if he checks them
  const dx = setX - 0.13;
  const shots = Object.fromEntries((Object.keys(SHOTS) as BatterShot[]).map(s => {
    let keys = SHOTS[s];
    const checked = CHECKED[s];
    if (p.finish === "checked" && checked) keys = [...keys.filter(k => k.t < 0.12), ...checked];
    if (s === "leave") return [s, shiftX(BAVUMA_SHOTS.leave, setX - 0.22)];
    return [s, shiftX(keys, dx)];
  })) as Record<BatterShot, PoseKey[]>;
  return { stance, trigger, shots, scale: p.scale, skin: p.skin };
}

// ── Keyframe tracks: smooth, monotone (no overshoot, planted feet stay planted) ──
const VEC_KEYS = ["pel", "look", "batTop", "batDir", "batFace", "lPole", "rPole", "rHand", "lHand"] as const;
const NUM_KEYS = ["pelYaw", "pelTilt", "pelRoll", "chestYaw", "bend", "side", "rFree", "lFree"] as const;
const FOOT_KEYS = ["x", "z", "yaw", "lift", "heel"] as const;

function flat(p: Pose): number[] {
  const out: number[] = [];
  for (const k of VEC_KEYS) out.push(...p[k]);
  for (const k of NUM_KEYS) out.push(p[k]);
  for (const f of [p.lf, p.rf]) for (const k of FOOT_KEYS) out.push(f[k]);
  return out;
}
function unflat(a: number[]): Pose {
  let i = 0;
  const v = (): V3 => [a[i++], a[i++], a[i++]];
  const n = () => a[i++];
  const pel = v(), look = v(), batTop = v(), batDir = v(), batFace = v(), lPole = v(), rPole = v(), rHand = v(), lHand = v();
  const pelYaw = n(), pelTilt = n(), pelRoll = n(), chestYaw = n(), bend = n(), side = n(), rFree = n(), lFree = n();
  const foot = (): Foot => ({ x: n(), z: n(), yaw: n(), lift: n(), heel: n() });
  const lf = foot(), rf = foot();
  return { pel, look, batTop, batDir, batFace, lPole, rPole, rHand, lHand, pelYaw, pelTilt, pelRoll, chestYaw, bend, side, rFree, lFree, lf, rf };
}
function blendPose(a: Pose, b: Pose, t: number): Pose {
  const fa = flat(a), fb = flat(b);
  return unflat(fa.map((x, i) => x + (fb[i] - x) * t));
}

interface Track { ts: number[]; ys: number[][]; ms: number[][] }
function makeTrack(base: Pose, keys: PoseKey[], speed = SPEED): Track {
  let cur: Pose = base;
  const ts: number[] = [], ys: number[][] = [];
  for (const { t, ...rest } of keys) { cur = { ...cur, ...rest }; ts.push(t / speed); ys.push(flat(cur)); }
  const n = ts.length, dim = ys[0].length;
  const ms = ys.map(() => new Array<number>(dim).fill(0));
  for (let i = 1; i < n - 1; i++) {
    const h0 = ts[i] - ts[i - 1], h1 = ts[i + 1] - ts[i];
    for (let j = 0; j < dim; j++) {
      const d0 = (ys[i][j] - ys[i - 1][j]) / h0, d1 = (ys[i + 1][j] - ys[i][j]) / h1;
      ms[i][j] = d0 * d1 <= 0 ? 0 : (3 * (h0 + h1)) / ((2 * h1 + h0) / d0 + (h1 + 2 * h0) / d1);
    }
  }
  return { ts, ys, ms };
}
function sampleTrack(tr: Track, t: number): Pose {
  const { ts, ys, ms } = tr, n = ts.length;
  if (t <= ts[0]) return unflat(ys[0]);
  if (t >= ts[n - 1]) return unflat(ys[n - 1]);
  let i = 0;
  while (t > ts[i + 1]) i++;
  const h = ts[i + 1] - ts[i], s = (t - ts[i]) / h, s2 = s * s, s3 = s2 * s;
  const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
  return unflat(ys[i].map((y0, j) => h00 * y0 + h10 * h * ms[i][j] + h01 * ys[i + 1][j] + h11 * h * ms[i + 1][j]));
}

/** Played faster than authored: same contact moment, everything around it quicker. */
const SPEED = 1.5;

export type BatterStyle =
  | "smith" | "bavuma" | "kohli" | "root" | "latham" | "gayle" | "babar" | "sangakkara"
  | "mushfiqur" | "gurbaz" | "stirling" | "raza" | "edwards" | "generic";
const STYLES: Record<BatterStyle, StyleDef> = {
  smith: { stance: STANCE, trigger: TRIGGER, shots: SHOTS, scale: 1, skin: "#e5ad87" },
  bavuma: { stance: BAVUMA_STANCE, trigger: BAVUMA_TRIGGER, shots: BAVUMA_SHOTS, scale: 0.93, skin: "#6f4631" },
  // Kohli: on his toes, back-and-across with a front-foot press, high backlift, flowing finish
  kohli: buildStyle({ scale: 1.0, skin: "#c68d64", guard: 0.3, crouch: 0.4, open: 28, width: 0.19, move: 0.1, press: true, backlift: 0.9, finish: "high" }),
  // Root: relaxed, small back-and-across, soft hands, checks his drives
  root: buildStyle({ scale: 1.04, skin: "#ecbc98", guard: 0.3, crouch: 0.3, open: 26, width: 0.18, move: 0.08, press: false, backlift: 0.6, finish: "checked" }),
  // Latham: deep crouch, wide base, barely moves, compact
  latham: buildStyle({ scale: 1.02, skin: "#e9b490", guard: 0.33, crouch: 1, open: 10, width: 0.24, move: 0.04, press: false, backlift: 0.45, finish: "checked" }),
  // Gayle: tall, upright, wide, feet hardly move, huge backlift and finish
  gayle: buildStyle({ scale: 1.08, skin: "#4b2d1f", guard: 0.3, crouch: 0, open: 34, width: 0.25, move: 0.02, press: false, backlift: 1, finish: "high" }),
  // Babar: still and upright, a small press, high elbow, held finish
  babar: buildStyle({ scale: 1.03, skin: "#c48a5f", guard: 0.3, crouch: 0.3, open: 20, width: 0.18, move: 0.06, press: true, backlift: 0.85, finish: "high" }),
  // Sangakkara: upright and elegant, a big high backlift
  sangakkara: buildStyle({ scale: 1.03, skin: "#8f5d3d", guard: 0.3, crouch: 0.15, open: 16, width: 0.19, move: 0.08, press: true, backlift: 1, finish: "high" }),
  // Mushfiqur: short, low and busy
  mushfiqur: buildStyle({ scale: 0.92, skin: "#a56f48", guard: 0.3, crouch: 0.7, open: 22, width: 0.17, move: 0.07, press: false, backlift: 0.55, finish: "checked" }),
  // Gurbaz: wide and upright, a press forward, big swing
  gurbaz: buildStyle({ scale: 1.0, skin: "#c8946c", guard: 0.3, crouch: 0.25, open: 30, width: 0.22, move: 0.05, press: true, backlift: 0.9, finish: "high" }),
  // Stirling: tall stance, front-foot press, strong through the line
  stirling: buildStyle({ scale: 1.03, skin: "#efc3a2", guard: 0.3, crouch: 0.35, open: 24, width: 0.2, move: 0.06, press: true, backlift: 0.7, finish: "high" }),
  // Raza: balanced, a press and a full swing
  raza: buildStyle({ scale: 1.04, skin: "#c08458", guard: 0.3, crouch: 0.3, open: 24, width: 0.2, move: 0.07, press: true, backlift: 0.75, finish: "high" }),
  // Scott Edwards: compact, crouched, nudges and checks
  edwards: buildStyle({ scale: 0.97, skin: "#e8b48e", guard: 0.3, crouch: 0.5, open: 18, width: 0.18, move: 0.08, press: false, backlift: 0.6, finish: "checked" }),
  // Anyone from elsewhere
  generic: buildStyle({ scale: 1.0, skin: "#c99068", guard: 0.3, crouch: 0.3, open: 20, width: 0.19, move: 0.08, press: false, backlift: 0.7, finish: "high" }),
};
const TRACKS = Object.fromEntries((Object.keys(STYLES) as BatterStyle[]).map(st => {
  const S = STYLES[st];
  const byShot = Object.fromEntries((Object.keys(S.shots) as BatterShot[]).map(s => [s, makeTrack(S.stance, [...S.trigger, ...S.shots[s]])]));
  return [st, byShot as Record<BatterShot, Track>];
})) as Record<BatterStyle, Record<BatterShot, Track>>;

function poseAt(style: BatterStyle, shot: BatterShot, t: number): Pose { return sampleTrack(TRACKS[style][shot], t); }

function idlePose(style: BatterStyle, t: number): Pose {
  // Two little taps of the bat every few seconds, and breathing
  const base = STYLES[style].stance;
  const cyc = t % 3.4;
  const tap = cyc < 0.56 ? Math.pow(Math.sin((Math.PI * cyc) / 0.28), 2) : 0;
  return {
    ...base,
    bend: base.bend + 0.012 * Math.sin(t * 2.4),
    batTop: [base.batTop[0], base.batTop[1] + 0.045 * tap, base.batTop[2] + 0.01 * tap],
  };
}

// ── Solve a pose into joint positions ───────────────────────────────────────
function footPoints(f: Foot) {
  const T = yawDir(f.yaw), c = Math.cos(f.heel), s = Math.sin(f.heel);
  const ball: V3 = [f.x, f.lift, f.z];
  // Foot drawn in (along the toes, up), rotated about the ball of the foot so the heel lifts
  const at = (a: number, b: number): V3 => add(ball, add(mul(T, a * c + b * s), [0, -a * s + b * c, 0]));
  return {
    T, ball,
    ankle: at(-0.14, 0.085), heel: at(-0.19, 0.012), heelTop: at(-0.2, 0.08),
    toe: at(0.07, 0.012), toeTop: at(0.045, 0.05), instep: at(-0.06, 0.08),
  };
}
type FootPts = ReturnType<typeof footPoints>;

function solve(p: Pose) {
  const lf = footPoints(p.lf), rf = footPoints(p.rf);

  // Pelvis frame
  const Fp0 = yawDir(p.pelYaw);
  const Up = norm(add(mul(UP, Math.cos(p.pelTilt)), mul(Fp0, Math.sin(p.pelTilt))));
  const Rp = norm(perp(add(mul(cross(Fp0, UP), Math.cos(p.pelRoll)), mul(UP, Math.sin(p.pelRoll))), Up));
  const Fp = cross(Up, Rp);
  const pel: V3 = [...p.pel];
  const hipOff = (s: number): V3 => add(mul(Rp, s * DIM.hipHalf), mul(Up, -DIM.hipDrop));
  // If a foot is out of reach, sink the hips (bend the knees) rather than stretch the leg
  const reach = (DIM.thigh + DIM.shin) * 0.995;
  let drop = 0;
  for (const [s, f] of [[-1, lf], [1, rf]] as const) {
    const hip = add(pel, hipOff(s));
    const h2 = (hip[0] - f.ankle[0]) ** 2 + (hip[2] - f.ankle[2]) ** 2;
    const vmax = Math.sqrt(Math.max(0.0025, reach * reach - h2));
    drop = Math.max(drop, hip[1] - (f.ankle[1] + vmax));
  }
  pel[1] -= drop;
  const hipL = add(pel, hipOff(-1)), hipR = add(pel, hipOff(1));
  const kneePole = (f: FootPts): V3 => add(f.T, [0, 0.25, 0]);
  const legL = ik(hipL, lf.ankle, DIM.thigh, DIM.shin, kneePole(lf));
  const legR = ik(hipR, rf.ankle, DIM.thigh, DIM.shin, kneePole(rf));

  // Spine and shoulders
  const Fc0 = yawDir(p.chestYaw), Rc0 = cross(Fc0, UP);
  let Uc = norm(add(mul(UP, Math.cos(p.bend)), mul(Fc0, Math.sin(p.bend))));
  Uc = norm(add(mul(Uc, Math.cos(p.side)), mul(Rc0, -Math.sin(p.side))));
  const Rc = norm(perp(Rc0, Uc)), Fc = cross(Uc, Rc);
  const lumbar = madd(pel, Up, DIM.lumbar);
  const chest = madd(lumbar, Uc, DIM.spine);
  const shL = add(chest, add(mul(Rc, -DIM.shoulderHalf), mul(Uc, -0.02)));
  const shR = add(chest, add(mul(Rc, DIM.shoulderHalf), mul(Uc, -0.02)));
  const neck = madd(chest, Uc, 0.035);
  const head = add(neck, add(mul(norm(add(Uc, mul(UP, 0.7))), 0.19), mul(Fc, 0.025)));

  // Head on the ball, eyes kept level
  let hF = norm(sub(p.look, head));
  if (hF[1] < -0.75) hF = norm([hF[0], -0.75, hF[2]]);
  const hU = norm(perp(add(mul(UP, 0.8), mul(Uc, 0.2)), hF));
  const hR = cross(hF, hU);

  // Bat in both hands. The top hand must reach; then the bottom hand pulls the bat round if needed.
  let dir = norm(p.batDir);
  let top: V3 = [...p.batTop];
  const free = clamp(p.rFree, 0, 1), lFree = clamp(p.lFree, 0, 1);
  const holding: [number, V3][] = [];
  if (lFree < 0.5) holding.push([DIM.gripTop, shL]);
  if (free < 0.5) holding.push([DIM.gripBottom, shR]);
  // Slide the bat (keeping its angle) until the hands on it can hold it
  for (let i = 0; i < 6; i++) {
    let moved = false;
    for (const [g, sh] of holding) {
      const grip = madd(top, dir, g), over = len(sub(grip, sh)) - ARM_REACH;
      if (over > 0) { top = madd(top, norm(sub(sh, grip)), over + 0.002); moved = true; }
    }
    if (!moved) break;
  }

  let gL = madd(top, dir, DIM.gripTop);
  // Still out of reach: the top hand holds on and the bat turns towards the bottom hand
  if (lFree < 0.5 && len(sub(gL, shL)) > ARM_REACH) {
    const moved = madd(shL, norm(sub(gL, shL)), ARM_REACH);
    top = add(top, sub(moved, gL));
    gL = moved;
  }
  let gR = madd(top, dir, DIM.gripBottom);
  if (free < 0.5 && len(sub(gR, shR)) > ARM_REACH) {
    const q = madd(shR, norm(sub(gR, shR)), ARM_REACH);
    dir = norm(sub(q, gL));
    top = madd(gL, dir, -DIM.gripTop);
    gR = madd(top, dir, DIM.gripBottom);
  }
  const face = norm(perp(p.batFace, dir));
  const side = cross(dir, face);
  const wrist = (g: V3, sh: V3) => madd(g, norm(sub(sh, g)), DIM.hand);
  const armL = ik(shL, lerp3(wrist(gL, shL), p.lHand, lFree), DIM.upperArm, DIM.forearm, p.lPole);
  const handL = lFree < 0.5 ? gL : madd(armL.end, norm(sub(armL.end, armL.joint)), 0.055);
  const armR = ik(shR, lerp3(wrist(gR, shR), p.rHand, free), DIM.upperArm, DIM.forearm, p.rPole);
  // A free hand: the glove sits a hand's length on from the wrist
  const handR = free < 0.5 ? gR : madd(armR.end, norm(sub(armR.end, armR.joint)), 0.055);

  return {
    lf, rf, pel, Up, Rp, Fp, hipL, hipR,
    kneeL: legL.joint, ankleL: legL.end, kneeR: legR.joint, ankleR: legR.end,
    lumbar, chest, Uc, Rc, Fc, shL, shR, neck, head, hF, hU, hR,
    elL: armL.joint, wrL: armL.end, elR: armR.joint, wrR: armR.end, gL: handL, gR: handR, rFree: free, lFree,
    bat: { top, dir, face, side },
  };
}
type Skel = ReturnType<typeof solve>;

/**
 * A left-hander is the right-hander reflected across the middle-stump line (x → −x).
 * Done after solving, so the light and shadows still fall the same way as everything else.
 */
function mirrorX<T>(v: T): T {
  if (Array.isArray(v) && v.length === 3 && typeof v[0] === "number") return [-v[0], v[1], v[2]] as T;
  if (v && typeof v === "object") return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, mirrorX(x)])) as T;
  return v;
}
const skeleton = (p: Pose, leftHanded: boolean) => (leftHanded ? mirrorX(solve(p)) : solve(p));

// ── Camera: end-on, behind the bowler, a little above ───────────────────────
const CAM_ELEV = d(21), CAM_DIST = 17;
const AIM: V3 = [0, 0.85, 0];
const CAM: V3 = [0, AIM[1] + Math.sin(CAM_ELEV) * CAM_DIST, Math.cos(CAM_ELEV) * CAM_DIST];
const CF = norm(sub(AIM, CAM)), CR = norm(cross(CF, UP)), CU = cross(CR, CF);
/** Game world units per metre at the batter. */
export const SMITH_SCALE = 36;
interface P2 { x: number; y: number; z: number; k: number }
function rawProj(p: V3) {
  const v = sub(p, CAM), z = dot(v, CF), k = (SMITH_SCALE * CAM_DIST) / z;
  return { x: dot(v, CR) * k, y: -dot(v, CU) * k, z, k };
}
const ORIGIN = rawProj([0, 0, 0]);
function pr(p: V3): P2 { const q = rawProj(p); return { x: q.x - ORIGIN.x, y: q.y - ORIGIN.y, z: q.z, k: q.k }; }

// ── Paint ───────────────────────────────────────────────────────────────────
const COMMON = {
  grille: "#c4c9d0", skin: "#e5ad87", pad: "#f2f1eb", glove: "#f3f2ec", shoe: "#f0f0f0", sole: "#7d8790",
  willow: "#eed6a0", edge: "#c8a263", grip: "#1b2520",
};
export type BatterKit = "aus" | "nz" | "sa" | "ind" | "eng" | "wi" | "pak" | "sl" | "ban" | "afg" | "ire" | "zim" | "ned" | "neutral";
const KITS = {
  // Gold with green, dark green helmet
  aus: { ...COMMON, shirt: "#f2c21b", trim: "#0e5a36", trousers: "#e3b015", helmet: "#14482f", badge: "#e8c55b", sticker: "#103d29" },
  // All black with silver, black helmet
  nz: { ...COMMON, shirt: "#26292d", trim: "#9aa3ab", trousers: "#1f2226", helmet: "#1b1d20", badge: "#d5dade", sticker: "#1b1d20" },
  // Green with gold, dark green helmet
  sa: { ...COMMON, shirt: "#0f7a45", trim: "#f2b31c", trousers: "#0c6639", helmet: "#0d4a2b", badge: "#f2b31c", sticker: "#0d4a2b" },
  // Sky blue with orange, navy helmet
  ind: { ...COMMON, shirt: "#2b7bd4", trim: "#f47b20", trousers: "#1d4f9a", helmet: "#0f2a5c", badge: "#f2b632", sticker: "#0f2a5c" },
  // Navy with red
  eng: { ...COMMON, shirt: "#1b2d5e", trim: "#d7263d", trousers: "#16244b", helmet: "#101c3e", badge: "#e8c55b", sticker: "#101c3e" },
  // Maroon with gold
  wi: { ...COMMON, shirt: "#7a1f35", trim: "#f5b72a", trousers: "#5e1828", helmet: "#5a1426", badge: "#f5b72a", sticker: "#5a1426" },
  // Bright green with white
  pak: { ...COMMON, shirt: "#169446", trim: "#eef6ea", trousers: "#0f6b35", helmet: "#0b4f2a", badge: "#f0f0f0", sticker: "#0b4f2a" },
  // Royal blue with yellow
  sl: { ...COMMON, shirt: "#1f3fa8", trim: "#f5c518", trousers: "#182f80", helmet: "#13265c", badge: "#f5c518", sticker: "#13265c" },
  // Green with red
  ban: { ...COMMON, shirt: "#00704a", trim: "#e3263a", trousers: "#005a3b", helmet: "#004d33", badge: "#e3263a", sticker: "#004d33" },
  // Blue with red
  afg: { ...COMMON, shirt: "#2a5bd7", trim: "#d62828", trousers: "#1f45a6", helmet: "#14306e", badge: "#d62828", sticker: "#14306e" },
  // Green with navy
  ire: { ...COMMON, shirt: "#13a05a", trim: "#1b2f6b", trousers: "#0f7a46", helmet: "#13284f", badge: "#13a05a", sticker: "#13284f" },
  // Red with yellow, green helmet
  zim: { ...COMMON, shirt: "#c8102e", trim: "#ffd200", trousers: "#9e0d24", helmet: "#14532d", badge: "#ffd200", sticker: "#14532d" },
  // Orange with navy
  ned: { ...COMMON, shirt: "#f36c21", trim: "#1e2f6b", trousers: "#d9601a", helmet: "#1e2f6b", badge: "#f36c21", sticker: "#1e2f6b" },
  // No national kit: slate with silver
  neutral: { ...COMMON, shirt: "#475569", trim: "#cbd5e1", trousers: "#334155", helmet: "#1e293b", badge: "#cbd5e1", sticker: "#1e293b" },
};
type Kit = typeof KITS.aus;
const LS = { x: -0.55, y: -0.835 };          // towards the light, on screen
const LIGHT: V3 = norm([0.55, -1, -0.5]);    // sun rays, for the shadow on the grass

const shadeCache = new Map<string, string>();
function shade(hex: string, amt: number) {
  const key = hex + amt;
  const hit = shadeCache.get(key);
  if (hit) return hit;
  const n = parseInt(hex.slice(1), 16);
  const t = amt < 0 ? 0 : 255, a = Math.abs(amt);
  const ch = (c: number) => Math.round(c + (t - c) * a);
  const out = `rgb(${ch(n >> 16)},${ch((n >> 8) & 255)},${ch(n & 255)})`;
  shadeCache.set(key, out);
  return out;
}
const f2 = (n: number) => Math.round(n * 100) / 100;
const ptsPath = (pts: { x: number; y: number }[]) => "M" + pts.map(p => `${f2(p.x)},${f2(p.y)}`).join("L") + "Z";

function capsuleOutline(a: { x: number; y: number }, ra: number, b: { x: number; y: number }, rb: number) {
  const dx = b.x - a.x, dy = b.y - a.y, dd = Math.hypot(dx, dy);
  const pts: { x: number; y: number }[] = [];
  if (dd < Math.abs(ra - rb) + 0.01) {
    const c = ra > rb ? a : b, r = Math.max(ra, rb);
    for (let i = 0; i < 18; i++) { const t = (i / 18) * Math.PI * 2; pts.push({ x: c.x + r * Math.cos(t), y: c.y + r * Math.sin(t) }); }
    return pts;
  }
  const phi = Math.atan2(dy, dx), al = Math.acos(clamp((ra - rb) / dd, -1, 1)), N = 9;
  for (let i = 0; i <= N; i++) { const t = phi + al - (2 * al * i) / N; pts.push({ x: b.x + rb * Math.cos(t), y: b.y + rb * Math.sin(t) }); }
  for (let i = 0; i <= N; i++) { const t = phi - al - ((2 * Math.PI - 2 * al) * i) / N; pts.push({ x: a.x + ra * Math.cos(t), y: a.y + ra * Math.sin(t) }); }
  return pts;
}

function convexHull<T extends { x: number; y: number }>(ps: T[]): T[] {
  const p = [...ps].sort((a, b) => a.x - b.x || a.y - b.y);
  const cr = (o: T, a: T, b: T) => (a.x - o.x) * (b.y - o.y) - (a.y - o.y) * (b.x - o.x);
  const lower: T[] = [], upper: T[] = [];
  for (const q of p) { while (lower.length >= 2 && cr(lower[lower.length - 2], lower[lower.length - 1], q) <= 0) lower.pop(); lower.push(q); }
  for (let i = p.length - 1; i >= 0; i--) { const q = p[i]; while (upper.length >= 2 && cr(upper[upper.length - 2], upper[upper.length - 1], q) <= 0) upper.pop(); upper.push(q); }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}
function smoothClosed(h: { x: number; y: number }[]) {
  const n = h.length;
  if (n < 3) return "";
  let out = `M${f2(h[0].x)},${f2(h[0].y)}`;
  for (let i = 0; i < n; i++) {
    const p0 = h[(i - 1 + n) % n], p1 = h[i], p2 = h[(i + 1) % n], p3 = h[(i + 2) % n];
    out += `C${f2(p1.x + (p2.x - p0.x) / 6)},${f2(p1.y + (p2.y - p0.y) / 6)} ${f2(p2.x - (p3.x - p1.x) / 6)},${f2(p2.y - (p3.y - p1.y) / 6)} ${f2(p2.x)},${f2(p2.y)}`;
  }
  return out + "Z";
}

class Painter {
  items: { z: number; el: ReactElement }[] = [];
  defs: ReactElement[] = [];
  shadows: string[] = [];
  constructor(public uid: string, public kit: Kit) {}

  /** Cylinder-style shading across a shape, lit from the upper left. */
  grad(name: string, base: string, cx: number, cy: number, vx: number, vy: number, r: number) {
    const id = `${this.uid}-${name}`;
    this.defs.push(
      <linearGradient key={id} id={id} gradientUnits="userSpaceOnUse"
        x1={f2(cx - vx * r)} y1={f2(cy - vy * r)} x2={f2(cx + vx * r)} y2={f2(cy + vy * r)}>
        <stop offset="0" stopColor={shade(base, -0.42)} />
        <stop offset="0.3" stopColor={shade(base, -0.14)} />
        <stop offset="0.6" stopColor={base} />
        <stop offset="0.84" stopColor={shade(base, 0.22)} />
        <stop offset="1" stopColor={shade(base, 0.08)} />
      </linearGradient>,
    );
    return `url(#${id})`;
  }

  push(z: number, el: ReactElement) { this.items.push({ z, el }); }

  limb(name: string, a: V3, ra: number, b: V3, rb: number, color: string, zBias = 0, extra: ReactElement[] = []) {
    const A = pr(a), B = pr(b), rA = ra * A.k, rB = rb * B.k;
    let ux = B.x - A.x, uy = B.y - A.y;
    const l = Math.hypot(ux, uy) || 1; ux /= l; uy /= l;
    let vx = -uy, vy = ux;
    if (vx * LS.x + vy * LS.y < 0) { vx = -vx; vy = -vy; }
    const fill = this.grad(name, color, (A.x + B.x) / 2, (A.y + B.y) / 2, vx, vy, Math.max(rA, rB));
    this.push((A.z + B.z) / 2 + zBias,
      <g key={name}>
        <path d={ptsPath(capsuleOutline(A, rA, B, rB))} fill={fill}
          stroke={shade(color, -0.6)} strokeOpacity={0.45} strokeWidth={0.28} strokeLinejoin="round" />
        {extra}
      </g>);
    return { A, B, rA, rB, vx, vy };
  }

  blob(name: string, pts: V3[], color: string, zBias = 0, extra: ReactElement[] = [], under: ReactElement[] = []) {
    const P = pts.map(pr);
    const h = convexHull(P);
    const cx = h.reduce((s, p) => s + p.x, 0) / h.length, cy = h.reduce((s, p) => s + p.y, 0) / h.length;
    const r = Math.max(...h.map(p => Math.hypot(p.x - cx, p.y - cy)));
    const fill = this.grad(name, color, cx, cy, LS.x, LS.y, r);
    this.push(P.reduce((s, p) => s + p.z, 0) / P.length + zBias,
      <g key={name}>
        {under}
        <path d={smoothClosed(h)} fill={fill}
          stroke={shade(color, -0.6)} strokeOpacity={0.45} strokeWidth={0.28} strokeLinejoin="round" />
        {extra}
      </g>);
  }

  /** A capsule's shadow, laid flat on the grass along the sun. */
  shadow(a: V3, ra: number, b: V3, rb: number) {
    const g = (p: V3) => madd(p, LIGHT, -p[1] / LIGHT[1]);
    const ga = g(a), gb = g(b);
    let ux = gb[0] - ga[0], uz = gb[2] - ga[2];
    const l = Math.hypot(ux, uz);
    if (l < 1e-4) { ux = 1; uz = 0; } else { ux /= l; uz /= l; }
    const pts: P2[] = [];
    const arc = (c: V3, r: number, from: number) => {
      for (let i = 0; i <= 8; i++) {
        const t = from + (Math.PI * i) / 8;
        // u = along, v = across (in the ground plane)
        const cu = Math.cos(t), su = Math.sin(t);
        pts.push(pr([c[0] + (ux * cu - uz * su) * r, 0, c[2] + (uz * cu + ux * su) * r]));
      }
    };
    arc(gb, rb, -Math.PI / 2);
    arc(ga, ra, Math.PI / 2);
    this.shadows.push(ptsPath(pts));
  }
}

const ring = (c: V3, A: V3, B: V3, a: number, b: number, n = 12): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const t = (i / n) * Math.PI * 2;
    return add(c, add(mul(A, a * Math.cos(t)), mul(B, b * Math.sin(t))));
  });

/** What a figure is wearing and carrying. */
export interface Outfit {
  pads: "bat" | "keep" | "none";
  gloves: "bat" | "keep" | "none";
  head: "helmet" | "cap" | "bare";
  bat: boolean;
  ball: "" | "L" | "R";      // which hand has the ball
}
const BATTING: Outfit = { pads: "bat", gloves: "bat", head: "helmet", bat: true, ball: "" };

function paintLeg(P: Painter, tag: string, hip: V3, knee: V3, ankle: V3, foot: FootPts, pads: Outfit["pads"] = "bat") {
  P.limb(`thigh${tag}`, hip, 0.085, knee, 0.064, P.kit.trousers);
  if (pads === "none") P.limb(`shin${tag}`, knee, 0.062, ankle, 0.046, P.kit.trousers);
  else paintPad(P, tag, knee, ankle, foot, pads === "keep");
  paintShoe(P, tag, foot);
}

/** Batting pads: rigid, in front of the shin, ankle to above the knee, cane ribs and a knee roll. Keeping pads are smaller. */
function paintPad(P: Painter, tag: string, knee: V3, ankle: V3, foot: FootPts, keeping: boolean) {
  const shinUp = norm(sub(knee, ankle));
  let fwd = perp(foot.T, shinUp);
  fwd = len(fwd) < 1e-3 ? [0, 0, 1] : norm(fwd);
  const across = norm(cross(shinUp, fwd));
  const padBot = add(madd(ankle, shinUp, 0.02), mul(fwd, 0.03));
  const padTop = add(madd(knee, shinUp, keeping ? 0.07 : 0.14), mul(fwd, keeping ? 0.035 : 0.04));
  const r0 = keeping ? 0.056 : 0.066, r1 = keeping ? 0.064 : 0.08;
  const A = pr(padBot), B = pr(padTop);
  const rA = r0 * A.k, rB = r1 * B.k;
  let vx = -(B.y - A.y), vy = B.x - A.x;
  const vl = Math.hypot(vx, vy) || 1; vx /= vl; vy /= vl;
  const ribs = (keeping ? [-0.35, 0.35] : [-0.42, 0, 0.42]).map((o, i) => {
    const x1 = A.x + (B.x - A.x) * 0.12 + vx * o * rA, y1 = A.y + (B.y - A.y) * 0.12 + vy * o * rA;
    const x2 = A.x + (B.x - A.x) * 0.84 + vx * o * rB, y2 = A.y + (B.y - A.y) * 0.84 + vy * o * rB;
    return <line key={`rib${i}`} x1={f2(x1)} y1={f2(y1)} x2={f2(x2)} y2={f2(y2)} stroke={shade(P.kit.pad, -0.2)} strokeWidth={0.32} strokeLinecap="round" />;
  });
  P.limb(`pad${tag}`, padBot, r0, padTop, r1, P.kit.pad, -0.03, ribs);
  const kr = madd(knee, fwd, keeping ? 0.07 : 0.085), kw = keeping ? 0.04 : 0.05, kt = keeping ? 0.026 : 0.032;
  P.limb(`kneeRoll${tag}`, madd(kr, across, -kw), kt, madd(kr, across, kw), kt, P.kit.pad, -0.06);
}

function paintShoe(P: Painter, tag: string, foot: FootPts) {
  const sideV = norm(cross(foot.T, UP));
  const w = 0.045;
  const pts: V3[] = [];
  for (const s of [-1, 1]) {
    pts.push(madd(foot.heel, sideV, s * w * 0.8), madd(foot.heelTop, sideV, s * w * 0.7),
      madd(foot.toe, sideV, s * w * 0.75), madd(foot.toeTop, sideV, s * w * 0.6),
      madd(foot.instep, sideV, s * w * 0.8), madd(foot.ankle, sideV, s * 0.04));
  }
  const soleH = convexHull([foot.heel, foot.toe].flatMap(p => [-1, 1].map(s => pr(madd(add(p, [0, -0.012, 0]), sideV, s * w * 0.85)))));
  P.blob(`shoe${tag}`, pts, P.kit.shoe, -0.01, [], [<path key="sole" d={smoothClosed(soleH)} fill={P.kit.sole} />]);
}

function paintArm(P: Painter, tag: string, sh: V3, el: V3, wr: V3) {
  P.limb(`arm${tag}`, sh, 0.046, el, 0.04, P.kit.skin);
  P.limb(`sleeve${tag}`, sh, 0.058, lerp3(sh, el, 0.6), 0.05, P.kit.shirt, -0.004);
  P.limb(`cuff${tag}`, lerp3(sh, el, 0.53), 0.053, lerp3(sh, el, 0.6), 0.051, P.kit.trim, -0.006);
  P.limb(`fore${tag}`, el, 0.04, wr, 0.032, P.kit.skin);
}

function paintGlove(P: Painter, tag: string, grip: V3, wr: V3, b: Skel["bat"], zBias: number) {
  const pts: V3[] = [];
  for (const a of [-0.05, 0.05]) for (const w of [-0.05, 0.05]) for (const f of [-0.05, 0.035]) {
    pts.push(add(grip, add(mul(b.dir, a), add(mul(b.side, w), mul(b.face, f)))));
  }
  const toW = norm(sub(wr, grip));
  let cuffSide = cross(toW, b.dir);
  cuffSide = len(cuffSide) < 1e-3 ? b.side : norm(cuffSide);
  for (const w of [-0.042, 0.042]) pts.push(add(madd(wr, toW, -0.005), mul(cuffSide, w)));
  // Green finger rolls across the back of the glove
  const r1 = pr(add(grip, add(mul(b.face, 0.04), mul(b.side, -0.045))));
  const r2 = pr(add(grip, add(mul(b.face, 0.04), mul(b.side, 0.045))));
  const roll = <line key="roll" x1={f2(r1.x)} y1={f2(r1.y)} x2={f2(r2.x)} y2={f2(r2.y)} stroke={P.kit.trim} strokeWidth={0.9} strokeLinecap="round" opacity={0.85} />;
  P.blob(`glove${tag}`, pts, P.kit.glove, zBias, [roll]);
}

function paintFist(P: Painter, tag: string, hand: V3, wr: V3, size = 1, color = P.kit.glove, cuff?: string) {
  const a = norm(sub(hand, wr));
  let b = perp([0, 1, 0], a);
  b = norm(len(b) < 1e-3 ? perp([1, 0, 0], a) : b);
  const c = cross(a, b);
  const pts: V3[] = [];
  for (const x of [-0.045, 0.045]) for (const y of [-0.045, 0.045]) for (const z of [-0.04, 0.04]) {
    pts.push(add(hand, mul(add(mul(a, x), add(mul(b, y), mul(c, z))), size)));
  }
  pts.push(madd(wr, b, 0.035 * size), madd(wr, b, -0.035 * size));
  const extra: ReactElement[] = [];
  if (cuff) {
    const c1 = pr(add(madd(wr, a, 0.012), mul(b, 0.04 * size))), c2 = pr(add(madd(wr, a, 0.012), mul(b, -0.04 * size)));
    extra.push(<line key="cuff" x1={f2(c1.x)} y1={f2(c1.y)} x2={f2(c2.x)} y2={f2(c2.y)} stroke={cuff} strokeWidth={f2(0.03 * c1.k)} strokeLinecap="round" />);
  }
  P.blob(`glove${tag}`, pts, color, -0.03, extra);
}

/** A bare head with hair, or a cap. */
function paintHead(P: Painter, s: Skel, cap: boolean) {
  const Hc = add(s.head, mul(s.hU, 0.01));
  const C = pr(Hc), R = 0.098 * C.k;
  const toCam = norm(sub(CAM, Hc));
  const facing = dot(s.hF, toCam);
  const around = (phi: number): V3 => add(mul(s.hF, Math.cos(phi)), mul(s.hR, Math.sin(phi)));
  const els: ReactElement[] = [];
  for (const sg of [-1, 1]) {
    if (dot(mul(s.hR, sg), toCam) < -0.2) continue;
    const e = pr(madd(Hc, s.hR, sg * 0.094));
    els.push(<circle key={`ear${sg}`} cx={f2(e.x)} cy={f2(e.y)} r={f2(0.022 * C.k)} fill={shade(P.kit.skin, -0.12)} />);
  }
  const gid = `${P.uid}-head`;
  P.defs.push(
    <radialGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" cx={f2(C.x + LS.x * R * 0.4)} cy={f2(C.y + LS.y * R * 0.4)} r={f2(R * 1.3)}>
      <stop offset="0" stopColor={shade(P.kit.skin, 0.22)} />
      <stop offset="0.5" stopColor={P.kit.skin} />
      <stop offset="1" stopColor={shade(P.kit.skin, -0.45)} />
    </radialGradient>,
  );
  els.push(<circle key="skull" cx={f2(C.x)} cy={f2(C.y)} r={f2(R)} fill={`url(#${gid})`} stroke={shade(P.kit.skin, -0.55)} strokeOpacity={0.4} strokeWidth={0.25} />);
  if (facing > 0.15) {
    for (const sg of [-1, 1]) {
      const e = pr(add(Hc, add(mul(s.hF, 0.088), add(mul(s.hR, sg * 0.034), mul(s.hU, -0.005)))));
      els.push(<ellipse key={`eye${sg}`} cx={f2(e.x)} cy={f2(e.y)} rx={f2(0.012 * C.k)} ry={f2(0.008 * C.k)} fill="#2a1a12" opacity={0.85} />);
    }
  }
  // Hair, or the crown of the cap: the head above the brow (hair comes lower at the back)
  const pts: P2[] = [];
  const lats = cap ? [0.12, 0.4, 0.7, 0.92, 1] : [0.3, 0.55, 0.8, 1];
  for (const la of lats) for (let i = 0; i < 16; i++) {
    const dir = add(mul(s.hU, la), mul(around((i / 16) * Math.PI * 2), Math.sqrt(1 - la * la)));
    pts.push(pr(madd(Hc, dir, cap ? 0.106 : 0.103)));
  }
  if (!cap) for (let i = 0; i <= 8; i++) {
    const dir = add(mul(s.hU, -0.3), mul(around(Math.PI * (0.6 + (0.8 * i) / 8)), 0.954));
    pts.push(pr(madd(Hc, dir, 0.103)));
  }
  const crown = convexHull(pts);
  const cc = crown.reduce((a, p) => ({ x: a.x + p.x / crown.length, y: a.y + p.y / crown.length }), { x: 0, y: 0 });
  const crownColor = cap ? P.kit.helmet : "#23170f";
  els.push(<path key="crown" d={smoothClosed(crown)} fill={P.grad("crown", crownColor, cc.x, cc.y, LS.x, LS.y, R)} />);
  if (cap) {
    const sph = (phi: number, r: number, up: number) => pr(add(Hc, add(mul(around(phi), r), mul(s.hU, up))));
    const peak: P2[] = [];
    for (let i = 0; i <= 10; i++) peak.push(sph(d(-70 + 14 * i), 0.1, 0.03));
    for (let i = 10; i >= 0; i--) peak.push(sph(d(-58 + 11.6 * i), 0.165, 0.014));
    const peakEl = <path key="peak" d={ptsPath(peak)} fill={shade(P.kit.helmet, -0.25)} />;
    if (facing >= 0) els.push(peakEl); else els.splice(0, 0, peakEl);
  }
  P.push(C.z, <g key="head">{els}</g>);
}

/** The ball, held in a hand. */
function paintBall(P: Painter, hand: V3) {
  const B = pr(hand), r = 0.036 * B.k;
  P.push(B.z - 0.06,
    <g key="ball">
      <circle cx={f2(B.x)} cy={f2(B.y)} r={f2(r)} fill="#b3202a" stroke="#6e0f15" strokeWidth={0.2} />
      <circle cx={f2(B.x - r * 0.35)} cy={f2(B.y - r * 0.35)} r={f2(r * 0.35)} fill="#ff8a8a" opacity={0.5} />
    </g>);
}

function paintBat(P: Painter, b: Skel["bat"], toCamFace: number) {
  const at = (along: number, across: number, depth: number): V3 =>
    add(b.top, add(mul(b.dir, along), add(mul(b.side, across), mul(b.face, -depth))));
  P.limb("handle", b.top, 0.017, at(DIM.handle + 0.02, 0, 0.02), 0.016, P.kit.grip, 0.01);

  const outline: [number, number][] = [[0.3, 0.026], [0.335, 0.052], [0.42, 0.054], [0.93, 0.054], [0.963, 0.044]];
  const half = [...outline, ...[...outline].reverse().map(([s, w]) => [s, -w] as [number, number])];
  const spine = (s: number) => 0.03 + 0.03 * Math.sin(clamp((s - 0.3) / 0.62, 0, 1) * Math.PI * 0.85);
  const front = half.map(([s, w]) => at(s, w, 0));
  const back = half.map(([s, w]) => at(s, w, 0.036));
  const ridge = [0.32, 0.45, 0.6, 0.75, 0.9, 0.955].map(s => at(s, 0, spine(s)));
  const mid = pr(at(0.65, 0, 0.03));

  const edges = convexHull([...front, ...back, ...ridge].map(pr));
  const els: ReactElement[] = [
    <path key="edges" d={smoothClosed(edges)} fill={P.kit.edge} stroke={shade(P.kit.edge, -0.55)} strokeOpacity={0.5} strokeWidth={0.28} />,
  ];
  const faceFill = P.grad("blade", P.kit.willow, mid.x, mid.y, LS.x, LS.y, 0.5 * mid.k);
  if (toCamFace >= 0) {
    els.push(<path key="face" d={ptsPath(front.map(pr))} fill={faceFill} />);
  } else {
    // The back: spine ridge and a plain maker's band
    els.push(<path key="back" d={ptsPath(back.map(pr))} fill={faceFill} opacity={0.9} />);
    const band = [[0.37, 0.054], [0.5, 0.054], [0.5, -0.054], [0.37, -0.054]].map(([s, w]) => pr(at(s, w, w === 0 ? spine(s) : 0.04)));
    els.push(<path key="band" d={ptsPath(band)} fill={P.kit.sticker} opacity={0.92} />);
    const rp = ridge.map(pr);
    els.push(<polyline key="ridge" points={rp.map(p => `${f2(p.x)},${f2(p.y)}`).join(" ")} fill="none" stroke={shade(P.kit.willow, -0.3)} strokeWidth={0.35} />);
  }
  P.push(mid.z, <g key="blade">{els}</g>);
}

function paintHelmet(P: Painter, s: Skel) {
  const Hc = add(s.head, add(mul(s.hU, 0.02), mul(s.hF, -0.012)));
  const C = pr(Hc), R = 0.13 * C.k;
  const facing = dot(s.hF, norm(sub(CAM, Hc)));
  const around = (phi: number): V3 => add(mul(s.hF, Math.cos(phi)), mul(s.hR, Math.sin(phi)));
  const sph = (phi: number, r: number, up: number) => pr(add(Hc, add(mul(around(phi), r), mul(s.hU, up))));
  const els: ReactElement[] = [];

  const peak: P2[] = [];
  for (let i = 0; i <= 10; i++) peak.push(sph(d(-72 + 14.4 * i), 0.126, 0.045));
  for (let i = 10; i >= 0; i--) peak.push(sph(d(-62 + 12.4 * i), 0.195, 0.028));
  const peakEl = <path key="peak" d={ptsPath(peak)} fill={shade(P.kit.helmet, -0.3)} stroke={shade(P.kit.helmet, -0.6)} strokeWidth={0.25} />;
  if (facing < 0) els.push(peakEl);

  const gid = `${P.uid}-helm`;
  P.defs.push(
    <radialGradient key={gid} id={gid} gradientUnits="userSpaceOnUse" cx={f2(C.x + LS.x * R * 0.45)} cy={f2(C.y + LS.y * R * 0.45)} r={f2(R * 1.3)}>
      <stop offset="0" stopColor={shade(P.kit.helmet, 0.4)} />
      <stop offset="0.45" stopColor={P.kit.helmet} />
      <stop offset="1" stopColor={shade(P.kit.helmet, -0.5)} />
    </radialGradient>,
  );
  els.push(<circle key="shell" cx={f2(C.x)} cy={f2(C.y)} r={f2(R)} fill={`url(#${gid})`} stroke={shade(P.kit.helmet, -0.6)} strokeWidth={0.25} />);

  if (facing > -0.35) {
    const face: P2[] = [];
    for (let i = 0; i < 16; i++) {
      const t = (i / 16) * Math.PI * 2;
      face.push(pr(add(Hc, add(mul(s.hF, 0.095), add(mul(s.hR, 0.064 * Math.cos(t)), mul(s.hU, -0.042 + 0.07 * Math.sin(t)))))));
    }
    const fc = pr(madd(Hc, s.hF, 0.1));
    els.push(<path key="face" d={smoothClosed(face)} fill={P.grad("face", P.kit.skin, fc.x, fc.y, LS.x, LS.y, 0.07 * fc.k)} />);
    // Shadow of the peak across the eyes
    const e1 = pr(add(Hc, add(mul(s.hF, 0.105), add(mul(s.hR, -0.05), mul(s.hU, 0.0)))));
    const e2 = pr(add(Hc, add(mul(s.hF, 0.105), add(mul(s.hR, 0.05), mul(s.hU, 0.0)))));
    els.push(<line key="eyes" x1={f2(e1.x)} y1={f2(e1.y)} x2={f2(e2.x)} y2={f2(e2.y)} stroke="rgba(45,28,20,0.6)" strokeWidth={f2(0.03 * C.k)} strokeLinecap="round" />);
    // Grille
    const bar = (y: number, r: number, from: number, to: number) => {
      const pts: P2[] = [];
      for (let a = from; a <= to + 1e-6; a += 10) pts.push(sph(d(a), r, y));
      return pts.map(p => `${f2(p.x)},${f2(p.y)}`).join(" ");
    };
    const gw = f2(0.011 * C.k);
    [[-0.035, 0.138], [-0.075, 0.136], [-0.112, 0.118]].forEach(([y, r], i) =>
      els.push(<polyline key={`bar${i}`} points={bar(y, r, -80, 80)} fill="none" stroke={P.kit.grille} strokeWidth={gw} strokeLinecap="round" />));
    [-40, 0, 40].forEach((a, i) => {
      const p1 = sph(d(a), 0.138, -0.035), p2 = sph(d(a), 0.118, -0.112);
      els.push(<line key={`vbar${i}`} x1={f2(p1.x)} y1={f2(p1.y)} x2={f2(p2.x)} y2={f2(p2.y)} stroke={P.kit.grille} strokeWidth={gw} />);
    });
  }
  if (facing >= 0) els.push(peakEl);
  if (facing > 0.2) {
    const b = sph(0, 0.125, 0.075);
    els.push(<ellipse key="badge" cx={f2(b.x)} cy={f2(b.y)} rx={f2(0.02 * C.k)} ry={f2(0.024 * C.k)} fill={P.kit.badge} opacity={0.9} />);
  }
  P.push(C.z, <g key="helmet">{els}</g>);
}

function paint(s: Skel, uid: string, kit: Kit, outfit: Outfit = BATTING): ReactElement {
  const P = new Painter(uid, kit);

  // Shadow on the grass
  P.shadow(s.hipL, 0.08, s.kneeL, 0.07); P.shadow(s.kneeL, 0.08, s.ankleL, 0.065);
  P.shadow(s.hipR, 0.08, s.kneeR, 0.07); P.shadow(s.kneeR, 0.08, s.ankleR, 0.065);
  P.shadow(s.pel, 0.16, s.chest, 0.18); P.shadow(s.head, 0.13, s.head, 0.13);
  P.shadow(s.shL, 0.05, s.elL, 0.045); P.shadow(s.elL, 0.045, s.wrL, 0.04);
  P.shadow(s.shR, 0.05, s.elR, 0.045); P.shadow(s.elR, 0.045, s.wrR, 0.04);
  if (outfit.bat) {
    P.shadow(s.bat.top, 0.025, madd(s.bat.top, s.bat.dir, 0.3), 0.025);
    P.shadow(madd(s.bat.top, s.bat.dir, 0.33), 0.055, madd(s.bat.top, s.bat.dir, DIM.bat), 0.05);
  }
  P.shadow(s.lf.heel, 0.055, s.lf.toe, 0.05); P.shadow(s.rf.heel, 0.055, s.rf.toe, 0.05);

  paintLeg(P, "L", s.hipL, s.kneeL, s.ankleL, s.lf, outfit.pads);
  paintLeg(P, "R", s.hipR, s.kneeR, s.ankleR, s.rf, outfit.pads);

  // Hips, then the shirt twisting from the hips up to the shoulders
  P.blob("hips", [
    ...ring(madd(s.pel, s.Up, -0.05), s.Rp, s.Fp, 0.165, 0.115),
    ...ring(madd(s.pel, s.Up, 0.1), s.Rp, s.Fp, 0.15, 0.105),
  ], P.kit.trousers, 0.02);
  const twist = (k: number) => ({ A: norm(lerp3(s.Rp, s.Rc, k)), B: norm(lerp3(s.Fp, s.Fc, k)) });
  const slices: [V3, number, number, number][] = [
    [madd(s.pel, s.Up, 0.07), 0.155, 0.108, 0],
    [madd(s.lumbar, s.Uc, 0.12), 0.155, 0.115, 0.5],
    [madd(s.lumbar, s.Uc, 0.25), 0.175, 0.12, 1],
    [madd(s.chest, s.Uc, -0.01), 0.205, 0.085, 1],
    [madd(s.chest, s.Uc, 0.03), 0.13, 0.07, 1],
  ];
  P.blob("shirt", slices.flatMap(([c, w, dp, k]) => { const { A, B } = twist(k); return ring(c, A, B, w, dp); }), P.kit.shirt, 0);
  const collarC = madd(s.neck, s.Fc, 0.03);
  P.limb("collar", madd(collarC, s.Rc, -0.06), 0.026, madd(collarC, s.Rc, 0.06), 0.026, P.kit.trim, -0.05);
  P.limb("neck", s.neck, 0.05, madd(s.head, s.hU, -0.07), 0.047, P.kit.skin, 0.02);

  paintArm(P, "L", s.shL, s.elL, s.wrL);
  paintArm(P, "R", s.shR, s.elR, s.wrR);

  if (outfit.bat) paintBat(P, s.bat, dot(s.bat.face, norm(sub(CAM, s.bat.top))));
  const hand = (tag: "L" | "R", g: V3, wr: V3, free: number) => {
    if (outfit.gloves === "bat" && free < 0.5) paintGlove(P, tag, g, wr, s.bat, tag === "L" ? -0.03 : -0.035);
    else if (outfit.gloves === "keep") paintFist(P, tag, g, wr, 1.4, P.kit.glove, P.kit.trim);
    else if (outfit.gloves === "none") paintFist(P, tag, g, wr, 0.75, P.kit.skin);
    else paintFist(P, tag, g, wr);
  };
  hand("L", s.gL, s.wrL, s.lFree);
  hand("R", s.gR, s.wrR, s.rFree);
  if (outfit.ball) paintBall(P, outfit.ball === "R" ? s.gR : s.gL);

  if (outfit.head === "helmet") paintHelmet(P, s);
  else paintHead(P, s, outfit.head === "cap");

  P.items.sort((a, b) => b.z - a.z);
  return (
    <g>
      <defs>{P.defs}</defs>
      <g opacity={0.3} fill="#06160b">{P.shadows.map((dd, i) => <path key={i} d={dd} />)}</g>
      {P.items.map(i => i.el)}
    </g>
  );
}

/** Where the bat meets the ball, relative to the batter's spot, in game units. */
export function contactOffset(shot: BatterShot, leftHanded = false, style: BatterStyle = "smith"): { x: number; y: number } {
  let p: P2;
  if (shot === "leave") p = pr([-0.45, 0.85, -0.2]);
  else { const s = solve(poseAt(style, shot, 0)); p = pr(madd(s.bat.top, s.bat.dir, DIM.sweet)); }
  // The camera sits on the middle-stump line, so a mirrored batter is a mirrored picture
  const k = STYLES[style].scale;
  return { x: (leftHanded ? -p.x : p.x) * k, y: p.y * k };
}

/**
 * Pick the shot when the CPU is batting. `side` is the game's shot side, which is screen-based:
 * "off" goes screen-right, "leg" screen-left. For a right-hander screen-left is his off side;
 * for a left-hander it's the other way round.
 */
export function shotWhenBowledTo(
  side: "leg" | "off" | "straight",
  length: "short" | "good" | "full",
  o: { runs: number; isWicket: boolean; isExtra: boolean; description: string },
  leftHanded = false,
): BatterShot {
  if (o.isExtra) return /wide/i.test(o.description) ? "leave" : "defence";
  if (o.isWicket && /^(bowled|lbw)/i.test(o.description)) return "defence";
  if (!o.isWicket && o.runs === 0) return "defence";
  if (side === "straight") return "straightDrive";
  const toHisOffSide = (side === "leg") !== leftHanded;   // screen-left for a right-hander
  if (toHisOffSide) return length === "short" ? "cut" : "coverDrive";
  return length === "short" ? "pull" : "flick";
}

/** Pick the shot from the batting joystick (screen directions). */
export function shotForJoystick(j: string | null, leftHanded = false): BatterShot {
  if (!j || j === "straight") return "straightDrive";
  const left = j.endsWith("left"), behind = j.startsWith("top");
  const toHisOffSide = left !== leftHanded;               // screen-left is a right-hander's off side
  if (toHisOffSide) return behind ? "cut" : "coverDrive";
  return behind ? "pull" : "flick";
}

/**
 * A batter at the crease, animated. With no play he fidgets in his stance; `ready` runs his trigger
 * and holds him set; a play runs the shot so the bat meets the ball at `contactAt`.
 * Draws with its feet at (0, 0): translate it to the batter's spot.
 */
export function RiggedBatter({ play, ready = false, kit = "aus", leftHanded = false, style = "smith" }: {
  play: BatterPlay | null; ready?: boolean; kit?: BatterKit; leftHanded?: boolean; style?: BatterStyle;
}) {
  const uid = "sm" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const [now, setNow] = useState(() => performance.now());
  const st = useRef({ readyAt: -1, last: STYLES[style].stance, from: null as Pose | null, fromAt: 0, busy: false });

  useEffect(() => {
    // Full frame rate while he's playing a ball; about 30 fps while he fidgets between balls
    let id = 0, last = 0;
    const loop = (t: number) => {
      const s = st.current;
      if (s.busy || s.from || t - last > 32) { last = t; setNow(t); }
      id = requestAnimationFrame(loop);
    };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, []);

  const s = st.current;
  if (ready && s.readyAt < 0) s.readyAt = now;
  if (!ready && !play) s.readyAt = -1;

  let pose: Pose;
  if (play) {
    const set = s.readyAt >= 0 && now - s.readyAt > ((SET_T - START_T) / SPEED) * 1000;
    const t = Math.max((now - play.contactAt) / 1000, (set ? SET_T : START_T) / SPEED);
    pose = poseAt(style, play.shot, t);
    s.busy = true; s.from = null;
  } else if (ready) {
    pose = poseAt(style, "defence", Math.min(SET_T / SPEED, START_T / SPEED + (now - s.readyAt) / 1000));
    s.busy = true; s.from = null;
  } else {
    if (s.busy) { s.busy = false; s.from = s.last; s.fromAt = now; }
    const idle = idlePose(style, now / 1000);
    const k = s.from ? (now - s.fromAt) / 420 : 1;
    if (k >= 1) s.from = null;
    pose = s.from ? blendPose(s.from, idle, easeInOut(k)) : idle;
  }
  s.last = pose;
  const S = STYLES[style];
  const art = paint(skeleton(pose, leftHanded), uid, { ...KITS[kit], skin: S.skin });
  // A shorter batter: the whole figure scaled about his feet on the crease
  return S.scale === 1 ? art : <g transform={`scale(${S.scale})`}>{art}</g>;
}

// ── Running between the wickets ─────────────────────────────────────────────
/** One moment of a batter running, in his own frame: his spot on the ground is the origin. */
export interface RunFrame {
  x: number;        // sideways offset (m)
  yaw: number;      // heading: π/2 towards the bowler's end (the camera), −π/2 back towards the keeper
  phase: number;    // stride cycles so far
  pace: number;     // 0 standing … 1 flat out: arm swing, knee lift, lean
  speed: number;    // ground speed in his own frame (m/s), so planted feet don't slide
  cadence: number;  // strides (cycles) per second
  ground: number;   // 0 … 1: bat stretched out to ground it over the crease
  hands?: "bat" | "free";   // bat in the top hand (batters), or both arms pumping (bowlers)
}
const RUN_CONTACT = 0.24;   // share of a stride each foot is on the ground, flat out

function runPose(f: RunFrame): Pose {
  const Fw = yawDir(f.yaw), Rw = cross(Fw, UP);
  const k = clamp(f.pace, 0, 1), g = clamp(f.ground, 0, 1);
  const ph = f.phase - Math.floor(f.phase);
  const stanceFrac = 1 - (1 - RUN_CONTACT) * k;                 // standing still: both feet down
  const sweep = f.cadence > 0 ? (f.speed * stanceFrac) / f.cadence : 0;
  const foot = (off: number, side: number): Foot => {
    const q = (ph + off) % 1;
    let rel: number, lift = 0, heel = 0;
    if (q < stanceFrac) {                                         // on the ground, sliding back under him
      const u = q / stanceFrac;
      rel = sweep * (0.5 - u);
      heel = d(40) * k * clamp((u - 0.55) / 0.45, 0, 1);
    } else {                                                      // swinging through, knee up
      const u = (q - stanceFrac) / (1 - stanceFrac);
      rel = -sweep / 2 + sweep * easeInOut(u);
      lift = 0.34 * k * Math.sin(Math.PI * Math.min(1, u * 1.15));   // knee up, foot high
      heel = d(30) * k * (1 - u);
    }
    const p = add([f.x, 0, 0], add(mul(Fw, rel), mul(Rw, side * 0.1)));
    return { x: p[0], z: p[2], yaw: f.yaw, lift, heel };
  };
  const swing = Math.cos(2 * Math.PI * ph) * k;                  // + while the left foot is out in front
  const P: V3 = [f.x, 0.93 - 0.08 * k - 0.16 * g + 0.045 * k * Math.cos(4 * Math.PI * ph), 0];
  const down: V3 = [0, -1, 0];
  // Bat in the top hand, swinging by his side; stretched out ahead to ground it at the crease
  // Arms pump: the hand coming forward rises towards the chest
  const runHand = add(P, add(mul(Rw, -0.21), add([0, -0.06 + 0.24 * Math.max(0, -swing), 0], mul(Fw, 0.08 - 0.26 * swing))));
  const groundHand = add(P, add(mul(Rw, -0.12), add([0, -0.42, 0], mul(Fw, 0.62))));
  const hand = lerp3(runHand, groundHand, g);
  const dir = norm(lerp3(norm(add(mul(Fw, 0.55), add(mul(down, 0.85), mul(Rw, -0.08)))), norm(add(mul(Fw, 0.88), mul(down, 0.48))), g));
  return {
    pel: P, pelYaw: f.yaw + d(8) * swing, pelTilt: d(6 + 8 * k), pelRoll: d(3) * Math.sin(2 * Math.PI * ph) * k,
    chestYaw: f.yaw - d(12) * swing, bend: d(10 + 22 * k + 26 * g), side: 0,
    look: add(P, add(mul(Fw, 8), [0, 0.3, 0])),
    lf: foot(0, -1), rf: foot(0.5, 1),
    batTop: madd(hand, dir, -DIM.gripTop), batDir: dir, batFace: mul(Rw, -1),
    lPole: add(mul(Fw, -1), add(mul(Rw, -0.4), [0, -0.4, 0])),
    rPole: add(mul(Fw, -1), add(mul(Rw, 0.4), [0, -0.4, 0])),
    rFree: 1,
    rHand: add(P, add(mul(Rw, 0.22), add([0, -0.02 + 0.28 * Math.max(0, swing) - 0.2 * g, 0], mul(Fw, 0.08 + 0.26 * swing + 0.35 * g)))),
    lFree: f.hands === "free" ? 1 : 0,
    lHand: add(P, add(mul(Rw, -0.22), add([0, -0.02 + 0.28 * Math.max(0, -swing), 0], mul(Fw, 0.08 - 0.26 * swing)))),
  };
}

/** Screen units that one metre along the pitch covers in a figure's own frame (before any scaling). */
export const PITCH_DEPTH_UNITS = pr([0, 0, 1]).y;
export function styleScale(style: BatterStyle) { return STYLES[style].scale; }
/** Where his hips are at time t of a shot (m, sideways), so a run can start from there. */
export function shotHipX(style: BatterStyle, shot: BatterShot, t: number, leftHanded: boolean) {
  const x = poseAt(style, shot, t).pel[0];
  return leftHanded ? -x : x;
}

/**
 * A batter running between the wickets (or standing at the non-striker's end), drawn at his spot.
 * `from` blends him out of the shot he's just played.
 */
export function RunnerFigure({ frame, kit, style, leftHanded, uid, from }: {
  frame: RunFrame; kit: BatterKit; style: BatterStyle; leftHanded: boolean; uid: string;
  from?: { shot: BatterShot; t: number; k: number };
}) {
  const S = STYLES[style];
  // Positions are given as they appear on screen; a left-hander is drawn mirrored, so mirror them back
  let pose = runPose(leftHanded ? { ...frame, x: -frame.x, yaw: Math.PI - frame.yaw } : frame);
  if (from && from.k < 1) pose = blendPose(poseAt(style, from.shot, from.t), pose, easeInOut(clamp(from.k, 0, 1)));
  const art = paint(skeleton(pose, leftHanded), uid, { ...KITS[kit], skin: S.skin });
  return S.scale === 1 ? art : <g transform={`scale(${S.scale})`}>{art}</g>;
}

// ── For other figures (bowlers, keepers) ────────────────────────────────────
export { F as footAt, d as deg, norm as unit, lerp3, blendPose, makeTrack, sampleTrack, runPose, yawDir };
export type { Track };

export interface RigLook { kit: BatterKit; style: BatterStyle; mirror?: boolean }
/** Any pose, dressed and drawn. A mirrored figure is the right-handed pose reflected across the stumps' line. */
export function RigFigure({ pose, look, outfit, uid }: { pose: Pose; look: RigLook; outfit: Outfit; uid: string }) {
  const S = STYLES[look.style];
  const sk = solve(pose);
  const art = paint(look.mirror ? mirrorX(sk) : sk, uid, { ...KITS[look.kit], skin: S.skin }, outfit);
  return S.scale === 1 ? art : <g transform={`scale(${S.scale})`}>{art}</g>;
}
/** Where a hand is on screen, relative to the figure's spot (in game units, before the figure's perspective). */
export function handOnScreen(pose: Pose, hand: "L" | "R", look: RigLook) {
  const sk = solve(pose);
  const p = hand === "R" ? sk.gR : sk.gL;
  const q = pr(look.mirror ? [-p[0], p[1], p[2]] : p);
  const k = STYLES[look.style].scale;
  return { x: q.x * k, y: q.y * k };
}
