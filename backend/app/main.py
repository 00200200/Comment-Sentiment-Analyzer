from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.core.config import settings

app = FastAPI(
    title="YouTube Sentiment Analysis API",
    description="Analyze YouTube video comments for sentiment and other metrics.",
    version="1.0.0",
)

# Configure CORS middleware
origins = [
    "http://localhost:3000",  # Frontend
    "http://localhost:8080"  # Backend
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.PORT, reload=True)