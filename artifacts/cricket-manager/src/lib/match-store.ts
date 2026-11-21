import type { Player } from "@workspace/api-client-react/src/generated/api.schemas";

export type Difficulty = "easy" | "medium" | "hard";

export interface MatchSetup {
  team1Name: string;
  team1Flag: string;
  team1Players: Player[];
  team2Name: string;
  team2Flag: string;
  team2Players: Player[];
  overs: number;
  difficulty?: Difficulty;
  // Career mode — set when launching a career fixture
  careerId?: string;
  fixtureIndex?: number;
  // 2-player pass-and-play: both teams use manual batting controls
  twoPlayer?: boolean;
  // Where "Play Again" goes after the match (defaults to Quick Match)
  returnTo?: string;
  returnLabel?: string;
}

let current: MatchSetup | null = null;

export function setMatchSetup(setup: MatchSetup) {
  current = setup;
}

export function getMatchSetup(): MatchSetup | null {
  return current;
}
