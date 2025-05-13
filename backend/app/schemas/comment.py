from pydantic import BaseModel, field_validator
from typing import Optional, List
from datetime import datetime

class Comment(BaseModel):
    comment_id: str
    text: str
    author: str
    sentiment_label: str
    sentiment: float
    like_count: int
    dislike_count: Optional[int] = 0
    published_at: str

    @classmethod
    def from_orm_model(cls, model: "Comment") -> "Comment":
        return cls(
            comment_id=model.id,
            text=model.text,
            author=model.author,
            sentiment_label=model.sentiment_label,
            sentiment=model.sentiment_score,
            like_count=model.like_count,
            dislike_count=model.dislike_count or 0,
            published_at=model.published_at.isoformat(),
        )



class CommentsResponse(BaseModel):
    video_id: str
    comments: List[Comment]
    total_available: int
    total_expected: int
    offset: int
    limit: int
    has_more: bool
    analysis_state: str


class ChartComment(BaseModel):
    id: str
    published_at: str
    sentiment_label: Optional[str]


class ChartCommentsResponse(BaseModel):
    video_id: str
    comments: List[ChartComment]
