/**
 * Both batters: the striker at the crease and the non-striker at the bowler's end, and the two of them
 * running between the wickets after a fielded hit.
 *
 * Times are seconds after bat meets ball. Distances are metres along the pitch from the striker's
 * popping crease (the bowler's popping crease is 17.68 m away).
 */
import { useEffect, useId, useState, type ReactElement } from "react";
import { RiggedBatter, RunnerFigure, PITCH_DEPTH_UNITS, styleScale, shotHipX, type BatterKit, type BatterStyle } from "@/components/drawn-batter";
import type { DrawnBatter } from "@/components/stadium-scene";

export interface BatterLook { id: string; kit: BatterKit; style: BatterStyle; leftHanded: boolean }
/** Where the ends are on the field, and how much bigger things get towards the bowler's end. */
export interface PitchEnds { x: number; strikerY: number; bowlerY: number; perspective: (y: number) => number }

const PITCH = 17.68;
const START = 0.22;          // striker sets off once his follow-through is done
const BLEND = 0.2;           // …turning out of his shot into the run
const NS_START = 0.1;        // the non-striker is already backing up
const LEG = 1.25;            // one length
const TURN = 0.28;           // ground the bat over the line, turn, push off
const RUN_THROUGH = 0.55;    // on through the crease after the last run, slowing down
const TURN_BACK = 0.45;      // then turn round to watch
const CADENCE = 2.3;         // strides a second
const STRIKER_LANE = 34;     // game units either side of the middle of the pitch
const NON_STRIKER_LANE = 46;  // the non-striker stands on the other side of the stumps from the bowler
const NON_STRIKER_SPOT = PITCH + 0.35;   // standing behind the bowler's crease
const BACKED_UP = PITCH - 0.7;           // where he's got to as the ball is bowled

/** When the batters make their ground on the last run. */
export function lastRunMadeAt(runs: number) { return START + runs * LEG + Math.max(0, runs - 1) * TURN; }
/** When they've pulled up and turned round. */
export function runningDoneAt(runs: number) { return runs > 0 ? lastRunMadeAt(runs) + RUN_THROUGH + TURN_BACK : 0; }

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const ramp = (u: number, a: number, b: number) => clamp01((u - a) / (b - a));
const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);

/** Share of a leg covered (p) and speed in legs per leg-time (v): speed up over a, hold, ease to vEnd over b. */
function legProfile(u: number, a: number, b: number, vEnd: number) {
  const vm = 1 / (1 - a / 2 - b / 2 + (vEnd * b) / 2);
  if (u < a) return { p: (vm * u * u) / (2 * a), v: (vm * u) / a, vm };
  const pA = (vm * a) / 2;
  if (b === 0 || u < 1 - b) return { p: pA + vm * (u - a), v: vm, vm };
  const w = u - (1 - b), pB = pA + vm * (1 - a - b), dv = vm * (1 - vEnd);
  return { p: pB + vm * w - (dv * w * w) / (2 * b), v: vm - (dv * w) / b, vm };
}

interface RunnerState { z: number; v: number; yaw: number; pace: number; ground: number; drift: number }
const headingYaw = (dir: number) => (dir > 0 ? Math.PI / 2 : -Math.PI / 2);

/**
 * One batter's run: from z0, first heading d0 (+1 towards the bowler's end), setting off at t0.
 * `side` is his lane (+1 screen-right), so he turns away from the pitch, not across it.
 */
function runnerAt(t: number, runs: number, t0: number, z0: number, d0: 1 | -1, side: 1 | -1): RunnerState {
  if (t < t0) return { z: z0, v: 0, yaw: headingYaw(d0), pace: 0, ground: 0, drift: 0 };
  let from = z0, dir: number = d0;
  for (let i = 0; i < runs; i++) {
    const ls = t0 + i * (LEG + TURN), final = i === runs - 1;
    const crease = dir > 0 ? PITCH : 0;
    const to = final ? crease : crease + dir * 0.1;               // turn just over the line
    const dist = to - from;
    if (t < ls + LEG) {
      const u = (t - ls) / LEG;
      const { p, v, vm } = legProfile(u, 0.28, final ? 0.2 : 0.3, final ? 0.6 : 0.25);
      return {
        z: from + dist * p, v: (dist * v) / LEG, yaw: headingYaw(dir),
        pace: 0.3 + 0.7 * (v / vm), ground: final ? ramp(u, 0.8, 0.97) : ramp(u, 0.82, 1),
        drift: i === 0 ? ramp(u, 0, 0.45) : 1,
      };
    }
    if (final) {
      // On through the crease, slowing to a stop, then turning round to watch
      const { vm } = legProfile(1, 0.28, 0.2, 0.6);
      const vEnd = (dist * vm * 0.6) / LEG;
      const w = Math.min(t - ls - LEG, RUN_THROUGH);
      const z = to + Math.sign(dist) * (Math.abs(vEnd) * w - (Math.abs(vEnd) * w * w) / (2 * RUN_THROUGH));
      const v = vEnd * (1 - w / RUN_THROUGH);
      const back = ramp(t - ls - LEG - RUN_THROUGH, 0, TURN_BACK);
      return {
        z, v, yaw: headingYaw(dir) + Math.PI * side * dir * easeInOut(back),
        pace: w < RUN_THROUGH ? 0.3 + 0.7 * (1 - w / RUN_THROUGH) : back > 0 && back < 1 ? 0.25 : 0,
        ground: 1 - ramp(w, 0, RUN_THROUGH * 0.4), drift: 1,
      };
    }
    if (t < ls + LEG + TURN) {
      const u = (t - ls - LEG) / TURN;
      return {
        z: to, v: 0, yaw: headingYaw(dir) + Math.PI * side * dir * easeInOut(u),
        pace: 0.35, ground: 1 - ramp(u, 0, 0.6), drift: 1,
      };
    }
    from = to;
    dir = -dir;
  }
  return { z: from, v: 0, yaw: headingYaw(dir), pace: 0, ground: 0, drift: 1 };
}

/**
 * The striker and non-striker. While a ball's being played the clock runs: the non-striker backs up,
 * and after a fielded hit for runs they run, cross and make their ground.
 */
export function BatsmenAtWork({ striker, nonStriker, ends, bowlerSide = -1 }: {
  striker: DrawnBatter | null; nonStriker: BatterLook | null; ends: PitchEnds;
  bowlerSide?: number;   // which side the bowler runs in on (−1 screen-left)
}) {
  const uid = "bw" + useId().replace(/[^a-zA-Z0-9]/g, "");
  const play = striker?.play ?? null;
  const [now, setNow] = useState(() => performance.now());
  useEffect(() => {
    if (!play) return;
    let id = 0;
    const loop = (ts: number) => { setNow(ts); id = requestAnimationFrame(loop); };
    id = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(id);
  }, [play]);

  const t = play ? (now - play.contactAt) / 1000 : -99;
  const runs = play?.runs ?? 0;
  const yPerM = (ends.bowlerY - ends.strikerY) / PITCH;
  const figures: { y: number; el: ReactElement }[] = [];

  const place = (key: string, look: BatterLook, laneX: number, s: RunnerState, phaseOffset: number, frameX: number,
    from?: { shot: NonNullable<DrawnBatter["play"]>["shot"]; t: number; k: number }) => {
    const y = ends.strikerY + s.z * yPerM;
    const persp = ends.perspective(y);
    // His ground speed in his own frame, so a planted foot stays put on screen
    const speed = (Math.abs(s.v) * yPerM) / (PITCH_DEPTH_UNITS * styleScale(look.style) * persp);
    figures.push({
      y,
      el: (
        <g key={key} transform={`translate(${(ends.x + laneX).toFixed(2)}, ${y.toFixed(2)}) scale(${persp.toFixed(3)})`}>
          <RunnerFigure
            uid={`${uid}${key}`} kit={look.kit} style={look.style} leftHanded={look.leftHanded} from={from}
            frame={{ x: frameX, yaw: s.yaw, phase: t * CADENCE + phaseOffset, pace: s.pace, speed, cadence: CADENCE, ground: s.ground }}
          />
        </g>
      ),
    });
  };

  // ── Striker: at the crease in his stance and shots, or running once he's set off ──
  if (striker) {
    if (play && runs > 0 && t >= START) {
      const sSide = (bowlerSide < 0 ? -1 : 1) as 1 | -1;
      const s = runnerAt(t, runs, START, 0, 1, sSide);
      const hip = shotHipX(striker.style, play.shot, START, striker.leftHanded);
      const k = (t - START) / BLEND;
      place("s", striker, s.drift * STRIKER_LANE * sSide, s, 0, (1 - s.drift) * hip,
        k < 1 ? { shot: play.shot, t: Math.min(t, START + BLEND), k } : undefined);
    } else {
      figures.push({
        y: ends.strikerY,
        el: (
          <g key="s" transform={`translate(${ends.x}, ${ends.strikerY})`}>
            <RiggedBatter key={striker.id} play={striker.play} ready={striker.ready} kit={striker.kit} leftHanded={striker.leftHanded} style={striker.style} />
          </g>
        ),
      });
    }
  }

  // ── Non-striker: backing up as the ball's bowled, then running or standing his ground ──
  if (nonStriker) {
    let s: RunnerState;
    if (!play) {
      s = { z: NON_STRIKER_SPOT, v: 0, yaw: -Math.PI / 2, pace: 0, ground: 0, drift: 1 };
    } else if (t < 0) {
      const u = ramp(t, -0.75, -0.05);
      const z = NON_STRIKER_SPOT + (BACKED_UP - NON_STRIKER_SPOT) * easeInOut(u);
      const walking = u > 0 && u < 1;
      s = { z, v: walking ? -1.4 : 0, yaw: -Math.PI / 2, pace: walking ? 0.25 : 0, ground: 0, drift: 1 };
    } else if (runs > 0) {
      s = runnerAt(t, runs, NS_START, BACKED_UP, -1, (bowlerSide < 0 ? 1 : -1) as 1 | -1);
    } else {
      s = { z: BACKED_UP, v: 0, yaw: -Math.PI / 2, pace: 0, ground: 0, drift: 1 };
    }
    place("n", nonStriker, NON_STRIKER_LANE * (bowlerSide < 0 ? 1 : -1), s, 0.5, 0);
  }

  // Further up the pitch first, nearer the camera on top
  figures.sort((a, b) => a.y - b.y);
  return <g>{figures.map(f => f.el)}</g>;
}
