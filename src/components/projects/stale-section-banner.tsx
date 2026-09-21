import { Sparkles, GitCompare } from "@/components/icons";
import { Button } from "@/components/ui/button";
import Loader1 from "@/components/ui/loader1";
import { StaleSectionBannerProps } from "@/types/StaleTypes";

export function StaleSectionBanner({
  changeSummary,
  onViewDiff,
  onAcceptAI,
  onDismiss,
  accepting,
}: StaleSectionBannerProps) {
  return (
    <div className="mx-6 mt-4 rounded-lg border border-primary/25 bg-primary/5 p-3 flex flex-col gap-2 shrink-0">
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-medium text-primary">
            AI has a newer version of this section
          </p>
          {changeSummary ? (
            <p className="text-[12px] text-primary/75 mt-0.5 line-clamp-2 leading-relaxed">
              {changeSummary}
            </p>
          ) : (
            <p className="text-[12px] text-primary/60 mt-0.5">
              Your edit is preserved : compare before deciding.
            </p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2 pl-6 flex-wrap">
        <Button
          size="sm"
          variant="outline"
          className="h-7 text-[12px] border-primary/25 hover:bg-primary/10 gap-1.5"
          onClick={onViewDiff}
        >
          <GitCompare className="h-3 w-3" />
          Compare versions
        </Button>
        <Button
          size="sm"
          className="h-7 text-[12px] gap-1.5"
          disabled={accepting}
          onClick={onAcceptAI}
        >
          {accepting ? <Loader1 className="h-3 w-3" /> : <Sparkles className="h-3 w-3" />}
          Use AI version
        </Button>
        <Button
          size="sm"
          variant="ghost"
          className="h-7 text-[12px] text-muted-foreground"
          onClick={onDismiss}
        >
          Keep my edit
        </Button>
      </div>
    </div>
  );
}
