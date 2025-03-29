from pydantic import BaseModel

class VideoStats(BaseModel):
    title: str
    channel_id: str
    channel_name: str
    thumbnail_url: str
    view_count: int
    like_count: int
    dislike_count: int
    comment_count: int

    view_change_pct: float
    sentiment_label: str
    sentiment_positive_pct: float
    engagement_level: str
    engagement_pct: float
    trend: str
    trend_explanation: str

class Comment(BaseModel):
    comment_id: str
    text: str
    author: str
    sentiment_label: str
    sentiment: float
    like_count: int
    dislike_count: int
    published_at: str

class AnalyzeResponse(BaseModel):
    video_id: str
    title: str
    channel_id: str
    channel_name: str
    thumbnail_url: str
    statistics: VideoStats
    num_comments_analyzed: int
