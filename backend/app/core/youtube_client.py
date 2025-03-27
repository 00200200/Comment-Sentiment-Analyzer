from googleapiclient.discovery import build
from app.core.config import settings

# Initialize YouTube API client
youtube = build("youtube", "v3", developerKey=settings.YOUTUBE_API_KEY)

def fetch_video_data(video_id: str):
    response = youtube.videos().list(
        part="snippet,statistics", id=video_id
    ).execute()
    if not response.get("items"):
        raise ValueError("Video not found")
    return response["items"][0]

def fetch_video_comments(video_id: str, max_results: int = 10):
    request = youtube.commentThreads().list(
        part="snippet",
        videoId=video_id,
        maxResults=max_results,
        textFormat="plainText"
    ).execute()
    return request.get("items", [])
