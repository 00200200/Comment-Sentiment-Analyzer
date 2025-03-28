import { ArrowDown, ArrowUp } from "lucide-react";
/**
 * Reusable stat block to handle:
 * - Label
 * - Main Value
 * - Optional sublabel or explanation
 * - Optional arrow direction (up/down)
 * - Optional percentage change
 */
interface StatBlockProps {
  label: string;
  value: string | number;
  valueClass?: string;
  sublabel?: string;
  change?: number;
  isPositiveChange?: boolean;
  arrowDirection?: "up" | "down";
  explanation?: string;
}

export function StatBlock({
  label,
  value,
  valueClass = "",
  sublabel,
  change,
  isPositiveChange,
  arrowDirection,
  explanation,
}: StatBlockProps) {
  return (
    <div className="p-3 rounded-md text-center">
      <p className="text-xs text-gray-400">{label}</p>

      <div
        className={`text-xl font-bold flex items-center justify-center ${valueClass}`}
      >
        {value}
        {arrowDirection === "up" && <ArrowUp className="w-4 h-4 ml-1" />}
        {arrowDirection === "down" && <ArrowDown className="w-4 h-4 ml-1" />}
      </div>

      {change !== undefined && (
        <p
          className={`text-xs flex items-center justify-center ${
            isPositiveChange ? "text-green-500" : "text-red-500"
          }`}
        >
          {isPositiveChange ? (
            <ArrowUp className="w-3 h-3 mr-1" />
          ) : (
            <ArrowDown className="w-3 h-3 mr-1" />
          )}
          {isPositiveChange ? `+${change}%` : `-${change}%`}
        </p>
      )}

      {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      {explanation && <p className="text-xs text-gray-400">{explanation}</p>}
    </div>
  );
}
