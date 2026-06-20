import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatRole(role: string) {
  switch (role) {
    case 'batsman': return 'Batsman';
    case 'bowler': return 'Bowler';
    case 'allrounder': return 'All-Rounder';
    case 'wicketkeeper': return 'Wicketkeeper';
    default: return role;
  }
}
