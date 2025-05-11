from sqlmodel import SQLModel, Field, Relationship
from typing import Optional
from datetime import datetime
from enum import Enum


class SentimentLabel(str, Enum):
    POSITIVE = "positive"
    NEUTRAL = "neutral"
    NEGATIVE = "negative"


class Comment(SQLModel, table=True):
    __tablename__ = "comments"
    
    id: str = Field(primary_key=True)
    video_id: str = Field(foreign_key="videos.id")
    author: str
    text: str
    like_count: int
    dislike_count: int = 0
    published_at: datetime
    
    # Sentiment analysis fields
    sentiment_label: str = SentimentLabel.NEUTRAL
    sentiment_score: float = 0.0
    
    # Relationship
    video: "Video" = Relationship(back_populates="comments")