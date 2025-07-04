from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import comments, videos, chart_data
from app.core.config import settings

app = FastAPI(
    title="Emotube API",
    description="Analyze YouTube video comments for sentiment and other metrics.",
    version="1.0.0",
)

# Configure CORS
origins = [
    f"http://{settings.HOST}:{settings.FRONTEND_PORT}",
    f"http://{settings.HOST}:{settings.BACKEND_PORT}",
    f"http://localhost:{settings.FRONTEND_PORT}",
    f"http://emotube-frontend:{settings.FRONTEND_PORT}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include feature-based routers
app.include_router(videos.router)
app.include_router(comments.router)
app.include_router(chart_data.router)

@app.on_event("startup")
async def on_startup():
    from app.db.init_db import init_db
    import logging
    logger = logging.getLogger("uvicorn")
    logger.info("▶️ Starting DB initialization...")
    await init_db()
    logger.info("✅ DB initialized.")

