import * as XLSX from "xlsx";
import { RoomConfig } from "../types";

export interface ExcelExportOptions {
  projectName: string;
  clientName?: string;
  rooms: RoomConfig[];
  discountPercent?: number;
}

/**
 * Generates and downloads a rich, multi-sheet Excel (.xlsx) file
 * with Project Summary, Detailed BOQ Schedule, and Template reference.
 */
export function exportProjectToExcel(options: ExcelExportOptions) {
  const { projectName, clientName = "Valued Client", rooms, discountPercent = 0 } = options;

  // 1. Gather all active interior components
  const allComponents: Array<{
    roomName: string;
    tier: string;
    carcass: string;
    shutter: string;
    finish: string;
    hardware: string;
    name: string;
    category: string;
    width: number;
    height: number;
    area: number;
    rate: number;
    lineTotal: number;
    notes?: string;
  }> = [];

  rooms.forEach((room) => {
    const roomRate = room.overrideRate !== null ? room.overrideRate : room.aiSuggestedRate;
    room.components
      .filter((c) => c.enabled)
      .forEach((c) => {
        let cat = c.category || "Storage & Wardrobes";
        const lower = c.name.toLowerCase();
        if (lower.includes("wardrobe") || lower.includes("loft") || lower.includes("closet")) {
          cat = "Storage & Wardrobes";
        } else if (lower.includes("dresser") || lower.includes("mirror") || lower.includes("vanity")) {
          cat = "Vanity & Dressers";
        } else if (lower.includes("bed") || lower.includes("panel") || lower.includes("upholster")) {
          cat = "Beds & Paneling";
        } else if (lower.includes("tv") || lower.includes("media") || lower.includes("credenza")) {
          cat = "Media & TV Units";
        } else if (lower.includes("kitchen") || lower.includes("crockery") || lower.includes("pantry")) {
          cat = "Kitchen & Dining";
        } else if (lower.includes("study") || lower.includes("desk") || lower.includes("book")) {
          cat = "Study & Bookshelves";
        }

        const rate = c.customRate || roomRate;
        const lineTotal = c.area * rate;

        allComponents.push({
          roomName: room.name,
          tier: room.tier,
          carcass: c.carcass || room.carcass,
          shutter: c.shutter || room.shutter,
          finish: c.finish || room.finish,
          hardware: c.hardware || room.hardware,
          name: c.name,
          category: cat,
          width: c.width,
          height: c.height,
          area: c.area,
          rate,
          lineTotal,
          notes: `${Math.round(c.width / 12)}' x ${Math.round(c.height / 12)}'`,
        });
      });
  });

  const totalSft = allComponents.reduce((sum, c) => sum + c.area, 0);
  const subtotal = allComponents.reduce((sum, c) => sum + c.lineTotal, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const taxableAmount = subtotal - discountAmount;
  const gstAmount = Math.round(taxableAmount * 0.18);
  const grandTotal = taxableAmount + gstAmount;

  // Create workbook
  const wb = XLSX.utils.book_new();

  // --- SHEET 1: PROJECT SUMMARY ---
  const summaryRows = [
    ["AETHEL LUXURY INTERIORS - ARCHITECTURAL BOQ & ESTIMATION"],
    ["High-End Residential Joinery, Cabinetry & Surface Engineering"],
    [],
    ["Project Name:", projectName],
    ["Client Name:", clientName],
    ["Date of Estimation:", new Date().toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })],
    ["Currency:", "INR (₹)"],
    [],
    ["FINANCIAL SUMMARY & COMMERCIAL LEDGER"],
    ["Total Sized Interior Area:", `${totalSft} Sft`],
    ["Blended Average Rate / Sft:", `₹${totalSft > 0 ? Math.round(subtotal / totalSft).toLocaleString("en-IN") : 0}`],
    ["Joinery Fabrication Subtotal:", `₹${subtotal.toLocaleString("en-IN")}`],
    [`Volume Architect Discount (${discountPercent}%):`, `- ₹${discountAmount.toLocaleString("en-IN")}`],
    ["Taxable Supply Value:", `₹${taxableAmount.toLocaleString("en-IN")}`],
    ["GST (18% Interior Works Contract):", `₹${gstAmount.toLocaleString("en-IN")}`],
    ["Grand Total Proposal Value:", `₹${grandTotal.toLocaleString("en-IN")}`],
    [],
    ["ZONE / ROOM SPECIFICATION BREAKDOWN"],
    ["Room Name", "Tier", "Active Area (Sft)", "Carcass Grade", "Hardware Specification", "Rate / Sft (₹)", "Estimated Room Total (₹)"],
  ];

  rooms.forEach((r) => {
    const roomArea = r.components.filter((c) => c.enabled).reduce((sum, c) => sum + c.area, 0);
    const roomRate = r.overrideRate !== null ? r.overrideRate : r.aiSuggestedRate;
    const roomTotal = roomArea * roomRate;
    summaryRows.push([
      r.name,
      r.tier,
      roomArea.toString(),
      r.carcass,
      r.hardware,
      `₹${roomRate.toLocaleString("en-IN")}`,
      `₹${roomTotal.toLocaleString("en-IN")}`,
    ]);
  });

  const wsSummary = XLSX.utils.aoa_to_sheet(summaryRows);
  // Set column widths for summary
  wsSummary["!cols"] = [
    { wch: 30 },
    { wch: 25 },
    { wch: 18 },
    { wch: 35 },
    { wch: 25 },
    { wch: 18 },
    { wch: 24 },
  ];
  XLSX.utils.book_append_sheet(wb, wsSummary, "Project Summary");

  // --- SHEET 2: DETAILED BOQ SCHEDULE ---
  const boqRows = [
    [
      "Zone / Room",
      "Interior Unit Name",
      "Category",
      "Width (Inches)",
      "Height (Inches)",
      "Area (Sft)",
      "Carcass Ply Specification",
      "Shutter / Core Specification",
      "Surface Finish Spec",
      "Hardware Brand",
      "Rate / Sft (INR)",
      "Line Total (INR)",
      "Dimension Notes",
    ],
  ];

  allComponents.forEach((c) => {
    boqRows.push([
      c.roomName,
      c.name,
      c.category,
      c.width.toString(),
      c.height.toString(),
      c.area.toString(),
      c.carcass,
      c.shutter,
      c.finish,
      c.hardware,
      c.rate.toString(),
      c.lineTotal.toString(),
      c.notes || "",
    ]);
  });

  // Append Total Row
  boqRows.push([]);
  boqRows.push([
    "TOTALS",
    `${allComponents.length} Units`,
    "",
    "",
    "",
    totalSft.toString(),
    "",
    "",
    "",
    "",
    `Avg ₹${totalSft > 0 ? Math.round(subtotal / totalSft) : 0}`,
    subtotal.toString(),
    "",
  ]);

  const wsBOQ = XLSX.utils.aoa_to_sheet(boqRows);
  wsBOQ["!cols"] = [
    { wch: 22 }, // Room
    { wch: 34 }, // Item Name
    { wch: 22 }, // Category
    { wch: 14 }, // Width
    { wch: 14 }, // Height
    { wch: 12 }, // Area
    { wch: 35 }, // Carcass
    { wch: 30 }, // Shutter
    { wch: 30 }, // Finish
    { wch: 20 }, // Hardware
    { wch: 16 }, // Rate
    { wch: 18 }, // Total
    { wch: 18 }, // Notes
  ];
  XLSX.utils.book_append_sheet(wb, wsBOQ, "Detailed BOQ Schedule");

  // --- SHEET 3: BLANK TEMPLATE FOR UPLOAD ---
  const templateRows = [
    ["Zone / Room", "Item Name", "Category", "Width (In)", "Height (In)", "Area (Sft)", "Rate / Sft (₹)", "Notes / Finish"],
    ["Master Bedroom", "4-Door Wardrobe with Loft", "Storage & Wardrobes", "96", "108", "72", "1550", "High Gloss Acrylic, Hettich hinges"],
    ["Master Bedroom", "Bedback Paneling with Fluted Louvers", "Beds & Paneling", "72", "48", "24", "1450", "Upholstered fabric insert"],
    ["Master Bedroom", "Dresser Unit with Backlit LED Mirror", "Vanity & Dressers", "36", "48", "12", "1650", "Soft close drawers"],
    ["Living Room", "Floating TV Console with Louvered Storage", "Media & TV Units", "84", "60", "35", "1750", "Natural Teak Veneer PU finish"],
    ["Living Room", "Crockery & Wine Console", "Kitchen & Dining", "60", "72", "30", "1650", "Fluted glass inserts with warm LED"],
    ["Culinary Suite", "Kitchen Base Cabinet Modules", "Kitchen & Dining", "120", "34", "28", "1850", "Tandem box soft-close drawers"],
    ["Culinary Suite", "Overhead Lift-Up Wall Cabinets", "Kitchen & Dining", "120", "24", "20", "1550", "Bi-fold lift up mechanisms"],
    ["Guest Suite", "3-Door Wardrobe with Loft", "Storage & Wardrobes", "72", "108", "54", "1450", "Super matte laminate"],
  ];
  const wsTemplate = XLSX.utils.aoa_to_sheet(templateRows);
  wsTemplate["!cols"] = [
    { wch: 20 },
    { wch: 36 },
    { wch: 22 },
    { wch: 12 },
    { wch: 12 },
    { wch: 12 },
    { wch: 16 },
    { wch: 36 },
  ];
  XLSX.utils.book_append_sheet(wb, wsTemplate, "Upload Template Sample");

  // Export file
  const safeTitle = (projectName || "Aethel_Interiors").replace(/[^a-z0-9_-]/gi, "_");
  XLSX.writeFile(wb, `${safeTitle}_Interior_BOQ.xlsx`);
}

/**
 * Downloads a clean sample template for users to edit and upload
 */
export function downloadSampleExcelTemplate() {
  const wb = XLSX.utils.book_new();

  const templateRows = [
    ["Zone / Room", "Item Name", "Category", "Width (Inches)", "Height (Inches)", "Area (Sft)", "Rate / Sft (INR)", "Notes / Finish Specs"],
    ["Master Bedroom", "4-Door Wardrobe with Loft", "Storage & Wardrobes", 96, 108, 72, 1550, "Full height BWP 710 marine ply, high gloss acrylic"],
    ["Master Bedroom", "Bedback Paneling with Fluted Louvers", "Beds & Paneling", 72, 48, 24, 1450, "Acoustic fluted veneer panel"],
    ["Master Bedroom", "Dresser Unit with Backlit LED Mirror", "Vanity & Dressers", 36, 48, 12, 1650, "3 soft close vanity drawers"],
    ["Living Room", "Floating TV Console with Louvered Storage", "Media & TV Units", 84, 60, 35, 1750, "Teak veneer with PU polish"],
    ["Living Room", "Study Desk with Bookshelf", "Study & Bookshelves", 60, 72, 30, 1550, "Concealed wire management grommets"],
    ["Culinary Suite", "Kitchen Base Cabinet Modules", "Kitchen & Dining", 120, 34, 28, 1850, "Hettich InnoTech soft close drawers"],
    ["Culinary Suite", "Overhead Lift-Up Wall Cabinets", "Kitchen & Dining", 120, 24, 20, 1550, "Bi-fold lift-up Aventos hardware"],
    ["Guest Bedroom", "3-Door Wardrobe with Loft", "Storage & Wardrobes", 72, 108, 54, 1450, "Super matte anti-scratch laminate"],
  ];

  const ws = XLSX.utils.aoa_to_sheet(templateRows);
  ws["!cols"] = [
    { wch: 20 },
    { wch: 38 },
    { wch: 24 },
    { wch: 15 },
    { wch: 15 },
    { wch: 14 },
    { wch: 18 },
    { wch: 40 },
  ];
  XLSX.utils.book_append_sheet(wb, ws, "Interior Estimation Template");

  XLSX.writeFile(wb, "Aethel_Interior_Estimation_Template.xlsx");
}

/**
 * Parses an uploaded Excel (.xlsx, .xls) or CSV file into tabular text
 * for processing by the AI OCR Reader.
 */
export async function parseExcelFileToText(file: File): Promise<{
  textData: string;
  sheetNames: string[];
  totalRows: number;
}> {
  const arrayBuffer = await file.arrayBuffer();
  const wb = XLSX.read(arrayBuffer, { type: "array" });

  let fullText = "";
  let totalRows = 0;

  wb.SheetNames.forEach((sheetName) => {
    const ws = wb.Sheets[sheetName];
    // Convert to CSV for clear tabular layout
    const csv = XLSX.utils.sheet_to_csv(ws);
    if (csv && csv.trim().length > 0) {
      fullText += `\n--- SHEET: ${sheetName} ---\n${csv}\n`;
      totalRows += csv.split("\n").length;
    }
  });

  return {
    textData: fullText,
    sheetNames: wb.SheetNames,
    totalRows,
  };
}
