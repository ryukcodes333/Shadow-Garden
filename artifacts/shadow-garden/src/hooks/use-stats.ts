import { useQuery } from "@tanstack/react-query";

const API_BASE = "/api/v1/stats";

export interface CommunityStats {
  members: number;
  totalCards: number;
  uniqueCards: number;
  bots: number;
  guilds: number;
  dungeonsCleared: number;
  messages: number;
  generatedAt: number;
}

export function useCommunityStats() {
  return useQuery<CommunityStats>({
    queryKey: ["communityStats"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/community`);
      if (!res.ok) throw new Error("Failed to fetch community stats");
      return res.json();
    },
    staleTime: 60000,
    retry: false,
  });
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  level: number;
  xp: number;
  role?: string;
  avatarUrl?: string;
}

export function useLeaderboard() {
  return useQuery<{ entries: LeaderboardEntry[] }>({
    queryKey: ["leaderboard"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/leaderboard?limit=10`);
      if (!res.ok) throw new Error("Failed to fetch leaderboard");
      return res.json();
    },
    staleTime: 60000,
    retry: false,
  });
}

export interface Bot {
  id: string;
  name: string;
  phone: string;
  status: string;
}

export function useBots() {
  return useQuery<{ bots: Bot[] }>({
    queryKey: ["bots"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/bots`);
      if (!res.ok) throw new Error("Failed to fetch bots");
      return res.json();
    },
    staleTime: 60000,
    retry: false,
  });
}
