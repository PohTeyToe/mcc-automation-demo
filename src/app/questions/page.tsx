import Link from "next/link";
import { questions } from "@/data/questions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { MessageSquare, ArrowRight } from "lucide-react";

function renderAnswer(answer: string) {
  // Split by newlines and process each segment
  const parts = answer.split("\n");

  return parts.map((part, i) => {
    if (part.trim() === "") {
      return <br key={i} />;
    }

    // Process **bold** markers within text
    const segments = part.split(/(\*\*[^*]+\*\*)/g);
    const rendered = segments.map((seg, j) => {
      const boldMatch = seg.match(/^\*\*(.+)\*\*$/);
      if (boldMatch) {
        return <strong key={j}>{boldMatch[1]}</strong>;
      }
      // Process `code` markers
      const codeSegments = seg.split(/(`[^`]+`)/g);
      return codeSegments.map((codeSeg, k) => {
        const codeMatch = codeSeg.match(/^`(.+)`$/);
        if (codeMatch) {
          return (
            <code
              key={`${j}-${k}`}
              className="rounded bg-muted px-1.5 py-0.5 text-xs font-mono"
            >
              {codeMatch[1]}
            </code>
          );
        }
        return codeSeg;
      });
    });

    return (
      <p key={i} className="mb-2 last:mb-0">
        {rendered}
      </p>
    );
  });
}

export default function QuestionsPage() {
  return (
    <div>
      {/* Header */}
      <section className="bg-[var(--navy)] py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <MessageSquare className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Technical Q&A
          </h1>
          <p className="mt-3 text-white/80">
            Detailed answers to all 8 of Tammy&apos;s technical questions —
            referencing specific flow names, column names, and bugs found in the
            solution export.
          </p>
        </div>
      </section>

      {/* Questions */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <Accordion>
            {questions.map((q) => (
              <AccordionItem key={q.id} value={`q-${q.id}`}>
                <AccordionTrigger className="gap-3 text-left">
                  <Badge className="shrink-0 bg-[var(--navy)] text-white">
                    Q{q.id}
                  </Badge>
                  <span className="flex-1">{q.question}</span>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-1 pl-10 text-sm leading-relaxed text-muted-foreground">
                    {renderAnswer(q.answer)}
                  </div>
                  {q.demoLink && (
                    <div className="mt-4 pl-10">
                      <Button
                        render={<Link href={q.demoLink} />}
                        className="bg-[var(--gold)] text-[var(--navy)] hover:bg-[var(--gold-light)] font-semibold"
                      >
                        {q.demoLabel || "View Demo"}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>
    </div>
  );
}
