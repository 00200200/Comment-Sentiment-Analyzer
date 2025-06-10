import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import type { AnalyzedVideoSummary } from "@/types/AnalyzedVideoList";
import { useAnalyzedVideos } from "@/hooks/useAnalyzedVideos";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const VIDEOS_PER_PAGE = 5;

// Extracted component for displaying a single video summary
const VideoSummary = ({
  video,
  navigate,
}: {
  video: AnalyzedVideoSummary;
  navigate: ReturnType<typeof useNavigate>;
}) => {
  return (
    <div
      key={video.id}
      className="relative overflow-hidden rounded-md p-4 w-full text-left hover:bg-muted/70 transition cursor-pointer"
      onClick={() =>
        navigate({
          to: "/video",
          search: {
            url: `https://www.youtube.com/watch?v=${video.id}`, // Corrected URL
          },
        })
      }
    >
      <img
        src={video.thumbnail_url}
        alt="Video background"
        className="absolute inset-0 w-full h-full object-cover opacity-10"
      />
      <div className="relative z-10 flex gap-4 items-start">
        <img
          src={video.thumbnail_url}
          alt="Video thumbnail"
          className="w-[128px] h-[80px] object-cover rounded flex-shrink-0"
        />
        <div className="flex flex-col">
          <h3 className="text-lg font-semibold leading-tight">{video.title}</h3>
          <p className="text-sm text-gray-500">{video.channel_name}</p>
          <p className="text-sm">
            {video.total_analyzed} / {video.comment_count} comments analyzed
          </p>
          <p className="text-sm">Analysis State: {video.analysis_state}</p>
          {video.sentiment_totals && (
            <div className="flex space-x-2">
              {Object.entries(video.sentiment_totals).map(([label, count]) => (
                <p key={label} className="text-xs">
                  {label}: {count}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Extracted component for the pagination controls
const VideoPagination = ({
  page,
  setPage,
  hasMore,
  total,
}: {
  page: number;
  setPage: (page: number) => void;
  hasMore: boolean;
  total: number;
}) => {
  return (
    <div className="mt-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => setPage(Math.max(page - 1, 1))}
              className={page === 1 ? "opacity-50 pointer-events-none" : ""}
            />
          </PaginationItem>
          <PaginationItem>
            <span className="px-4">
              Page {page} of {Math.ceil(total / VIDEOS_PER_PAGE)}
            </span>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext
              onClick={() => setPage(page + 1)}
              className={!hasMore ? "opacity-50 pointer-events-none" : ""}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
};

export function AnalyzedVideoList() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * VIDEOS_PER_PAGE;
  const { data, isLoading, error } = useAnalyzedVideos(offset, VIDEOS_PER_PAGE);
  const navigate = useNavigate();

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error.message}</p>;
  if (!data?.videos.length) return <p>No analyzed videos found.</p>;

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>
      <div className="space-y-3 w-full">
        {data.videos.map((video) => (
          <VideoSummary key={video.id} video={video} navigate={navigate} />
        ))}
      </div>
      {data.total > VIDEOS_PER_PAGE && (
        <VideoPagination
          page={page}
          setPage={setPage}
          hasMore={data.has_more}
          total={data.total}
        />
      )}
    </div>
  );
}

export default AnalyzedVideoList;
