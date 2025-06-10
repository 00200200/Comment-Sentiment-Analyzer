from datetime import datetime
import re
from typing import List
from urllib.parse import parse_qs, urlparse

# app/utils/text_utils.py

import re
from urllib.parse import urlparse, parse_qs
from typing import Optional

def extract_video_id(url: str) -> Optional[str]:
    """
    Extracts the YouTube video ID (11 characters) from various YouTube URL formats.
    Handles standard watch URLs, short URLs, embed URLs, and shorts URLs.
    """
    if not url:
        return None

    # This regex is designed to capture the 11-character video ID
    # It tries to be flexible with different YouTube domain/path patterns.
    youtube_regex = (
        r'(?:https?://)?'  # Optional http or https
        r'(?:www\.)?'      # Optional www.
        r'(?:m\.)?'        # Optional m. for mobile
        r'(?:youtube\.com|youtu\.be)' # youtube.com or youtu.be
        r'(?:/(?:watch\?v=|embed/|v/|shorts/|e/|\.be/|watch\?.+&v=))' # various path patterns
        r'([a-zA-Z0-9_-]{11})' # <--- CAPTURE GROUP: exactly 11 characters (alphanumeric, hyphen, underscore)
        r'(?:[?&].*)?'     # Optional query parameters after the ID
        r'(?:#.*)?'        # Optional hash fragments
    )

    match = re.search(youtube_regex, url)
    if match:
        return match.group(1) # Return the captured 11-character ID

    # Fallback: If not matched by regex, try parsing query parameters for 'v'
    # This might catch some edge cases, but the regex should handle most.
    try:
        parsed_url = urlparse(url)
        if parsed_url.hostname and ('youtube.com' in parsed_url.hostname or 'youtu.be' in parsed_url.hostname):
            query_params = parse_qs(parsed_url.query)
            if 'v' in query_params:
                video_id_from_query = query_params['v'][0]
                if re.fullmatch(r'[a-zA-Z0-9_-]{11}', video_id_from_query):
                    return video_id_from_query
    except Exception:
        # Handle cases where urlparse might fail on malformed URLs
        pass
        
    return None

def chunk_text(text: str, max_length: int = 512) -> List[str]:
    words = text.split()
    chunks = []
    while words:
        chunk = words[:max_length]
        chunks.append(" ".join(chunk))
        words = words[max_length:]
    return chunks

def parse_datetime(dt_str: str) -> datetime:
    # Converts string like "2025-05-11T22:33:20Z" to naive UTC datetime
    return datetime.fromisoformat(dt_str.replace("Z", "+00:00")).replace(tzinfo=None)
