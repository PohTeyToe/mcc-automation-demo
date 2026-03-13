import { TimelinePhase } from "@/lib/types";

export const timelinePhases: TimelinePhase[] = [
  {
    phase: 1,
    title: "Fix & Stabilize",
    weeks: "Weeks 1-2",
    status: "current",
    tasks: [
      "Fix sendInitialInfo column name bugs (\"Cheat Business\", \"Buisness of Inquiry\")",
      "Install AI Builder models for BusinessEvaluation flow",
      "Build out VerifyFilesSeller with Drive-based trigger and document categorization",
      "Audit all 11 flows for hardcoded file IDs and broken references",
      "Set up Google Drive folder automation from Power Apps trigger",
      "Document every flow with one-page runbooks",
    ],
  },
  {
    phase: 2,
    title: "Extraction & Valuation",
    weeks: "Weeks 3-4",
    status: "upcoming",
    tasks: [
      "Deploy AI-powered financial statement extraction (replace n8n regex parsing)",
      "Connect extraction pipeline to Valuation Template Excel mapping",
      "Implement document validation traffic light system (Red/Yellow/Green)",
      "Set up DocuSign → Google Drive automation with completion webhook",
      "Build automated brochure generation from client folder data",
      "Test end-to-end: PDF upload → extraction → valuation → folder filing",
    ],
  },
  {
    phase: 3,
    title: "Dashboards & Scale",
    weeks: "Weeks 5-8",
    status: "upcoming",
    tasks: [
      "Build admin dashboard in Power Apps with full pipeline view",
      "Build client-facing view with filtered business data",
      "Set up scheduled sync flows for real-time dashboard updates",
      "Create architecture diagram of all flow interconnections",
      "Build master reference sheet of all system IDs and URLs",
      "Weekly status reports with hours logged and tasks completed",
      "Handoff documentation and training",
    ],
  },
];
