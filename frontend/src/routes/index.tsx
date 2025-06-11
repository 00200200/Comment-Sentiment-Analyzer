import { createFileRoute, useNavigate } from "@tanstack/react-router";

import { AnalyzedVideoList } from "@/components/AnalyzedVideoList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: SearchPage,
});

function SearchPage() {
  const [videoUrl, setVideoUrl] = useState("");

  const navigate = useNavigate();

  const handleAnalyze = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    navigate({
      to: "/video",
      search: { url: videoUrl },
    });
  };

  return (
    <div className="container max-w-xl mx-auto text-center p-8 flex flex-col items-center space-y-2 min-h-screen justify-center">
      <h1 className="text-3xl mb-8">Select a URL to analyze</h1>
      <form
        onSubmit={handleAnalyze}
        className="flex justify-center items-center space-x-2 w-full"
      >
        <Input
          type="text"
          placeholder="URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full h-12"
        />
        <Button type="submit" className="h-12">
          Analyze
        </Button>
      </form>
      <Separator className="w-full my-6" />
      <AnalyzedVideoList />
    </div>
  );
}

export default SearchPage;
