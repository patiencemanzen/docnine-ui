import { Link } from "react-router-dom";

import { ArrowUp } from "@/components/icons";

const GITHUB_URL = "https://github.com/docnineai";

export function Footer() {
  const navigation = [
    { name: "Product", href: "/#features" },
    { name: "Pricing", href: "/pricing" },
    { name: "Docs", href: "/docs" },
    { name: "FAQ", href: "/#faq" },
    { name: "Contact", href: "/contact" },
  ];

  const legal = [
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ];

  return (
    <footer className="flex flex-col items-center gap-12 pt-[calc(48px+8vh)]">
      <div className="mx-auto max-w-5xl space-y-4 px-6 text-center">
        <h2 data-animate className="text-3xl font-bold tracking-tight sm:text-4xl">
          Start documenting for free
        </h2>
        <p
          data-animate
          data-delay="1"
          className="mx-auto max-w-xl text-balance leading-relaxed text-muted-foreground"
        >
          Connect a repo, generate clear docs, and keep every page up to date as your team ships.
        </p>
        <div data-animate data-delay="2">
          <Link
            to="/signup"
            className="mt-2 inline-flex items-center rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-opacity hover:opacity-90"
          >
            Get started
          </Link>
        </div>
      </div>

      <nav className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-6">
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {navigation.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className="text-sm font-medium transition-opacity hover:opacity-75"
              >
                {item.name}
              </Link>
            </li>
          ))}
          <li>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-sm font-medium transition-opacity hover:opacity-75"
            >
              GitHub <ArrowUp className="size-3.5 rotate-45" aria-hidden="true" />
            </a>
          </li>
        </ul>
        <ul className="flex flex-wrap items-center justify-center gap-6">
          {legal.map((item) => (
            <li key={item.name}>
              <Link
                to={item.href}
                className="text-sm text-muted-foreground transition-opacity hover:opacity-75"
              >
                {item.name}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-6 w-full overflow-hidden text-primary md:mt-10">
        <p
          aria-hidden="true"
          className="font-display w-full translate-y-4 bg-linear-to-b from-primary to-transparent bg-clip-text text-center text-[clamp(6rem,22vw,22rem)] leading-none font-bold tracking-tighter text-transparent select-none sm:translate-y-6 md:translate-y-8"
        >
          DOCNINE
        </p>
      </div>
    </footer>
  );
}
