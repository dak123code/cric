import { motion, animate as animateValue } from "framer-motion";
import { useState, useRef, useCallback, useEffect } from "react";

interface StadiumSceneProps {
  ballProgress: number;       // 0 = at bowler, 1 = at batsman
  ballActive: boolean;
  batAngle: number;           // kept for compat
  shotDirection: "leg" | "straight" | "off" | null;
  isUserBatting: boolean;
  resultFlash?: string | null;
  kohliFrame?: number;        // 1–19, default 1 (stance)
  batsmanSprite?: "kohli" | "root";  // which sprite to render
  ballPing?: boolean;         // ball bounced off bat
  bowlerFrame?: number;       // 1–19 run-up frames
  // Bowling aim mode
  bowlingMode?: boolean;
  pitchTarget?: { x: number; y: number } | null;   // 0-1 normalised within pitch
  onPitchTarget?: (t: { x: number; y: number }) => void;
  // Fielding animation after a hit
  fieldingAnim?: { runs: number; shotDir: "leg" | "straight" | "off" } | null;
  fieldingKey?: number;
}

const BOWLER_X = 320;
const BOWLER_Y = 610;   // further back — visible run-up space below bowling crease
const BATSMAN_X = 320;
const BATSMAN_Y = 268;  // feet at batting crease

// Bowler sprite dimensions — smaller
const B_W = 62;
const B_H = 88;
const B_X = BOWLER_X - B_W / 2;
const B_Y = BOWLER_Y - B_H + 10; // feet land near bowling crease

// Kohli sprite position in SVG (centred on batsman position)
const K_W = 65;
const K_H = 92;
const K_X = BATSMAN_X - K_W / 2;
const K_Y = BATSMAN_Y - K_H + 14; // feet roughly at crease

// Root sprite — larger dimensions
const R_W = 92;
const R_H = 128;
const R_X = BATSMAN_X - R_W / 2;
const R_Y = BATSMAN_Y - R_H + 30;

const FIELDER_POSITIONS: [number, number, string][] = [
  [320, 158, "WK"],       // behind batting stumps
  [352, 161, "1st slip"], // off side, same depth as WK
  [490, 368, "Cover"],    // off side, well forward of batsman
  [148, 368, "Mid-wkt"],  // leg side, well forward of batsman
];

// Pitch boundaries in SVG coords
const PITCH_Y1 = 268, PITCH_Y2 = 505;  // batting crease → bowling crease

function svgCoordsFromEvent(e: React.MouseEvent<SVGSVGElement>, svgEl: SVGSVGElement) {
  const pt = svgEl.createSVGPoint();
  pt.x = e.clientX;
  pt.y = e.clientY;
  const svgP = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
  return { x: svgP.x, y: svgP.y };
}

// Pitch polygon: "280,170 360,170 395,700 245,700" (80 px top, 150 px bottom)
// At PITCH_Y1=268: xLeft≈269, xRight≈371. At PITCH_Y2=505: xLeft≈256, xRight≈384.
function svgToPitchNorm(sx: number, sy: number) {
  const tY = (sy - PITCH_Y1) / (PITCH_Y2 - PITCH_Y1);
  const xLeft  = 269 - 13 * tY;
  const xRight = 371 + 13 * tY;
  const nx = (sx - xLeft)  / (xRight - xLeft);
  const ny = (sy - PITCH_Y1) / (PITCH_Y2 - PITCH_Y1);
  return { x: Math.max(0, Math.min(1, nx)), y: Math.max(0, Math.min(1, ny)) };
}

function pitchNormToSvg(nx: number, ny: number) {
  const tY = ny;
  const xLeft  = 269 - 13 * tY;
  const xRight = 371 + 13 * tY;
  const sx = xLeft + nx * (xRight - xLeft);
  const sy = PITCH_Y1 + ny * (PITCH_Y2 - PITCH_Y1);
  return { x: sx, y: sy };
}

function isOnPitch(sx: number, sy: number) {
  if (sy < PITCH_Y1 || sy > PITCH_Y2) return false;
  const tY = (sy - PITCH_Y1) / (PITCH_Y2 - PITCH_Y1);
  const xLeft  = 269 - 13 * tY;
  const xRight = 371 + 13 * tY;
  return sx >= xLeft - 4 && sx <= xRight + 4;
}


export function StadiumScene({
  ballActive,
  shotDirection,
  isUserBatting,
  resultFlash,
  kohliFrame = 1,
  batsmanSprite = "kohli",
  ballPing = false,
  bowlerFrame = 1,
  bowlingMode = false,
  pitchTarget = null,
  onPitchTarget,
  fieldingAnim,
  fieldingKey,
}: StadiumSceneProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverSvg, setHoverSvg] = useState<{ x: number; y: number } | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!bowlingMode || !svgRef.current) return;
    const { x, y } = svgCoordsFromEvent(e, svgRef.current);
    if (isOnPitch(x, y)) {
      setHoverSvg({ x, y });
    } else {
      setHoverSvg(null);
    }
  }, [bowlingMode]);

  const handleMouseLeave = useCallback(() => {
    setHoverSvg(null);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!bowlingMode || !svgRef.current || !onPitchTarget) return;
    const { x, y } = svgCoordsFromEvent(e, svgRef.current);
    if (isOnPitch(x, y)) {
      onPitchTarget(svgToPitchNorm(x, y));
    }
  }, [bowlingMode, onPitchTarget]);

  // Convert stored normalised target back to SVG coords for rendering
  const lockedSvg = pitchTarget ? pitchNormToSvg(pitchTarget.x, pitchTarget.y) : null;

  // Camera group ref — pans/zooms SVG for outfield shots
  const cameraGroupRef = useRef<SVGGElement>(null);

  useEffect(() => {
    const el = cameraGroupRef.current;
    if (!el) return;

    if (!fieldingAnim || fieldingAnim.runs < 2) {
      el.setAttribute("transform", "");
      return;
    }

    const { shotDir } = fieldingAnim;
    const bx = shotDir === "leg" ? 90 : shotDir === "off" ? 558 : 315;
    const by = shotDir === "leg" ? 490 : shotDir === "off" ? 478 : 525;

    const mk = (cx: number, cy: number, s: number) =>
      `translate(320,350) scale(${s}) translate(${-cx},${-cy})`;
    const lr = (a: number, b: number, t: number) => a + (b - a) * t;
    const eOut = (t: number) => 1 - (1 - t) * (1 - t);
    const eIO  = (t: number) => t < 0.5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);

    const ctrl = animateValue(0, 1, {
      duration: 2.5,
      ease: "linear",
      onUpdate: (p) => {
        let cx: number, cy: number, s: number;
        if (p < 0.30) {
          // 0–0.75s: pan to outfield destination
          const t = eOut(p / 0.30);
          cx = lr(320, bx, t); cy = lr(350, by, t); s = lr(1.0, 1.35, t);
        } else if (p < 0.52) {
          // 0.75–1.3s: hold on outfielder picking up
          cx = bx; cy = by; s = 1.35;
        } else if (p < 0.72) {
          // 1.3–1.8s: pan toward WK as ball is thrown
          const t = eIO((p - 0.52) / 0.20);
          cx = lr(bx, 320, t); cy = lr(by, 220, t); s = lr(1.35, 1.15, t);
        } else {
          // 1.8–2.5s: gracefully return to normal view
          const t = eIO((p - 0.72) / 0.28);
          cx = 320; cy = lr(220, 350, t); s = lr(1.15, 1.0, t);
        }
        el.setAttribute("transform", mk(cx, cy, s));
      },
      onComplete: () => el.setAttribute("transform", ""),
    });

    return () => ctrl.stop();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fieldingKey, fieldingAnim]);

  // Ping direction offsets
  const pingDX =
    shotDirection === "leg" ? -130 :
    shotDirection === "off" ? 130 : 0;
  const pingDY = -110;

  return (
    <div
      className="relative w-full"
      style={{ aspectRatio: "640/700", cursor: bowlingMode ? "none" : "default" }}
    >
      <svg
        ref={svgRef}
        viewBox="0 0 640 700"
        className="w-full h-full"
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <g ref={cameraGroupRef}>
        {/* Dark fallback for any camera pan beyond the normal viewport */}
        <rect x="-800" y="-800" width="2240" height="2300" fill="#0a1628" />
        <defs>
          <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0a1628" />
            <stop offset="60%" stopColor="#1a2f55" />
            <stop offset="100%" stopColor="#1e3d6e" />
          </linearGradient>
          <linearGradient id="grass" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d3d0d" />
            <stop offset="100%" stopColor="#1a5c1a" />
          </linearGradient>
          <linearGradient id="pitch" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#b8974e" />
            <stop offset="100%" stopColor="#c8a865" />
          </linearGradient>
          <radialGradient id="ballGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ff4444" />
            <stop offset="100%" stopColor="#cc0000" />
          </radialGradient>
        </defs>

        {/* Sky */}
        <rect width="640" height="700" fill="url(#sky)" />

        {/* Stars */}
        {[
          [60, 30], [120, 20], [200, 45], [300, 15], [420, 35],
          [520, 25], [580, 50], [80, 70], [450, 55], [350, 40],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1} fill="white" opacity={0.6} />
        ))}

        {/* Stadium lights — high in sky, indicating distance */}
        <ellipse cx="90" cy="60" rx="6" ry="6" fill="#ffffaa" opacity={0.9} />
        <ellipse cx="550" cy="60" rx="6" ry="6" fill="#ffffaa" opacity={0.9} />
        <line x1="90" y1="66" x2="90" y2="96" stroke="#888" strokeWidth="3" />
        <line x1="550" y1="66" x2="550" y2="96" stroke="#888" strokeWidth="3" />
        <ellipse cx="90" cy="63" rx="20" ry="8" fill="#ffffaa" opacity={0.12} />
        <ellipse cx="550" cy="63" rx="20" ry="8" fill="#ffffaa" opacity={0.12} />

        {/* Stands – Left (compact — they're 60 m away) */}
        <polygon points="0,152 192,126 158,93 0,93" fill="#1a1a2e" />
        {[99, 107, 115, 123, 131].map((y, row) =>
          Array.from({ length: 18 }).map((_, i) => (
            <circle
              key={`cl${row}${i}`}
              cx={10 + i * 10 + (row % 2) * 4}
              cy={y}
              r={3}
              fill={["#c0392b", "#2980b9", "#f1c40f", "#27ae60", "#8e44ad"][i % 5]}
              opacity={0.7}
            />
          ))
        )}

        {/* Stands – Right (compact — they're 60 m away) */}
        <polygon points="640,152 448,126 482,93 640,93" fill="#1a1a2e" />
        {[99, 107, 115, 123, 131].map((y, row) =>
          Array.from({ length: 18 }).map((_, i) => (
            <circle
              key={`cr${row}${i}`}
              cx={452 + i * 10 + (row % 2) * 4}
              cy={y}
              r={3}
              fill={["#e74c3c", "#3498db", "#f39c12", "#2ecc71", "#9b59b6"][i % 5]}
              opacity={0.7}
            />
          ))
        )}

        {/* Advertising boards */}
        <rect x="0" y="137" width="192" height="11" fill="#e74c3c" rx="2" />
        <text x="96" y="146" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
          CRICKET MANAGER
        </text>
        <rect x="448" y="137" width="192" height="11" fill="#2980b9" rx="2" />
        <text x="544" y="146" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">
          LIVE CRICKET
        </text>

        {/* Outfield — vastly larger so field extends well off-screen, matching
            real cricket proportions: 120 m diameter field vs 20 m pitch */}
        <ellipse cx="320" cy="460" rx="800" ry="312" fill="url(#grass)" />
        {Array.from({ length: 8 }).map((_, i) => (
          <ellipse
            key={i}
            cx="320"
            cy="460"
            rx={750 - i * 85}
            ry={287 - i * 32}
            fill="none"
            stroke="#1f5c1f"
            strokeWidth={20}
            opacity={0.28}
          />
        ))}

        {/* Pitch — 80 px wide at top, extends to bottom of taller canvas */}
        <polygon points="280,170 360,170 395,700 245,700" fill="url(#pitch)" />

        {/* Batting crease */}
        <line x1="267" y1="268" x2="373" y2="268" stroke="white" strokeWidth="1.5" />
        {/* Bowling crease */}
        <line x1="254" y1="505" x2="386" y2="505" stroke="white" strokeWidth="1.5" />

        {/* Stumps at batsman end */}
        <line x1="312" y1="242" x2="312" y2="268" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="320" y1="240" x2="320" y2="268" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="328" y1="242" x2="328" y2="268" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="310" y1="242" x2="322" y2="240" stroke="#ff6090" strokeWidth="2.5" />
        <line x1="318" y1="240" x2="330" y2="242" stroke="#ff6090" strokeWidth="2.5" />

        {/* Stumps at bowling end */}
        <line x1="315" y1="499" x2="315" y2="524" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="320" y1="497" x2="320" y2="524" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="325" y1="499" x2="325" y2="524" stroke="#ff6090" strokeWidth="3.5" />
        <line x1="313" y1="499" x2="322" y2="497" stroke="#ff6090" strokeWidth="2.5" />
        <line x1="318" y1="497" x2="327" y2="499" stroke="#ff6090" strokeWidth="2.5" />

        {/* Fielders — hide infielder only when they're actively chasing (runs ≤ 1) */}
        {(() => {
          const animIdx = (fieldingAnim && fieldingAnim.runs <= 1)
            ? (fieldingAnim.shotDir === "off" ? 2 : fieldingAnim.shotDir === "leg" ? 3 : -1)
            : -1;
          return FIELDER_POSITIONS.map(([x, y], i) =>
            fieldingAnim && i === animIdx ? null : (
              <g key={i}>
                <circle cx={x} cy={y} r={5} fill="white" opacity={0.9} />
                <circle cx={x} cy={y} r={5} fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth={1} />
              </g>
            )
          );
        })()}

        {/* ── BATSMAN ── */}
        {isUserBatting ? (
          <image
            href={
              batsmanSprite === "root"
                ? `/images/root/root-${kohliFrame}.png`
                : `/images/kohli/kohli-${kohliFrame}.png`
            }
            x={batsmanSprite === "root" ? R_X : K_X}
            y={batsmanSprite === "root" ? R_Y : K_Y}
            width={batsmanSprite === "root" ? R_W : K_W}
            height={batsmanSprite === "root" ? R_H : K_H}
          />
        ) : (
          // Generic opposition batsman when user bowls
          <g transform={`translate(${BATSMAN_X}, ${BATSMAN_Y - 10}) scale(1.22)`}>
            {/* Pads */}
            <rect x="-9" y="2" width="8" height="14" fill="#e2e8f0" rx="2" />
            <rect x="2" y="2" width="8" height="14" fill="#e2e8f0" rx="2" />
            {/* Legs */}
            <line x1="-4" y1="-2" x2="-6" y2="16" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
            <line x1="4" y1="-2" x2="7" y2="16" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
            {/* Body */}
            <rect x="-7" y="-22" width="14" height="20" fill="#1e3a8a" rx="2" />
            {/* Bat arm */}
            <line x1="7" y1="-18" x2="17" y2="-6" stroke="#1e3a8a" strokeWidth="5" strokeLinecap="round" />
            {/* Bat */}
            <rect x="15" y="-14" width="7" height="22" fill="#c8a865" rx="2" transform="rotate(-20, 15, -14)" />
            {/* Other arm guiding */}
            <line x1="-7" y1="-16" x2="-15" y2="-8" stroke="#1e3a8a" strokeWidth="4" strokeLinecap="round" />
            {/* Head with helmet */}
            <circle cx="0" cy="-34" r="10" fill="#172554" />
            {/* Helmet peak */}
            <path d="M -10,-34 Q -14,-28 -6,-26" fill="#172554" />
            {/* Grill */}
            <line x1="-10" y1="-30" x2="-6" y2="-24" stroke="#64748b" strokeWidth="1.5" />
            <line x1="-8" y1="-31" x2="-4" y2="-25" stroke="#64748b" strokeWidth="1.5" />
            {/* Face */}
            <circle cx="2" cy="-33" r="6" fill="#8B6914" />
          </g>
        )}

        {/* ── BOWLER SPRITE (Shaheen Afridi run-up frames) ── */}
        <image
          href={`/images/bowler/bowler-${bowlerFrame}.png`}
          x={B_X}
          y={B_Y}
          width={B_W}
          height={B_H}
          preserveAspectRatio="xMidYMax meet"
        />

        {/* ── DELIVERY BALL ── */}
        {ballActive && (
          <motion.circle
            cx={BOWLER_X}
            cy={BOWLER_Y}
            r={5}
            fill="url(#ballGlow)"
            stroke="#cc0000"
            strokeWidth={1}
            initial={{ cx: BOWLER_X, cy: BOWLER_Y }}
            animate={{ cx: BATSMAN_X, cy: BATSMAN_Y - 15 }}
            transition={{ duration: 0.52, ease: "easeIn" }}
          />
        )}

        {/* ── BALL PING (bounces off bat) ── */}
        {ballPing && (
          <motion.circle
            r={6}
            fill="url(#ballGlow)"
            stroke="#ffcc00"
            strokeWidth={1.5}
            initial={{ cx: BATSMAN_X, cy: BATSMAN_Y - 15, opacity: 1, scale: 1 }}
            animate={{
              cx: BATSMAN_X + pingDX,
              cy: BATSMAN_Y - 15 + pingDY,
              opacity: 0,
              scale: 0.5,
            }}
            transition={{ duration: 0.55, ease: "easeOut" }}
          />
        )}

        {/* ── FIELDING ANIMATION ── */}
        {fieldingAnim && (
          <FieldingAnimation key={fieldingKey} runs={fieldingAnim.runs} shotDir={fieldingAnim.shotDir} />
        )}

        {/* ── BOWLING AIM: hover ghost + locked target ── */}
        {bowlingMode && hoverSvg && (
          <g pointerEvents="none">
            {/* Outer ring */}
            <circle
              cx={hoverSvg.x}
              cy={hoverSvg.y}
              r={10}
              fill="none"
              stroke="rgba(255,255,255,0.85)"
              strokeWidth={1.5}
              strokeDasharray="3 2"
            />
            {/* Gap for ball — inner cutout shows via transparency */}
            <circle
              cx={hoverSvg.x}
              cy={hoverSvg.y}
              r={4.5}
              fill="rgba(255,255,255,0.12)"
              stroke="rgba(255,255,255,0.5)"
              strokeWidth={1}
            />
            {/* Crosshair ticks */}
            <line x1={hoverSvg.x - 14} y1={hoverSvg.y} x2={hoverSvg.x - 11} y2={hoverSvg.y} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
            <line x1={hoverSvg.x + 11} y1={hoverSvg.y} x2={hoverSvg.x + 14} y2={hoverSvg.y} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
            <line x1={hoverSvg.x} y1={hoverSvg.y - 14} x2={hoverSvg.x} y2={hoverSvg.y - 11} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
            <line x1={hoverSvg.x} y1={hoverSvg.y + 11} x2={hoverSvg.x} y2={hoverSvg.y + 14} stroke="rgba(255,255,255,0.6)" strokeWidth={1} />
          </g>
        )}

        {bowlingMode && lockedSvg && (
          <g pointerEvents="none">
            {/* Locked outer ring — orange accent */}
            <circle
              cx={lockedSvg.x}
              cy={lockedSvg.y}
              r={10}
              fill="none"
              stroke="#ff7820"
              strokeWidth={2}
            />
            {/* Ball space inside */}
            <circle
              cx={lockedSvg.x}
              cy={lockedSvg.y}
              r={4.5}
              fill="rgba(255,120,30,0.25)"
              stroke="#ff7820"
              strokeWidth={1.2}
            />
            {/* Pulsing glow ring */}
            <circle
              cx={lockedSvg.x}
              cy={lockedSvg.y}
              r={13}
              fill="none"
              stroke="rgba(255,120,30,0.35)"
              strokeWidth={3}
            />
          </g>
        )}

        {/* Result flash */}
        {resultFlash && (
          <motion.text
            x="320"
            y="200"
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
            initial={{ opacity: 0, y: 210 }}
            animate={{ opacity: 1, y: 195 }}
            exit={{ opacity: 0 }}
          >
            {resultFlash}
          </motion.text>
        )}
        </g>
      </svg>
    </div>
  );
}

// ── Fielding animation: scales behaviour to runs scored ──
//  0 = dot: infielder walks to short ball
//  1 = infielder dives to stop it, throws back
//  2-3 = ball beats infield, deep outfielder chases, throws back
function FieldingAnimation({ runs, shotDir }: { runs: number; shotDir: "leg" | "straight" | "off" }) {
  const BAT_X = 320, BAT_Y = 253;
  const WK_X = 320, WK_Y = 158;

  // Infield home positions (Mid-wkt / Cover / bowling-end)
  const fx = shotDir === "leg" ? 148 : shotDir === "off" ? 490 : 320;
  const fy = shotDir === "leg" ? 368 : shotDir === "off" ? 368 : 480;

  // Ball destination — scales with runs (harder hit = further)
  const bx =
    runs >= 2 ? (shotDir === "leg" ? 90  : shotDir === "off" ? 558 : 315)
    : runs === 1 ? (shotDir === "leg" ? 115 : shotDir === "off" ? 530 : 320)
    :               (shotDir === "leg" ? 225 : shotDir === "off" ? 418 : 320);

  const by =
    runs >= 2 ? (shotDir === "leg" ? 490 : shotDir === "off" ? 478 : 525)
    : runs === 1 ? (shotDir === "leg" ? 418 : shotDir === "off" ? 412 : 472)
    :               (shotDir === "leg" ? 318 : shotDir === "off" ? 318 : 358);

  // Deep outfielder (boundary rider) — well away from the ball stop point
  const ox = shotDir === "leg" ? 55  : shotDir === "off" ? 590 : 305;
  const oy = shotDir === "leg" ? 555 : shotDir === "off" ? 540 : 575;

  const isOutfield = runs >= 2;

  // Ball speed tied to shot power — faster for more runs, but all slower overall
  const ballDur = runs >= 2 ? 0.78 : runs === 1 ? 0.58 : 0.42;

  // Fielder speed also tied to urgency — but outfielder has further to run
  const fielderDur = runs >= 2 ? 2.1 : runs === 1 ? 1.85 : 1.6;

  // Throw-back timing: outfield needs longer to reach the ball
  const throwDelay = runs >= 2 ? 1.15 : 0.88;

  // Run text appears just after the throw
  const textDelay = throwDelay + 0.05;

  return (
    <>
      {/* Ball: bat → field destination */}
      <motion.circle
        cx={BAT_X} cy={BAT_Y} r={5}
        fill="#cc2200" stroke="#ff4444" strokeWidth={1.5}
        style={{ filter: "drop-shadow(0 0 5px rgba(255,80,80,0.8))" }}
        initial={{ cx: BAT_X, cy: BAT_Y, opacity: 1 }}
        animate={{ cx: bx, cy: by, opacity: [1, 1, 0] }}
        transition={{ duration: ballDur, ease: "easeOut", opacity: { times: [0, 0.55, 1] } }}
      />

      {!isOutfield ? (
        <>
          {/* Infielder chases ball and returns */}
          <motion.circle
            cx={fx} cy={fy} r={5.5} fill="white" opacity={0.95}
            initial={{ cx: fx, cy: fy }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            animate={{ cx: [fx, bx, fx] as any, cy: [fy, by, fy] as any }}
            transition={{ delay: 0.12, duration: fielderDur, times: [0, 0.44, 1], ease: "easeInOut" }}
          />
          {/* Throw back to WK */}
          <motion.circle
            cx={bx} cy={by} r={4} fill="#cc2200" stroke="#ff4444" strokeWidth={1}
            initial={{ cx: bx, cy: by, opacity: 0 }}
            animate={{ cx: WK_X, cy: WK_Y, opacity: [0, 1, 1, 0] }}
            transition={{ delay: throwDelay, duration: 0.45, ease: "easeIn", opacity: { times: [0, 0.1, 0.8, 1] } }}
          />
        </>
      ) : (
        <>
          {/* Deep outfielder sprints to ball and returns */}
          <motion.circle
            cx={ox} cy={oy} r={5.5} fill="white" opacity={0.85}
            initial={{ cx: ox, cy: oy }}
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            animate={{ cx: [ox, bx, ox] as any, cy: [oy, by, oy] as any }}
            transition={{ delay: 0.22, duration: fielderDur, times: [0, 0.43, 1], ease: "easeInOut" }}
          />
          {/* Throw back from outfielder */}
          <motion.circle
            cx={bx} cy={by} r={4} fill="#cc2200" stroke="#ff4444" strokeWidth={1}
            initial={{ cx: bx, cy: by, opacity: 0 }}
            animate={{ cx: WK_X, cy: WK_Y, opacity: [0, 1, 1, 0] }}
            transition={{ delay: throwDelay, duration: 0.55, ease: "easeIn", opacity: { times: [0, 0.1, 0.8, 1] } }}
          />
        </>
      )}

      {/* Run count — positioned near ball for outfield, above pitch for infield */}
      {runs > 0 && (
        <motion.text
          x={isOutfield ? bx : 320}
          y={isOutfield ? by - 30 : 215}
          textAnchor="middle"
          fontSize={42} fontWeight="900"
          fill={runs >= 2 ? "#fde68a" : "white"}
          stroke="rgba(0,0,0,0.85)" strokeWidth={3} paintOrder="stroke"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1, 1, 0] }}
          transition={{ delay: textDelay, duration: 1.3, times: [0, 0.12, 0.65, 1] }}
        >
          {runs === 1 ? "1 RUN" : `${runs} RUNS`}
        </motion.text>
      )}
    </>
  );
}
