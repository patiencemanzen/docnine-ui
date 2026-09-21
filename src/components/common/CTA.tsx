import { Button } from "../ui/button";
import { Link } from "react-router-dom";
import { ArrowRight } from "@/components/icons";
import { PremiumGreenBackdrop } from "@/components/ui/premium-green-backdrop";

export function CTA() {
  return (
    <section className="relative z-10 overflow-hidden px-4 py-24 sm:px-6">
      <PremiumGreenBackdrop grain="subtle" />

      <div className="container relative z-10 mx-auto max-w-3xl text-center">
        <h2 className="text-section text-foreground">Ready to make docs easier for your team?</h2>
        <p className="mx-auto mt-4 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
          Start from a free account, or talk with us if you want Docnine rolled out across your
          organization.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            asChild
            className="h-11 rounded-lg bg-foreground px-5 text-[14px] font-semibold text-background hover:bg-foreground/90"
          >
            <Link to="/signup">
              Get started <ArrowRight className="ml-1.5 h-4 w-4" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-lg border-border bg-background/40 px-5 text-[14px] font-medium text-foreground hover:bg-muted dark:border-white/15 dark:bg-transparent dark:hover:bg-white/8"
          >
            <Link to="/contact">Talk to us</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
