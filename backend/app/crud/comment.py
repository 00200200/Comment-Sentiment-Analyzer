from typing import List, Optional
from datetime import datetime

from sqlalchemy.future import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import asc, desc, func

from app.models.comment import Comment
from app.schemas.comment import CommentsResponse
from app.crud.video import get_video_by_id


async def get_comment_by_id(db: AsyncSession, comment_id: str) -> Optional[Comment]:
    """Get a comment by its ID (used to prevent duplicates)."""
    result = await db.execute(select(Comment).where(Comment.id == comment_id))
    return result.scalars().first()


async def get_latest_comment_date(db: AsyncSession, video_id: str) -> Optional[datetime]:
    """Get the date of the most recent comment for a video."""
    result = await db.execute(
        select(Comment)
        .where(Comment.video_id == video_id)
        .order_by(Comment.published_at.desc())
        .limit(1)
    )
    comment = result.scalars().first()
    return comment.published_at if comment else None


async def get_chart_comments(db: AsyncSession, video_id: str) -> List[tuple]:
    """Get comment ID, timestamp, and sentiment for chart visualizations."""
    result = await db.execute(
        select(Comment.id, Comment.published_at, Comment.sentiment_label)
        .where(Comment.video_id == video_id)
        .order_by(Comment.published_at.asc())
    )
    return result.all()


async def save_comment(db: AsyncSession, video_id: str, comment: dict, sentiment: dict):
    """Insert a single analyzed comment unless it's already in the DB."""
    try:
        if await get_comment_by_id(db, comment["id"]):
            return  # Avoid duplicate inserts

        db_comment = Comment(
            id=comment["id"],
            video_id=video_id,
            text=comment["text"],
            author=comment["author"],
            like_count=comment.get("likeCount", 0),
            published_at=comment["publishedAt"],
            sentiment_label=sentiment["label"],
            sentiment_score=sentiment["score"],
        )
        db.add(db_comment)
        await db.commit()
    except Exception:
        await db.rollback()
        raise


async def query_comments(
    db: AsyncSession,
    video_id: str,
    offset: int,
    limit: int,
    sentiment: Optional[str],
    author: Optional[str],
    min_likes: Optional[int],
    sort_by: str,
    sort_order: str,
) -> CommentsResponse:
    """Query comments with full filtering, pagination, and sorting."""
    query = select(Comment).where(Comment.video_id == video_id)
    # Count query (no offset/limit)
    count_query = select(func.count()).select_from(query.subquery())
    total_available = await db.scalar(count_query)

    if sentiment:
        query = query.where(Comment.sentiment_label == sentiment)
    if author:
        query = query.where(Comment.author.ilike(f"%{author}%"))
    if min_likes is not None:
        query = query.where(Comment.like_count >= min_likes)

    sort_column = getattr(Comment, sort_by, Comment.published_at)
    query = query.order_by(asc(sort_column) if sort_order == "asc" else desc(sort_column))
    query = query.offset(offset).limit(limit)

    result = await db.execute(query)
    comments = result.scalars().all()

    video = await get_video_by_id(db, video_id)
    total_expected = video.comment_count if video else total_available
    analysis_state = video.analysis_state if video else "unknown"

    return {
        "video_id": video_id,
        "comments": comments,
        "total_available": total_available,
        "total_expected": total_expected,
        "offset": offset,
        "limit": limit,
        "has_more": offset + len(comments) < total_expected,
        "analysis_state": analysis_state,
    }