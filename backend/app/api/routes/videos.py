from typing import Optional, Union
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.utils.text_utils import extract_video_id
from app.api.logic.video import get_or_create_video, get_paginated_video_list
from app.schemas.video import VideoResponse, AnalyzedVideoList
from app.db.session import get_db

router = APIRouter()

@router.get("/videos", response_model=Union[VideoResponse, AnalyzedVideoList])
async def get_videos(
    url: Optional[str] = Query(None),
    offset: int = Query(0, ge=0),
    limit: int = Query(25, ge=1, le=100),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    if url:
        video_id = extract_video_id(url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube video URL")
        return await get_or_create_video(video_id, db, background_tasks)
    
    return await get_paginated_video_list(db, offset, limit)
