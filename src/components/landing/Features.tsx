import { Link } from "react-router-dom";

import { ChevronRight } from "@/components/icons";
import { DashedLine } from "@/components/landing/DashedLine";
import {
  DocsWorkspacePreview,
  PortalPreview,
  SyncPreview,
} from "@/components/landing/ProductPreviews";
import { Card, CardContent } from "@/components/ui/card";

const items = [
  {
    title: "Generate docs from your codebase",
    href: "/#features",
    Preview: DocsWorkspacePreview,
  },
  {
    title: "Keep docs in sync with every commit",
    href: "/#resource-allocation",
    Preview: SyncPreview,
  },
  {
    title: "Share portals your team will use",
    href: "/signup",
    Preview: PortalPreview,
  },
];

export function Features() {
  return (
    <section id="features" className="py-[calc(24px+4vh)]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="relative flex items-center justify-center">
          <DashedLine className="text-muted-foreground" />
          <span className="absolute bg-muted px-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground max-md:hidden">
            Scan. Draft. Ship.
          </span>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl items-start gap-4 md:mt-12 lg:grid-cols-2 lg:gap-8">
          <h2 data-animate className="text-3xl font-bold tracking-tight sm:text-4xl">
            Made for modern engineering teams
          </h2>
          <p
            data-animate
            data-delay="1"
            className="mt-0 leading-relaxed text-muted-foreground lg:mt-1"
          >
            Docnine connects to your repositories, drafts clear documentation with AI, and keeps
            every page in sync so your team can ship without outdated wiki pages.
          </p>
        </div>

        <Card className="mt-10 rounded-2xl md:mt-12">
          <CardContent className="flex bg-gray-900/50 p-0 max-md:flex-col">
            {items.map((item, i) => (
              <div
                key={item.title}
                className="flex flex-1 max-md:flex-col"
                data-animate
                data-delay={String(i + 1)}
              >
                <div className="flex-1 p-5 md:p-6">
                  <div className="relative aspect-[1.28/1] overflow-hidden rounded-xl bg-[#0c0b0a]">
                    <item.Preview className="absolute inset-0 size-full" />
                    <div className="pointer-events-none absolute inset-0 z-10 bg-linear-to-t from-background via-transparent to-transparent" />
                  </div>

                  <Link
                    to={item.href}
                    className="group mt-4 flex items-center justify-between gap-3"
                  >
                    <h3 className="max-w-[14rem] text-lg font-bold leading-snug tracking-tight">
                      {item.title}
                    </h3>
                    <div className="rounded-full border p-1.5">
                      <ChevronRight className="size-5 transition-transform group-hover:translate-x-1" />
                    </div>
                  </Link>
                </div>
                {i < items.length - 1 && (
                  <div className="relative hidden md:block">
                    <DashedLine orientation="vertical" />
                  </div>
                )}
                {i < items.length - 1 && (
                  <div className="relative block md:hidden">
                    <DashedLine orientation="horizontal" />
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
