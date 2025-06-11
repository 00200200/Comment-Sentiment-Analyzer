from typing import Optional, Union
from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from urllib.parse import unquote

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
    """
    Handles requests for video analysis or a list of analyzed videos.

    If a 'url' query parameter is provided:
    - Extracts the YouTube video ID.
    - Fetches or creates the video entry in the database.
    - Triggers background analysis if the video is new or requires re-analysis.
    
    If no 'url' is provided:
    - Returns a paginated list of previously analyzed videos.
    """
    if url:
        # Decode the URL to ensure 'extract_video_id' receives a clean, unencoded string.
        # This accounts for varying client-side encoding behaviors or multiple encoding layers.
        decoded_url = unquote(url)
        
        video_id = extract_video_id(decoded_url)
        
        if not video_id:
            raise HTTPException(
                status_code=400, 
                detail=f"Invalid YouTube video URL or could not extract ID from: {decoded_url}"
            )
        
        return await get_or_create_video(video_id, db, background_tasks)
    
    return await get_paginated_video_list(db, offset, limit)