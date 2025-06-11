# Project Architecture Overview

This document explains the architecture and functionality of the YouTube sentiment analysis backend system. It includes a file-by-file explanation, an overview of YouTube API integration, data flow, comment processing, and how the backend works with the frontend.

---

## Folder Structure

```
.
├── main.py                          # FastAPI app entry point, includes all routers
├── api/
│   ├── endpoints/                   # FastAPI route definitions (split by feature)
│   │   ├── video_fetch.py          # POST /videos/fetch
│   │   ├── video_data.py           # GET /videos/{id}, /{id}/with-comments
│   │   ├── video_analysis.py       # POST /videos/{id}/resume
│   │   ├── comment.py              # GET /videos/{id}/comments (paginated, filtered)
│   │   └── video.py                # [Optional or generic video routes]
│   └── logic/                      # Business logic extracted from endpoints
│       ├── video_fetch_logic.py    # Handles video metadata fetching/storage
│       ├── video_analysis_logic.py # Continues/resumes background comment processing
│       ├── comment_analysis_logic.py # Fetches/analyzes comment batches
│       └── comment_query_logic.py  # Pagination/sorting/filtering from DB
├── core/
│   ├── config.py                   # Loads environment variables (e.g., API keys, DB URL)
│   ├── integrations/youtube/      # YouTube API logic
│   │   ├── youtube_client.py      # Fetch metadata/comments, handle pagination
│   └── sentiment/sentiment.py     # Sentiment analysis using TextBlob (or ML model)
├── crud/
│   ├── video.py                    # Video DB functions: create/update/get
│   └── comment.py                 # Comment DB functions: insert, count, get
├── db/
│   ├── session.py                 # SQLAlchemy async DB session creator
│   └── init_db.py                 # Creates tables on startup
├── models/
│   ├── video.py                   # SQLModel for Video
│   └── comment.py                 # SQLModel for Comment
├── schemas/
│   ├── video.py                   # Pydantic Video models
│   └── comment.py                 # Pydantic Comment models
├── utils/text_utils.py            # Text chunking and processing helpers
```

---

## YouTube API Integration

YouTube data is pulled using the official **YouTube Data API v3** via the `youtube_client.py` integration:

- **fetch_video_data(video_id)**

  - Pulls `snippet` and `statistics` for a single video.
  - Extracts title, channel, thumbnail, views, likes, and comment count.

- **fetch_video_comments(video_id, page_token)**

  - Fetches top-level comments in batches (up to 100).
  - Handles pagination using `nextPageToken`.

- **fetch_comments_after_date(video_id, date)**

  - Simulates fetching only new comments by filtering client-side after fetching.

All calls are wrapped with error handling and integrated with FastAPI background tasks.

---

## Data Processing Workflow

### Video Fetch

1. Frontend calls `POST /api/videos/fetch` with a YouTube URL.
2. The backend:

   - Extracts the video ID.
   - Checks if the video exists in the DB.
   - If not, fetches metadata from YouTube.
   - Analyzes the title's sentiment.
   - Stores video and initial stats in DB.
   - Fetches and processes the **first 100 comments**.
   - Schedules background tasks to process the rest.

### Comment Analysis

- Comments are fetched in **batches of 100**.
- Each comment is:

  - Cleaned and chunked (if long).
  - Analyzed using sentiment analysis.
  - Stored in the DB.

- Background tasks continue fetching until `nextPageToken` is `None`.

### Resume Analysis

- If a video’s analysis is incomplete and is requested again, the backend continues processing where it left off.

---

## How Backend Supports Frontend

### Video Metadata

- `GET /videos/{video_id}` or `/with-comments`
- Returns stats, sentiment, analysis status, and metadata fast (from DB).

### Comments Section

- `GET /videos/{video_id}/comments`
- Supports:

  - `offset`, `limit`
  - Filtering by sentiment, author, likes
  - Sorting by published date, likes, sentiment

- Returns:

  - List of processed comments
  - `total_analyzed`, `total_expected`, `has_more`
  - Current `analysis_state`

Frontend can show analyzed comments immediately and indicate that more are coming.

---

## Key Design Principles

- **Asynchronous and non-blocking**: all DB and external calls are async.
- **Persistent DB**: No in-memory cache; all comments and metadata stored reliably.
- **Extensible logic layer**: new APIs and platforms can be added with minimal changes.
- **Background-safe**: works with FastAPI BackgroundTasks or future queueing (Celery/RQ).

---

## Summary

This backend enables efficient, scalable, and reliable YouTube comment sentiment analysis by:

- Minimizing initial latency (quick metadata)
- Splitting comment work into safe, background-able batches
- Enabling frontend to interact via clean REST APIs with full query support

The modular architecture ensures long-term maintainability and team collaboration.
