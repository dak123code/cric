import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CricketCard, type CardPlayer } from "@/components/cricket-card";
import {
  hasUnlock,
  addToCollection,
  addCoins,
  grantUnlock,
  QUEST_DEFINITIONS,
  type QuestDefinition,
  getCollection,
  getWins,
  getCompletedSBCCount,
} from "@/lib/game-store";
import { getPrimePlayer, getIconPlayer, ICON_PLAYERS, getMWPlayer, MW_IDS } from "@/lib/static-data";
import { Button } from "@/components/shared";

function toCard(p: { id: number; name: string; role: string; country: string; battingRating: number; bowlingRating: number; keepingRating: number; overallRating: number; age: number; salary: number }): CardPlayer {
  return { id: p.id, name: p.name, role: p.role, country: p.country, battingRating: p.battingRating, bowlingRating: p.bowlingRating, keepingRating: p.keepingRating, overallRating: p.overallRating, age: p.age, salary: p.salary };
}

// Deterministically pick 3 icons to offer (seeded so they don't reshuffle on re-render)
function pickThreeIcons(): typeof ICON_PLAYERS {
  const seed = [...ICON_PLAYERS].sort((a, b) => a.id - b.id);
  // Simple stable shuffle using fixed indices spread across the array
  const step = Math.floor(seed.length / 3);
  return [seed[0], seed[step], seed[step * 2]];
}

// ── Standard quest card ───────────────────────────────────────────────────────
function StandardQuestCard({ quest }: { quest: QuestDefinition }) {
  const [claimed, setClaimed] = useState(false);
  const completed = hasUnlock(quest.id);
  const reward = getPrimePlayer(quest.rewardPlayerId) ?? getMWPlayer(quest.rewardPlayerId);
  const isMWReward = reward ? MW_IDS.has(reward.id) : false;
  const alreadyOwned = getCollection().some((c) => c.id === quest.rewardPlayerId);

  const handleClaim = () => {
    if (!completed || claimed || alreadyOwned) return;
    if (reward) addToCollection([toCard(reward)]);
    setClaimed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{
        background: completed
          ? "linear-gradient(145deg, rgba(20,40,20,0.7), rgba(10,25,10,0.5))"
          : "linear-gradient(145deg, rgba(15,25,50,0.7), rgba(10,15,35,0.5))",
        borderColor: completed ? "rgba(74,222,128,0.4)" : "rgba(148,163,184,0.2)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{completed ? "✅" : "🎯"}</span>
            <h3 className="font-display font-black text-white text-lg">{quest.name}</h3>
            {completed && (
              <span className="text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                Complete
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
        </div>
        {reward && (
          <div className="flex-shrink-0">
            <CricketCard player={toCard(reward)} cardType={isMWReward ? "mw" : "prime"} size="sm" />
          </div>
        )}
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-bold">
          <span>Progress</span>
          <span>{completed ? "DONE" : "Incomplete"}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: completed ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#3b82f6,#1d4ed8)" }}
            initial={{ width: 0 }}
            animate={{ width: completed ? "100%" : "0%" }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {completed && !alreadyOwned && !claimed && (
        <Button onClick={handleClaim} size="sm" className="w-full font-black"
          style={isMWReward
            ? { background: "linear-gradient(135deg,#dc2626,#b91c1c)", color: "#fff" }
            : { background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000" }}>
          Claim Reward — {isMWReward ? "MW" : "Prime"} {quest.rewardPlayerName}
        </Button>
      )}
      {(claimed || alreadyOwned) && completed && (
        <div className="text-center text-green-400 font-black text-sm">
          {isMWReward ? "MW" : "Prime"} {quest.rewardPlayerName} is in your collection!
        </div>
      )}
      {!completed && (
        <p className="text-xs text-muted-foreground italic">
          Complete the objective in a Quick Match to unlock this reward.{isMWReward ? " Use a 5 or 10 over format." : ""}
        </p>
      )}
    </motion.div>
  );
}

// ── Icon pick quest card ──────────────────────────────────────────────────────
function IconPickQuestCard({ quest }: { quest: QuestDefinition }) {
  const [picked, setPicked] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const completed = hasUnlock(quest.id);
  const wins = getWins();
  const required = quest.winsRequired ?? 3;
  const progress = Math.min(wins, required);

  const options = useMemo(() => pickThreeIcons(), []);

  // Check if already claimed one
  const alreadyClaimedId = getCollection().find((c) => options.some((o) => o.id === c.id))?.id ?? null;

  const handleConfirm = () => {
    if (picked === null || confirmed || alreadyClaimedId) return;
    const player = getIconPlayer(picked);
    if (player) addToCollection([toCard(player)]);
    grantUnlock(`icon_claimed_${picked}`);
    setConfirmed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 flex flex-col gap-5"
      style={{
        background: completed
          ? "linear-gradient(145deg, rgba(40,10,60,0.8), rgba(20,5,35,0.6))"
          : "linear-gradient(145deg, rgba(15,25,50,0.7), rgba(10,15,35,0.5))",
        borderColor: completed ? "rgba(192,132,252,0.5)" : "rgba(148,163,184,0.2)",
      }}
    >
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xl">{completed ? "⭐" : "🎯"}</span>
          <h3 className="font-display font-black text-white text-lg">{quest.name}</h3>
          {completed && (
            <span className="text-[10px] font-black bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
              Unlocked
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{quest.description}</p>
      </div>

      {/* Progress bar */}
      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-bold">
          <span>Wins</span>
          <span>{progress}/{required}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: completed ? "linear-gradient(90deg,#c084fc,#a855f7)" : "linear-gradient(90deg,#3b82f6,#1d4ed8)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(progress / required) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {/* Icon picker — shown once quest is complete */}
      {completed && !alreadyClaimedId && !confirmed && (
        <div>
          <p className="text-sm font-black text-purple-300 mb-3 text-center uppercase tracking-wider">
            Choose 1 Icon Card
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            {options.map((icon) => (
              <motion.div
                key={icon.id}
                whileHover={{ scale: 1.05 }}
                onClick={() => setPicked(icon.id)}
                className="cursor-pointer"
                style={{
                  filter: picked !== null && picked !== icon.id ? "brightness(0.45) saturate(0.3)" : "none",
                  transition: "filter 0.2s",
                }}
              >
                <CricketCard player={toCard(icon)} cardType="icon" size="md" />
                {picked === icon.id && (
                  <div className="text-center mt-1">
                    <span className="text-[10px] font-black text-purple-300 bg-purple-500/20 border border-purple-500/40 px-2 py-0.5 rounded uppercase">
                      Selected
                    </span>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
          <div className="mt-4 flex justify-center">
            <Button
              onClick={handleConfirm}
              disabled={picked === null}
              size="sm"
              className="px-8 font-black"
              style={{
                background: picked !== null ? "linear-gradient(135deg,#a855f7,#7c3aed)" : undefined,
                color: picked !== null ? "#fff" : undefined,
              }}
            >
              Confirm Pick
            </Button>
          </div>
        </div>
      )}

      {(confirmed || alreadyClaimedId) && completed && (
        <div className="text-center">
          <p className="text-purple-300 font-black text-sm mb-3">Icon card added to your collection!</p>
          {(() => {
            const id = confirmed ? picked : alreadyClaimedId;
            const p = id ? getIconPlayer(id) : null;
            return p ? (
              <div className="flex justify-center">
                <CricketCard player={toCard(p)} cardType="icon" size="md" />
              </div>
            ) : null;
          })()}
        </div>
      )}

      {!completed && (
        <p className="text-xs text-muted-foreground italic">
          Win {required - progress} more match{required - progress !== 1 ? "es" : ""} to unlock this reward.
        </p>
      )}
    </motion.div>
  );
}

// ── Coin quest card ───────────────────────────────────────────────────────────
function CoinQuestCard({ quest }: { quest: QuestDefinition }) {
  const [claimed, setClaimed] = useState(false);
  const completed = hasUnlock(quest.id);
  const sbcsDone = getCompletedSBCCount();
  const required = quest.sbcsRequired ?? 2;
  const progress = Math.min(sbcsDone, required);
  const canClaim = sbcsDone >= required && !completed && !claimed;

  const handleClaim = () => {
    if (!canClaim) return;
    if (quest.rewardCoins) {
      addCoins(quest.rewardCoins);
      window.dispatchEvent(new Event("cm-coins-updated"));
    }
    grantUnlock(quest.id);
    setClaimed(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border p-5 flex flex-col gap-4"
      style={{
        background: completed || claimed
          ? "linear-gradient(145deg, rgba(20,40,20,0.7), rgba(10,25,10,0.5))"
          : "linear-gradient(145deg, rgba(15,25,50,0.7), rgba(10,15,35,0.5))",
        borderColor: completed || claimed ? "rgba(74,222,128,0.4)" : "rgba(148,163,184,0.2)",
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xl">{completed || claimed ? "✅" : "🧩"}</span>
            <h3 className="font-display font-black text-white text-lg">{quest.name}</h3>
            {(completed || claimed) && (
              <span className="text-[10px] font-black bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded uppercase tracking-wider">
                Complete
              </span>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{quest.description}</p>
        </div>
        <div className="flex-shrink-0 flex flex-col items-center gap-1">
          <div className="w-14 h-14 rounded-xl border-2 border-primary/50 bg-primary/10 flex items-center justify-center">
            <span className="text-2xl">🪙</span>
          </div>
          <span className="text-[10px] font-black text-primary">+{quest.rewardCoins}</span>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-muted-foreground mb-1 font-bold">
          <span>SBCs completed</span>
          <span>{progress}/{required}</span>
        </div>
        <div className="h-2 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className="h-full rounded-full"
            style={{ background: completed || claimed ? "linear-gradient(90deg,#4ade80,#22c55e)" : "linear-gradient(90deg,#f59e0b,#d97706)" }}
            initial={{ width: 0 }}
            animate={{ width: `${(progress / required) * 100}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
      </div>

      {canClaim && (
        <Button onClick={handleClaim} size="sm" className="w-full font-black"
          style={{ background: "linear-gradient(135deg,#f59e0b,#d97706)", color: "#000" }}>
          Claim +{quest.rewardCoins} 🪙
        </Button>
      )}
      {(completed || claimed) && (
        <div className="text-center text-green-400 font-black text-sm">+{quest.rewardCoins} coins added to your balance!</div>
      )}
      {!completed && !claimed && !canClaim && (
        <p className="text-xs text-muted-foreground italic">
          Complete {required - progress} more SBC{required - progress !== 1 ? "s" : ""} to unlock this reward.
        </p>
      )}
    </motion.div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function Quests() {
  const [, setTick] = useState(0);
  useEffect(() => {
    const handler = () => setTick((t) => t + 1);
    window.addEventListener("cm-unlock", handler);
    window.addEventListener("cm-wins-updated", handler);
    return () => {
      window.removeEventListener("cm-unlock", handler);
      window.removeEventListener("cm-wins-updated", handler);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-display font-black text-white mb-2">Quests</h1>
        <p className="text-muted-foreground">
          Complete in-game challenges to unlock exclusive Prime and Icon rewards.
        </p>
      </div>

      <div className="flex flex-col gap-6">
        {QUEST_DEFINITIONS.map((quest) =>
          quest.sbcsRequired ? (
            <CoinQuestCard key={quest.id} quest={quest} />
          ) : quest.isIconPick ? (
            <IconPickQuestCard key={quest.id} quest={quest} />
          ) : (
            <StandardQuestCard key={quest.id} quest={quest} />
          )
        )}
      </div>
    </div>
  );
}
