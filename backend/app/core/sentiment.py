from transformers import pipeline, AutoTokenizer
from app.core.config import settings
from fastapi import HTTPException

sentiment_pipeline = pipeline("sentiment-analysis", model=settings.MODEL_NAME)
tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_NAME)


def analyze_text(text: str):
    try:
        result = sentiment_pipeline(text, truncation=True, max_length=512)
        return result[0]
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Sentiment Analysis Error: {str(e)}"
        )
