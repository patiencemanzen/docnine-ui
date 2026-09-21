import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { API_BASE } from "@/lib/api";
import { AuroraBackdrop } from "./AuroraBackdrop";

function startGoogleOAuth() {
  window.location.href = `${API_BASE}/auth/google/start`;
}

export function HeroSection() {
  return (
    <section className="relative z-0 h-screen w-full overflow-hidden bg-black px-8 py-8 text-white">
      <AuroraBackdrop variant="column" />

      <div className="relative z-10 mx-auto flex h-full w-full max-w-5xl flex-col px-6">
        <div className="mt-auto grid grid-cols-1 items-end gap-8 pb-20 md:grid-cols-[2fr_1fr] md:gap-12 md:pb-24">
          <h1
            data-animate
            className="max-w-[16ch] text-4xl font-bold tracking-tight drop-shadow-[0_2px_24px_rgba(0,0,0,0.45)] sm:text-5xl md:text-6xl lg:text-[5rem] lg:leading-[1.05]"
          >
            Docs that stay in sync with your infrastructure
          </h1>
          <div data-animate data-delay="1" className="flex flex-col gap-5">
            <p className="leading-relaxed text-white/70 drop-shadow-[0_1px_12px_rgba(0,0,0,0.4)]">
              Connect a repo, generate clear documentation, and keep every page up to date as your
              team ships — without rewriting by hand.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                asChild
                className="w-full rounded-full border border-white bg-white px-5 py-2 text-sm font-medium text-neutral-900 hover:bg-white/90 sm:w-auto"
              >
                <Link to="/signup">
                  Get started <ArrowRight className="ml-1.5 inline size-3.5" />
                </Link>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={startGoogleOAuth}
                className="w-full rounded-full border-white/30 bg-transparent px-5 py-2 text-sm font-medium text-white hover:bg-white/10 sm:w-auto"
              >
                Sign up with Google
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-section-fade" aria-hidden />
    </section>
  );
}
