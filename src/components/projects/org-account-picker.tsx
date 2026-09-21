import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { OrgAccountPickerProps } from "@/types/GithubTypes";
import { User, Building2 } from "@/components/icons";

export function OrgAccountPicker({
  username,
  orgs,
  orgsLoading,
  selected,
  onSelect,
}: OrgAccountPickerProps) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
        Account / Organisation
      </p>

      {orgsLoading ? (
        <div className="flex gap-1.5 overflow-x-auto pb-1">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-7 w-24 shrink-0 rounded-full" />
          ))}
        </div>
      ) : (
        <div className="flex gap-1.5 overflow-x-auto pb-1 -mx-1 px-1">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className={cn(
              "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
              selected === null
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-foreground hover:bg-muted",
            )}
          >
            <User className="h-3 w-3 shrink-0" />
            {username}
          </button>

          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => onSelect(org.login)}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                selected === org.login
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-foreground hover:bg-muted",
              )}
            >
              <Building2 className="h-3 w-3 shrink-0" />
              {org.login}
            </button>
          ))}

          {orgs.length === 0 && (
            <span className="self-center text-[11px] text-muted-foreground pl-1">
              No organisations found.
            </span>
          )}
        </div>
      )}
    </div>
  );
}
