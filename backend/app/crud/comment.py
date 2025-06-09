from typing import Dict, List, Optional
from datetime import datetime

from sqlalchemy import select, asc, desc, func
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.comment import CommentModel
from app.models.enums import SentimentLabel
from app.schemas.comment import CommentSchema, CommentsResponseSchema
from app.crud.video import get_video_by_id


async def get_sentiment_totals(
    db: AsyncSession,
    video_id: str,
    sentiment: Optional[SentimentLabel] = None,
    author: Optional[str] = None,
    min_likes: Optional[int] = None,
    phrase: Optional[str] = None
) -> Dict[SentimentLabel, int]:
    query = select(CommentModel.sentiment_label, func.count()).where(CommentModel.video_id == video_id)

    if sentiment:
        query = query.where(CommentModel.sentiment_label == sentiment)
    if author:
        query = query.where(CommentModel.author.ilike(f"%{author}%"))
    if min_likes is not None:
        query = query.where(CommentModel.like_count >= min_likes)
    if phrase:
        query = query.where(CommentModel.text.ilike(f"%{phrase}%"))

    query = query.group_by(CommentModel.sentiment_label)
    result = await db.execute(query)
    counts = dict(result.all())

    totals = {label: 0 for label in SentimentLabel}
    totals.update(counts)
    return totals


async def get_comment_by_id(db: AsyncSession, comment_id: str) -> Optional[CommentModel]:
    result = await db.execute(select(CommentModel).where(CommentModel.id == comment_id))
    return result.scalars().first()


async def get_latest_comment_date(db: AsyncSession, video_id: str) -> Optional[datetime]:
    result = await db.execute(
        select(CommentModel)
        .where(CommentModel.video_id == video_id)
        .order_by(CommentModel.published_at.desc())
        .limit(1)
    )
    comment = result.scalars().first()
    return comment.published_at if comment else None


async def get_chart_comments(db: AsyncSession, video_id: str) -> List[tuple]:
    result = await db.execute(
        select(CommentModel.id, CommentModel.published_at, CommentModel.sentiment_label)
        .where(CommentModel.video_id == video_id)
        .order_by(CommentModel.published_at.asc())
    )
    return result.all()


async def save_comment(db: AsyncSession, video_id: str, comment: dict, sentiment: dict):
    try:
        if await get_comment_by_id(db, comment["id"]):
            return

        db_comment = CommentModel(
            id=comment["id"],
            video_id=video_id,
            text=comment["text"],
            author=comment["author"],
            like_count=comment.get("likeCount", 0),
            published_at=comment["publishedAt"],
            sentiment_label=SentimentLabel(sentiment["label"]),
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
    phrase: Optional[str],
) -> CommentsResponseSchema:
    base_query = select(CommentModel).where(CommentModel.video_id == video_id)

    sentiment_enum = None
    if sentiment:
        try:
            sentiment_enum = SentimentLabel(sentiment)
            base_query = base_query.where(CommentModel.sentiment_label == sentiment_enum)
        except ValueError:
            sentiment_enum = SentimentLabel.NEUTRAL
            base_query = base_query.where(CommentModel.sentiment_label == sentiment_enum)

    if author:
        base_query = base_query.where(CommentModel.author.ilike(f"%{author}%"))
    if min_likes is not None:
        base_query = base_query.where(CommentModel.like_count >= min_likes)
    if phrase:
        base_query = base_query.where(CommentModel.text.ilike(f"%{phrase}%"))

    total_available = await db.scalar(
        select(func.count()).select_from(base_query.subquery())
    )

    # Call helper to get sentiment totals
    sentiment_totals = await get_sentiment_totals(
        db=db,
        video_id=video_id,
        sentiment=sentiment_enum,
        author=author,
        min_likes=min_likes,
        phrase=phrase
    )

    sort_column = getattr(CommentModel, sort_by, CommentModel.published_at)
    order = asc(sort_column) if sort_order == "asc" else desc(sort_column)
    base_query = base_query.order_by(order).offset(offset).limit(limit)

    result = await db.execute(base_query)
    comment_rows = result.scalars().all()

    video = await get_video_by_id(db, video_id)
    total_expected = video.comment_count if video else total_available
    analysis_state = video.analysis_state if video else "unknown"

    comments = [
        CommentSchema.model_validate(c).model_dump(exclude={"sentiment_totals"}) for c in comment_rows
    ]

    return CommentsResponseSchema(
        video_id=video_id,
        comments=comments,
        total_available=total_available,
        total_expected=total_expected,
        offset=offset,
        limit=limit,
        has_more=(offset + len(comments)) < total_expected,
        analysis_state=analysis_state,
        sentiment_totals=sentiment_totals,
    )
