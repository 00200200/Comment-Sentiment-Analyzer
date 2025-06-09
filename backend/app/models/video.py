from __future__ import annotations
from datetime import datetime
from typing import Optional, Dict
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field

from app.models.enums import AnalysisState, EngagementLevel, SentimentLabel 


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

    view_change_pct: float = 0.0
    sentiment_totals: Optional[Dict[str, int]] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=True)
    )
    sentiment_label: SentimentLabel = Field(default=SentimentLabel.NEUTRAL)
    sentiment_positive_pct: float = 0.0
    engagement_level: EngagementLevel = Field(default=EngagementLevel.MEDIUM)
    engagement_pct: float = 0.0
    trend: str = ""
    trend_explanation: str = ""

    analysis_state: AnalysisState = Field(default=AnalysisState.PENDING)
    total_analyzed: int = 0
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    last_update: datetime = Field(default_factory=datetime.utcnow)
