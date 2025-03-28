import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { analyzeVideo } from "@/services/api"; // ✅ Fixed import name
import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

export const Route = createFileRoute("/")({
  component: App,
});

interface AnalyzeResponse {
  video_id: string;
  title: string;
  channel_id: string;
  statistics: {
    view_count: number;
    like_count: number;
    comment_count: number;
  };
  num_comments_analyzed: number;
}

function App() {
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedMode, setSelectedMode] = useState("default");
  const [saveHistory, setSaveHistory] = useState(true);

  const { isLoading, refetch: fetchAnalysis } = useQuery<
    AnalyzeResponse,
    Error
  >({
    queryKey: ["analyzeVideo", videoUrl],
    queryFn: () => analyzeVideo(videoUrl),
    enabled: false,
  });

  const handleAnalyze = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!videoUrl.trim()) return;
    fetchAnalysis();
  };

  return (
    <div className="container max-w-xl mx-auto text-center p-8 flex flex-col items-center space-y-2 min-h-screen justify-center">
      <h1 className="text-3xl mb-8">Select a video to analyze</h1>
      <form
        onSubmit={handleAnalyze}
        className="flex justify-center items-center space-x-2 w-full"
      >
        <Input
          type="text"
          placeholder="Video URL"
          value={videoUrl}
          onChange={(e) => setVideoUrl(e.target.value)}
          className="w-full h-12"
        />
        <Button type="submit" disabled={isLoading} className="h-12">
          {isLoading ? "Analyzing..." : "Analyze"}
        </Button>
      </form>
      <Separator className="w-full my-6" />
      <div className="flex items-center justify-center space-x-6 max-w-2xl">
        <div className="flex flex-col items-center">
          <Select value={selectedMode} onValueChange={setSelectedMode}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Default" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="default">Default</SelectItem>
              <SelectItem value="deep-analysis">Deep Analysis*</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="save-history"
            checked={saveHistory}
            onCheckedChange={setSaveHistory}
          />
          <Label htmlFor="save-history">Save History</Label>
        </div>
      </div>
      <p className="text-gray-400 text-sm mt-6">
        *Looks for relevant videos and analyzes sentiment trends across an
        entire topic pool.
      </p>
    </div>
  );
}

export default App;
