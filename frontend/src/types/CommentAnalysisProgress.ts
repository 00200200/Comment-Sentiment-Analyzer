export interface CommentAnalysisProgress {
  video_id: string;
  state: string;
  total_analyzed: number;
  last_update: number;
  has_more: boolean;
  estimated_completion?: number;
}
