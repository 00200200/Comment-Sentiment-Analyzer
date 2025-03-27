from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.core import youtube_client, sentiment
from app.models import schemas
from app.utils import text_utils

router = APIRouter()

# In-memory stores for MVP; replace with DB later if needed.
video_data_store = {}
comments_data_store = {}

@router.get("/analyze", response_model=schemas.AnalyzeResponse)
async def analyze_video(video_url: str = Query(..., description="Full YouTube URL or video ID")):
    video_id = text_utils.extract_video_id(video_url)
    
    try:
        video_item = youtube_client.fetch_video_data(video_id)
        snippet = video_item["snippet"]
        statistics = video_item["statistics"]
        video_stats = schemas.VideoStats(
            title=snippet["title"],
            channel_id=snippet["channelId"],
            view_count=int(statistics.get("viewCount", 0)),
            like_count=int(statistics.get("likeCount", 0)),
            comment_count=int(statistics.get("commentCount", 0))
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube API Error: {str(e)}")
    
    try:
        comments = []
        comment_items = youtube_client.fetch_video_comments(video_id)
        for item in comment_items:
            comment_data = item["snippet"]["topLevelComment"]["snippet"]
            text = comment_data["textDisplay"]
            chunks = text_utils.chunk_text(text)
            sentiments = [sentiment.analyze_text(chunk) for chunk in chunks]
            avg_sentiment = sum(s["score"] for s in sentiments) / len(sentiments)
            sentiment_label = sentiments[0]["label"]
            comments.append(schemas.Comment(
                comment_id=item["id"],
                text=text,
                author=comment_data["authorDisplayName"],
                sentiment=avg_sentiment,
                sentiment_label=sentiment_label,
                like_count=comment_data.get("likeCount", 0),
                published_at=comment_data.get("publishedAt"),
            ))
        
        video_data_store[video_id] = video_stats
        comments_data_store[video_id] = comments
        
        return schemas.AnalyzeResponse(
            video_id=video_id,
            title=video_stats.title,
            channel_id=video_stats.channel_id,
            statistics=video_stats,
            num_comments_analyzed=len(comments)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing comments: {str(e)}")

@router.get("/comments/{video_id}", response_model=List[schemas.Comment])
async def get_comments(video_id: str):
    if video_id not in comments_data_store:
        raise HTTPException(status_code=404, detail="No comments found for this video.")
    return comments_data_store[video_id]
