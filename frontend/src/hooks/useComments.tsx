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
    staleTime: 1000 * 60 * 2,
  });
}
