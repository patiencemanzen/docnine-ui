import { DashedLine } from "@/components/landing/DashedLine";
import { ArchivePreview, NotifyPreview, SharePreview } from "@/components/landing/ProductPreviews";
import { cn } from "@/lib/utils";

const topItems = [
  {
    title: "Reusable doc structure.",
    description:
      "Start from clear sections — README, API reference, schemas, and security — then edit what matters.",
    kind: "templates" as const,
    className: "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8",
  },
  {
    title: "Simplify your stack.",
    description:
      "Connect GitHub, GitLab, and Notion. Stop juggling Confluence, SharePoint, and stale wikis.",
    kind: "stack" as const,
    className: "flex-1 [&>.title-container]:mb-5 md:[&>.title-container]:mb-8",
  },
];

const bottomItems = [
  {
    title: "Archive what you outgrow.",
    description:
      "Retire outdated docs without losing history. Restore anything when you need it again.",
    kind: "archive" as const,
    className: "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8",
  },
  {
    title: "Collaboration built in.",
    description:
      "Invite editors and viewers so documentation stays a team habit, not a solo chore.",
    kind: "share" as const,
    className: "justify-normal [&>.title-container]:mb-5 md:[&>.title-container]:mb-0",
  },
  {
    title: "Stay notified.",
    description: "Know when docs regenerate after a push, a portal goes live, or a teammate joins.",
    kind: "notify" as const,
    className: "[&>.title-container]:mb-5 md:[&>.title-container]:mb-8",
  },
];

const STACK_LOGOS = [
  { src: "/landing/logos/github.svg", alt: "GitHub" },
  { src: "/landing/logos/gitlab.svg", alt: "GitLab" },
  { src: "/landing/logos/notion.svg", alt: "Notion" },
  { src: "/landing/logos/openai.svg", alt: "OpenAI" },
  { src: "/landing/logos/claude.svg", alt: "Claude" },
  { src: "/landing/logos/drive.svg", alt: "Google Drive" },
  { src: "/landing/logos/confluence.svg", alt: "Confluence" },
  { src: "/landing/logos/jira.svg", alt: "Jira" },
];

export function ResourceAllocation() {
  return (
    <section id="resource-allocation" className="overflow-hidden py-[calc(48px+8vh)]">
      <div className="mx-auto max-w-5xl px-6">
        <h2
          data-animate
          className="text-center text-3xl font-bold tracking-tight text-balance sm:text-4xl"
        >
          Keep documentation and delivery in the same loop
        </h2>

        <div className="mt-10 md:mt-12">
          <DashedLine orientation="horizontal" className="scale-x-105" />

          <div className="relative flex max-md:flex-col">
            {topItems.map((item, i) => (
              <Item key={item.title} item={item} isLast={i === topItems.length - 1} />
            ))}
          </div>
          <DashedLine orientation="horizontal" className="scale-x-105" />

          <div className="relative grid md:grid-cols-3">
            {bottomItems.map((item, i) => (
              <Item
                key={item.title}
                item={item}
                isLast={i === bottomItems.length - 1}
                className="md:pb-0"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type ItemData = (typeof topItems)[number] | (typeof bottomItems)[number];

interface ItemProps {
  item: ItemData;
  isLast?: boolean;
  className?: string;
}

function ItemVisual({ kind }: { kind: ItemData["kind"] }) {
  if (kind === "stack") {
    return (
      <div className="relative overflow-hidden">
        <div className="flex flex-col gap-4">
          <div className="flex translate-x-3 justify-end gap-3">
            {STACK_LOGOS.slice(0, 4).map((logo) => (
              <div
                key={logo.alt}
                className="grid size-14 place-items-center rounded-2xl border border-border/60 bg-background p-2 lg:size-16"
              >
                <img
                  src={logo.src}
                  alt={`${logo.alt} logo`}
                  className="size-7 object-contain dark:invert"
                />
              </div>
            ))}
          </div>
          <div className="flex -translate-x-3 gap-3">
            {STACK_LOGOS.slice(4).map((logo) => (
              <div
                key={logo.alt}
                className="grid size-14 place-items-center rounded-2xl border border-border/60 bg-background p-2 lg:size-16"
              >
                <img
                  src={logo.src}
                  alt={`${logo.alt} logo`}
                  className="size-7 object-contain dark:invert"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (kind === "templates") {
    return (
      <div className="rounded-xl border border-border/60 bg-background/40 p-3">
        <div className="space-y-2">
          {["README", "API reference", "Schemas", "Security report"].map((label, i) => (
            <div
              key={label}
              className={cn(
                "flex items-center justify-between rounded-lg border px-3 py-2 text-sm",
                i === 1 ? "border-primary/40 bg-primary/10" : "border-border/60 bg-muted/30",
              )}
            >
              <span className="font-medium">{label}</span>
              <span className="text-xs text-muted-foreground">{i === 1 ? "Editing" : "Ready"}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (kind === "archive") return <ArchivePreview />;
  if (kind === "share") return <SharePreview />;
  return <NotifyPreview />;
}

function Item({ item, isLast, className }: ItemProps) {
  return (
    <div
      data-animate
      className={cn(
        "relative flex flex-col justify-between px-0 py-6 md:px-6 md:py-8",
        className,
        item.className,
      )}
    >
      <div className="title-container text-balance">
        <h3 className="inline text-base font-semibold tracking-tight">{item.title} </h3>
        <span className="text-sm leading-relaxed text-muted-foreground"> {item.description}</span>
      </div>

      <div className="image-container mt-5">
        <ItemVisual kind={item.kind} />
      </div>

      {!isLast && (
        <>
          <DashedLine orientation="vertical" className="absolute top-0 right-0 max-md:hidden" />
          <DashedLine orientation="horizontal" className="absolute inset-x-0 bottom-0 md:hidden" />
        </>
      )}
    </div>
  );
}
