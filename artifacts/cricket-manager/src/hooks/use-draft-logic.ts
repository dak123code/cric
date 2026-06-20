import { useState } from "react";
import type { Player } from "@workspace/api-client-react/src/generated/api.schemas";

export function useDraftState() {
  const [userTeam, setUserTeam] = useState<Player[]>([]);
  const [aiTeam, setAiTeam] = useState<Player[]>([]);

  const handlePick = (player: Player) => {
    if (userTeam.length >= 11) return;
    if (userTeam.some(p => p.id === player.id)) return;
    setUserTeam(prev => [...prev, player]);
  };

  const removePick = (playerId: number) => {
    setUserTeam(prev => prev.filter(p => p.id !== playerId));
  };

  const isDraftComplete = userTeam.length === 11;
  const wks = userTeam.filter(p => p.role === 'wicketkeeper').length;
  const bowlers = userTeam.filter(p => p.role === 'bowler' || p.role === 'allrounder').length;
  const isValidXI = isDraftComplete && wks >= 1 && bowlers >= 5;

  return { userTeam, aiTeam, setAiTeam, handlePick, removePick, isDraftComplete, isValidXI, wks, bowlers };
}

export function useDraft2PState() {
  const [turn, setTurn] = useState<1 | 2>(1);
  const [team1, setTeam1] = useState<Player[]>([]);
  const [team2, setTeam2] = useState<Player[]>([]);

  const handlePick = (player: Player) => {
    if (turn === 1) {
      if (team1.length >= 11) return;
      setTeam1(prev => [...prev, player]);
      if (team2.length < 11) setTurn(2);
    } else {
      if (team2.length >= 11) return;
      setTeam2(prev => [...prev, player]);
      if (team1.length < 11) setTurn(1);
    }
  };

  return { turn, team1, team2, handlePick };
}
