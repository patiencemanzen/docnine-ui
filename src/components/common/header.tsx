import { useState } from "react";
import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { Menu, X } from "@/components/icons";
import { ApplicationLogo } from "./application-logo";

export function TopHeader({ className }: { className?: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header
      className={`sticky top-0 z-50 w-full border-b border-border/50 bg-background/75 backdrop-blur-xl supports-[backdrop-filter]:bg-background/55 ${className ?? ""}`}
    >
      <div className="container mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
        <ApplicationLogo />

        <nav className="hidden items-center gap-7 text-[13px] font-medium tracking-tight text-muted-foreground md:flex">
          <Link to="/docs" className="transition-colors hover:text-foreground">
            Docs
          </Link>
          <a
            href="https://github.com/docnineai"
            target="_blank"
            rel="noreferrer"
            className="transition-colors hover:text-foreground"
          >
            GitHub
          </a>
          <Link to="/pricing" className="transition-colors hover:text-foreground">
            Pricing
          </Link>
          <Link to="/contact" className="transition-colors hover:text-foreground">
            Contact
          </Link>
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            to="/login"
            className="px-2 text-[13px] font-medium tracking-tight text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <Button
            asChild
            className="h-9 rounded-lg bg-foreground px-4 text-[13px] font-semibold text-background hover:bg-foreground/90"
          >
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            to="/login"
            className="text-[13px] font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Sign in
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen((o) => !o)}
            className="flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 md:hidden">
          <nav className="mt-3 flex flex-col gap-1">
            <Link
              to="/docs"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Docs
            </Link>
            <a
              href="https://github.com/docnineai"
              target="_blank"
              rel="noreferrer"
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              GitHub
            </a>
            <Link
              to="/pricing"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Pricing
            </Link>
            <Link
              to="/contact"
              onClick={() => setMobileOpen(false)}
              className="rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              Contact
            </Link>
            <div className="mt-2 border-t border-border pt-2">
              <Button asChild className="h-9 w-full rounded-lg text-sm font-semibold">
                <Link to="/signup" onClick={() => setMobileOpen(false)}>
                  Get started
                </Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
