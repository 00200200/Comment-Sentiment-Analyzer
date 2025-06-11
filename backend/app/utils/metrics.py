from typing import Dict, Tuple
from app.models.enums import SentimentLabel


def compute_engagement_metrics(view_count: int, like_count: int, comment_count: int) -> Dict[str, float]:
    return {
        "engagement_rate": round((like_count + comment_count) / max(1, view_count) * 100, 1),
        "like_rate": round(like_count / max(1, view_count) * 1000, 2),
        "comment_rate": round(comment_count / max(1, view_count) * 1000, 2),
    }


def compute_controversiality(sentiment_totals: Dict[str, int]) -> float:
    pos = sentiment_totals.get("positive", 0)
    neg = sentiment_totals.get("negative", 0)

    return (
        round(1 - abs(pos - neg) / max(1, pos + neg), 3)
        if pos + neg > 0 else 0.0
    )


def default_sentiment_totals() -> Dict[str, int]:
    return {label.value: 0 for label in SentimentLabel}
