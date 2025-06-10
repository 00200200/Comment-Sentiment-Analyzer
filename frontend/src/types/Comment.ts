export interface Comment {
  id: string; // Matches backend's 'id' field
  text: string;
  author: string;
  sentiment_label: string; // e.g., "positive", "neutral", "negative", "ambiguous"
  sentiment_score: number; // Matches backend's 'sentiment_score'
  like_count: number;
  published_at: Date; // Use Date object for better handling in TS/JS
}
