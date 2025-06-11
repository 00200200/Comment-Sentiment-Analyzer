import logging
import asyncio
from collections import Counter
from sqlalchemy.ext.asyncio import AsyncSession

from app.crud import comment as crud_comment
from app.crud import video as crud_video
from app.core.integrations.youtube.youtube_client import fetch_video_comments
from app.core.sentiment.sentiment import analyze_text
from app.models.enums import AnalysisState, SentimentLabel

logger = logging.getLogger(__name__)


async def analyze_all_comments(db: AsyncSession, video_id: str):
    try:
        logger.info(f"[BG] Starting analysis for video {video_id}")
        await crud_video.update_video_analysis_state(db, video_id, AnalysisState.IN_PROGRESS)

        next_page = None
        total_analyzed = 0
        sentiment_totals = Counter()

        while True:
            await asyncio.sleep(1)  # Respect API rate limits

            try:
                comments, next_page = fetch_video_comments(video_id, page_token=next_page)
            except Exception:
                logger.exception(f"[BG] Failed to fetch comments for video {video_id} (page: {next_page})")
                await crud_video.update_video_analysis_state(db, video_id, AnalysisState.FAILED)
                return

            if not comments:
                logger.warning(f"[BG] No comments fetched for {video_id} (page: {next_page})")
                await crud_video.update_video_analysis_state(db, video_id, AnalysisState.FAILED)
                return

            for comment in comments:
                try:
                    sentiment = analyze_text(comment["text"])
                    sentiment_label = {
                        "positive": SentimentLabel.POSITIVE,
                        "neutral": SentimentLabel.NEUTRAL,
                        "negative": SentimentLabel.NEGATIVE,
                        "ambiguous": SentimentLabel.AMBIGUOUS,
                    }.get(sentiment["label"], SentimentLabel.NEUTRAL)

                    sentiment["label"] = sentiment_label
                    await crud_comment.save_comment(db, video_id, comment, sentiment)

                    sentiment_totals[sentiment_label] += 1
                    total_analyzed += 1
                except Exception:
                    logger.exception(f"[BG] Error analyzing/saving comment: {comment.get('text', '')[:30]}...")

            await crud_video.update_video_analysis_state(
                db,
                video_id,
                AnalysisState.IN_PROGRESS,
                total_analyzed=total_analyzed
            )

            logger.debug(f"[BG] Processed {len(comments)} comments, total analyzed: {total_analyzed}")

            if not next_page:
                break

        await crud_video.update_video_analysis_state(
            db,
            video_id,
            AnalysisState.COMPLETED,
            total_analyzed=total_analyzed
        )

        logger.info(f"[BG] Completed analysis for {video_id}. Total: {total_analyzed}")
        logger.info(f"[BG] Sentiment breakdown: {dict(sentiment_totals)}")

    except Exception:
        logger.exception(f"[BG] Fatal error during analysis for video {video_id}")
        await crud_video.update_video_analysis_state(db, video_id, AnalysisState.FAILED)


async def get_comments_paginated(
    db,
    video_id,
    offset,
    limit,
    sentiment,
    author,
    min_likes,
    phrase,
    sort_by,
    sort_order
):
    return await crud_comment.query_comments(
        db=db,
        video_id=video_id,
        offset=offset,
        limit=limit,
        sentiment=sentiment,
        author=author,
        min_likes=min_likes,
        phrase=phrase,
        sort_by=sort_by,
        sort_order=sort_order
    )
