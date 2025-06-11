from transformers import pipeline, AutoTokenizer
from app.core.config import settings
from fastapi import HTTPException

tokenizer = AutoTokenizer.from_pretrained(settings.MODEL_NAME,use_fast=False)
sentiment_pipeline = pipeline("sentiment-analysis",model=settings.MODEL_NAME,tokenizer=tokenizer,truncation=True,max_length=512)

_LABEL_MAP = {
    "LABEL_0": "negative",
    "LABEL_1": "neutral",
    "LABEL_2": "positive"
}

def analyze_text(text: str):
    try:
        result = sentiment_pipeline(text)
        label = result[0]["label"]
        score = result[0]["score"]
        if score < 0.6:
            label = "ambiguous"
        return {"label": _LABEL_MAP.get(label, label), "score": score}
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Sentiment Analysis Error: {str(e)}"
        )