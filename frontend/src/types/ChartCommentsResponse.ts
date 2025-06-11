export interface ChartComment {
  id: string;
  published_at: string;
  sentiment_label?: string;
}

export interface ChartCommentsResponse {
  video_id: string;
  comments: ChartComment[];
}
