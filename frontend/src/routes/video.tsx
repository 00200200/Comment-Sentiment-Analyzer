// src/routes/video.tsx

import { createFileRoute, useSearch } from "@tanstack/react-router";

import Comments from "@/components/Comments";
import { Header } from "@/components/Header";
import { VideoDetails } from "@/components/VideoDetails";
import { useEffect } from "react";
import { useVideoAnalysis } from "@/hooks/useVideoAnalysis";
import { z } from "zod";

const searchSchema = z.object({ url: z.string() });

export const Route = createFileRoute("/video")({
  component: VideoAnalysisPage,
  validateSearch: (search) => searchSchema.parse(search),
});

function VideoAnalysisPage() {
  const searchParams = useSearch({ from: "/video", strict: true });
  const {
    data: analysis,
    isLoading,
    error,
    refetch,
  } = useVideoAnalysis(searchParams.url);

  useEffect(() => {
    if (searchParams.url) {
      refetch();
    }
  }, [searchParams.url, refetch]);

  if (!searchParams.url) {
    return <div className="p-4 ">No video URL provided.</div>;
  }

  if (isLoading) {
    return <div className="p-4 ">Loading analysis...</div>;
  }

  if (error) {
    return <div className="p-4 ">Error loading analysis: {error.message}</div>;
  }

  if (!analysis) {
    return <div className="p-4 ">No analysis data found.</div>;
  }

  return (
    <div className="min-h-screen ">
      <Header />

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-16">
        <VideoDetails analysis={analysis} />
        <Comments videoId={analysis.video_id} />
      </div>
    </div>
  );
}

export default VideoAnalysisPage;
