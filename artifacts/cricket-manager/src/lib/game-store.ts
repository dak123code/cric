import type { CardPlayer } from "@/components/cricket-card";

export interface CollectedCard extends CardPlayer {
  addedAt: number;
}

const COINS_KEY = "cm_coins";
const COLLECTION_KEY = "cm_collection";
export const STARTING_COINS = 500;

export function getCoins(): number {
  const v = localStorage.getItem(COINS_KEY);
  return v !== null ? parseInt(v, 10) : STARTING_COINS;
}

export function setCoins(n: number): void {
  localStorage.setItem(COINS_KEY, String(Math.max(0, n)));
}

export function addCoins(amount: number): number {
  const next = getCoins() + amount;
  setCoins(next);
  return next;
}

export function deductCoins(amount: number): boolean {
  const cur = getCoins();
  if (cur < amount) return false;
  setCoins(cur - amount);
  return true;
}

export function getCollection(): CollectedCard[] {
  try {
    const v = localStorage.getItem(COLLECTION_KEY);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export function addToCollection(cards: CardPlayer[]): void {
  const existing = getCollection();
  const stamped = cards.map(c => ({ ...c, addedAt: Date.now() }));
  localStorage.setItem(COLLECTION_KEY, JSON.stringify([...existing, ...stamped]));
}

export function removeFromCollection(addedAts: number[]): void {
  const existing = getCollection();
  const toRemove = new Set(addedAts);
  const updated = existing.filter(c => !toRemove.has(c.addedAt));
  localStorage.setItem(COLLECTION_KEY, JSON.stringify(updated));
}

export const PACK_COSTS: Record<string, number> = {
  mini: 80,
  bronze: 50,
  silver: 75,
  gold: 100,
  special: 200,
  mw: 350,
  exploder: 110,
};

const EXPLODER_COUNT_KEY = "cm_exploder_count";

export function getExploderCount(): number {
  const v = localStorage.getItem(EXPLODER_COUNT_KEY);
  return v !== null ? parseInt(v, 10) : 0;
}

export function incrementExploderCount(): number {
  const next = getExploderCount() + 1;
  localStorage.setItem(EXPLODER_COUNT_KEY, String(next));
  return next;
}

export const MATCH_COIN_REWARDS: Record<number, number> = {
  2: 50,
  5: 100,
  10: 150,
};

export const CAREER_COIN_REWARDS: Record<number, number> = {
  1: 300,
  2: 250,
  3: 200,
  4: 150,
  5: 100,
  6: 75,
  7: 50,
  8: 30,
  9: 10,
  10: -5,
};

// ── SBC / Quest unlocks ────────────────────────────────────────────────────────

const UNLOCKS_KEY = "cm_unlocks";

export function getUnlocks(): string[] {
  try {
    const v = localStorage.getItem(UNLOCKS_KEY);
    return v ? JSON.parse(v) : [];
  } catch {
    return [];
  }
}

export function hasUnlock(id: string): boolean {
  return getUnlocks().includes(id);
}

export function grantUnlock(id: string): void {
  const existing = getUnlocks();
  if (!existing.includes(id)) {
    localStorage.setItem(UNLOCKS_KEY, JSON.stringify([...existing, id]));
    window.dispatchEvent(new CustomEvent("cm-unlock", { detail: { id } }));
  }
}

// SBC definitions
export interface SBCDefinition {
  id: string;
  name: string;
  description: string;
  rewardPlayerId: number;  // player id from static-data (0 if pack reward)
  requiredRoles: { role: string; minRating: number; count: number }[];
  coinCost: number;
  isDoubleSquad?: boolean;  // requires two 11-player squads (22 cards total)
  isLegendsOfGame?: boolean; // 11 players, 3+ gold, 1 TOTW → random icon reward
  isMWSquad?: boolean;       // 7 players, 3+ gold (75+), 3+ Indian players → MW card reward
  isWinReward?: boolean;     // no cards required — claimable after winning 1+ match, once only
  rewardPack?: { primes: number; icons: number; golds: number };  // if set, gives a pack instead of a single player
}

export const SBC_DEFINITIONS: SBCDefinition[] = [
  {
    id: "sbc_beginner",
    name: "Beginner",
    description: "Win your first match to claim a free Gold Pack. One time only.",
    rewardPlayerId: 0,
    requiredRoles: [],
    coinCost: 0,
    isWinReward: true,
    rewardPack: { primes: 0, icons: 0, golds: 5 },
  },
  {
    id: "sbc_shami",
    name: "Shami Special",
    description: "Submit a squad of 3 bowlers (70+ rated) and 2 batsmen (75+ rated) to unlock Prime Mohammed Shami.",
    rewardPlayerId: 10,
    requiredRoles: [
      { role: "bowler",   minRating: 70, count: 3 },
      { role: "batsman",  minRating: 75, count: 2 },
    ],
    coinCost: 0,
  },
  {
    id: "sbc_narine",
    name: "Narine's Mystery",
    description: "Submit 3 allrounders (65+ rated) and 2 bowlers (70+ rated) to unlock Prime Sunil Narine.",
    rewardPlayerId: 76,
    requiredRoles: [
      { role: "allrounder", minRating: 65, count: 3 },
      { role: "bowler",     minRating: 70, count: 2 },
    ],
    coinCost: 0,
  },
  {
    id: "sbc_taylor",
    name: "Taylor's Legacy",
    description: "Submit 4 batsmen (65+ rated) and 1 wicketkeeper (60+ rated) to unlock Prime Ross Taylor.",
    rewardPlayerId: 999,
    requiredRoles: [
      { role: "batsman",       minRating: 65, count: 4 },
      { role: "wicketkeeper",  minRating: 60, count: 1 },
    ],
    coinCost: 0,
  },
  {
    id: "sbc_gauntlet",
    name: "The Ultimate Gauntlet",
    description: "Submit two complete 11-player squads (22 players total) to earn a special pack: 1 Prime, 1 Icon, and 8 Gold players guaranteed.",
    rewardPlayerId: 0,
    requiredRoles: [],
    coinCost: 0,
    isDoubleSquad: true,
    rewardPack: { primes: 1, icons: 1, golds: 8 },
  },
  {
    id: "sbc_legends",
    name: "Legends of the Game",
    description: "Submit an 11-player squad with at least 3 Gold players (75+ rated) and 1 TOTW card. Reward: 1 random Icon.",
    rewardPlayerId: 0,
    requiredRoles: [],
    coinCost: 0,
    isLegendsOfGame: true,
  },
  {
    id: "sbc_amarnath",
    name: "Match Winner: Jimmy Amarnath",
    description: "Submit a squad of 7 players with at least 3 Gold cards (75+ rated) and 3 Indian players to unlock Jimmy Amarnath MW (91).",
    rewardPlayerId: 760,
    requiredRoles: [],
    coinCost: 0,
    isMWSquad: true,
  },
];

// Completed SBC count (used for quests)
export function getCompletedSBCCount(): number {
  const unlocks = getUnlocks();
  return SBC_DEFINITIONS.filter(s => unlocks.includes(s.id)).length;
}

// Win counter (used for quests)
const WINS_KEY = "cm_wins";

export function getWins(): number {
  const v = localStorage.getItem(WINS_KEY);
  return v !== null ? parseInt(v, 10) : 0;
}

export function incrementWins(): number {
  const next = getWins() + 1;
  localStorage.setItem(WINS_KEY, String(next));
  window.dispatchEvent(new CustomEvent("cm-wins-updated", { detail: { wins: next } }));
  return next;
}

// Quest definitions
export interface QuestDefinition {
  id: string;
  name: string;
  description: string;
  rewardPlayerId: number;
  rewardPlayerName: string;
  // For icon pick quests — offer 3 random icon ids to choose from
  isIconPick?: boolean;
  iconPickCount?: number;  // how many to show (always 3)
  winsRequired?: number;
  // Coin-only reward (no player card)
  rewardCoins?: number;
  sbcsRequired?: number;  // number of completed SBCs needed to claim
}

export const QUEST_DEFINITIONS: QuestDefinition[] = [
  {
    id: "quest_labuschagne",
    name: "The Labuschagne Challenge",
    description: "Win a match by 100+ runs to unlock Prime Marnus Labuschagne (93).",
    rewardPlayerId: 998,
    rewardPlayerName: "Marnus Labuschagne",
  },
  {
    id: "quest_stokes_mw",
    name: "Stokes' Masterclass",
    description: "Win a 5 or 10 over match using the English team with Ben Stokes in your squad, and have him score 30+ runs. Reward: Ben Stokes MW.",
    rewardPlayerId: 762,
    rewardPlayerName: "Ben Stokes MW",
  },
  {
    id: "quest_sbc_grinder",
    name: "SBC Grinder",
    description: "Complete any 2 SBCs to earn 100 coins. One time only.",
    rewardPlayerId: 0,
    rewardPlayerName: "",
    rewardCoins: 100,
    sbcsRequired: 2,
  },
];
