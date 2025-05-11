// src/hooks/useContinueAnalysis.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { continueAnalysis } from "@/services/api";

export function useContinueAnalysis(videoId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => continueAnalysis(videoId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["analysisProgress", videoId],
      });
      queryClient.invalidateQueries({ queryKey: ["comments", videoId] });
    },
  });
}
