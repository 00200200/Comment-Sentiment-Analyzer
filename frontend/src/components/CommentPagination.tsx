import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

import { Input } from "@/components/ui/input";

interface CommentPaginationProps {
  page: number;
  totalPages: number;
  hasMore: boolean;
  onPageChange: (page: number) => void;
}

export function CommentPagination({
  page,
  totalPages,
  hasMore,
  onPageChange,
}: CommentPaginationProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = Number(e.target.value);
    if (!isNaN(value) && value >= 1 && value <= totalPages) {
      onPageChange(value);
    }
  };

  return (
    <Pagination className="mt-4 flex flex-col items-center space-y-2">
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious
            onClick={page > 1 ? () => onPageChange(page - 1) : undefined}
            className={page === 1 ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>
        <PaginationItem className="flex items-center gap-2">
          <span className="text-sm">Page</span>
          <Input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={page}
            onChange={handleChange}
            className="w-12 h-8 text-center text-sm appearance-none"
          />
          <span className="text-sm">of {totalPages}</span>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            onClick={hasMore ? () => onPageChange(page + 1) : undefined}
            className={!hasMore ? "opacity-50 pointer-events-none" : ""}
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
