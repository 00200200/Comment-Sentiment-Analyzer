from fastapi import FastAPI
from app.api import endpoints
from app.core.config import settings

app = FastAPI(
    title="YouTube Sentiment Analysis API",
    description="Analyze YouTube video comments for sentiment and other metrics.",
    version="1.0.0",
)

app.include_router(endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, reload=True)
