import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { GameEngine } from "@/lib/types";

/** The JSON attack engine served by GET /api/game. Static for a session, so never refetch. */
export function useGameData() {
  return useQuery({
    queryKey: ["game"],
    queryFn: () => apiGet<GameEngine>("/game"),
    staleTime: Infinity,
    retry: 1,
  });
}
