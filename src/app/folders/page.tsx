"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Folder,
  FolderOpen,
  FolderTree,
  Info,
  CheckCircle2,
  Loader2,
  ExternalLink,
} from "lucide-react";
import type { FolderNode, FolderResult } from "@/lib/types";

function FolderTreeNode({
  node,
  depth = 0,
  index = 0,
}: {
  node: FolderNode;
  depth?: number;
  index?: number;
}) {
  const hasChildren = node.children && node.children.length > 0;
  const isRoot = depth === 0;

  return (
    <div
      className="animate-in fade-in slide-in-from-left-2"
      style={{
        animationDelay: `${index * 50}ms`,
        animationDuration: "300ms",
        animationFillMode: "backwards",
      }}
    >
      <div
        className="flex items-center gap-2 py-1"
        style={{ paddingLeft: `${depth * 24}px` }}
      >
        {hasChildren ? (
          <FolderOpen
            className={`h-4 w-4 shrink-0 ${
              isRoot
                ? "text-[var(--gold)]"
                : depth === 1
                ? "text-[var(--navy)]"
                : "text-muted-foreground"
            }`}
          />
        ) : (
          <Folder
            className="h-4 w-4 shrink-0 text-muted-foreground"
          />
        )}
        <span
          className={`text-sm ${
            isRoot
              ? "font-bold text-[var(--navy)]"
              : depth === 1
              ? "font-semibold text-[var(--navy)]"
              : "text-foreground"
          }`}
        >
          {node.name}
        </span>
      </div>
      {hasChildren &&
        node.children!.map((child, i) => (
          <FolderTreeNode
            key={child.name}
            node={child}
            depth={depth + 1}
            index={index + i + 1}
          />
        ))}
    </div>
  );
}

export default function FoldersPage() {
  const [businessName, setBusinessName] = useState("");
  const [location, setLocation] = useState("");
  const [businessType, setBusinessType] = useState<string>("sale-of-business");
  const [shareWith, setShareWith] = useState("");
  const [folderTree, setFolderTree] = useState<FolderNode | null>(null);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [driveUrl, setDriveUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [treeKey, setTreeKey] = useState(0);

  async function handlePreview() {
    if (!businessName.trim() || !location.trim()) return;
    setLoading(true);
    setDriveUrl(null);
    setError(null);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          location: location.trim(),
          businessType,
          mode: "preview",
        }),
      });
      const data: FolderResult = await res.json();
      setFolderTree(data.tree);
      setTreeKey((k) => k + 1);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateDrive() {
    if (!businessName.trim() || !location.trim()) return;
    setCreating(true);
    setDriveUrl(null);
    setError(null);
    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessName: businessName.trim(),
          location: location.trim(),
          businessType,
          mode: "live",
          shareWith: shareWith.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to create folders");
        return;
      }
      setFolderTree(data.tree);
      setTreeKey((k) => k + 1);
      setDriveUrl(data.driveUrl);
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setCreating(false);
    }
  }

  const isFormValid = businessName.trim() !== "" && location.trim() !== "";

  return (
    <div>
      {/* Header */}
      <section className="bg-[var(--navy)] py-14 text-white">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <div className="mb-3 flex items-center justify-center gap-2">
            <FolderTree className="h-8 w-8 text-[var(--gold)]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Client Folder Creator
          </h1>
          <p className="mt-3 text-white/80">
            Enter client details and generate the full Google Drive folder
            structure — matching the exact taxonomy used at Maxwell Canyon Creek.
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-12">
        <div className="mx-auto max-w-6xl px-4">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left: Form */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Client Information</CardTitle>
                  <CardDescription>
                    Fill in the details to generate the folder structure.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="businessName">Business / Client Name</Label>
                    <Input
                      id="businessName"
                      placeholder="e.g. Tim Hortons #4521"
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      placeholder="e.g. Mississauga, ON"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Business Type</Label>
                    <Select
                      value={businessType}
                      onValueChange={(val) => {
                        if (val) setBusinessType(val);
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sale-of-business">
                          Sale of Business
                        </SelectItem>
                        <SelectItem value="residential">Residential</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shareWith">Share With (email)</Label>
                    <Input
                      id="shareWith"
                      type="email"
                      placeholder="e.g. tammy@example.com (optional)"
                      value={shareWith}
                      onChange={(e) => setShareWith(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground">
                      The created folder will be shared with this email as an editor.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <Button
                      onClick={handlePreview}
                      disabled={!isFormValid || loading || creating}
                      className="bg-[var(--navy)] hover:bg-[var(--navy-light)]"
                    >
                      {loading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FolderTree className="mr-2 h-4 w-4" />
                      )}
                      Preview
                    </Button>
                    <Button
                      onClick={handleCreateDrive}
                      disabled={!isFormValid || creating || loading}
                      className="bg-[var(--gold)] text-[var(--navy)] hover:bg-[var(--gold-light)]"
                    >
                      {creating ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <FolderOpen className="mr-2 h-4 w-4" />
                      )}
                      {creating ? "Creating..." : "Create in Google Drive"}
                    </Button>
                  </div>

                  {driveUrl && (
                    <Alert className="border-green-500 bg-green-50">
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      <AlertTitle className="text-green-800">Folders Created</AlertTitle>
                      <AlertDescription className="text-green-700">
                        Your folder structure has been created in Google Drive.
                        {shareWith && ` Shared with ${shareWith}.`}
                        <a
                          href={driveUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-2 flex items-center gap-1 font-medium text-green-800 underline"
                        >
                          Open in Google Drive
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </AlertDescription>
                    </Alert>
                  )}

                  {error && (
                    <Alert className="border-red-300 bg-red-50">
                      <Info className="h-4 w-4 text-red-500" />
                      <AlertTitle className="text-red-800">Error</AlertTitle>
                      <AlertDescription className="text-red-700">
                        {error}
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              {/* How This Works */}
              <Card>
                <CardContent className="pt-6">
                  <Accordion>
                    <AccordionItem value="how-it-works">
                      <AccordionTrigger className="text-sm font-semibold text-[var(--navy)]">
                        How This Works
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 text-sm text-muted-foreground">
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                            <p>
                              <strong>Service account</strong> — A dedicated
                              Google service account creates folders without
                              needing access to anyone&apos;s personal Drive.
                              It only sees files it creates (drive.file scope).
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                            <p>
                              <strong>Template-based</strong> — Folder trees
                              match Maxwell Canyon Creek&apos;s exact taxonomy
                              for Sale of Business and Residential listings.
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                            <p>
                              <strong>Auto-shared</strong> — Created folders are
                              shared with the specified email so they appear
                              directly in the recipient&apos;s Drive.
                            </p>
                          </div>
                          <div className="flex items-start gap-3">
                            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[var(--gold)]" />
                            <p>
                              <strong>Privacy first</strong> — The service
                              account has no access to existing files. It can
                              only manage folders it creates itself.
                            </p>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>

            {/* Right: Folder Tree */}
            <div>
              <Card className="min-h-[400px]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FolderOpen className="h-5 w-5 text-[var(--gold)]" />
                    Folder Structure Preview
                  </CardTitle>
                  <CardDescription>
                    {folderTree
                      ? `${businessType === "sale-of-business" ? "Sale of Business" : "Residential"} folder tree for ${businessName}`
                      : "Fill in the form and click Preview to see the folder tree."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {folderTree ? (
                    <div
                      key={treeKey}
                      className="rounded-lg border bg-muted/30 p-4"
                    >
                      <FolderTreeNode node={folderTree} />
                    </div>
                  ) : (
                    <div className="flex h-[300px] flex-col items-center justify-center text-muted-foreground">
                      <FolderTree className="mb-3 h-12 w-12 opacity-20" />
                      <p className="text-sm">No folder structure to display</p>
                      <p className="text-xs">
                        Enter client details and click Preview
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
