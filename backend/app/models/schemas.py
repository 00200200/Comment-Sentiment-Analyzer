from pydantic import BaseModel
from typing import List, Optional

class VideoStats(BaseModel):
    title: str
    channel_id: str
    view_count: int
    like_count: int
    comment_count: int

class Comment(BaseModel):
    comment_id: str
    text: str
    author: Optional[str] = None
    sentiment: Optional[float] = None
    sentiment_label: Optional[str] = None
    like_count: Optional[int] = None
    published_at: Optional[str] = None

class AnalyzeResponse(BaseModel):
    video_id: str
    title: str
    channel_id: str
    statistics: VideoStats
    num_comments_analyzed: int
