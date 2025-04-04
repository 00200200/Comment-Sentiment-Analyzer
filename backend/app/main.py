from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import endpoints
from app.core.config import settings

app = FastAPI(
    title="Emotube API",
    description="Analyze YouTube video comments for sentiment and other metrics.",
    version="1.0.0",
)

# Configure CORS middleware
origins = [
    f"http://{settings.HOST}:{settings.FRONTEND_PORT}",  # Frontend
    f"http://{settings.HOST}:{settings.BACKEND_PORT}",  # Backend
    "http://localhost:{settings.FRONTEND_PORT}",
    "http://emotube-frontend:{settings.FRONTEND_PORT}",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(endpoints.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host=settings.HOST, port=settings.BACKEND_PORT, reload=True)