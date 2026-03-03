import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FindingsPaginationProps {
  currentPage: number
  totalPages: number
  rowsPerPage: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function FindingsPagination({
  currentPage,
  totalPages,
  rowsPerPage,
  totalCount,
  onPageChange,
}: FindingsPaginationProps) {
  return (
    <div className="flex items-center justify-between p-4 border-t">
      <p className="text-sm text-muted-foreground">
        Showing {totalCount === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} to{" "}
        {Math.min(currentPage * rowsPerPage, totalCount)} of {totalCount} entries
      </p>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1 || totalPages === 0}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages || totalPages === 0}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
