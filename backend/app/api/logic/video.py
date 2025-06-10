from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import BackgroundTasks
from datetime import datetime, timedelta
from app.utils.classify_sentiment_headline import classify_sentiment_headline
from app.utils.metrics import (
    compute_engagement_metrics,
    compute_controversiality,
    default_sentiment_totals,
)
from app.schemas.video import VideoResponse, AnalyzedVideoSummary, AnalyzedVideoList
from app.core.integrations.youtube.youtube_client import fetch_video_data
from app.core.sentiment.sentiment import analyze_text
from app.crud import video as crud_video
from app.crud import comment as crud_comment
from app.api.logic.comment import analyze_all_comments
from app.models.enums import EngagementLevel, AnalysisState, SentimentHeadline
from app.crud.video import get_analyzed_videos_paginated
from app.crud.comment import get_sentiment_totals
import logging

logger = logging.getLogger(__name__)

YOUTUBE_METADATA_TTL = timedelta(seconds=5)
SENTIMENT_STATS_TTL = timedelta(seconds=15)


async def get_or_create_video(video_id: str, db: AsyncSession, background_tasks: BackgroundTasks) -> VideoResponse:
    try:
        video = await crud_video.get_video_by_id(db, video_id)
        now = datetime.utcnow()

        if video:
            if video.analysis_state in {AnalysisState.PENDING, AnalysisState.FAILED}:
                background_tasks.add_task(analyze_all_comments, db, video_id)

            # Refresh YouTube metadata
            if (now - video.meta_last_update) > YOUTUBE_METADATA_TTL:
                yt_data = fetch_video_data(video_id)
                stats = yt_data.get("statistics", {})

                view_count = int(stats.get("viewCount", 0))
                like_count = int(stats.get("likeCount", 0))
                comment_count = int(stats.get("commentCount", 0))

                engagement = compute_engagement_metrics(view_count, like_count, comment_count)

                await crud_video.update_video(db, video_id, {
                    "view_count": view_count,
                    "like_count": like_count,
                    "comment_count": comment_count,
                    **engagement,
                    "meta_last_update": now
                })

            # Refresh sentiment stats
            if (now - video.sentiment_last_update) > SENTIMENT_STATS_TTL:
                raw_totals = await get_sentiment_totals(db, video_id)
                sentiment_totals = {label.value: count for label, count in raw_totals.items()}
                controversiality = compute_controversiality(sentiment_totals)

                comment_metrics = await crud_comment.get_comment_analysis_metrics(db, video_id)
                avg_score = round(comment_metrics.get("average_sentiment_score", 0.0), 3)
                avg_length = round(comment_metrics.get("average_comment_length", 0.0), 1)

                smart_label = classify_sentiment_headline(
                    sentiment_totals=sentiment_totals,
                    avg_score=avg_score,
                    controversiality=controversiality,
                    engagement_rate=video.engagement_rate
                )

                await crud_video.update_video(db, video_id, {
                    "sentiment_totals": sentiment_totals,
                    "controversiality_score": controversiality,
                    "sentiment_headline": smart_label,
                    "average_sentiment_score": avg_score,
                    "average_comment_length": avg_length,
                    "sentiment_last_update": now
                })
                
            return VideoResponse.model_validate(video)

        # Create new video if not found
        yt_data = fetch_video_data(video_id)
        snippet = yt_data.get("snippet", {})
        stats = yt_data.get("statistics", {})

        title = snippet.get("title")
        published_at_str = snippet.get("publishedAt")
        if not title or not published_at_str:
            raise ValueError("Missing title or publishedAt")

        published_at = datetime.fromisoformat(published_at_str.replace("Z", "+00:00")).replace(tzinfo=None)

        view_count = int(stats.get("viewCount", 0))
        like_count = int(stats.get("likeCount", 0))
        comment_count = int(stats.get("commentCount", 0))

        avg_score = 0.0
        controversiality = 0.0

        engagement = compute_engagement_metrics(view_count, like_count, comment_count)
        initial_totals = default_sentiment_totals()

        smart_label = SentimentHeadline.NEUTRAL  # Default label for new videos

        video_data = {
            "id": video_id,
            "title": title,
            "channel_id": snippet["channelId"],
            "channel_name": snippet["channelTitle"],
            "thumbnail_url": snippet["thumbnails"]["high"]["url"],
            "view_count": view_count,
            "like_count": like_count,
            "comment_count": comment_count,
            "published_at": published_at,
            "sentiment_label": smart_label,
            "average_sentiment_score": avg_score,
            **engagement,
            "engagement_level": EngagementLevel.MEDIUM,
            "trend": "New",
            "trend_explanation": "First analysis",
            "analysis_state": AnalysisState.IN_PROGRESS,
            "total_analyzed": 0,
            "sentiment_totals": initial_totals,
            "controversiality_score": controversiality,
            "average_comment_length": 0.0,
            "fetched_at": now,
            "last_update": now
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
                id=v.id,
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
