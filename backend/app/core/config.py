import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY")
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    MODEL_NAME: str = "distilbert-base-uncased-finetuned-sst-2-english"

settings = Settings()

if not settings.YOUTUBE_API_KEY:
    raise ValueError("YOUTUBE_API_KEY not set. Check your environment or .env file.")
