from pydantic import BaseModel, ConfigDict
from typing import Optional, List
from datetime import datetime

class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
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

class AnalyzedVideoSummary(BaseModel):
    video_id: str
    title: str
    channel_name: str
    thumbnail_url: str
    published_at: datetime
    view_count: int
    comment_count: int
    total_analyzed: int
    analysis_state: str

class AnalyzedVideoList(BaseModel):
    videos: List[AnalyzedVideoSummary]
    offset: int
    limit: int
    total: int
    has_more: bool