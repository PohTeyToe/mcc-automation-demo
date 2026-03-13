"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import {
  FileText,
  Upload,
  Download,
  Sparkles,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import type { ExtractionResult, LineItem } from "@/lib/types";

const fmt = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

function formatValue(v: number | null): string {
  if (v === null || v === undefined) return "--";
  return fmt.format(v);
}

export default function ExtractPage() {
  const [data, setData] = useState<ExtractionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cached sample on mount
  useEffect(() => {
    setLoading(true);
    setProgress(30);
    fetch("/api/extract", { method: "POST" })
      .then((res) => {
        setProgress(70);
        if (!res.ok) throw new Error("Failed to load sample data");
        return res.json();
      })
      .then((json) => {
        setProgress(100);
        setData(json);
        setFileName(null);
      })
      .catch((err) => setError(err.message))
      .finally(() => {
        setTimeout(() => setLoading(false), 300);
      });
  }, []);

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setLoading(true);
      setError(null);
      setProgress(10);
      setFileName(file.name);

      const formData = new FormData();
      formData.append("file", file);

      try {
        setProgress(30);
        const res = await fetch("/api/extract", {
          method: "POST",
          body: formData,
        });
        setProgress(80);

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error || "Extraction failed");
        }

        const json = await res.json();
        setProgress(100);
        setData(json);
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Extraction failed");
      } finally {
        setTimeout(() => setLoading(false), 300);
      }
    },
    []
  );

  const handleDownloadExcel = useCallback(async () => {
    if (!data) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/valuation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to generate Excel");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${data.businessName || "Valuation"} - Financials.xlsx`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Download failed");
    } finally {
      setDownloading(false);
    }
  }, [data]);

  const updateLineItem = useCallback(
    (
      section: "revenue" | "cogs" | "expenses",
      index: number,
      field: "label" | "year1" | "year0",
      value: string
    ) => {
      setData((prev) => {
        if (!prev) return prev;
        const updated = { ...prev };
        const items = [...updated[section]];
        const item = { ...items[index] };
        if (field === "label") {
          item.label = value;
        } else {
          item[field] = value === "" ? null : Number(value.replace(/[^0-9.-]/g, ""));
        }
        items[index] = item;
        updated[section] = items;
        return updated;
      });
    },
    []
  );

  const renderEditableRows = (
    items: LineItem[],
    section: "revenue" | "cogs" | "expenses"
  ) =>
    items.map((item, i) => (
      <TableRow key={`${section}-${i}`}>
        <TableCell className="font-medium">
          <input
            className="w-full bg-transparent border-b border-transparent hover:border-border focus:border-[var(--gold)] focus:outline-none px-1 py-0.5 text-sm"
            value={item.label}
            onChange={(e) => updateLineItem(section, i, "label", e.target.value)}
          />
        </TableCell>
        <TableCell className="text-right tabular-nums">
          <input
            className="w-28 text-right bg-transparent border-b border-transparent hover:border-border focus:border-[var(--gold)] focus:outline-none px-1 py-0.5 text-sm tabular-nums"
            value={item.year1 !== null ? item.year1.toString() : ""}
            onChange={(e) => updateLineItem(section, i, "year1", e.target.value)}
          />
        </TableCell>
        <TableCell className="text-right tabular-nums">
          <input
            className="w-28 text-right bg-transparent border-b border-transparent hover:border-border focus:border-[var(--gold)] focus:outline-none px-1 py-0.5 text-sm tabular-nums"
            value={item.year0 !== null ? item.year0.toString() : ""}
            onChange={(e) => updateLineItem(section, i, "year0", e.target.value)}
          />
        </TableCell>
      </TableRow>
    ));

  const renderSummaryRow = (
    label: string,
    values: { year1: number | null; year0: number | null },
    bold = false
  ) => (
    <TableRow
      key={label}
      className={bold ? "bg-[var(--navy)]/5 font-semibold" : ""}
    >
      <TableCell className={bold ? "font-bold" : "font-medium"}>
        {label}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatValue(values.year1)}
      </TableCell>
      <TableCell className="text-right tabular-nums">
        {formatValue(values.year0)}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <FileText className="h-8 w-8 text-[var(--navy)]" />
          <h1 className="text-3xl font-bold text-[var(--navy)]">
            Financial Statement Extractor
          </h1>
        </div>
        <p className="text-muted-foreground ml-11">
          AI-powered extraction of financial data from PDF statements into
          structured, editable tables.
        </p>
      </div>

      {/* Loading Bar */}
      {loading && (
        <div className="mb-6">
          <Progress value={progress}>
            <span className="text-sm text-muted-foreground">
              {progress < 50
                ? "Reading document..."
                : progress < 90
                ? "Extracting financial data with AI..."
                : "Finalizing..."}
            </span>
          </Progress>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Extraction Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - PDF Info & Upload */}
        <div className="lg:col-span-1 space-y-6">
          {/* PDF Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-[var(--gold)]" />
                {fileName || "Sample Financial Statement"}
              </CardTitle>
              <CardDescription>
                {fileName
                  ? "Custom uploaded PDF - extracted with Claude AI"
                  : "Pre-extracted sample data from a real financial statement. Upload your own PDF below to extract live data."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {data && (
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Business
                    </span>
                    <Badge variant="outline">{data.businessName}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Years
                    </span>
                    <span className="text-sm font-medium">
                      {data.year0Label} &ndash; {data.year1Label}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Line Items
                    </span>
                    <span className="text-sm font-medium">
                      {data.revenue.length +
                        data.cogs.length +
                        data.expenses.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-muted-foreground">
                      Status
                    </span>
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Extracted
                    </Badge>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* File Upload Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-[var(--gold)]" />
                Upload Custom PDF
              </CardTitle>
              <CardDescription>
                Upload a financial statement (Income Statement / P&amp;L) to
                extract data automatically.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Label htmlFor="pdf-upload">PDF File</Label>
                <Input
                  ref={fileInputRef}
                  id="pdf-upload"
                  type="file"
                  accept=".pdf"
                  onChange={handleFileUpload}
                  disabled={loading}
                  className="cursor-pointer"
                />
                <p className="text-xs text-muted-foreground">
                  Supported: PDF files up to 10MB. Works best with clean,
                  text-based PDFs.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Download Excel Button */}
          {data && !loading && (
            <Button
              onClick={handleDownloadExcel}
              disabled={downloading}
              className="w-full h-11 bg-[var(--navy)] hover:bg-[var(--navy-light)] text-white"
              size="lg"
            >
              {downloading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Download className="h-4 w-4 mr-2" />
              )}
              Generate Valuation Excel
            </Button>
          )}

          {/* How This Works */}
          <Accordion>
            <AccordionItem value="how-it-works">
              <AccordionTrigger className="px-2">
                <span className="flex items-center gap-2">
                  <Info className="h-4 w-4 text-[var(--gold)]" />
                  How This Works
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-2">
                <div className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5 shrink-0 bg-[var(--navy)] text-white">
                      1
                    </Badge>
                    <p>
                      <strong>PDF Upload</strong> &mdash; Your financial
                      statement PDF is sent securely to the server and converted
                      to base64 for processing.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5 shrink-0 bg-[var(--navy)] text-white">
                      2
                    </Badge>
                    <p>
                      <strong>Claude AI Extraction</strong> &mdash; Anthropic&apos;s
                      Claude analyzes the document, identifying revenue, COGS,
                      and expense line items with their values across fiscal
                      years.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5 shrink-0 bg-[var(--navy)] text-white">
                      3
                    </Badge>
                    <p>
                      <strong>Structured Data</strong> &mdash; The extracted data
                      is returned as structured JSON that populates the editable
                      table. You can review and correct any values.
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <Badge className="mt-0.5 shrink-0 bg-[var(--navy)] text-white">
                      4
                    </Badge>
                    <p>
                      <strong>Excel Generation</strong> &mdash; One click
                      populates a valuation Excel template with the extracted
                      financials, including SDE normalization calculations.
                    </p>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

        {/* Right Column - Data Table */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[var(--gold)]" />
                Extracted Financial Data
              </CardTitle>
              <CardDescription>
                Review and edit the extracted line items. Click any value to
                modify it before generating the Excel output.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading && !data ? (
                <div className="flex flex-col items-center justify-center py-16 gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--navy)]" />
                  <p className="text-sm text-muted-foreground">
                    Extracting financial data...
                  </p>
                </div>
              ) : data ? (
                <div className="space-y-1">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[var(--navy)] hover:bg-[var(--navy)]">
                        <TableHead className="text-white font-semibold">
                          Line Item
                        </TableHead>
                        <TableHead className="text-white font-semibold text-right">
                          {data.year1Label}
                        </TableHead>
                        <TableHead className="text-white font-semibold text-right">
                          {data.year0Label}
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {/* Revenue Section */}
                      <TableRow className="bg-[var(--gold)]/10">
                        <TableCell
                          colSpan={3}
                          className="font-bold text-[var(--navy)] uppercase text-xs tracking-wider"
                        >
                          Revenue
                        </TableCell>
                      </TableRow>
                      {renderEditableRows(data.revenue, "revenue")}
                      {renderSummaryRow("Total Revenue", data.totalRevenue)}

                      <TableRow><TableCell colSpan={3} className="p-0"><div className="border-b" /></TableCell></TableRow>

                      {/* COGS Section */}
                      <TableRow className="bg-[var(--gold)]/10">
                        <TableCell
                          colSpan={3}
                          className="font-bold text-[var(--navy)] uppercase text-xs tracking-wider"
                        >
                          Cost of Goods Sold
                        </TableCell>
                      </TableRow>
                      {renderEditableRows(data.cogs, "cogs")}
                      {renderSummaryRow("Total COGS", data.totalCogs)}

                      {/* Gross Profit */}
                      {renderSummaryRow("Gross Profit", data.grossProfit, true)}

                      <TableRow><TableCell colSpan={3} className="p-0"><div className="border-b" /></TableCell></TableRow>

                      {/* Expenses Section */}
                      <TableRow className="bg-[var(--gold)]/10">
                        <TableCell
                          colSpan={3}
                          className="font-bold text-[var(--navy)] uppercase text-xs tracking-wider"
                        >
                          Operating Expenses
                        </TableCell>
                      </TableRow>
                      {renderEditableRows(data.expenses, "expenses")}
                      {renderSummaryRow(
                        "Total Expenses",
                        data.totalExpenses
                      )}

                      {/* Net Income */}
                      <TableRow className="bg-[var(--navy)]/10">
                        <TableCell className="font-bold text-[var(--navy)] text-base">
                          Net Income
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums font-bold text-base ${
                            data.netIncome.year1 !== null &&
                            data.netIncome.year1 < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {formatValue(data.netIncome.year1)}
                        </TableCell>
                        <TableCell
                          className={`text-right tabular-nums font-bold text-base ${
                            data.netIncome.year0 !== null &&
                            data.netIncome.year0 < 0
                              ? "text-red-600"
                              : "text-green-700"
                          }`}
                        >
                          {formatValue(data.netIncome.year0)}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-16 gap-4 text-muted-foreground">
                  <FileText className="h-12 w-12" />
                  <p>No data loaded. Upload a PDF to get started.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
