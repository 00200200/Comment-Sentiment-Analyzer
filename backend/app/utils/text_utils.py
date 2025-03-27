import re
from typing import List

def extract_video_id(youtube_url: str) -> str:
    regex = r"(?:v=|\/)([0-9A-Za-z_-]{11}).*"
    match = re.search(regex, youtube_url)
    return match.group(1) if match else youtube_url

def chunk_text(text: str, max_length: int = 512) -> List[str]:
    words = text.split()
    chunks = []
    while words:
        chunk = words[:max_length]
        chunks.append(" ".join(chunk))
        words = words[max_length:]
    return chunks
