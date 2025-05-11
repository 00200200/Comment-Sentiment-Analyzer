import type { Comment } from "./Comment";

export interface CommentsResponse {
  video_id: string;
  comments: Comment[];
  total_analyzed: number;
  total_available: number;
  offset: number;
  limit: number;
  has_more: boolean;
  analysis_state: string;
}
