from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import Optional

from app.api.logic.comment import get_comments_paginated
from app.schemas.comment import CommentsResponse
from app.db.session import get_db
from app.utils.text_utils import extract_video_id

router = APIRouter()

@router.get("/comments", response_model=CommentsResponse)
async def fetch_comments_by_url(
    url: str = Query(..., description="YouTube video URL"),
    offset: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    sentiment: Optional[str] = Query(None),
    author: Optional[str] = Query(None),
    min_likes: Optional[int] = Query(None, ge=0),
    sort_by: str = Query("published_at"),
    sort_order: str = Query("desc"),
    db: AsyncSession = Depends(get_db)
):
    try:
        video_id = extract_video_id(url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube video URL")

        return await get_comments_paginated(
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
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
