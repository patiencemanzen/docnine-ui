import { Link } from "react-router-dom";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";

const categories = [
  {
    title: "Product",
    questions: [
      {
        question: "How does Docnine work?",
        answer:
          "Docnine scans your codebase for APIs, components, and schemas, then uses AI to draft clear, structured documentation you can review and publish.",
      },
      {
        question: "Which languages are supported?",
        answer:
          "Most common languages are covered, including JavaScript, TypeScript, Python, Go, Rust, and more.",
      },
    ],
  },
  {
    title: "Billing",
    questions: [
      {
        question: "Is Docnine free to try?",
        answer:
          "Yes. The free plan lets you scan up to two projects and generate docs at no cost. Paid plans unlock exports, sharing, portals, and more.",
      },
    ],
  },
  {
    title: "Account",
    questions: [
      {
        question: "Can I use my own OpenAI or Anthropic API key?",
        answer:
          "Yes. You can bring your own key for OpenAI, Anthropic, or Google Gemini to power generation.",
      },
    ],
  },
];

export function FAQ({
  headerTag = "h2",
  className,
  className2,
}: {
  headerTag?: "h1" | "h2";
  className?: string;
  className2?: string;
}) {
  const Heading = headerTag;

  return (
    <section id="faq" className={cn("py-[calc(48px+8vh)]", className)}>
      <div className="mx-auto max-w-5xl px-6 md:px-10">
        <div className={cn("mx-auto grid gap-10 lg:grid-cols-2 lg:gap-12", className2)}>
          <div>
            <Heading data-animate className="text-3xl font-bold tracking-tight sm:text-4xl">
              Got Questions?
            </Heading>
            <p
              data-animate
              data-delay="1"
              className="mt-4 max-w-md leading-relaxed text-muted-foreground"
            >
              If you can&apos;t find what you&apos;re looking for,{" "}
              <Link to="/contact" className="text-sm font-medium underline underline-offset-4">
                get in touch
              </Link>
              .
            </p>
          </div>

          <div className="grid gap-6 text-start">
            {categories.map((category, categoryIndex) => (
              <div key={category.title} data-animate data-delay={String(categoryIndex + 1)}>
                <h3 className="border-b py-3 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
                  {category.title}
                </h3>
                <Accordion type="single" collapsible className="w-full">
                  {category.questions.map((item, i) => (
                    <AccordionItem key={item.question} value={`${categoryIndex}-${i}`}>
                      <AccordionTrigger className="text-left text-sm font-medium">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
