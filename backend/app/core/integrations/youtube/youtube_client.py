from googleapiclient.discovery import build
from app.utils.text_utils import parse_datetime
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

def fetch_video_comments(video_id: str, max_results: int = 10, page_token: str = None):
    request_args = {
        "part": "snippet",
        "videoId": video_id,
        "maxResults": max_results,
        "textFormat": "plainText"
    }
    if page_token:
        request_args["pageToken"] = page_token  # ✅ only add if valid

    response = youtube.commentThreads().list(**request_args).execute()

    comments = []
    for item in response.get("items", []):
        top_comment = item["snippet"]["topLevelComment"]
        snippet = top_comment["snippet"]

        published_at_raw = snippet.get("publishedAt")
        published_at = parse_datetime(published_at_raw) if published_at_raw else None

        comments.append({
            "id": top_comment["id"],
            "text": snippet.get("textDisplay", ""),
            "author": snippet.get("authorDisplayName", ""),
            "likeCount": snippet.get("likeCount", 0),
            "publishedAt": published_at,
            "authorChannelId": snippet.get("authorChannelId", {}).get("value", None),
            "viewerRating": snippet.get("viewerRating", None),
            "updatedAt": parse_datetime(snippet["updatedAt"]) if "updatedAt" in snippet else published_at
        })

    next_page_token = response.get("nextPageToken")
    return comments, next_page_token


def fetch_comments_after_date(video_id: str, after_date: str):
    """Fetch comments newer than the specified date"""
    # Initial request without page token
    items, next_page_token = fetch_video_comments(video_id, max_results=100)
    
    newer_comments = []
    # Keep collecting comments until we hit the date threshold or run out of pages
    while True:
        for item in items:
            comment_date = item["snippet"]["topLevelComment"]["snippet"]["publishedAt"]
            if comment_date > after_date:
                newer_comments.append(item)
            else:
                # Once we hit older comments, return what we have
                return newer_comments
        
        # If no more pages, return what we have
        if not next_page_token:
            break
            
        # Fetch next page
        items, next_page_token = fetch_video_comments(video_id, max_results=100, page_token=next_page_token)
    
    return newer_comments