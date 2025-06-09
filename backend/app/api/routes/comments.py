from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional
from collections import Counter

from app.api.logic.comment import get_comments_paginated
from app.schemas.comment import CommentsResponseSchema, CommentSchema
from app.db.session import get_db
from app.models.enums import SentimentLabel
from app.models.comment import CommentModel
from app.utils.text_utils import extract_video_id
from sqlalchemy import select

router = APIRouter()


@router.get("/comments", response_model=CommentsResponseSchema)
async def fetch_comments_by_url(
    url: str = Query(..., description="YouTube video URL"),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sentiment: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    min_likes: Optional[int] = Query(None, ge=0),
    phrase: Optional[str] = Query(None, description="Filter by phrase in comment"),
    sort_by: str = Query("published_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db)
):
    try:
        video_id = extract_video_id(url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube video URL")

        # Fetch main paginated response
        response = await get_comments_paginated(
            db=db,
            video_id=video_id,
            offset=offset,
            limit=limit,
            sentiment=sentiment,
            author=author,
            min_likes=min_likes,
            sort_by=sort_by,
            sort_order=sort_order,
            phrase=phrase
        )

        # Fetch sentiment totals for the filtered result set (no pagination)
        base_query = select(CommentModel.sentiment_label).where(CommentModel.video_id == video_id)

        if sentiment:
            base_query = base_query.where(CommentModel.sentiment_label == SentimentLabel(sentiment))
        if author:
            base_query = base_query.where(CommentModel.author.ilike(f"%{author}%"))
        if min_likes is not None:
            base_query = base_query.where(CommentModel.like_count >= min_likes)
        if phrase:
            base_query = base_query.where(CommentModel.text.ilike(f"%{phrase}%"))

        result = await db.execute(base_query)
        sentiment_counts = Counter(row[0] for row in result.all())

        sentiment_totals = {
            label: sentiment_counts.get(label, 0)
            for label in SentimentLabel
        }

        response.sentiment_totals = sentiment_totals

        return response

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
