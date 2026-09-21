import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "@/components/icons"

interface PaginationProps {
    currentPage: number
    totalPages: number
    onPreviousClick: () => void
    onNextClick: () => void
    showPageInfo?: boolean
    showItemCount?: boolean
    itemCount?: number
    currentItemStart?: number
    currentItemEnd?: number
    variant?: "default" | "compact"
}

export function Pagination({
    currentPage,
    totalPages,
    onPreviousClick,
    onNextClick,
    showPageInfo = true,
    showItemCount = false,
    itemCount,
    currentItemStart = 0,
    currentItemEnd = 0,
    variant = "default",
}: PaginationProps) {
    const canGoPrevious = currentPage > 1
    const canGoNext = currentPage < totalPages

    if (totalPages <= 1) {
        return null
    }

    if (variant === "compact") {
        return (
            <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoPrevious}
                    onClick={onPreviousClick}
                >
                    Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages}
                </span>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={!canGoNext}
                    onClick={onNextClick}
                >
                    Next
                </Button>
            </div>
        )
    }

    return (
        <div className="flex items-center justify-between pt-8 border-t border-border">
            {showItemCount && itemCount && currentItemStart !== undefined && currentItemEnd !== undefined && (
                <div className="text-sm text-muted-foreground">
                    Showing <span className="font-medium">{currentItemStart}</span>–<span className="font-medium">{currentItemEnd}</span> of <span className="font-medium">{itemCount}</span> items
                </div>
            )}

            {!showItemCount && showPageInfo && (
                <div className="text-sm text-muted-foreground">
                    Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                </div>
            )}

            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onPreviousClick}
                    disabled={!canGoPrevious}
                    className="gap-1.5 rounded-lg"
                >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                </Button>
                {showPageInfo && (
                    <div className="px-3 py-2 text-sm font-medium">
                        Page <span className="tabular-nums">{currentPage}</span> of <span className="tabular-nums">{totalPages}</span>
                    </div>
                )}
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onNextClick}
                    disabled={!canGoNext}
                    className="gap-1.5 rounded-lg"
                >
                    Next
                    <ChevronRight className="h-4 w-4" />
                </Button>
            </div>
        </div>
    )
}
