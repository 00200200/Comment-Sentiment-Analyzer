import type { AnalyzeResponse } from "@/types/AnalyzeResponse";
import { StatBlock } from "./StatBlock";

interface VideoDetailsProps {
  analysis: AnalyzeResponse;
}

export function VideoDetails({ analysis }: VideoDetailsProps) {
  const {
    view_count,
    like_count,
    comment_count,
    dislike_count = 151000,
    view_change_pct = 20.1,
    engagement_level = "High",
    engagement_pct = 37.2,
    trend = "Down",
    trend_explanation = "Increased negative feedback",
    sentiment_label = "F",
    sentiment_positive_pct = 3.2,
  } = analysis.statistics;

  return (
    <section className="mt-4 mb-8">
      <h2 className="text-xl font-medium mb-4">Video stats</h2>

      {/* Card with background image at ~8% opacity */}
      <div className="relative overflow-hidden rounded-md p-6 flex flex-col items-center text-center">
        {/* The large, semi-opaque background image */}
        <img
          src={analysis.thumbnail_url}
          alt="Background Thumbnail"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        {/* Card content */}
        <div className="relative w-full max-w-xl flex flex-col items-center">
          {/* Thumbnail + Title Row */}
          <div className="flex items-center justify-center gap-4 w-full">
            <img
              src={analysis.thumbnail_url}
              alt="Video Thumbnail"
              className="w-40 h-24 object-cover rounded-md flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold">{analysis.title}</h3>
              <p className="text-sm text-gray-300">{analysis.channel_id}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid - Matches Width */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-4">
        {/* Views */}
        <StatBlock
          label="Views"
          value={view_count.toLocaleString()}
          change={view_change_pct}
          isPositiveChange={true}
        />

        {/* Comments */}
        <StatBlock
          label="Comments"
          value={comment_count.toLocaleString()}
          sublabel="Average ratio"
        />

        {/* Sentiment */}
        <StatBlock
          label="Sentiment"
          value={sentiment_label}
          valueClass="text-red-500"
          sublabel={`${sentiment_positive_pct}% positive comments`}
          arrowDirection="down"
        />

        {/* Thumbs Up */}
        <StatBlock
          label="Thumbs"
          value={like_count.toLocaleString()}
          sublabel="Up"
        />

        {/* Thumbs Down */}
        <StatBlock
          label=""
          value={dislike_count.toLocaleString()}
          sublabel="Down"
        />

        {/* Engagement & Trend */}
        <StatBlock
          label="Engagement"
          value={engagement_level}
          valueClass="text-red-500"
          sublabel={`${engagement_pct}%`}
          arrowDirection={trend.toLowerCase() === "down" ? "down" : "up"}
          explanation={trend_explanation}
        />
      </div>
    </section>
  );
}
