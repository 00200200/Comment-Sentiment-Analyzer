# Emotube: Comment Sentiment Analyzer

Emotube is a web application that analyzes YouTube video comments to extract sentiment and other engagement metrics. The project is split into two parts: a backend API built with FastAPI that handles data retrieval and sentiment analysis, and a frontend that visualizes the results.

---

## Project Structure

```
.
├── backend
│   ├── app
│   │   ├── api
│   │   │   ├── endpoints.py          # API endpoints (analyze, comments, etc.)
│   │   │   └── dependencies.py       # Endpoint dependencies (e.g., DB sessions)
│   │   ├── core
│   │   │   ├── config.py             # App configuration (API keys, model names, etc.)
│   │   │   ├── sentiment.py          # Sentiment analysis functions (Hugging Face or custom)
│   │   │   └── youtube_client.py     # YouTube API interaction code
│   │   ├── db
│   │   │   └── models.py             # Database models (if using a DB for persistence)
│   │   ├── models
│   │   │   └── schemas.py            # Pydantic models for API requests/responses
│   │   ├── services
│   │   │   └── analytics.py          # Advanced analytics functions (audience sentiment, etc.)
│   │   ├── utils
│   │   │   └── text_utils.py         # Helper functions (video ID extraction, chunking, etc.)
│   │   └── main.py                   # FastAPI entry point
│   ├── .env.example                  # Example environment file (API keys, host, etc.)
│   ├── requirements.txt              # Python dependencies
│   └── README.md                     # Backend-specific documentation
├── frontend
└── README.md                         # Project overview and instructions
```

---

## Backend

### Stack

- **FastAPI** - For building the API endpoints.
- **Uvicorn** - ASGI server for running the FastAPI app.
- **Google API Python Client** - For interacting with the YouTube Data API.
- **Transformers** - For sentiment analysis using Hugging Face pre-trained models.
- **Pydantic** - For data validation and schema definitions.
- **Python-Dotenv** - For managing environment variables.

### Features

- **/analyze**: Accepts a YouTube URL or video ID, fetches video metadata and comments, and performs sentiment analysis.
- **/comments/{video_id}**: Retrieves stored comments with sentiment scores.
- **Advanced Analytics**: (Planned) Future endpoints for deep analysis, audience sentiment breakdown, and history saving.

### Backend Setup

1. **Clone the repository:**

   ```bash
   git clone git@github.com:00200200/Comment-Sentiment-Analyzer.git emotube
   cd emotube/backend
   ```

2. **Create and activate a virtual environment:**

   ```bash
   python -m venv venv
   source venv/bin/activate   # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies:**

   ```bash
   pip install -r requirements.txt
   ```

4. **Configure environment variables:**

   - Copy `.env.example` to `.env` and update the values (especially `YOUTUBE_API_KEY`):
     ```bash
     cp .env.example .env
     ```

5. **Run the server:**

   ```bash
   uvicorn app.main:app --reload
   ```

   The API will be available at [http://127.0.0.1:8000](http://127.0.0.1:8000).

6. **API Documentation:**
   - Visit [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs) for the interactive Swagger UI.

---

## Frontend

### Stack

- **React** - Typescript-based framework for building the user interface.
- **Tanstack Query** - For a powerful asynchronous state management while querying.
- **Tailwind CSS** - For styling components.
- **ShadCN** - For industry-standard basic components.
- **Chart.js/D3.js** - For data visualization (e.g., sentiment distribution charts).

### Features

- **Search & Analysis**: Enter a YouTube URL to fetch sentiment analysis results.
- **Dashboard**: Visualize video stats, sentiment distribution, and top keywords.
- **History**: (Planned) Save and revisit past analyses.

### Setup

tbd.

---

## Future Enhancements

- **Custom AI Model**: Train and integrate your own sentiment analysis model.
- **User Authentication**: Allow users to save and retrieve their analysis history.
- **Deep Analysis**: Expand analytics endpoints to include advanced metrics and trend analysis.
- **Database Integration**: Move from in-memory stores to a persistent database (e.g., PostgreSQL).

---

## License

This project is licensed under the [MIT License](LICENSE).
