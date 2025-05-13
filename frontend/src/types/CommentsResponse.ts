import type { Comment } from "./Comment";

export interface CommentsResponse {
  video_id: string;
  comments: Comment[];
  total_available: number;
  total_expected: number;
  offset: number;
  limit: number;
  has_more: boolean;
  analysis_state: string;
}
