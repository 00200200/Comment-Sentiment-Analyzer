export interface Comment {
  comment_id: string;
  text: string;
  author: string;
  sentiment_label: string;
  sentiment: number;
  like_count: number;
  published_at: string;
}
