from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime
from enum import Enum


class AnalysisState(str, Enum):
    PENDING = "pending"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


class EngagementLevel(str, Enum):
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


class Video(SQLModel, table=True):
    __tablename__ = "videos"
    
    id: str = Field(primary_key=True)
    title: str
    channel_id: str
    channel_name: str
    thumbnail_url: str
    view_count: int
    like_count: int
    comment_count: int
    published_at: datetime
    
    # Analysis fields
    view_change_pct: float = 0.0
    sentiment_label: str = "neutral"
    sentiment_positive_pct: float = 0.0
    engagement_level: str = EngagementLevel.MEDIUM
    engagement_pct: float = 0.0
    trend: str = ""
    trend_explanation: str = ""
    
    # Tracking fields
    analysis_state: str = AnalysisState.PENDING
    total_analyzed: int = 0
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    last_update: datetime = Field(default_factory=datetime.utcnow)
    
    # Relationship
    comments: List["Comment"] = Relationship(back_populates="video")