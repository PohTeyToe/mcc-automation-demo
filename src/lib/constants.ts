import { FolderNode } from "./types";

export const BRAND = {
  name: "Maxwell Canyon Creek",
  tagline: "AI Automation Demo",
  navy: "#1e3a5f",
  navyLight: "#2a4f7f",
  gold: "#c5a55a",
  goldLight: "#d4bc7a",
} as const;

export const SALE_OF_BUSINESS_FOLDERS: FolderNode = {
  name: "{Business Name} – {Location}",
  type: "folder",
  children: [
    {
      name: "Initial Prospect Folder",
      type: "folder",
      children: [
        { name: "Financials", type: "folder" },
        { name: "Franchise & Lease Agreements", type: "folder" },
        { name: "Store Photos", type: "folder" },
        { name: "Monthly Sales", type: "folder" },
        { name: "Payroll/Staff", type: "folder" },
        { name: "Incorporated Docs", type: "folder" },
        { name: "Normalized Financials", type: "folder" },
      ],
    },
    {
      name: "Full Info Prospect Folder",
      type: "folder",
      children: [
        { name: "Financials", type: "folder" },
        { name: "Franchise & Lease Agreements", type: "folder" },
        { name: "Store Photos", type: "folder" },
        { name: "Monthly Sales", type: "folder" },
        { name: "Payroll/Staff", type: "folder" },
        { name: "Incorporated Docs", type: "folder" },
        { name: "Normalized Financials", type: "folder" },
      ],
    },
  ],
};

export const RESIDENTIAL_FOLDERS: FolderNode = {
  name: "{Client Name} – {Location}",
  type: "folder",
  children: [
    {
      name: "Listings",
      type: "folder",
      children: [
        { name: "Title", type: "folder" },
        { name: "Exclusive Seller Agreement", type: "folder" },
        { name: "Consumer Agreement", type: "folder" },
        { name: "FINTRAC", type: "folder" },
        { name: "RMS Measurements", type: "folder" },
        { name: "Photos", type: "folder" },
        { name: "Receipt of Funds", type: "folder" },
        { name: "Waivers", type: "folder" },
        { name: "Trade Record Sheet", type: "folder" },
      ],
    },
    {
      name: "Buyers",
      type: "folder",
      children: [
        { name: "Exclusive Buyer Agreement", type: "folder" },
        { name: "Consumer Agreement", type: "folder" },
        { name: "FINTRAC", type: "folder" },
        { name: "Waivers", type: "folder" },
        { name: "Trade Record Sheet", type: "folder" },
      ],
    },
  ],
};

export const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/extract", label: "Extractor" },
  { href: "/folders", label: "Folders" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/questions", label: "Q&A" },
  { href: "/timeline", label: "Roadmap" },
] as const;
