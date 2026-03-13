import { NextRequest, NextResponse } from "next/server";
import cachedSample from "@/data/cached-sample.json";
import { checkRateLimit } from "@/lib/rate-limit";

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: NextRequest) {
  try {
    // Check if there's a file in the request
    let hasFile = false;
    let fileBase64 = "";

    try {
      const contentType = request.headers.get("content-type") || "";
      if (contentType.includes("multipart/form-data")) {
        const formData = await request.formData();
        const file = formData.get("file");
        if (file && file instanceof Blob && file.size > 0) {
          // File size check
          if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json(
              { error: "File too large. Maximum size is 10MB." },
              { status: 413 }
            );
          }
          hasFile = true;
          const buffer = Buffer.from(await file.arrayBuffer());
          fileBase64 = buffer.toString("base64");
        }
      }
    } catch {
      // No FormData or empty body — fall through to cached sample
    }

    // If no file uploaded, return cached sample (no rate limit for cached)
    if (!hasFile) {
      return NextResponse.json(cachedSample);
    }

    // Rate limit live extractions only
    const ip =
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      request.headers.get("x-real-ip") ||
      "unknown";
    const { allowed, remaining } = checkRateLimit(ip);

    if (!allowed) {
      return NextResponse.json(
        {
          error:
            "Rate limit exceeded. Maximum 5 live extractions per hour. The pre-loaded sample works without limits.",
        },
        {
          status: 429,
          headers: { "Retry-After": "3600" },
        }
      );
    }

    // Call Claude API to extract financial data from the PDF
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey || apiKey === "placeholder") {
      return NextResponse.json(
        {
          error:
            "Live extraction is not configured yet. Use the pre-loaded sample to see the demo in action.",
        },
        { status: 503 }
      );
    }

    const prompt = `You are extracting financial data from a Statement of Operations / Income Statement. Extract ALL line items preserving their exact order.

Return JSON matching this structure exactly:
{
  "businessName": "string",
  "year1Label": "most recent year (e.g. 2024)",
  "year0Label": "prior year (e.g. 2023)",
  "revenue": [{"label": "string", "year1": number, "year0": number}],
  "cogs": [{"label": "string", "year1": number, "year0": number}],
  "expenses": [{"label": "string", "year1": number, "year0": number}],
  "totalRevenue": {"year1": number, "year0": number},
  "totalCogs": {"year1": number, "year0": number},
  "grossProfit": {"year1": number, "year0": number},
  "totalExpenses": {"year1": number, "year0": number},
  "netIncome": {"year1": number, "year0": number}
}

Revenue keywords: revenue, sales, income from services
COGS keywords: cost of goods, cost of sales, cogs
Everything else under expenses goes in expenses array.
Return ONLY valid JSON, no markdown fences.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: [
              {
                type: "document",
                source: {
                  type: "base64",
                  media_type: "application/pdf",
                  data: fileBase64,
                },
              },
              {
                type: "text",
                text: prompt,
              },
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error("Claude API error:", response.status, errorBody);
      return NextResponse.json(
        { error: `Claude API error: ${response.status}` },
        { status: 502 }
      );
    }

    const result = await response.json();

    // Extract text content from Claude's response
    const textBlock = result.content?.find(
      (block: { type: string }) => block.type === "text"
    );
    if (!textBlock) {
      return NextResponse.json(
        { error: "No text response from Claude" },
        { status: 502 }
      );
    }

    // Parse the JSON from Claude's response
    let extractedData;
    try {
      let jsonText = textBlock.text.trim();
      if (jsonText.startsWith("```")) {
        jsonText = jsonText
          .replace(/^```(?:json)?\s*/, "")
          .replace(/\s*```$/, "");
      }
      extractedData = JSON.parse(jsonText);
    } catch {
      console.error("Failed to parse Claude response:", textBlock.text);
      return NextResponse.json(
        { error: "Failed to parse extracted data" },
        { status: 502 }
      );
    }

    return NextResponse.json(extractedData, {
      headers: { "X-RateLimit-Remaining": remaining.toString() },
    });
  } catch (err) {
    console.error("Extract API error:", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
