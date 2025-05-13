from typing import Optional, Dict, Any
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.models.video import Video, AnalysisState
from app.schemas import video as schemas


from sqlalchemy import select, desc, func

async def get_analyzed_videos_paginated(
    db: AsyncSession, offset: int, limit: int
):
    query = select(Video).where(Video.analysis_state == "completed").order_by(desc(Video.fetched_at)).offset(offset).limit(limit)
    result = await db.execute(query)
    videos = result.scalars().all()

    total = await db.scalar(
        select(func.count()).select_from(Video).where(Video.analysis_state == "completed")
    )

    return videos, total



async def get_video_by_id(db: AsyncSession, video_id: str) -> Optional[Video]:
    """Get video by its ID without loading comments"""
    query = select(Video).where(Video.id == video_id)
    result = await db.execute(query)
    return result.scalars().first()


async def get_full_video_metadata(db: AsyncSession, video_id: str) -> Video:
    query = select(Video).options(selectinload(Video.comments)).where(Video.id == video_id)
    result = await db.execute(query)
    return result.scalars().first()


async def create_video(db: AsyncSession, video_data: Dict[str, Any]) -> Video:
    """Create a new video entry in the database"""
    db_video = Video(**video_data)
    db.add(db_video)
    await db.commit()
    await db.refresh(db_video)
    return db_video


async def update_video(db: AsyncSession, video_id: str, video_data: Dict[str, Any]) -> Optional[Video]:
    """Update video metadata and analysis results"""
    db_video = await get_video_by_id(db, video_id)
    if not db_video:
        return None
        
    for key, value in video_data.items():
        if hasattr(db_video, key):
            setattr(db_video, key, value)
            
    db_video.last_update = datetime.utcnow()
    
    await db.commit()
    await db.refresh(db_video)
    return db_video


async def update_video_analysis_state(
    db: AsyncSession, 
    video_id: str, 
    state: AnalysisState, 
    total_analyzed: Optional[int] = None
) -> Optional[Video]:
    """Update the analysis state of a video"""
    update_data = {"analysis_state": state, "last_update": datetime.utcnow()}
    if total_analyzed is not None:
        update_data["total_analyzed"] = total_analyzed
        
    return await update_video(db, video_id, update_data)