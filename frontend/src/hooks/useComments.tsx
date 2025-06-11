import type { CommentsResponse } from "@/types/CommentsResponse";
import {
  fetchComments,
  type FetchCommentsOptions,
} from "@/services/commentsApi";
import { useQuery } from "@tanstack/react-query";

export function useComments(
  videoUrl: string,
  params: FetchCommentsOptions = {}
) {
  return useQuery<CommentsResponse, Error>({
    queryKey: ["comments", videoUrl, params],
    queryFn: () => fetchComments(videoUrl, params),
    enabled: !!videoUrl,
    refetchInterval: 1000 * 3, // Refetch every 3 second
  });
}
