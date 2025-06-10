// Use type-only imports for string literal types
import type { SentimentHeadline, SentimentLabel } from "@/types/types";

import { StatBlock } from "./StatBlock";
import type { VideoResponse } from "@/types/VideoResponse";

interface VideoDetailsProps {
  analysis: VideoResponse;
}

export function VideoDetails({ analysis }: VideoDetailsProps) {
  const {
    view_count,
    like_count,
    comment_count,
    thumbnail_url,
    title,
    channel_name,
    engagement_rate,
    sentiment_headline,
    average_sentiment_score, // If you plan to use this, uncomment the relevant display. Otherwise, consider removing from destructuring.
    sentiment_totals,
    like_rate,
    controversiality_score, // Corrected variable name
    engagement_label,
  } = analysis;

  // --- Calculations and Derived Values ---

  // Calculate positive sentiment percentage from sentiment_totals
  const totalSentiments = Object.values(sentiment_totals || {}).reduce(
    (sum, count) => sum + (count || 0),
    0
  );
  // Correctly access sentiment_totals using string literals
  const positiveSentimentCount = sentiment_totals?.positive || 0;
  const positiveSentimentPct =
    totalSentiments > 0 ? (positiveSentimentCount / totalSentiments) * 100 : 0;

  // Determine sentiment color based on sentiment_headline (using string literal values directly)
  let sentimentColorClass = "";
  switch (sentiment_headline) {
    case "positive": // Use string literal directly
      sentimentColorClass = "text-green-500";
      break;
    case "negative": // Use string literal directly
      sentimentColorClass = "text-red-500";
      break;
    case "neutral": // Use string literal directly
      sentimentColorClass = "text-gray-500";
      break;
    case "controversial": // Use string literal directly
      sentimentColorClass = "text-yellow-500";
      break;
    case "viral": // Use string literal directly
      sentimentColorClass = "text-purple-500";
      break;
    case "boring": // Use string literal directly
      sentimentColorClass = "text-gray-400";
      break;
    default:
      sentimentColorClass = "";
  }

  // Determine engagement color based on engagement_label
  let engagementColorClass = "";
  if (engagement_label === "low") {
    engagementColorClass = "text-red-500";
  } else if (engagement_label === "high") {
    engagementColorClass = "text-green-500";
  }

  // Handle optional controversy_score for display and calculation
  // Ensure we safely handle `controversiality_score` being `null` or `undefined`
  const controversyDisplayValue =
    controversiality_score !== null && controversiality_score !== undefined
      ? `${(controversiality_score * 100).toFixed(1)}%`
      : "N/A";

  const controversyColorClass =
    controversiality_score !== null &&
    controversiality_score !== undefined &&
    controversiality_score > 0.5
      ? "text-red-500"
      : "";

  // --- Render Section ---

  return (
    <section className="mt-4 mb-8">
      <h2 className="text-xl text-center font-medium mb-4">
        Analysis Overview
      </h2>

      <div className="relative overflow-hidden rounded-md p-6 flex flex-col items-center text-center">
        <img
          src={thumbnail_url}
          alt="Background Thumbnail"
          className="absolute inset-0 w-full h-full object-cover opacity-10"
        />

        <div className="relative w-full max-w-xl flex flex-col items-center">
          <div className="flex items-center justify-center gap-4 w-full">
            <img
              src={thumbnail_url}
              alt="Video Thumbnail"
              className="w-40 h-24 object-cover rounded-md flex-shrink-0"
            />
            <div>
              <h3 className="text-lg font-bold">{title}</h3>
              <p className="text-sm text-gray-500">{channel_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-4">
        <StatBlock label="Views" value={view_count.toLocaleString()} />

        <StatBlock
          label="Likes"
          value={like_count?.toLocaleString() || "N/A"}
          sublabel={
            like_rate !== null && like_rate !== undefined
              ? `${like_rate.toFixed(1)}/1k views`
              : "N/A"
          }
        />

        <StatBlock
          label="Comments"
          value={comment_count.toLocaleString()}
          sublabel="Total"
        />

        <StatBlock
          label="Sentiment"
          value={sentiment_headline}
          valueClass={sentimentColorClass}
          sublabel={`${positiveSentimentPct.toFixed(1)}% positive`}
        />

        <StatBlock
          label="Engagement"
          value={engagement_label}
          valueClass={engagementColorClass}
          sublabel={`${engagement_rate.toFixed(1)}% rate`}
        />

        {/* The controversiality StatBlock */}
        <StatBlock
          label="Controversy"
          value={controversyDisplayValue}
          sublabel="Polarizing score"
          valueClass={controversyColorClass}
        />
      </div>
    </section>
  );
}
