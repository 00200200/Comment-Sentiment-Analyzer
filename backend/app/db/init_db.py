from app.db.session import engine
from app.models.video import Video
from app.models.comment import Comment
from sqlmodel import SQLModel

async def init_db():
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)
