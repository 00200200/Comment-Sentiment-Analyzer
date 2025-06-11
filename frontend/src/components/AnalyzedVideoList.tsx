import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { VideoSummary } from "./VideoSummary";
import { useAnalyzedVideos } from "@/hooks/useAnalyzedVideos";
import { useNavigate } from "@tanstack/react-router";
import { useState } from "react";

const VIDEOS_PER_PAGE = 2;

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
