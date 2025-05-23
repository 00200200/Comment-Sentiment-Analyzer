import { StatBlock } from "./StatBlock";

interface CommentStatsProps {
  counts: Record<"positive" | "neutral" | "negative" | "ambiguous", number>;
}

export function CommentStats({ counts }: CommentStatsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
      <StatBlock label="Positive" value={counts.positive} />
      <StatBlock label="Neutral" value={counts.neutral} />
      <StatBlock label="Negative" value={counts.negative} />
      <StatBlock label="Ambiguous" value={counts.ambiguous} />
    </div>
  );
}
