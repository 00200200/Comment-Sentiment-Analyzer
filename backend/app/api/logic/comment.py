import logging
import asyncio
from sqlalchemy.ext.asyncio import AsyncSession
from app.crud import comment as crud_comment
from app.crud import video as crud_video
from app.core.integrations.youtube.youtube_client import fetch_video_comments
from app.core.sentiment.sentiment import analyze_text
from app.models.video import AnalysisState
from app.schemas.comment import Comment, CommentsResponse

logger = logging.getLogger(__name__)

async def analyze_all_comments(db: AsyncSession, video_id: str):
    try:
        logger.info(f"[BG] Start analysis for video {video_id}")
        await crud_video.update_video_analysis_state(db, video_id, AnalysisState.IN_PROGRESS)

        next_page = None
        total_analyzed = 0

        while True:
            await asyncio.sleep(1)  # Respect API rate limit

            try:
                comments, next_page = fetch_video_comments(video_id, page_token=next_page)
            except Exception as e:
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
                    await crud_comment.save_comment(db, video_id, comment, sentiment)
                    total_analyzed += 1
                except Exception:
                    logger.exception(f"[BG] Error analyzing/saving comment: {comment.get('text', '')[:30]}...")

            await crud_video.update_video_analysis_state(
                db,
                video_id,
                AnalysisState.IN_PROGRESS,
                total_analyzed=total_analyzed
            )

            logger.info(f"[BG] Analyzed batch of {len(comments)} comments, total: {total_analyzed}")

            if not next_page:
                break

        await crud_video.update_video_analysis_state(
            db,
            video_id,
            AnalysisState.COMPLETED,
            total_analyzed=total_analyzed
        )

        logger.info(f"[BG] Completed analysis for {video_id}. Total analyzed: {total_analyzed}")

    except Exception:
        logger.exception(f"[BG] Fatal error during analysis for video {video_id}")
        await crud_video.update_video_analysis_state(db, video_id, AnalysisState.FAILED)


async def get_comments_paginated(db, video_id, offset, limit, sentiment, author, min_likes, sort_by, sort_order):
    results = await crud_comment.query_comments(
        db=db,
        video_id=video_id,
        offset=offset,
        limit=limit,
        sentiment=sentiment,
        author=author,
        min_likes=min_likes,
        sort_by=sort_by,
        sort_order=sort_order
    )

    return CommentsResponse(
        video_id=video_id,
        comments=[Comment.from_orm_model(c) for c in results["comments"]],
        total_available=results["total_available"],
        total_expected=results["total_expected"],
        offset=offset,
        limit=limit,
        has_more=(offset + len(results["comments"])) < results["total_available"],
        analysis_state=results["analysis_state"]
    )

