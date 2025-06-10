import type { AnalyzedVideoSummary } from "@/types/AnalyzedVideoList";
import { Progress } from "@/components/ui/progress";
import type { useNavigate } from "@tanstack/react-router";

export const VideoSummary = ({
  video,
  navigate,
}: {
  video: AnalyzedVideoSummary;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  // Calculate the progress value
  const progressValue =
    video.comment_count === 0
      ? 0
      : (video.total_analyzed / video.comment_count) * 100;

  // Determine whether it's 100%
  const isCompleted = video.analysis_state === "completed";
  const finalProgressValue = isCompleted ? 100 : progressValue;

  return (
    <div
      key={video.id}
      className="relative overflow-hidden rounded-md p-3 w-full text-left hover:bg-muted/70 transition cursor-pointer flex flex-col md:flex-row md:items-start md:gap-3"
      onClick={() =>
        navigate({
          to: "/video",
          search: {
            url: `https://www.youtube.com/watch?v=${video.id}`,
          },
        })
      }
    >
      <img
        src={video.thumbnail_url}
        alt="Video background"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="relative z-10 flex flex-col items-center md:flex-row md:items-start md:gap-3">
        <img
          src={video.thumbnail_url}
          alt="Video thumbnail"
          className="w-[156px] h-[84px] object-cover rounded flex-shrink-0 md:w-[120px] md:h-[72px]"
        />
        <div className="flex flex-col items-center md:items-start md:flex-grow md:gap-3">
          {/* Progress Bar with Percentage Label Inside */}
          <div className="relative w-72 h-5 mt-1">
            {" "}
            {/* Increased height for better text visibility */}
            <Progress
              value={finalProgressValue}
              className={`h-full rounded-full bg-[#dfbaf2]`}
            />
            <span
              className="absolute inset-0 flex items-center justify-center text-xs text-black font-semibold" // Increased text size
            >
              {Math.round(finalProgressValue)}%
            </span>
          </div>
          <div className="flex flex-col items-center md:items-start md:flex-grow">
            <h3
              className="text-m font-semibold leading-tight overflow-hidden whitespace-nowrap text-ellipsis" // Smaller font, single-line truncate
              style={{ maxWidth: "288px" }} // Adjust maxWidth as needed
            >
              {video.title}
            </h3>
            <p className="text-s text-gray-300">{video.channel_name}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
