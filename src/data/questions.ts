import { QuestionData } from "@/lib/types";

export const questions: QuestionData[] = [
  {
    id: 1,
    question:
      "How would you create the automatic folder structure in Google Drive when a new client is entered in Power Apps?",
    answer: `The sendInitialInfo flow already triggers from Power Apps and pulls client info from Main Client Sheet. I'd add a parallel action that calls the Google Drive connector to create the full folder tree. Parent folder gets named \`{Business Name} – {Location}\`, then it creates Initial Prospect and Full Info with all 7 sub-folders underneath (Financials, Franchise & Lease, Store Photos, Monthly Sales, Payroll/Staff, Incorporated Docs, Normalized Financials). The folder link gets written back to the client record and included in the onboarding email automatically — no manual steps after hitting the button in Power Apps.\n\n**Try the live demo** to see the folder structure generated from a form input, matching your exact taxonomy.`,
    demoLink: "/folders",
    demoLabel: "Try Folder Creator Demo →",
  },
  {
    id: 2,
    question:
      "How would you set up the automated financial extraction from financial statements to our valuation spreadsheet?",
    answer: `Your n8n extraction workflow watches a Drive folder, downloads the PDF, parses it with regex to find the Statement of Operations section, then maps revenue to rows 2-4, COGS to row 5, and expenses to rows 9-35 on the 2YR Financials sheet. The Normalized Calculations sheet handles the SDE multiples from there.\n\nIt's a solid setup, but the regex approach breaks when financial statements have non-standard layouts. I'd swap out the parsing step for AI document intelligence (Claude) — same output format, same Excel mapping, but it handles any financial statement without custom regex.\n\n**The live demo** processes your actual sample financial statement PDF, extracts all line items using AI, and generates a filled valuation spreadsheet you can download.`,
    demoLink: "/extract",
    demoLabel: "Try Financial Extractor Demo →",
  },
  {
    id: 3,
    question:
      "How would you build the admin dashboard vs. client-facing view?",
    answer: `Your Power Apps already tracks Buyer Stage (Initial Inquiry → Has Initial Information → Full Info → Ready to Rate), along with Client Name, Email, Date of Last Contact, and Notes.\n\nFor the **admin view** I'd add document validation status (red/yellow/green) and a calculated days-on-market field. The **client-facing view** would be a separate screen filtered by business — they'd only see their own buyer pipeline counts without access to notes or scorecard.\n\nFor daily updates, either a scheduled Power Automate flow that syncs the data, or a "When a row is modified" trigger for real-time refresh.\n\n**The dashboard prototype** uses mock data based on your actual client sheet fields so you can see what both views would look like.`,
    demoLink: "/dashboard",
    demoLabel: "Try Dashboard Demo →",
  },
  {
    id: 4,
    question:
      "How would you implement the document validation / traffic light system?",
    answer: `The VerifyFilesSeller flow currently triggers on every incoming email with no filters and the conditional branches are empty — nothing actually happens when it matches a client.\n\nHere's how I'd rebuild it: trigger on file uploads to the client's Drive folder instead of emails, scan all files recursively, then use AI to categorize what's there against the required checklist (Financials, Franchise & Lease, Photos, Payroll, Corporate Docs, etc.).\n\nScore it:\n- **Red Light:** 3+ missing document categories\n- **Yellow Light:** 1-2 missing categories\n- **Green Light:** All present and accounted for\n\nUpdate the client record automatically and email the seller a list of what's still missing. This feeds directly into the dashboard so you can see every client's readiness at a glance.`,
  },
  {
    id: 5,
    question:
      "How would you automate signed documents from DocuSign to Google Drive?",
    answer: `I'd set up a Power Automate flow triggered by DocuSign's completion webhook. When an envelope gets signed, the flow:\n\n1. Grabs the signed PDF from DocuSign\n2. Matches the signer's email to the client record in Main Client Sheet\n3. Uploads it to their Drive folder under a \`/DocuSign Signed/\` sub-folder\n4. Names the file with the document type (LOI, Consulting Agreement, Waiver, etc.)\n5. Updates the Excel tracker with the signed date\n6. Sends you a notification\n\nYour inbox stays clean and everything's filed where it should be. The document validation system from Q4 would automatically pick up the new file and update the traffic light status.`,
  },
  {
    id: 6,
    question: "How would you approach automated brochure generation?",
    answer: `I looked at your brochure template — the MaxWell header with price and MLS number, the red banner section with business type and key financials (asking price, unit size, lease terms, gross rent, included costs), photos on the right side, and your contact info at the bottom.\n\nThe approach: AI reads everything in the client's folder — financials, lease docs, photos — extracts the specific data points needed, and generates a PDF matching your layout programmatically.\n\nI think this is more reliable than the Canva API right now (it's still pretty limited for this kind of templating), and it means the whole thing runs end-to-end without manual input. The data extraction part is essentially the same pipeline as the financial extractor — we're just pulling different fields and rendering them into a different template.`,
  },
  {
    id: 7,
    question:
      "How would you make the system maintainable and easy to understand?",
    answer: `This is something I feel strongly about. I'd deliver:\n\n1. **One-page doc for every flow** — what triggers it, what it does step by step, what to check if it breaks, and how to test it\n2. **Master reference sheet** listing all hardcoded file IDs and SharePoint URLs in the system (right now if you rename or move a file, flows fail silently because the IDs are baked in everywhere)\n3. **Architecture diagram** showing how all 11 flows connect to each other\n4. **Weekly status reports** with hours logged and tasks completed\n\nThe goal is that you'd have everything you need to troubleshoot or hand this off to someone else without depending on me.`,
  },
  {
    id: 8,
    question: "How confident are you with Power Automate and Power Apps?",
    answer: `I want to be straight — I haven't built directly in Power Apps before. But I've gone through the full solution export, all 11 flows, and I understand how they're wired:\n\n- **CreateConsultingAgreement** is solid and you're using it daily (trigger from Power Apps → Word template populate via Encodian → save to OneDrive → log to Excel)\n- **BusinessEvaluation** is stuck because the AI Builder text recognition and custom prompt models haven't been installed in the environment yet\n- **sendInitialInfo** has column name issues ("Cheat Business" and the misspelled "Buisness of Inquiry") that cause lookup failures\n- **VerifyFilesSeller** is essentially a stub waiting to be built out\n\nThe automation patterns — triggers, connectors, conditional logic, looping through data, reading/writing to Excel — are the same as what I build daily in n8n. The learning curve is the Power Apps UI and Microsoft connector ecosystem, not the automation concepts. Phase 1 would be fixing the existing bugs and missing dependencies before building anything new.`,
  },
];
