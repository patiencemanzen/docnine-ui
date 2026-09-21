import { Link } from "react-router-dom";

import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const steps = [
  {
    step: "01",
    title: "Connect a repository",
    description:
      "Link GitHub, GitLab, Bitbucket, or Azure DevOps. Docnine scans the codebase for APIs, schemas, and structure.",
  },
  {
    step: "02",
    title: "Generate living docs",
    description:
      "AI drafts README, API reference, schemas, and security notes you can review before anything goes public.",
  },
  {
    step: "03",
    title: "Stay in sync and share",
    description:
      "Push updates regenerate docs. Publish a portal, invite teammates, or export when you need a handoff.",
  },
];

export function Testimonials({ className }: { className?: string }) {
  return (
    <section className={cn("overflow-hidden py-[calc(48px+8vh)]", className)}>
      <div className="mx-auto max-w-5xl px-6">
        <div className="max-w-xl space-y-4">
          <h2 data-animate className="text-3xl font-bold tracking-tight sm:text-4xl">
            How Docnine works
          </h2>
          <p data-animate data-delay="1" className="leading-relaxed text-muted-foreground">
            Built for engineering teams who want living docs — generated from code, kept in sync,
            and shared through portals people actually open.
          </p>
          <div data-animate data-delay="2">
            <Button
              variant="outline"
              className="rounded-full px-5 py-2 text-sm font-medium shadow-none"
              asChild
            >
              <Link to="/docs">
                Read the docs <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </div>

        <ol className="mt-10 grid gap-4 md:mt-12 md:grid-cols-3">
          {steps.map((item, index) => (
            <li
              key={item.step}
              data-animate
              data-delay={String(index + 1)}
              className="rounded-2xl border border-border/80 bg-muted/40 p-6"
            >
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                {item.step}
              </p>
              <h3 className="mt-3 text-lg font-bold tracking-tight">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
