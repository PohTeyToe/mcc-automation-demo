import { NextRequest, NextResponse } from "next/server";
import * as XLSX from "xlsx";
import type { ExtractionResult } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    const data: ExtractionResult = await request.json();

    const wb = XLSX.utils.book_new();

    // ============================================================
    // Sheet 1: 2YR Financials
    // ============================================================
    const rows: (string | number | null)[][] = [];

    // Row 1: Headers
    rows.push(["", data.year1Label, data.year0Label]);

    // Revenue section
    rows.push(["REVENUE", "", ""]);
    for (const item of data.revenue) {
      rows.push([item.label, item.year1, item.year0]);
    }
    // Blank row after revenue items (up to row 4 area)
    rows.push(["Total Revenue", data.totalRevenue.year1, data.totalRevenue.year0]);

    // COGS section (around row 5)
    rows.push(["", "", ""]);
    rows.push(["COST OF GOODS SOLD", "", ""]);
    for (const item of data.cogs) {
      rows.push([item.label, item.year1, item.year0]);
    }
    rows.push(["Total COGS", data.totalCogs.year1, data.totalCogs.year0]);

    // Gross Profit
    rows.push(["", "", ""]);
    rows.push(["Gross Profit", data.grossProfit.year1, data.grossProfit.year0]);

    // Operating Expenses header (row 8 area)
    rows.push(["", "", ""]);
    rows.push(["OPERATING EXPENSES", "", ""]);

    // Expense items (rows 9-35 area)
    for (const item of data.expenses) {
      rows.push([item.label, item.year1, item.year0]);
    }

    // Pad to ensure we have space (at least up to row 35 area for expenses)
    const expenseEndTarget = 14 + data.revenue.length + data.cogs.length + 35;
    while (rows.length < expenseEndTarget - data.expenses.length) {
      // Don't over-pad — only pad if we have fewer than expected
      break;
    }

    // Summary rows after expenses
    rows.push(["", "", ""]);
    rows.push(["Total Expenses", data.totalExpenses.year1, data.totalExpenses.year0]);
    rows.push(["", "", ""]);

    // Final summary block
    rows.push(["SUMMARY", "", ""]);
    rows.push(["Total Revenue", data.totalRevenue.year1, data.totalRevenue.year0]);
    rows.push(["Total COGS", data.totalCogs.year1, data.totalCogs.year0]);
    rows.push(["Gross Profit", data.grossProfit.year1, data.grossProfit.year0]);
    rows.push(["Total Expenses", data.totalExpenses.year1, data.totalExpenses.year0]);
    rows.push(["Net Income", data.netIncome.year1, data.netIncome.year0]);

    const ws1 = XLSX.utils.aoa_to_sheet(rows);

    // Set column widths
    ws1["!cols"] = [
      { wch: 30 }, // A: labels
      { wch: 18 }, // B: year1
      { wch: 18 }, // C: year0
    ];

    XLSX.utils.book_append_sheet(wb, ws1, "2YR Financials");

    // ============================================================
    // Sheet 2: Normalized Calculations (SDE)
    // ============================================================
    const sdeRows: (string | number | null)[][] = [];

    sdeRows.push(["SDE (Seller's Discretionary Earnings) Calculation", "", ""]);
    sdeRows.push(["", data.year1Label, data.year0Label]);
    sdeRows.push(["", "", ""]);

    // Net Income reference
    sdeRows.push(["Net Income (from financials)", data.netIncome.year1, data.netIncome.year0]);
    sdeRows.push(["", "", ""]);

    // Add-back categories
    sdeRows.push(["ADD-BACKS", "", ""]);
    sdeRows.push(["Owner's Salary / Management Compensation", null, null]);
    sdeRows.push(["Owner's Benefits (Health, Auto, etc.)", null, null]);
    sdeRows.push(["Depreciation / Amortization", null, null]);
    sdeRows.push(["Interest Expense", null, null]);
    sdeRows.push(["One-Time / Non-Recurring Expenses", null, null]);
    sdeRows.push(["Personal Expenses Run Through Business", null, null]);
    sdeRows.push(["Other Add-Backs", null, null]);
    sdeRows.push(["", "", ""]);

    // Total Add-Backs (formulas referencing B7:B13)
    // Using row references based on 0-indexed + 1 for Excel
    const addBackStartRow = 7;
    const addBackEndRow = 13;
    sdeRows.push([
      "Total Add-Backs",
      { t: "n", f: `SUM(B${addBackStartRow}:B${addBackEndRow})` } as unknown as number,
      { t: "n", f: `SUM(C${addBackStartRow}:C${addBackEndRow})` } as unknown as number,
    ]);

    sdeRows.push(["", "", ""]);

    // SDE Calculation
    sdeRows.push([
      "SELLER'S DISCRETIONARY EARNINGS (SDE)",
      { t: "n", f: `B4+B${addBackEndRow + 2}` } as unknown as number,
      { t: "n", f: `C4+C${addBackEndRow + 2}` } as unknown as number,
    ]);

    sdeRows.push(["", "", ""]);
    sdeRows.push(["VALUATION MULTIPLES", "", ""]);
    sdeRows.push(["Low Multiple (2.0x)", { t: "n", f: `B${addBackEndRow + 4}*2` } as unknown as number, { t: "n", f: `C${addBackEndRow + 4}*2` } as unknown as number]);
    sdeRows.push(["Mid Multiple (2.5x)", { t: "n", f: `B${addBackEndRow + 4}*2.5` } as unknown as number, { t: "n", f: `C${addBackEndRow + 4}*2.5` } as unknown as number]);
    sdeRows.push(["High Multiple (3.0x)", { t: "n", f: `B${addBackEndRow + 4}*3` } as unknown as number, { t: "n", f: `C${addBackEndRow + 4}*3` } as unknown as number]);

    const ws2 = XLSX.utils.aoa_to_sheet(sdeRows);

    // Set column widths
    ws2["!cols"] = [
      { wch: 45 }, // A: labels
      { wch: 18 }, // B: year1
      { wch: 18 }, // C: year0
    ];

    XLSX.utils.book_append_sheet(wb, ws2, "Normalized Calculations");

    // Generate the Excel buffer
    const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });

    // Return the file
    const filename = `${data.businessName || "Valuation"} - Financials.xlsx`;

    return new NextResponse(buf, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (err) {
    console.error("Valuation API error:", err);
    return NextResponse.json(
      { error: "Failed to generate Excel file" },
      { status: 500 }
    );
  }
}
