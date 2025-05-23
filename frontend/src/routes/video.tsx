import { createFileRoute, useSearch } from "@tanstack/react-router";

import CommentCharts from "@/components/CommentCharts";
import CommentSection from "@/components/CommentSection";
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
    isLoading: analysisLoading,
    error: analysisError,
    refetch,
  } = useVideoAnalysis(searchParams.url);

  useEffect(() => {
    if (searchParams.url) {
      refetch();
    }
  }, [searchParams.url, refetch]);

  if (!searchParams.url) {
    return <div className="p-4">No video URL provided.</div>;
  }

  if (analysisLoading) {
    return <div className="p-4">Loading analysis...</div>;
  }

  if (analysisError) {
    return (
      <div className="p-4">Error loading analysis: {analysisError.message}</div>
    );
  }

  if (!analysis) {
    return <div className="p-4">No analysis data found.</div>;
  }

  return (
    <div className="min-h-screen">
      <Header />

      <div className="max-w-5xl mx-auto px-4 pt-4 pb-16">
        <VideoDetails analysis={analysis} />

        {/* Pass video URL to chart/comments components */}
        <CommentCharts url={searchParams.url} />
        <CommentSection url={searchParams.url} />
      </div>
    </div>
  );
}

export default VideoAnalysisPage;
