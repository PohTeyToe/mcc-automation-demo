import { NextRequest, NextResponse } from "next/server";
import { google } from "googleapis";
import {
  SALE_OF_BUSINESS_FOLDERS,
  RESIDENTIAL_FOLDERS,
} from "@/lib/constants";
import type { FolderNode, FolderRequest, FolderResult } from "@/lib/types";

function fillNames(node: FolderNode, businessName: string, location: string): FolderNode {
  const name = node.name
    .replace(/\{Business Name\}/g, businessName)
    .replace(/\{Client Name\}/g, businessName)
    .replace(/\{Store Name\}/g, businessName)
    .replace(/\{Location\}/g, location);

  return {
    name,
    type: "folder",
    children: node.children?.map((child) => fillNames(child, businessName, location)),
  };
}

function getDriveClient() {
  const creds = process.env.GOOGLE_SA_CREDENTIALS;
  if (!creds) throw new Error("GOOGLE_SA_CREDENTIALS not configured");

  const credentials = JSON.parse(creds);
  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/drive.file"],
  });

  return google.drive({ version: "v3", auth });
}

async function createFolderInDrive(
  drive: ReturnType<typeof google.drive>,
  name: string,
  parentId?: string
): Promise<string> {
  const requestBody: Record<string, unknown> = {
    name,
    mimeType: "application/vnd.google-apps.folder",
  };
  if (parentId) {
    requestBody.parents = [parentId];
  }

  const res = await drive.files.create({
    requestBody,
    fields: "id",
  });

  return res.data.id!;
}

async function createTreeInDrive(
  drive: ReturnType<typeof google.drive>,
  node: FolderNode,
  parentId?: string
): Promise<string> {
  const folderId = await createFolderInDrive(drive, node.name, parentId);

  if (node.children) {
    for (const child of node.children) {
      await createTreeInDrive(drive, child, folderId);
    }
  }

  return folderId;
}

export async function POST(request: NextRequest) {
  try {
    const body: FolderRequest = await request.json();
    const { businessName, location, businessType, mode, shareWith } = body;

    if (!businessName || !location || !businessType) {
      return NextResponse.json(
        { error: "Missing required fields: businessName, location, businessType" },
        { status: 400 }
      );
    }

    const template =
      businessType === "sale-of-business"
        ? SALE_OF_BUSINESS_FOLDERS
        : RESIDENTIAL_FOLDERS;

    const tree = fillNames(template, businessName, location);

    if (mode === "preview") {
      const result: FolderResult = { tree, mode: "preview" };
      return NextResponse.json(result);
    }

    // Live mode: create folders in Google Drive
    try {
      const drive = getDriveClient();
      const rootFolderId = await createTreeInDrive(drive, tree);

      // Share with the specified email if provided
      if (shareWith) {
        await drive.permissions.create({
          fileId: rootFolderId,
          requestBody: {
            role: "writer",
            type: "user",
            emailAddress: shareWith,
          },
          sendNotificationEmail: false,
        });
      }

      // Get the shareable link
      const file = await drive.files.get({
        fileId: rootFolderId,
        fields: "webViewLink",
      });

      const result: FolderResult = {
        tree,
        mode: "live",
        driveUrl: file.data.webViewLink || `https://drive.google.com/drive/folders/${rootFolderId}`,
      };
      return NextResponse.json(result);
    } catch (driveError) {
      console.error("Google Drive error:", driveError);
      return NextResponse.json(
        { error: "Failed to create folders in Google Drive. Check service account configuration." },
        { status: 500 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    );
  }
}
