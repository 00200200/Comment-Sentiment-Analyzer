from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class VideoResponse(BaseModel):
    id: str
    title: str
    channel_id: str
    channel_name: str
    thumbnail_url: str
    view_count: int
    like_count: int
    comment_count: int
    published_at: datetime
    
    view_change_pct: float
    sentiment_label: str
    sentiment_positive_pct: float
    engagement_level: str
    engagement_pct: float
    trend: str
    trend_explanation: str
    
    analysis_state: str
    total_analyzed: int
    fetched_at: datetime
    last_update: datetime
    
    class Config:
        orm_mode = True