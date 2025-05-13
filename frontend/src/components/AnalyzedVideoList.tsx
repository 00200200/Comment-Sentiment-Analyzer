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

export function AnalyzedVideoList() {
  const [page, setPage] = useState(1);
  const offset = (page - 1) * VIDEOS_PER_PAGE;
  const { data, isLoading, error } = useAnalyzedVideos(offset, VIDEOS_PER_PAGE);
  const navigate = useNavigate();

  return (
    <div className="w-full">
      <h2 className="text-xl font-semibold mb-4">Recent Analyses</h2>

      {isLoading && <p>Loading...</p>}
      {error && <p className="text-red-500">Error: {error.message}</p>}
      {data?.videos.length === 0 && <p>No analyzed videos found.</p>}

      <div className="space-y-3 w-full">
        {data?.videos.map((video: AnalyzedVideoSummary) => (
          <div
            key={video.video_id}
            className="relative overflow-hidden rounded-md p-4 w-full text-left hover:bg-muted/70 transition cursor-pointer"
            onClick={() =>
              navigate({
                to: "/video",
                search: {
                  url: `https://www.youtube.com/watch?v=${video.video_id}`,
                },
              })
            }
          >
            {/* Background thumbnail (semi-transparent) */}
            <img
              src={video.thumbnail_url}
              alt="Video background"
              className="absolute inset-0 w-full h-full object-cover opacity-10"
            />

            {/* Foreground content */}
            <div className="relative z-10 flex gap-4 items-start">
              <img
                src={video.thumbnail_url}
                alt="Video thumbnail"
                className="w-[128px] h-[80px] object-cover rounded flex-shrink-0"
              />
              <div className="flex flex-col">
                <h3 className="text-lg font-semibold leading-tight">
                  {video.title}
                </h3>
                <p className="text-sm text-gray-500">{video.channel_name}</p>
                <p className="text-sm">
                  {video.total_analyzed} / {video.comment_count} comments
                  analyzed
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {data && data.total > VIDEOS_PER_PAGE && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className={page === 1 ? "opacity-50 pointer-events-none" : ""}
                />
              </PaginationItem>
              <PaginationItem>
                <span className="px-4">
                  Page {page} of {Math.ceil(data.total / VIDEOS_PER_PAGE)}
                </span>
              </PaginationItem>
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((prev) => prev + 1)}
                  className={
                    !data.has_more ? "opacity-50 pointer-events-none" : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}
