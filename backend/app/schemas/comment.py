from pydantic import BaseModel
from typing import Dict, Optional, List
from datetime import datetime

from app.models.enums import SentimentLabel

class CommentSchema(BaseModel):
    id: str
    text: str
    author: str
    sentiment_label: str
    sentiment_score: float
    like_count: int
    published_at: datetime

    model_config = {
        "from_attributes": True  # Enables ORM conversion
    }


class CommentsResponseSchema(BaseModel):
    video_id: str
    comments: List[CommentSchema]
    sentiment_totals: Dict[SentimentLabel, int]
    total_available: int
    total_expected: int
    offset: int
    limit: int
    has_more: bool
    analysis_state: str


class ChartCommentSchema(BaseModel):
    id: str
    published_at: str
    sentiment_label: Optional[str]


class ChartCommentsResponseSchema(BaseModel):
    video_id: str
    comments: List[ChartCommentSchema]
