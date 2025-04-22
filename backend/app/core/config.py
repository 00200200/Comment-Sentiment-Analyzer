import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    YOUTUBE_API_KEY: str = os.getenv("YOUTUBE_API_KEY")
    HOST: str = os.getenv("HOST", "0.0.0.0")
    FRONTEND_PORT: str = os.getenv("FRONTEND_PORT", "3000")
    BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8000"))
    MODEL_NAME: str = "cardiffnlp/twitter-xlm-roberta-base-sentiment"
settings = Settings()

if not settings.YOUTUBE_API_KEY:
    raise ValueError("YOUTUBE_API_KEY not set. Check your environment or .env file.") 
