import type { VideoResponse } from "@/types/VideoResponse";
import { analyzeVideo } from "@/services/videosApi"; // Updated import path
import { useQuery } from "@tanstack/react-query";

export function useVideoAnalysis(videoUrl: string) {
  return useQuery<VideoResponse, Error>({
    queryKey: ["videoAnalysis", videoUrl],
    queryFn: () => analyzeVideo(videoUrl),
    enabled: !!videoUrl,
    refetchInterval: 1000 * 3, // Refetch every 2 second
  });
}
