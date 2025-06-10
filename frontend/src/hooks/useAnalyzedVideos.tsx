import type { AnalyzedVideoList } from "@/types/AnalyzedVideoList";
import { fetchAnalyzedVideos } from "@/services/videosApi"; // Updated import path
import { useQuery } from "@tanstack/react-query";

export function useAnalyzedVideos(offset: number, limit: number) {
  return useQuery<AnalyzedVideoList, Error>({
    queryKey: ["analyzedVideos", offset, limit],
    queryFn: () => fetchAnalyzedVideos(offset, limit),
    placeholderData: undefined,
    staleTime: 1000 * 60 * 3,
  });
}
