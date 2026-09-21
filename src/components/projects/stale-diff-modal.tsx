import { X } from "@/components/icons"
import { Button } from "@/components/ui/button"
import { DocRenderer } from "@/components/projects/doc-render"
import Loader1 from "@/components/ui/loader1"

export interface StaleDiffModalProps {
    sectionLabel: string
    userContent: string
    aiContent: string
    onClose: () => void
    onAcceptAI: () => void
    accepting: boolean
}

export function StaleDiffModal({
    sectionLabel,
    userContent,
    aiContent,
    onClose,
    onAcceptAI,
    accepting,
}: StaleDiffModalProps) {
    return (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm flex flex-col">
            <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-card shrink-0">
                <div>
                    <h2 className="text-[14px] font-semibold">
                        Compare versions : {sectionLabel}
                    </h2>
                    <p className="text-[12px] text-muted-foreground mt-0.5">
                        Your edit (left) vs the new AI version (right)
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        size="sm"
                        className="h-8"
                        disabled={accepting}
                        onClick={onAcceptAI}
                    >
                        {accepting && <Loader1 className="mr-1.5 h-3.5 w-3.5" />}
                        Use AI version
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        className="h-8 gap-1.5"
                        onClick={onClose}
                    >
                        <X className="h-3.5 w-3.5" />
                        Keep my edit
                    </Button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden border-r border-border">
                    <div className="px-5 py-2 border-b border-border/40 bg-emerald-500/5 shrink-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                            Your Edit : Active
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <DocRenderer content={userContent} />
                        </div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-5 py-2 border-b border-border/40 bg-primary/5 shrink-0">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-primary">
                            New AI Version
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto px-6 py-5">
                        <div className="prose prose-slate dark:prose-invert max-w-none">
                            <DocRenderer content={aiContent} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
