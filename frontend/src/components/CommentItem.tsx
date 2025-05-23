import { Card, CardContent } from "@/components/ui/card";

import { useState } from "react";

interface CommentItemProps {
  author: string;
  text: string;
  likeCount: number;
  sentiment: string;
  publishedAt: string;
}

export function CommentItem({
  author,
  text,
  likeCount,
  sentiment,
  publishedAt,
}: CommentItemProps) {
  const [expanded, setExpanded] = useState(false);
  const previewLimit = 160;

  const shouldTruncate = text.length > previewLimit;
  const displayText =
    !expanded && shouldTruncate ? text.slice(0, previewLimit) + "..." : text;

  return (
    <Card
      className={`overflow-hidden transition-all duration-200 ${expanded ? "h-auto" : "h-32"}`}
    >
      <CardContent className="p-3 flex flex-col justify-between h-full">
        <div>
          <h3 className="font-semibold text-sm">@{author}</h3>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {displayText}
            {shouldTruncate && (
              <span
                onClick={() => setExpanded((prev) => !prev)}
                className="ml-1 text-blue-500 hover:underline text-xs cursor-pointer"
              >
                {expanded ? "Read less" : "Read more"}
              </span>
            )}
          </p>
        </div>
        <div className="flex justify-between text-xs text-gray-500 pt-2">
          <span>{new Date(publishedAt).toLocaleDateString()}</span>
          <span>👍 {likeCount}</span>
          <span>{sentiment}</span>
        </div>
      </CardContent>
    </Card>
  );
}
