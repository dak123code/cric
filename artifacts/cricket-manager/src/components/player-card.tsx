import { Shield, Zap, Target, Crosshair, Plus, Minus, UserCheck } from "lucide-react";
import { cn, formatRole } from "@/lib/utils";
import type { Player, CareerPlayer } from "@workspace/api-client-react/src/generated/api.schemas";
import { Button } from "./shared";

const roleStyles = {
  batsman: 'text-role-batsman bg-role-batsman/10 border-role-batsman/20',
  bowler: 'text-role-bowler bg-role-bowler/10 border-role-bowler/20',
  allrounder: 'text-role-allrounder bg-role-allrounder/10 border-role-allrounder/20',
  wicketkeeper: 'text-role-wk bg-role-wk/10 border-role-wk/20'
};

export function RoleIcon({ role, className }: { role: string, className?: string }) {
  switch (role) {
    case 'batsman': return <Crosshair className={className} />;
    case 'bowler': return <Target className={className} />;
    case 'allrounder': return <Zap className={className} />;
    case 'wicketkeeper': return <Shield className={className} />;
    default: return null;
  }
}

function StatPill({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <span className={cn("text-sm font-display font-black leading-none", highlight ? "text-primary" : "text-white")}>
        {value}
      </span>
      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">{label}</span>
    </div>
  );
}

interface PlayerCardProps {
  player: Player | CareerPlayer;
  action?: 'add' | 'remove' | 'sign' | 'release' | 'toggleXI';
  onAction?: () => void;
  inXI?: boolean;
  disabled?: boolean;
  compact?: boolean;
}

export function PlayerCard({ player, action, onAction, inXI, disabled, compact }: PlayerCardProps) {
  const roleStyle = roleStyles[player.role as keyof typeof roleStyles] || 'text-muted bg-muted/10 border-muted/20';

  const fullPlayer = 'battingRating' in player ? player : null;
  const bat = fullPlayer?.battingRating ?? 0;
  const bowl = (fullPlayer?.bowlingRating ?? 0) * 10;
  const keep = (fullPlayer?.keepingRating ?? 0) * 10;
  const role = player.role;

  // Primary stat: batting for bat/wk/ar, bowling for pure bowlers
  const primaryValue = role === 'bowler' ? bowl : bat;
  const primaryLabel = role === 'bowler' ? 'BWL' : 'BAT';

  return (
    <div className={cn(
      "group relative flex items-center justify-between p-4 rounded-2xl border transition-all duration-300",
      "bg-card hover:bg-secondary border-border/50 hover:border-primary/30",
      compact && "p-3"
    )}>
      <div className="flex items-center gap-4">
        <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border", roleStyle)}>
          <RoleIcon role={player.role} className="w-6 h-6" />
        </div>
        <div>
          <h4 className="font-display font-bold text-lg leading-tight group-hover:text-primary transition-colors">
            {player.name}
          </h4>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              {formatRole(player.role)}
            </span>
            {('country' in player) && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-muted-foreground">{player.country}</span>
              </>
            )}
            {('salary' in player && player.salary > 0) && (
              <>
                <span className="w-1 h-1 rounded-full bg-border" />
                <span className="text-xs text-accent font-mono font-bold">₹{player.salary}Cr</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        {/* Primary stat (big) */}
        <div className="text-right">
          <div className="text-2xl font-display font-black text-white">
            {primaryValue}
          </div>
          <div className="text-[10px] text-primary font-bold uppercase tracking-widest">{primaryLabel}</div>
        </div>

        {/* Secondary stats */}
        <div className={cn("flex gap-3 border-l border-border/40 pl-4", compact && "hidden")}>
          {role !== 'bowler' && <StatPill label="BAT" value={bat} highlight />}
          {bowl > 0 && <StatPill label="BWL" value={bowl} />}
          {keep > 0 && <StatPill label="WK" value={keep} />}
          <StatPill label="OVR" value={(player.overallRating ?? 0) * 10} />
        </div>

        {action && (
          <Button 
            variant={action === 'remove' || action === 'release' ? 'destructive' : action === 'toggleXI' ? (inXI ? 'primary' : 'secondary') : 'primary'}
            size="sm" 
            onClick={onAction}
            disabled={disabled}
            className="w-12 h-12 p-0 rounded-xl"
          >
            {action === 'add' && <Plus className="w-5 h-5" />}
            {action === 'remove' && <Minus className="w-5 h-5" />}
            {action === 'sign' && <Plus className="w-5 h-5" />}
            {action === 'release' && <Minus className="w-5 h-5" />}
            {action === 'toggleXI' && (inXI ? <UserCheck className="w-5 h-5" /> : <Plus className="w-5 h-5" />)}
          </Button>
        )}
      </div>
    </div>
  );
}
