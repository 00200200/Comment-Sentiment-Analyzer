from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db.session import get_db
from app.utils.text_utils import extract_video_id
from app.crud.comment import get_chart_comments
from app.schemas.comment import ChartCommentsResponse, ChartComment

router = APIRouter()

@router.get("/chart-data", response_model=ChartCommentsResponse)
async def fetch_chart_data_by_url(
    url: str = Query(..., description="YouTube video URL"),
    db: AsyncSession = Depends(get_db)
):
    try:
        video_id = extract_video_id(url)
        if not video_id:
            raise HTTPException(status_code=400, detail="Invalid YouTube video URL")

        rows = await get_chart_comments(db, video_id)

        chart_comments = [
            ChartComment(
                id=row[0],
                published_at=row[1].isoformat(),
                sentiment_label=row[2]
            )
            for row in rows
        ]

        return ChartCommentsResponse(video_id=video_id, comments=chart_comments)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch chart data: {str(e)}")
