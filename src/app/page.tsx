import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileSpreadsheet, FolderTree, LayoutDashboard, MessageSquare, CalendarClock } from "lucide-react";

export default function HomePage() {
  return (
    <div>
      {/* Hero */}
      <section className="bg-[var(--navy)] py-20 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            AI Automation for{" "}
            <span className="text-[var(--gold)]">Maxwell Canyon Creek</span>
          </h1>
          <p className="mt-4 text-lg text-white/80">
            Working demos of the exact systems Tammy needs &mdash; financial
            extraction, folder automation, and client pipeline dashboards.
            Built to prove I can ship, not just talk.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button render={<Link href="/extract" />} size="lg" className="bg-[var(--gold)] text-[var(--navy)] hover:bg-[var(--gold-light)] font-semibold">
              Try Financial Extractor
            </Button>
            <Button render={<Link href="/questions" />} size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10">
              Read All 8 Answers
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b bg-white py-6">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-8 px-4 text-center">
          {[
            ["11", "Power Automate flows analyzed"],
            ["8", "Technical questions answered"],
            ["3", "Live demos built"],
            ["1", "Candidate who read the code"],
          ].map(([num, label]) => (
            <div key={label} className="min-w-[140px]">
              <div className="text-3xl font-bold text-[var(--navy)]">{num}</div>
              <div className="text-sm text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Demo Cards */}
      <section className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="mb-8 text-center text-2xl font-bold text-[var(--navy)]">
            Live Demos
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            <DemoCard
              href="/extract"
              icon={<FileSpreadsheet className="h-8 w-8 text-[var(--gold)]" />}
              title="Financial Extractor"
              description="Upload a financial statement PDF → AI extracts every line item → generates a filled valuation spreadsheet matching Tammy's exact template."
              tag="Q2"
            />
            <DemoCard
              href="/folders"
              icon={<FolderTree className="h-8 w-8 text-[var(--gold)]" />}
              title="Folder Creator"
              description="Enter client info → preview the full Google Drive folder tree → creates all sub-folders matching the Sale of Business or Residential taxonomy."
              tag="Q1"
            />
            <DemoCard
              href="/dashboard"
              icon={<LayoutDashboard className="h-8 w-8 text-[var(--gold)]" />}
              title="Pipeline Dashboard"
              description="Admin vs. client view of the buyer pipeline. Mock data uses the actual Main Client Sheet fields: Buyer Stage, Date of Last Contact, Notes."
              tag="Q3"
            />
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <DemoCard
              href="/questions"
              icon={<MessageSquare className="h-8 w-8 text-[var(--gold)]" />}
              title="All 8 Questions Answered"
              description="Detailed technical answers to every question Tammy asked — referencing specific flow names, column names, and bugs found in the solution export."
              tag="Q1-Q8"
            />
            <DemoCard
              href="/timeline"
              icon={<CalendarClock className="h-8 w-8 text-[var(--gold)]" />}
              title="Implementation Roadmap"
              description="3-phase plan: Fix & Stabilize (Weeks 1-2), Extraction & Valuation (Weeks 3-4), Dashboards & Scale (Weeks 5-8)."
              tag="Plan"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

function DemoCard({
  href,
  icon,
  title,
  description,
  tag,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  tag: string;
}) {
  return (
    <Link href={href} className="group">
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            {icon}
            <span className="rounded bg-[var(--navy)]/10 px-2 py-0.5 text-xs font-medium text-[var(--navy)]">
              {tag}
            </span>
          </div>
          <CardTitle className="mt-3 text-lg group-hover:text-[var(--navy)]">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-sm">{description}</CardDescription>
        </CardContent>
      </Card>
    </Link>
  );
}
