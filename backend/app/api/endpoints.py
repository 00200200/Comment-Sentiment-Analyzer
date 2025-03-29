from fastapi import APIRouter, HTTPException, Query
from typing import List
from app.core import youtube_client, sentiment
from app.models import schemas
from app.utils import text_utils

router = APIRouter()

# In-memory stores for current and historical data.
video_data_store = {}
comments_data_store = {}

@router.get("/analyze", response_model=schemas.AnalyzeResponse)
async def analyze_video(video_url: str = Query(..., description="Full YouTube URL or video ID")):
    video_id = text_utils.extract_video_id(video_url)

    try:
        video_item = youtube_client.fetch_video_data(video_id)
        snippet = video_item["snippet"]
        statistics = video_item["statistics"]

        # Check required fields exist.
        if "channelTitle" not in snippet or "thumbnails" not in snippet:
            raise HTTPException(status_code=500, detail="Missing channelTitle or thumbnails in API response.")
        if "viewCount" not in statistics or "likeCount" not in statistics or "commentCount" not in statistics:
            raise HTTPException(status_code=500, detail="Missing necessary statistics fields in API response.")

        # Fetch dislike count if available, otherwise assume zero.
        dislike_count = statistics.get("dislikeCount")
        if dislike_count is None:
            # Optionally, integrate another API call here to retrieve dislikes if available.
            dislike_count = 0

        # Sentiment analysis for video title.
        title_sentiments = sentiment.analyze_text(snippet["title"])
        sentiment_label = title_sentiments["label"]
        sentiment_positive_pct = round(title_sentiments["score"] * 100, 1)

        # Convert raw counts.
        view_count = int(statistics["viewCount"])
        like_count = int(statistics["likeCount"])
        comment_count = int(statistics["commentCount"])

        # Compute engagement percentage.
        engagement_pct = round(((like_count + comment_count) / view_count) * 100, 1) if view_count > 0 else 0

        # Define engagement level based on computed engagement percentage.
        if engagement_pct > 10:
            engagement_level = "High"
        elif engagement_pct >= 5:
            engagement_level = "Medium"
        else:
            engagement_level = "Low"

        # Calculate view change percentage and trend compared to previous analysis.
        previous_video_stats = video_data_store.get(video_id)
        if previous_video_stats:
            previous_view_count = previous_video_stats.view_count
            if previous_view_count > 0:
                view_change_pct = round(((view_count - previous_view_count) / previous_view_count) * 100, 1)
            else:
                view_change_pct = 0.0
            if view_change_pct > 0:
                trend = "Up"
                trend_explanation = "View count increased compared to previous analysis."
            elif view_change_pct < 0:
                trend = "Down"
                trend_explanation = "View count decreased compared to previous analysis."
            else:
                trend = "No Change"
                trend_explanation = "View count remained the same as previous analysis."
        else:
            # First analysis: no change.
            view_change_pct = 0.0
            trend = "No Change"
            trend_explanation = "This is the first analysis of the video."

        # Build the video statistics payload.
        video_stats = schemas.VideoStats(
            title=snippet["title"],
            channel_id=snippet["channelId"],
            channel_name=snippet["channelTitle"],
            thumbnail_url=snippet["thumbnails"]["high"]["url"],
            view_count=view_count,
            like_count=like_count,
            dislike_count=int(dislike_count),
            comment_count=comment_count,
            view_change_pct=view_change_pct,
            sentiment_label=sentiment_label,
            sentiment_positive_pct=sentiment_positive_pct,
            engagement_level=engagement_level,
            engagement_pct=engagement_pct,
            trend=trend,
            trend_explanation=trend_explanation
        )

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"YouTube API Error: {str(e)}")

    try:
        comments = []
        comment_items = youtube_client.fetch_video_comments(video_id)
        for item in comment_items:
            comment_data = item["snippet"]["topLevelComment"]["snippet"]
            text = comment_data["textDisplay"]

            # Process sentiment on comment text.
            chunks = text_utils.chunk_text(text)
            sentiments = [sentiment.analyze_text(chunk) for chunk in chunks]
            avg_sentiment = sum(s["score"] for s in sentiments) / len(sentiments)
            comment_sentiment_label = sentiments[0]["label"]

            comments.append(schemas.Comment(
                comment_id=item["id"],
                text=text,
                author=comment_data["authorDisplayName"],
                sentiment=round(avg_sentiment, 2),
                sentiment_label=comment_sentiment_label,
                like_count=int(comment_data.get("likeCount", 0)),
                dislike_count=int(comment_data.get("dislikeCount", 0)),
                published_at=comment_data.get("publishedAt")
            ))

        # Save current video stats for future comparison.
        video_data_store[video_id] = video_stats
        comments_data_store[video_id] = comments

        return schemas.AnalyzeResponse(
            video_id=video_id,
            title=video_stats.title,
            channel_id=video_stats.channel_id,
            channel_name=video_stats.channel_name,
            thumbnail_url=video_stats.thumbnail_url,
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
