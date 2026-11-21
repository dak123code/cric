import { cn } from "@/lib/utils";

export type CardType = "normal" | "totw" | "prime" | "icon" | "mw" | "mw-icon" | "bazball";

export interface CardPlayer {
  id: number;
  name: string;
  role: string;
  country: string;
  battingRating: number;
  bowlingRating: number;
  keepingRating: number;
  overallRating: number;
  age: number;
  salary?: number;
}

const ROLE_ABBREV: Record<string, string> = {
  batsman: "BAT",
  bowler: "BWL",
  allrounder: "ALL",
  wicketkeeper: "WK",
};

const ROLE_EMOJI: Record<string, string> = {
  batsman: "🏏",
  bowler: "⚾",
  allrounder: "⚡",
  wicketkeeper: "🧤",
};

// Player headshot images — keyed by player ID (covers all card variants of that player)
const PLAYER_HEADSHOTS: Record<number, string> = {
  801:  "/images/players/jimmy-anderson.png",
  1016: "/images/players/jimmy-anderson.png",
  2009: "/images/players/jacques-kallis.png",
};

const FLAG: Record<string, string> = {
  India: "🇮🇳",
  Australia: "🇦🇺",
  England: "🏴󠁧󠁢󠁥󠁮󠁧󠁿",
  Pakistan: "🇵🇰",
  "New Zealand": "🇳🇿",
  "South Africa": "🇿🇦",
  "West Indies": "🏝️",
  "Sri Lanka": "🇱🇰",
  Bangladesh: "🇧🇩",
  Afghanistan: "🇦🇫",
  Singapore: "🇸🇬",
};

interface CricketCardProps {
  player: CardPlayer;
  cardType?: CardType;
  customRating?: number;
  size?: "xs" | "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const SIZES = {
  xs: {
    card: "w-[100px] h-[141px]",
    rating: "text-[18px]",
    roleText: "text-[7px]",
    icon: "text-[26px]",
    flag: "text-[11px]",
    name: "text-[8px]",
    stat: "text-[7px]",
    statLabel: "text-[5px]",
    px: "px-1.5",
    pt: "pt-1.5",
    mx: "mx-1",
    mb: "mb-1",
    namePy: "py-[2px]",
    statPy: "py-[1px]",
  },
  sm: {
    card: "w-[130px] h-[184px]",
    rating: "text-[22px]",
    roleText: "text-[8px]",
    icon: "text-[36px]",
    flag: "text-[14px]",
    name: "text-[9px]",
    stat: "text-[8px]",
    statLabel: "text-[6px]",
    px: "px-2",
    pt: "pt-2",
    mx: "mx-1.5",
    mb: "mb-1.5",
    namePy: "py-[3px]",
    statPy: "py-[2px]",
  },
  md: {
    card: "w-[165px] h-[232px]",
    rating: "text-[30px]",
    roleText: "text-[10px]",
    icon: "text-[48px]",
    flag: "text-[20px]",
    name: "text-[11px]",
    stat: "text-[9px]",
    statLabel: "text-[7px]",
    px: "px-2.5",
    pt: "pt-2.5",
    mx: "mx-2",
    mb: "mb-2",
    namePy: "py-[4px]",
    statPy: "py-[3px]",
  },
  lg: {
    card: "w-[220px] h-[308px]",
    rating: "text-[40px]",
    roleText: "text-[12px]",
    icon: "text-[64px]",
    flag: "text-[26px]",
    name: "text-[13px]",
    stat: "text-[11px]",
    statLabel: "text-[8px]",
    px: "px-3",
    pt: "pt-3",
    mx: "mx-2.5",
    mb: "mb-2.5",
    namePy: "py-[5px]",
    statPy: "py-[4px]",
  },
};

function r10(v: number) { return Math.min(99, Math.ceil(v / 10)); }

/**
 * Look for a normal (non-special) card, by its displayed rating. Splits match the
 * game's Gold/Silver/Bronze packs and the "Gold (75+)" SBC rules.
 */
export type BaseTier = "gold" | "silver" | "bronze";
export function baseTierFor(rating: number): BaseTier {
  if (rating >= 75) return "gold";
  if (rating >= 65) return "silver";
  return "bronze";
}

interface BaseStyle {
  bg: string; border: string; shadow: string; sheen: string;
  rating: string; role: string;
  plate: string; bar: string; barTop: string; stat: string; statLabel: string;
}

// Deliberately flat and muted (no stripes or glow) so special cards still stand out.
const BASE_STYLE: Record<BaseTier, BaseStyle> = {
  // 75+: antique champagne
  gold: {
    bg: "linear-gradient(160deg, #6e5d3a 0%, #5a4b2d 45%, #463a22 100%)",
    border: "1.5px solid rgba(231,211,160,0.55)",
    shadow: "shadow-[0_4px_18px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_28px_rgba(231,211,160,0.3)]",
    sheen: "rgba(255,240,205,0.14)",
    rating: "text-[#f4e4b8]", role: "text-[#cdb47c]",
    plate: "rgba(36,28,14,0.72)", bar: "rgba(36,28,14,0.55)", barTop: "1px solid rgba(231,211,160,0.2)",
    stat: "text-[#f6ecd2]", statLabel: "text-[#bfa56e]",
  },
  // 65–74: cool pewter with ivory type
  silver: {
    bg: "linear-gradient(160deg, #5b6068 0%, #4a4e56 45%, #3a3d44 100%)",
    border: "1.5px solid rgba(228,231,236,0.4)",
    shadow: "shadow-[0_4px_18px_rgba(0,0,0,0.55)] hover:shadow-[0_6px_28px_rgba(228,231,236,0.2)]",
    sheen: "rgba(255,255,255,0.1)",
    rating: "text-[#f5f2ea]", role: "text-[#b9bec7]",
    plate: "rgba(22,24,28,0.7)", bar: "rgba(22,24,28,0.5)", barTop: "1px solid rgba(228,231,236,0.15)",
    stat: "text-[#f5f2ea]", statLabel: "text-[#a1a7b0]",
  },
  // Under 65: dark cocoa with clay type
  bronze: {
    bg: "linear-gradient(160deg, #4b3022 0%, #3b2519 45%, #2a1910 100%)",
    border: "1.5px solid rgba(204,142,100,0.42)",
    shadow: "shadow-[0_4px_18px_rgba(0,0,0,0.6)] hover:shadow-[0_6px_28px_rgba(204,142,100,0.22)]",
    sheen: "rgba(255,220,190,0.08)",
    rating: "text-[#ebb991]", role: "text-[#b98462]",
    plate: "rgba(24,13,7,0.7)", bar: "rgba(24,13,7,0.5)", barTop: "1px solid rgba(204,142,100,0.18)",
    stat: "text-[#f3dccb]", statLabel: "text-[#ad7c5c]",
  },
};

function getStats(player: CardPlayer) {
  const bat = r10(player.battingRating);
  const bowl = r10(player.bowlingRating);
  const wk = r10(player.keepingRating);
  const ovr = r10(player.overallRating);
  const fld = Math.min(99, Math.ceil(player.overallRating * 0.9 / 10));

  if (player.role === "wicketkeeper") {
    return [{ l: "BAT", v: bat }, { l: "WK", v: wk }, { l: "FLD", v: fld }, { l: "OVR", v: ovr }];
  }
  if (player.role === "bowler") {
    return [{ l: "BWL", v: bowl }, { l: "PAC", v: Math.min(99, bowl + 2) }, { l: "BAT", v: bat }, { l: "OVR", v: ovr }];
  }
  return [{ l: "BAT", v: bat }, { l: "BWL", v: bowl || fld }, { l: "FLD", v: fld }, { l: "OVR", v: ovr }];
}

export function CricketCard({ player, cardType = "normal", customRating, size = "md", onClick, className }: CricketCardProps) {
  const isTOTW    = cardType === "totw";
  const isPrime   = cardType === "prime";
  const isIcon    = cardType === "icon";
  const isMW      = cardType === "mw";
  const isMWIcon  = cardType === "mw-icon";
  const isBazBall = cardType === "bazball";

  const rating = customRating !== undefined ? Math.ceil(customRating / 10) : r10(player.overallRating);
  const base = cardType === "normal" ? BASE_STYLE[baseTierFor(rating)] : null;
  const s = SIZES[size];
  const stats = getStats(player);

  return (
    <div
      className={cn(
        "relative rounded-xl overflow-hidden cursor-pointer select-none flex flex-col",
        "transition-all duration-300 hover:scale-105 hover:-translate-y-1",
        isTOTW    ? "shadow-[0_0_28px_rgba(59,130,246,0.75)] hover:shadow-[0_0_50px_rgba(96,165,250,1)]"
        : isPrime ? "shadow-[0_0_28px_rgba(251,191,36,0.65)] hover:shadow-[0_0_48px_rgba(251,191,36,0.95)]"
        : isIcon  ? "shadow-[0_0_36px_rgba(168,85,247,0.7)] hover:shadow-[0_0_60px_rgba(168,85,247,1)]"
        : isMW    ? "shadow-[0_0_28px_rgba(220,38,38,0.65)] hover:shadow-[0_0_50px_rgba(239,68,68,0.95)]"
        : isMWIcon? "shadow-[0_0_40px_rgba(168,85,247,0.65),0_0_28px_rgba(220,38,38,0.55)] hover:shadow-[0_0_70px_rgba(168,85,247,0.95),0_0_50px_rgba(239,68,68,0.85)]"
        : isBazBall ? "shadow-[0_0_36px_rgba(34,197,94,0.55),0_0_18px_rgba(168,85,247,0.3)] hover:shadow-[0_0_60px_rgba(34,197,94,0.85),0_0_30px_rgba(168,85,247,0.45)]"
        : base      ? base.shadow
        : "shadow-[0_4px_20px_rgba(0,0,0,0.6)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.8)]",
        s.card,
        className
      )}
      style={{
        background:
          isTOTW    ? "linear-gradient(148deg, #1a4fd8 0%, #2660f0 30%, #1c4fd8 60%, #1030a8 100%)"
          : isPrime ? "linear-gradient(148deg, #3d2a00 0%, #2a1c00 30%, #1e1400 60%, #100a00 100%)"
          : isIcon  ? "linear-gradient(148deg, #1a0030 0%, #2d0050 25%, #1a0040 55%, #0d0020 100%)"
          : isMW    ? "linear-gradient(148deg, #3d0808 0%, #5c0f0f 25%, #400808 55%, #1a0202 100%)"
          : isMWIcon? "linear-gradient(148deg, #1a0030 0%, #2d0050 18%, #350012 38%, #200030 60%, #0d000f 100%)"
          : isBazBall ? "linear-gradient(148deg, #001a08 0%, #002d10 20%, #001a08 50%, #000e04 80%, #0d0020 100%)"
          : base      ? base.bg
          : "linear-gradient(148deg, #26263a 0%, #19192b 30%, #1d1d2f 60%, #111120 100%)",
      }}
      onClick={onClick}
    >
      {/* Outer border */}
      <div
        className="absolute inset-0 rounded-xl pointer-events-none z-20"
        style={{
          border:
            isTOTW    ? "2px solid rgba(147,197,253,0.95)"
            : isPrime ? "1.5px solid rgba(251,191,36,0.75)"
            : isIcon  ? "2px solid rgba(192,132,252,0.8)"
            : isMW    ? "2px solid rgba(239,68,68,0.75)"
            : isMWIcon? "2px solid rgba(239,68,68,0.9)"
            : isBazBall ? "2px solid rgba(34,197,94,0.9)"
            : base      ? base.border
            : "1.5px solid rgba(148,163,184,0.22)",
        }}
      />

      {/* TOTW */}
      {isTOTW && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.13] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <polygon points="18,0 46,90 34,90 62,180 46,180 82,232" fill="#bfdbfe" />
            <polygon points="108,0 136,90 124,90 152,180 138,180 172,232" fill="#93c5fd" opacity="0.65" />
          </svg>
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(147,197,253,0.45) 0%, transparent 70%)" }} />
        </>
      )}

      {/* Prime */}
      {isPrime && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.10] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="0" y1="60" x2="165" y2="0" stroke="#fde68a" strokeWidth="18" />
            <line x1="0" y1="140" x2="165" y2="80" stroke="#fbbf24" strokeWidth="10" />
            <line x1="0" y1="232" x2="165" y2="150" stroke="#fde68a" strokeWidth="14" />
          </svg>
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(251,191,36,0.32) 0%, transparent 70%)" }} />
        </>
      )}

      {/* Icon */}
      {isIcon && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.18] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="82" y1="0" x2="82" y2="232" stroke="#e879f9" strokeWidth="1.5" />
            <line x1="0" y1="116" x2="165" y2="116" stroke="#c084fc" strokeWidth="1.5" />
            <line x1="0" y1="0" x2="165" y2="232" stroke="#a855f7" strokeWidth="1" />
            <line x1="165" y1="0" x2="0" y2="232" stroke="#a855f7" strokeWidth="1" />
            <circle cx="82" cy="116" r="55" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.5" />
            <circle cx="82" cy="116" r="30" fill="none" stroke="#e879f9" strokeWidth="0.8" opacity="0.6" />
          </svg>
          <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.25) 0%, transparent 70%)" }} />
        </>
      )}

      {/* MW */}
      {isMW && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.12] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="0" y1="80"  x2="165" y2="0"   stroke="#f87171" strokeWidth="22" />
            <line x1="0" y1="180" x2="165" y2="100"  stroke="#ef4444" strokeWidth="14" />
            <line x1="0" y1="260" x2="165" y2="180"  stroke="#f87171" strokeWidth="18" />
          </svg>
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(220,38,38,0.35) 0%, transparent 70%)" }} />
        </>
      )}

      {/* MW-Icon: Icon star-burst in purple, slashed through with crimson MW streaks */}
      {isMWIcon && (
        <>
          {/* Icon star-burst layer */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.20] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="82"  y1="0"   x2="82"  y2="232"  stroke="#e879f9" strokeWidth="1.5" />
            <line x1="0"   y1="116" x2="165" y2="116"  stroke="#c084fc" strokeWidth="1.5" />
            <line x1="0"   y1="0"   x2="165" y2="232"  stroke="#a855f7" strokeWidth="1" />
            <line x1="165" y1="0"   x2="0"   y2="232"  stroke="#a855f7" strokeWidth="1" />
            <circle cx="82" cy="116" r="55" fill="none" stroke="#c084fc" strokeWidth="1.2" opacity="0.55" />
            <circle cx="82" cy="116" r="30" fill="none" stroke="#e879f9" strokeWidth="1"   opacity="0.65" />
          </svg>
          {/* Bold MW crimson slashes cutting across */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.16] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="0"   y1="75"  x2="165" y2="0"   stroke="#ef4444" strokeWidth="32" />
            <line x1="0"   y1="175" x2="165" y2="100" stroke="#f87171" strokeWidth="20" />
            <line x1="0"   y1="265" x2="165" y2="188" stroke="#ef4444" strokeWidth="26" />
          </svg>
          {/* Dual radial glow — purple core, red rim */}
          <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(168,85,247,0.28) 0%, rgba(220,38,38,0.20) 60%, transparent 85%)" }} />
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(239,68,68,0.40) 0%, rgba(168,85,247,0.15) 55%, transparent 80%)" }} />
        </>
      )}

      {/* BazBall */}
      {isBazBall && (
        <>
          <svg className="absolute inset-0 w-full h-full opacity-[0.13] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="0"   y1="70"  x2="165" y2="0"   stroke="#16a34a" strokeWidth="30" />
            <line x1="0"   y1="170" x2="165" y2="100" stroke="#22c55e" strokeWidth="18" />
            <line x1="0"   y1="260" x2="165" y2="190" stroke="#16a34a" strokeWidth="24" />
          </svg>
          <svg className="absolute inset-0 w-full h-full opacity-[0.22] pointer-events-none z-[1]" preserveAspectRatio="none" viewBox="0 0 165 232">
            <line x1="82"  y1="0"   x2="82"  y2="232"  stroke="#22c55e" strokeWidth="1.5" />
            <line x1="0"   y1="116" x2="165" y2="116"  stroke="#16a34a" strokeWidth="1.5" />
            <line x1="0"   y1="0"   x2="165" y2="232"  stroke="#22c55e" strokeWidth="1" />
            <line x1="165" y1="0"   x2="0"   y2="232"  stroke="#22c55e" strokeWidth="1" />
            <circle cx="82" cy="116" r="55" fill="none" stroke="#16a34a" strokeWidth="1.2" opacity="0.55" />
            <circle cx="82" cy="116" r="28" fill="none" stroke="#4ade80" strokeWidth="1"   opacity="0.65" />
          </svg>
          <div className="absolute inset-0 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 40%, rgba(34,197,94,0.15) 0%, rgba(168,85,247,0.1) 55%, transparent 80%)" }} />
          <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(34,197,94,0.32) 0%, transparent 70%)" }} />
        </>
      )}

      {/* Gold / silver / bronze: just a faint top sheen */}
      {base && (
        <div className="absolute top-0 left-0 right-0 h-1/3 pointer-events-none z-[1]" style={{ background: `radial-gradient(ellipse at 50% 0%, ${base.sheen} 0%, transparent 70%)` }} />
      )}

      {/* Top bar */}
      <div className={cn("relative z-10 flex items-start justify-between", s.px, s.pt)}>
        <div className="flex flex-col items-start leading-none">
          <span className={cn("font-display font-black leading-none", s.rating,
            isTOTW    ? "text-blue-200"
            : isPrime ? "text-yellow-300"
            : isIcon  ? "text-purple-200"
            : isMW    ? "text-orange-300"
            : isMWIcon? "text-fuchsia-200"
            : isBazBall ? "text-green-200"
            : base      ? base.rating
            : "text-white"
          )}>
            {rating}
          </span>
          <span className={cn("font-bold uppercase tracking-widest mt-[2px]", s.roleText,
            isTOTW    ? "text-sky-300"
            : isPrime ? "text-amber-400"
            : isIcon  ? "text-purple-400"
            : isMW    ? "text-red-300"
            : isMWIcon? "text-fuchsia-400"
            : isBazBall ? "text-green-400"
            : base      ? base.role
            : "text-slate-400"
          )}>
            {ROLE_ABBREV[player.role] ?? "PLY"}
          </span>
        </div>

        {isTOTW && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-blue-500 to-sky-400 text-white font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">TOTW</span>
            <span className={cn("text-sky-300", size === "lg" ? "text-sm" : "text-[11px]")}>⚡</span>
          </div>
        )}
        {isPrime && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-yellow-400 to-amber-300 text-black font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">PRIME</span>
            <span className={cn("text-yellow-300", size === "lg" ? "text-sm" : "text-[11px]")}>👑</span>
          </div>
        )}
        {isIcon && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-purple-400 to-fuchsia-400 text-black font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">ICON</span>
            <span className={cn("text-purple-300", size === "lg" ? "text-sm" : "text-[11px]")}>⭐</span>
          </div>
        )}
        {isMW && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">MW</span>
            <span className={cn("text-orange-300", size === "lg" ? "text-sm" : "text-[11px]")}>🏆</span>
          </div>
        )}
        {isMWIcon && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-purple-500 to-fuchsia-400 text-white font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">ICON</span>
            <span className="bg-gradient-to-r from-red-600 to-orange-500 text-white font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow mt-[2px]">MW</span>
          </div>
        )}
        {isBazBall && (
          <div className="flex flex-col items-end gap-[3px] mt-0.5">
            <span className="bg-gradient-to-r from-green-600 to-emerald-500 text-white font-black text-[7px] px-1.5 py-[2px] rounded uppercase tracking-wider shadow">BAZBALL</span>
            <span className={cn("text-green-300", size === "lg" ? "text-sm" : "text-[11px]")}>🌿</span>
          </div>
        )}
      </div>

      {/* Center: headshot if available, otherwise role emoji + flag */}
      <div className="relative z-10 flex flex-col items-center justify-end flex-1 pb-1">
        {PLAYER_HEADSHOTS[player.id] ? (
          <img
            src={PLAYER_HEADSHOTS[player.id]}
            alt={player.name}
            className="object-contain object-bottom drop-shadow-lg"
            style={{ width: "72%", maxHeight: "90%" }}
          />
        ) : (
          <>
            <span className={cn("leading-none", s.icon)}>{ROLE_EMOJI[player.role] ?? "🏏"}</span>
            <span className={cn("mt-1 leading-none", s.flag)}>{FLAG[player.country] ?? "🌍"}</span>
          </>
        )}
      </div>

      {/* Name plate */}
      <div
        className={cn("relative z-10 rounded text-center", s.mx, "mb-[4px]", s.px, s.namePy)}
        style={{
          background:
            isTOTW    ? "linear-gradient(135deg, rgba(26,79,216,0.97), rgba(37,96,240,0.92))"
            : isPrime ? "linear-gradient(135deg, rgba(120,53,15,0.95), rgba(180,83,9,0.88))"
            : isIcon  ? "linear-gradient(135deg, rgba(88,28,135,0.95), rgba(126,34,206,0.88))"
            : isMW    ? "linear-gradient(135deg, rgba(127,29,29,0.95), rgba(185,28,28,0.88))"
            : isMWIcon? "linear-gradient(135deg, rgba(80,10,100,0.97), rgba(140,20,60,0.92))"
            : isBazBall ? "linear-gradient(135deg, rgba(5,46,22,0.97), rgba(20,83,45,0.92))"
            : base      ? base.plate
            : "linear-gradient(135deg, rgba(15,23,42,0.95), rgba(30,41,59,0.88))",
        }}
      >
        <span className={cn("font-display font-black text-white truncate block leading-tight", s.name)}>
          {player.name}
        </span>
      </div>

      {/* Stats bar */}
      <div
        className={cn("relative z-10 rounded flex justify-between", s.mx, s.mb, s.px, s.statPy)}
        style={{
          background:
            isTOTW    ? "rgba(26,79,216,0.80)"
            : isPrime ? "rgba(120,53,15,0.65)"
            : isIcon  ? "rgba(88,28,135,0.6)"
            : isMW    ? "rgba(127,29,29,0.65)"
            : isMWIcon? "rgba(70,10,80,0.70)"
            : isBazBall ? "rgba(5,46,22,0.75)"
            : base      ? base.bar
            : "rgba(15,23,42,0.82)",
          borderTop:
            isTOTW    ? "1px solid rgba(96,165,250,0.3)"
            : isPrime ? "1px solid rgba(251,191,36,0.25)"
            : isIcon  ? "1px solid rgba(192,132,252,0.3)"
            : isMW    ? "1px solid rgba(239,68,68,0.3)"
            : isMWIcon? "1px solid rgba(239,68,68,0.45)"
            : isBazBall ? "1px solid rgba(34,197,94,0.4)"
            : base      ? base.barTop
            : "1px solid rgba(148,163,184,0.1)",
        }}
      >
        {stats.map((stat) => (
          <div key={stat.l} className="flex flex-col items-center">
            <span className={cn("font-black leading-none", s.stat,
              isTOTW    ? "text-sky-100"
              : isPrime ? "text-yellow-100"
              : isIcon  ? "text-purple-100"
              : isMW    ? "text-orange-100"
              : isMWIcon? "text-fuchsia-100"
              : isBazBall ? "text-green-100"
              : base      ? base.stat
              : "text-white"
            )}>
              {stat.v}
            </span>
            <span className={cn("font-bold uppercase leading-none mt-[1px]", s.statLabel,
              isTOTW    ? "text-sky-400"
              : isPrime ? "text-amber-400"
              : isIcon  ? "text-purple-400"
              : isMW    ? "text-red-400"
              : isMWIcon? "text-fuchsia-400"
              : isBazBall ? "text-green-400"
              : base      ? base.statLabel
              : "text-slate-500"
            )}>
              {stat.l}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
