from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.text_utils import extract_video_id
from app.api.logic.video import get_or_create_video
from app.schemas.video import VideoResponse
from app.db.session import get_db

router = APIRouter()

@router.get("/videos", response_model=VideoResponse)
async def fetch_video_by_url(
    url: str = Query(..., description="YouTube video URL"),
    background_tasks: BackgroundTasks = BackgroundTasks(),
    db: AsyncSession = Depends(get_db)
):
    try:
        video_id = extract_video_id(url)
        return await get_or_create_video(video_id, db, background_tasks)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))