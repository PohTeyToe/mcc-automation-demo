"use client";

import { useState, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Users,
  ShieldCheck,
  User,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  FileText,
  ChevronRight,
  BarChart3,
  CircleDot,
  Info,
} from "lucide-react";
import { mockClients } from "@/data/mock-clients";
import type { ClientRecord } from "@/lib/types";

// ----- Constants -----

const STAGES = [
  "Initial Inquiry",
  "Has Initial Information",
  "Full Info",
  "Ready to Rate",
] as const;

const STAGE_COLORS: Record<string, { bg: string; border: string; text: string; bar: string }> = {
  "Initial Inquiry": {
    bg: "bg-sky-50",
    border: "border-sky-200",
    text: "text-sky-800",
    bar: "bg-sky-400",
  },
  "Has Initial Information": {
    bg: "bg-blue-50",
    border: "border-blue-200",
    text: "text-blue-800",
    bar: "bg-blue-500",
  },
  "Full Info": {
    bg: "bg-indigo-50",
    border: "border-indigo-200",
    text: "text-indigo-800",
    bar: "bg-indigo-600",
  },
  "Ready to Rate": {
    bg: "bg-[var(--navy)]/5",
    border: "border-[var(--navy)]/30",
    text: "text-[var(--navy)]",
    bar: "bg-[var(--navy)]",
  },
};

const DOC_STATUS_CONFIG = {
  red: { label: "Missing", dotColor: "bg-red-500", textColor: "text-red-700", bgColor: "bg-red-50" },
  yellow: { label: "Partial", dotColor: "bg-amber-500", textColor: "text-amber-700", bgColor: "bg-amber-50" },
  green: { label: "Complete", dotColor: "bg-emerald-500", textColor: "text-emerald-700", bgColor: "bg-emerald-50" },
};

type SortKey = "clientName" | "businessesOfInquiry" | "buyerStage" | "documentStatus" | "daysOnMarket" | "dateOfLastContact";
type SortDir = "asc" | "desc";

// ----- Helpers -----

function stageIndex(stage: string) {
  return STAGES.indexOf(stage as typeof STAGES[number]);
}

function sortClients(clients: ClientRecord[], key: SortKey, dir: SortDir) {
  return [...clients].sort((a, b) => {
    let cmp = 0;
    if (key === "buyerStage") {
      cmp = stageIndex(a.buyerStage) - stageIndex(b.buyerStage);
    } else if (key === "daysOnMarket") {
      cmp = a.daysOnMarket - b.daysOnMarket;
    } else if (key === "documentStatus") {
      const order = { red: 0, yellow: 1, green: 2 };
      cmp = order[a.documentStatus] - order[b.documentStatus];
    } else {
      cmp = String(a[key]).localeCompare(String(b[key]));
    }
    return dir === "asc" ? cmp : -cmp;
  });
}

// ----- Sub-components -----

function DocStatusBadge({ status }: { status: "red" | "yellow" | "green" }) {
  const cfg = DOC_STATUS_CONFIG[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${cfg.bgColor} ${cfg.textColor}`}
    >
      <span className={`h-2 w-2 rounded-full ${cfg.dotColor}`} />
      {cfg.label}
    </span>
  );
}

function StageBadge({ stage }: { stage: string }) {
  const colors = STAGE_COLORS[stage];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-xs font-medium border ${colors.bg} ${colors.border} ${colors.text}`}
    >
      {stage}
    </span>
  );
}

function FunnelVisualization({ stageCounts }: { stageCounts: Record<string, number> }) {
  const total = mockClients.length;
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-medium text-muted-foreground">
        <span>Pipeline Funnel</span>
        <span>{total} total clients</span>
      </div>
      <div className="space-y-2">
        {STAGES.map((stage, i) => {
          const count = stageCounts[stage] || 0;
          const pct = total > 0 ? (count / total) * 100 : 0;
          const colors = STAGE_COLORS[stage];
          // Funnel narrows: max width decreases per stage
          const maxW = 100 - i * 10;
          return (
            <div key={stage} className="flex items-center gap-3">
              <div className="w-44 shrink-0 text-right text-xs text-muted-foreground truncate">
                {stage}
              </div>
              <div className="relative flex-1 h-8 rounded bg-muted/50" style={{ maxWidth: `${maxW}%` }}>
                <div
                  className={`absolute inset-y-0 left-0 rounded ${colors.bar} transition-all duration-500`}
                  style={{ width: `${Math.max(pct, 8)}%` }}
                />
                <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white mix-blend-difference">
                  {count}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0 last:invisible" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StageCards({ stageCounts }: { stageCounts: Record<string, number> }) {
  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {STAGES.map((stage) => {
        const count = stageCounts[stage] || 0;
        const colors = STAGE_COLORS[stage];
        return (
          <Card key={stage} className={`border ${colors.border} ${colors.bg}`}>
            <CardHeader className="pb-1">
              <CardDescription className={`text-xs font-medium ${colors.text}`}>
                {stage}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className={`text-3xl font-bold ${colors.text}`}>{count}</div>
              <p className="text-xs text-muted-foreground mt-1">
                {count === 1 ? "client" : "clients"}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

function SortableHeader({
  label,
  sortKey,
  currentSort,
  currentDir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  currentSort: SortKey;
  currentDir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <TableHead>
      <button
        className="inline-flex items-center gap-1 hover:text-[var(--navy)] transition-colors"
        onClick={() => onSort(sortKey)}
      >
        {label}
        <ArrowUpDown
          className={`h-3.5 w-3.5 transition-transform ${
            currentSort === sortKey ? "text-[var(--navy)]" : "text-muted-foreground/40"
          } ${currentSort === sortKey && currentDir === "desc" ? "rotate-180" : ""}`}
        />
      </button>
    </TableHead>
  );
}

function ClientTable({ clients }: { clients: ClientRecord[] }) {
  const [sortKey, setSortKey] = useState<SortKey>("buyerStage");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const sorted = useMemo(() => sortClients(clients, sortKey, sortDir), [clients, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-[var(--navy)]">
          <FileText className="h-5 w-5" />
          Client Pipeline Detail
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/30">
              <SortableHeader label="Client Name" sortKey="clientName" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Business" sortKey="businessesOfInquiry" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Buyer Stage" sortKey="buyerStage" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Doc Status" sortKey="documentStatus" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Days on Market" sortKey="daysOnMarket" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <SortableHeader label="Last Contact" sortKey="dateOfLastContact" currentSort={sortKey} currentDir={sortDir} onSort={handleSort} />
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((c) => (
              <TableRow key={c.id} className="group hover:bg-[var(--navy)]/[0.02]">
                <TableCell className="font-medium">{c.clientName}</TableCell>
                <TableCell className="max-w-[200px] truncate text-muted-foreground">
                  {c.businessesOfInquiry}
                </TableCell>
                <TableCell>
                  <StageBadge stage={c.buyerStage} />
                </TableCell>
                <TableCell>
                  <DocStatusBadge status={c.documentStatus} />
                </TableCell>
                <TableCell>
                  <span className={`font-medium ${c.daysOnMarket > 60 ? "text-amber-600" : ""}`}>
                    {c.daysOnMarket}
                  </span>
                </TableCell>
                <TableCell className="text-muted-foreground">{c.dateOfLastContact}</TableCell>
                <TableCell className="max-w-[250px] truncate text-xs text-muted-foreground">
                  {c.notes}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

function PipelineHealth({ stageCounts }: { stageCounts: Record<string, number> }) {
  const total = mockClients.length;
  const ready = stageCounts["Ready to Rate"] || 0;
  const fullInfo = stageCounts["Full Info"] || 0;
  const needsAttention = mockClients.filter((c) => c.documentStatus === "red").length;
  const avgDays = Math.round(mockClients.reduce((s, c) => s + c.daysOnMarket, 0) / total);

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <Card>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--navy)]/10">
            <Users className="h-5 w-5 text-[var(--navy)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--navy)]">{total}</p>
            <p className="text-xs text-muted-foreground">Total Clients</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-emerald-700">{ready + fullInfo}</p>
            <p className="text-xs text-muted-foreground">Near Completion</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <AlertCircle className="h-5 w-5 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-700">{needsAttention}</p>
            <p className="text-xs text-muted-foreground">Need Docs</p>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--gold)]/10">
            <Clock className="h-5 w-5 text-[var(--gold)]" />
          </div>
          <div>
            <p className="text-2xl font-bold text-[var(--navy)]">{avgDays}</p>
            <p className="text-xs text-muted-foreground">Avg Days on Market</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- Admin View -----

function AdminView() {
  const stageCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const stage of STAGES) counts[stage] = 0;
    for (const c of mockClients) counts[c.buyerStage]++;
    return counts;
  }, []);

  return (
    <div className="space-y-6">
      {/* Health Summary */}
      <PipelineHealth stageCounts={stageCounts} />

      <Separator />

      {/* Funnel + Stage Cards row */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-[var(--navy)]">
              <BarChart3 className="h-5 w-5" />
              Pipeline Funnel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <FunnelVisualization stageCounts={stageCounts} />
          </CardContent>
        </Card>

        <div className="space-y-3">
          <h3 className="text-sm font-medium text-muted-foreground">Stage Breakdown</h3>
          <StageCards stageCounts={stageCounts} />
          {/* Document status summary */}
          <Card size="sm" className="mt-3">
            <CardContent>
              <h4 className="text-xs font-medium text-muted-foreground mb-2">Document Status Overview</h4>
              <div className="flex items-center gap-4">
                {(["green", "yellow", "red"] as const).map((status) => {
                  const count = mockClients.filter((c) => c.documentStatus === status).length;
                  return (
                    <div key={status} className="flex items-center gap-1.5">
                      <DocStatusBadge status={status} />
                      <span className="text-sm font-medium">{count}</span>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Data Table */}
      <ClientTable clients={mockClients} />
    </div>
  );
}

// ----- Client View -----

function ClientView() {
  const client = mockClients.find((c) => c.clientName === "Mountain View Bakery")!;
  const currentStageIdx = stageIndex(client.buyerStage);
  const progress = ((currentStageIdx + 1) / STAGES.length) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Welcome */}
      <Card className="border-[var(--gold)]/30 bg-gradient-to-br from-[var(--navy)]/[0.02] to-transparent">
        <CardHeader>
          <CardTitle className="text-xl text-[var(--navy)]">
            {client.businessesOfInquiry}
          </CardTitle>
          <CardDescription>
            Welcome back. Here is the current status of your listing.
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Stage Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[var(--navy)]">Your Buyer Stage</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <div className="h-3 w-full rounded-full bg-muted">
              <div
                className="h-3 rounded-full bg-gradient-to-r from-[var(--navy)] to-[var(--gold)] transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Stage steps */}
          <div className="flex items-center justify-between">
            {STAGES.map((stage, i) => {
              const isCompleted = i <= currentStageIdx;
              const isCurrent = i === currentStageIdx;
              return (
                <div key={stage} className="flex flex-col items-center gap-1.5 flex-1">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition-all ${
                      isCurrent
                        ? "bg-[var(--gold)] text-white ring-4 ring-[var(--gold)]/20"
                        : isCompleted
                        ? "bg-[var(--navy)] text-white"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      i + 1
                    )}
                  </div>
                  <span
                    className={`text-[10px] text-center leading-tight max-w-[80px] ${
                      isCurrent ? "font-semibold text-[var(--navy)]" : "text-muted-foreground"
                    }`}
                  >
                    {stage}
                  </span>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Document Status */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[var(--navy)]">Document Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <DocStatusBadge status={client.documentStatus} />
            <span className="text-sm text-muted-foreground">
              {client.documentStatus === "green"
                ? "All required documents have been received."
                : client.documentStatus === "yellow"
                ? "Some documents are still pending."
                : "Key documents are missing."}
            </span>
          </div>
          {client.missingDocs.length > 0 && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <p className="text-xs font-medium text-amber-800 mb-1">Missing Documents:</p>
              <ul className="space-y-1">
                {client.missingDocs.map((doc) => (
                  <li key={doc} className="flex items-center gap-1.5 text-sm text-amber-700">
                    <CircleDot className="h-3 w-3" />
                    {doc}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {client.missingDocs.length === 0 && (
            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
              <p className="flex items-center gap-2 text-sm text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
                All documents received and verified.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Days on Market */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base text-[var(--navy)]">Listing Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Days on Market</p>
              <p className="text-2xl font-bold text-[var(--navy)]">{client.daysOnMarket}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Last Contact</p>
              <p className="text-lg font-semibold text-[var(--navy)]">{client.dateOfLastContact}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ----- How This Works -----

function HowThisWorks() {
  return (
    <Accordion>
      <AccordionItem value="how-it-works">
        <AccordionTrigger className="text-sm text-muted-foreground hover:text-[var(--navy)]">
          <div className="flex items-center gap-2">
            <Info className="h-4 w-4" />
            How This Would Be Built in Production
          </div>
        </AccordionTrigger>
        <AccordionContent>
          <div className="space-y-4 text-sm text-muted-foreground pb-2">
            <p>
              This dashboard demonstrates a client pipeline view that would be built as a{" "}
              <strong className="text-foreground">Power Apps canvas app</strong> connected to the{" "}
              <strong className="text-foreground">Main Client Sheet</strong> in Excel (SharePoint).
            </p>

            <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
              <p className="font-medium text-foreground text-xs uppercase tracking-wide">
                Data Source: Main Client Sheet Columns
              </p>
              <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs">
                {[
                  "Client Name",
                  "Client Email",
                  "Buyer Stage",
                  "Businesses of Inquiry",
                  "Date of Last Contact",
                  "Notes",
                ].map((col) => (
                  <div key={col} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
                    <code className="text-[var(--navy)] font-mono">{col}</code>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="font-medium text-foreground">How the sync works:</p>
              <ol className="list-decimal list-inside space-y-1 text-xs">
                <li>
                  A <strong>Power Automate scheduled flow</strong> runs every 15 minutes
                </li>
                <li>
                  It reads the Main Client Sheet from SharePoint via the Excel connector
                </li>
                <li>
                  Data is written to a <strong>Dataverse table</strong> or remains in Excel as a source
                </li>
                <li>
                  The Power App reads from that source and renders the admin/client views
                </li>
                <li>
                  Tammy (admin) sees all clients; each business owner sees only their own record
                </li>
              </ol>
            </div>

            <p className="text-xs italic">
              This Next.js demo uses mock data to show the exact UI and UX that the Power App
              would deliver. The column names, buyer stages, and document statuses match what
              is already in Tammy&apos;s existing Excel sheet.
            </p>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// ----- Main Page -----

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[var(--navy)]/[0.02] to-transparent">
      {/* Header */}
      <div className="bg-[var(--navy)] py-10">
        <div className="mx-auto max-w-6xl px-4">
          <h1 className="text-3xl font-bold text-white">
            Client Pipeline{" "}
            <span className="text-[var(--gold)]">Dashboard</span>
          </h1>
          <p className="mt-2 text-white/70">
            Track buyer stages, document status, and pipeline health at a glance.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-8">
        <Tabs defaultValue="admin" style={{ flexDirection: "column" }}>
          <TabsList className="mb-6">
            <TabsTrigger value="admin">
              <ShieldCheck className="h-4 w-4 mr-1.5" />
              Admin View (Tammy)
            </TabsTrigger>
            <TabsTrigger value="client">
              <User className="h-4 w-4 mr-1.5" />
              Client View (Mountain View Bakery)
            </TabsTrigger>
          </TabsList>

          <TabsContent value="admin">
            <AdminView />
          </TabsContent>

          <TabsContent value="client">
            <ClientView />
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <HowThisWorks />
      </div>
    </div>
  );
}
