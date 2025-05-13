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
    view_change_pct,
    engagement_level,
    engagement_pct,
    trend,
    trend_explanation,
    sentiment_label,
    sentiment_positive_pct,
  } = analysis;

  return (
    <section className="mt-4 mb-8">
      <h2 className="text-xl text-center font-medium mb-4">Sentiment Info</h2>

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
              <p className="text-sm text-gray-300">{channel_name}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 max-w-xl mx-auto mt-4">
        <StatBlock
          label="Views"
          value={view_count.toLocaleString()}
          change={view_change_pct}
          isPositiveChange={view_change_pct >= 0}
        />

        <StatBlock
          label="Comments"
          value={comment_count.toLocaleString()}
          sublabel="Average ratio"
        />

        <StatBlock
          label="Sentiment"
          value={sentiment_label}
          valueClass="text-red-500"
          sublabel={`${sentiment_positive_pct}% positive comments`}
          arrowDirection="down"
        />

        <StatBlock
          label="Thumbs"
          value={like_count.toLocaleString()}
          sublabel="Up"
        />

        <StatBlock label="" value="—" sublabel="Down" />

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
