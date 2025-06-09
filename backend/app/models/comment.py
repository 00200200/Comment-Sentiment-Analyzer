from sqlmodel import SQLModel, Field
from datetime import datetime
from app.models.enums import SentimentLabel

class CommentModel(SQLModel, table=True):
    __tablename__ = "comments"
    
    id: str = Field(primary_key=True)
    video_id: str = Field(foreign_key="videos.id")
    author: str
    text: str
    like_count: int
    dislike_count: int = 0
    published_at: datetime
    
    sentiment_label: SentimentLabel = Field(default=SentimentLabel.NEUTRAL)
    sentiment_score: float = 0.0
