from datetime import datetime
from typing import Dict
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field

from app.models.enums import AnalysisState, EngagementLevel, SentimentHeadline


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

    # Metrics
    like_rate: float = 0.0                              # Likes per 1000 views
    comment_rate: float = 0.0                           # Comments per 1000 views
    engagement_rate: float = 0.0                        # Combined likes/comments per views
    engagement_level: EngagementLevel = Field(default=EngagementLevel.MEDIUM)  # ❗ required for Pydantic schema
    engagement_label: str = "Medium"                    # ❗ required by VideoResponse schema

    # Sentiment
    sentiment_headline: SentimentHeadline = Field(default=SentimentHeadline.NEUTRAL)
    average_sentiment_score: float = 0.0                # ❗ required by VideoResponse schema
    controversiality_score: float = 0.0
    sentiment_totals: Dict[str, int] = Field(
        default_factory=dict, sa_column=Column(JSONB, nullable=True)
    )

    # Comment analysis
    total_analyzed: int = 0
    average_comment_length: float = 0.0

    # Trend
    trend: str = ""
    trend_explanation: str = ""

    # Meta
    analysis_state: AnalysisState = Field(default=AnalysisState.PENDING)
    fetched_at: datetime = Field(default_factory=datetime.utcnow)
    meta_last_update: datetime = Field(default_factory=datetime.utcnow)
    sentiment_last_update: datetime = Field(default_factory=datetime.utcnow)
