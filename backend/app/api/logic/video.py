from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks
from datetime import datetime
from app.schemas.video import VideoResponse
from app.core.integrations.youtube.youtube_client import fetch_video_data
from app.core.sentiment.sentiment import analyze_text
from app.crud import video as crud_video
from app.api.logic.comment import analyze_all_comments
from app.models.comment import CommentModel
from app.models.enums import EngagementLevel, AnalysisState, SentimentLabel
from app.crud.video import get_analyzed_videos_paginated
from app.schemas.video import AnalyzedVideoSummary, AnalyzedVideoList
from app.crud.comment import get_sentiment_totals
import logging

logger = logging.getLogger(__name__)


async def get_or_create_video(video_id: str, db: AsyncSession, background_tasks: BackgroundTasks) -> VideoResponse:
    try:
        video = await crud_video.get_video_by_id(db, video_id)

        if video:
            if video.analysis_state in {AnalysisState.PENDING, AnalysisState.FAILED}:
                background_tasks.add_task(analyze_all_comments, db, video_id)

            # Refresh and update sentiment totals
            raw_totals = await get_sentiment_totals(db, video_id)
            sentiment_totals = {label.value: count for label, count in raw_totals.items()}
            await crud_video.update_video(db, video_id, {"sentiment_totals": sentiment_totals})
            video.sentiment_totals = sentiment_totals
            return VideoResponse.model_validate(video)

        # New video: fetch from YouTube
        yt_data = fetch_video_data(video_id)
        snippet = yt_data.get("snippet", {})
        statistics = yt_data.get("statistics", {})

        title = snippet.get("title")
        published_at_str = snippet.get("publishedAt")
        if not title or not published_at_str:
            raise ValueError("Missing 'title' or 'publishedAt'")

        published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00")).replace(tzinfo=None)

        sentiment_result = analyze_text(title)
        sentiment_mapping = {
            "positive": SentimentLabel.POSITIVE,
            "neutral": SentimentLabel.NEUTRAL,
            "negative": SentimentLabel.NEGATIVE,
            "ambiguous": SentimentLabel.AMBIGUOUS
        }
        sentiment_label = sentiment_mapping.get(sentiment_result["label"], SentimentLabel.NEUTRAL)

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
            "sentiment_label": sentiment_label,
            "sentiment_positive_pct": round(sentiment_result["score"] * 100, 1),
            "engagement_pct": round(
                ((int(statistics.get("likeCount", 0)) + int(statistics.get("commentCount", 0))) / max(1, int(statistics.get("viewCount", 1)))) * 100, 1
            ),
            "engagement_level": EngagementLevel.MEDIUM,
            "trend": "New",
            "trend_explanation": "First analysis",
            "analysis_state": AnalysisState.IN_PROGRESS,
            "total_analyzed": 0,
            "sentiment_totals": {label.value: 0 for label in SentimentLabel}
        }

        await crud_video.create_video(db, video_data)
        background_tasks.add_task(analyze_all_comments, db, video_id)

        return VideoResponse.model_validate(await crud_video.get_video_by_id(db, video_id))

    except Exception:
        logger.exception(f"Error processing video_id={video_id}")
        raise


async def get_paginated_video_list(db: AsyncSession, offset: int, limit: int) -> AnalyzedVideoList:
    videos, total = await get_analyzed_videos_paginated(db, offset, limit)

    return AnalyzedVideoList(
        videos=[
            AnalyzedVideoSummary(
                video_id=v.id,
                title=v.title,
                channel_name=v.channel_name,
                thumbnail_url=v.thumbnail_url,
                published_at=v.published_at,
                view_count=v.view_count,
                comment_count=v.comment_count,
                total_analyzed=v.total_analyzed,
                analysis_state=v.analysis_state,
                sentiment_totals=v.sentiment_totals,
            )
            for v in videos
        ],
        offset=offset,
        limit=limit,
        total=total,
        has_more=(offset + len(videos)) < total
    )
