from pydantic import BaseModel, ConfigDict
from typing import List, Dict, Optional
from datetime import datetime
from app.models.enums import SentimentLabel

class VideoResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    # Youtube video metadata
    id: str                                                         # Video ID
    title: str                                                      # Video title  
    channel_id: str                                                 # Channel ID    
    channel_name: str                                               # Channel name
    thumbnail_url: str                                              # Thumbnail URL
    view_count: int                                                 # View count
    like_count: int                                                 # Like count
    comment_count: int                                              # Comment count
    published_at: datetime                                          # Published date and time
    
    # Analysis metadata
    like_rate: Optional[float] = None                               # Likes per 1000 views
    sentiment_headline: str                                         # Overall sentiment label (smart interpretation)
    average_sentiment_score: float                                  # Sentiment average score
    controversiality_score: Optional[float] = None                  # How split the sentiment is (0 = unified, 1 = polarizing)
    sentiment_totals: Optional[Dict[SentimentLabel, int]] = None    # Counts of each sentiment label
    engagement_label: str                                           # Engagement level (Comments & likes as a percentage of views)
    engagement_rate: float                                          # Engagement rate
    
    # Comment analysis
    total_analyzed: int                                             # Total number of comments analyzed
    average_comment_length: Optional[float] = None                  # Average comment length (optional)
    comment_rate: Optional[float] = None                            # Comments per 1000 views (optional)
    
    # Analysis state
    analysis_state: str                                             # Current state of analysis (e.g., PENDING, COMPLETED, FAILED)
    fetched_at: datetime                                            # When the video was fetched
    meta_last_update: datetime                                      # Last metadata update timestamp
    sentiment_last_update: datetime                                 # Last sentiment data update timestamp
    

class AnalyzedVideoSummary(BaseModel):
    id: str
    title: str
    channel_name: str
    thumbnail_url: str
    published_at: datetime
    view_count: int
    comment_count: int
    sentiment_totals: Optional[Dict[SentimentLabel, int]] = None
    total_analyzed: int
    analysis_state: str

class AnalyzedVideoList(BaseModel):
    videos: List[AnalyzedVideoSummary]
    offset: int
    limit: int
    total: int
    has_more: bool