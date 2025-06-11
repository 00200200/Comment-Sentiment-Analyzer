from app.models.enums import SentimentHeadline

def classify_sentiment_headline(
    sentiment_totals: dict,
    avg_score: float,
    controversiality: float,
    engagement_rate: float
) -> SentimentHeadline:
    total = sum(sentiment_totals.values())
    if total == 0:
        return SentimentHeadline.NEUTRAL

    pos = sentiment_totals.get("positive", 0)
    neg = sentiment_totals.get("negative", 0)
    pos_ratio = pos / total
    neg_ratio = neg / total

    if controversiality > 0.6 and pos_ratio > 0.2 and neg_ratio > 0.2:
        return SentimentHeadline.CONTROVERSIAL

    if engagement_rate > 3.0 and avg_score > 0.2:
        return SentimentHeadline.VIRAL

    if pos_ratio > 0.65:
        return SentimentHeadline.POSITIVE
    if neg_ratio > 0.65:
        return SentimentHeadline.NEGATIVE

    if engagement_rate < 0.5 and abs(avg_score) < 0.2:
        return SentimentHeadline.BORING

    return SentimentHeadline.NEUTRAL
