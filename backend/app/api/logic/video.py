from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks
from datetime import datetime
from app.schemas.video import VideoResponse
from app.core.integrations.youtube.youtube_client import fetch_video_data
from app.core.sentiment.sentiment import analyze_text
from app.crud import video as crud_video
from app.api.logic.comment import analyze_all_comments
from app.models.video import EngagementLevel, AnalysisState
from app.utils.text_utils import parse_datetime
from datetime import timezone
import logging

logger = logging.getLogger(__name__)

async def get_or_create_video(video_id: str, db: AsyncSession, background_tasks: BackgroundTasks) -> VideoResponse:
    try:
        video = await crud_video.get_video_by_id(db, video_id)

        if video:
            if video.analysis_state in {AnalysisState.PENDING, AnalysisState.FAILED}:
                background_tasks.add_task(analyze_all_comments, db, video_id)
            return await crud_video.get_full_video_metadata(db, video_id)

        # Fetch from YouTube
        yt_data = fetch_video_data(video_id)
        snippet = yt_data.get("snippet", {})
        statistics = yt_data.get("statistics", {})

        title = snippet.get("title")
        if not title:
            raise ValueError("Missing 'title' in YouTube API response")

        # Parse publishedAt string into datetime
        published_at_str = snippet.get("publishedAt")
        if not published_at_str:
            raise ValueError("Missing 'publishedAt' in YouTube API response")
        
        published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00")).replace(tzinfo=None)

        sentiment_result = analyze_text(title)

        video_data = {
            "id": video_id,
            "title": title,
            "channel_id": snippet["channelId"],
            "channel_name": snippet["channelTitle"],
            "thumbnail_url": snippet["thumbnails"]["high"]["url"],
            "view_count": int(statistics.get("viewCount", 0)),
            "like_count": int(statistics.get("likeCount", 0)),
            "comment_count": int(statistics.get("commentCount", 0)),
            "published_at": published_at,
            "sentiment_label": sentiment_result["label"],
            "sentiment_positive_pct": round(sentiment_result["score"] * 100, 1),
            "engagement_pct": round(
                ((int(statistics.get("likeCount", 0)) + int(statistics.get("commentCount", 0))) / max(1, int(statistics.get("viewCount", 1)))) * 100, 1
            ),
            "engagement_level": EngagementLevel.MEDIUM.value,
            "trend": "New",
            "trend_explanation": "First analysis",
            "analysis_state": AnalysisState.IN_PROGRESS.value,
            "total_analyzed": 0
        }

        await crud_video.create_video(db, video_data)

        # Start analysis in background only
        background_tasks.add_task(analyze_all_comments, db, video_id)

        return await crud_video.get_full_video_metadata(db, video_id)

    except Exception as e:
        logger.exception(f"Error processing video_id={video_id}")
        raise
