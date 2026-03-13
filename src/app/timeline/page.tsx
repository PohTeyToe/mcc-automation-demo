import { timelinePhases } from "@/data/timeline-phases";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Progress, ProgressLabel, ProgressValue } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  CalendarClock,
  CheckSquare,
  Square,
  Circle,
} from "lucide-react";

function getOverallProgress(phases: typeof timelinePhases): number {
  const totalTasks = phases.reduce((sum, p) => sum + p.tasks.length, 0);
  let completedTasks = 0;
  for (const phase of phases) {
    if (phase.status === "completed") {
      completedTasks += phase.tasks.length;
    } else if (phase.status === "current") {
      // Estimate ~25% through the current phase
      completedTasks += Math.round(phase.tasks.length * 0.25);
    }
  }
  return Math.round((completedTasks / totalTasks) * 100);
}

function getStatusBadge(status: "upcoming" | "current" | "completed") {
  switch (status) {
    case "completed":
      return (
        <Badge className="bg-emerald-600 text-white">Completed</Badge>
      );
    case "current":
      return (
        <Badge className="bg-[var(--gold)] text-[var(--navy)]">
          In Progress
        </Badge>
      );
    case "upcoming":
      return <Badge variant="outline">Upcoming</Badge>;
  }
}

export default function TimelinePage() {
  const progress = getOverallProgress(timelinePhases);

  return (
    <div>
      {/* Header */}
      <section className="bg-[var(--navy)] py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <CalendarClock className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Implementation Roadmap
          </h1>
          <p className="mt-3 text-white/80">
            3-phase plan covering stabilization, extraction, and dashboard
            delivery over 8 weeks.
          </p>
        </div>
      </section>

      {/* Progress bar */}
      <section className="border-b bg-white py-8">
        <div className="mx-auto max-w-3xl px-4">
          <Progress value={progress}>
            <ProgressLabel>Overall Progress</ProgressLabel>
            <ProgressValue />
          </Progress>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-12">
        <div className="mx-auto max-w-3xl px-4">
          <div className="relative">
            {/* Vertical connecting line */}
            <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-border" />

            <div className="space-y-8">
              {timelinePhases.map((phase) => {
                const isCurrent = phase.status === "current";
                const isCompleted = phase.status === "completed";

                return (
                  <div key={phase.phase} className="relative flex gap-6">
                    {/* Timeline dot */}
                    <div className="relative z-10 flex shrink-0">
                      <div
                        className={`mt-6 flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-bold ${
                          isCurrent
                            ? "border-[var(--gold)] bg-[var(--gold)] text-[var(--navy)]"
                            : isCompleted
                            ? "border-emerald-600 bg-emerald-600 text-white"
                            : "border-border bg-white text-muted-foreground"
                        }`}
                      >
                        {phase.phase}
                      </div>
                    </div>

                    {/* Phase card */}
                    <Card
                      className={`flex-1 ${
                        isCurrent
                          ? "border-[var(--gold)] shadow-md ring-1 ring-[var(--gold)]/20"
                          : ""
                      }`}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <CardTitle className="text-lg text-[var(--navy)]">
                            {phase.title}
                          </CardTitle>
                          {getStatusBadge(phase.status)}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {phase.weeks}
                        </p>
                      </CardHeader>
                      <Separator />
                      <CardContent className="pt-4">
                        <ul className="space-y-2.5">
                          {phase.tasks.map((task, i) => (
                            <li
                              key={i}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              {isCompleted ? (
                                <CheckSquare className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                              ) : isCurrent && i === 0 ? (
                                <Circle className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                              ) : (
                                <Square className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/40" />
                              )}
                              <span
                                className={
                                  isCompleted
                                    ? "text-muted-foreground line-through"
                                    : "text-foreground"
                                }
                              >
                                {task}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
