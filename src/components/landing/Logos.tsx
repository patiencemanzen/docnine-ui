import Marquee from "react-fast-marquee";

import { cn } from "@/lib/utils";

type Integration = {
  name: string;
  logo: string;
  width: number;
  height: number;
};

const INTEGRATIONS: Integration[] = [
  { name: "GitHub", logo: "/landing/logos/github.svg", width: 96, height: 24 },
  { name: "GitLab", logo: "/landing/logos/gitlab.svg", width: 96, height: 24 },
  { name: "Notion", logo: "/landing/logos/notion.svg", width: 88, height: 24 },
  { name: "OpenAI", logo: "/landing/logos/openai.svg", width: 88, height: 22 },
  { name: "Claude", logo: "/landing/logos/claude.svg", width: 88, height: 22 },
  { name: "Google Drive", logo: "/landing/logos/drive.svg", width: 100, height: 22 },
  { name: "Confluence", logo: "/landing/logos/confluence.svg", width: 110, height: 22 },
  { name: "Jira", logo: "/landing/logos/jira.svg", width: 72, height: 22 },
];

export function Logos() {
  return (
    <section className="overflow-hidden py-[calc(24px+4vh)]">
      <div className="mx-auto max-w-5xl space-y-10 px-6">
        <div className="text-center" data-animate>
          <h2 className="text-3xl font-bold tracking-tight text-balance sm:text-4xl">
            Fits the tools you already use
          </h2>
          <p className="mt-4 leading-relaxed text-muted-foreground">
            Connect your repos, bring your own AI keys, and export where your team already works.
          </p>
        </div>

        <div className="hidden md:block w-full">
          <div className="grid grid-cols-4 items-center justify-items-center gap-x-10 gap-y-8 lg:grid-cols-8 lg:gap-x-8">
            {INTEGRATIONS.map((item) => (
              <IntegrationMark key={item.name} item={item} />
            ))}
          </div>
        </div>

        <div className="md:hidden w-full">
          <Marquee pauseOnHover>
            {INTEGRATIONS.map((item) => (
              <div key={item.name} className="mx-8 inline-flex">
                <IntegrationMark item={item} />
              </div>
            ))}
          </Marquee>
        </div>
      </div>
    </section>
  );
}

function IntegrationMark({ item }: { item: Integration }) {
  return (
    <img
      src={item.logo}
      alt={`${item.name} logo`}
      width={item.width}
      height={item.height}
      className={cn(
        "h-6 w-auto object-contain opacity-50 transition-opacity hover:opacity-80 dark:invert dark:opacity-60 dark:hover:opacity-90",
      )}
    />
  );
}
