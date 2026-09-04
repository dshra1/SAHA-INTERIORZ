import React, { useState } from "react";
import { RoomConfig } from "../types";
import {
  Download,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  ChevronRight,
  Edit3,
  Layers,
  Calculator,
  Grid,
  Filter,
  Package,
  Upload,
} from "lucide-react";
import { exportProjectToExcel, downloadSampleExcelTemplate } from "../utils/excelExporter";

interface EstimatorViewProps {
  rooms: RoomConfig[];
  onSelectRoomForEdit: (roomId: string) => void;
  projectName?: string;
  clientName?: string;
  onOpenAiOcrModal?: () => void;
}

interface ComponentCostItem {
  id: string;
  name: string;
  area: number;
  width: number;
  height: number;
  enabled: boolean;
  category: string;
  customRate?: number;
  roomName: string;
  roomId: string;
  carcass: string;
  shutter: string;
  finish: string;
  hardware: string;
  rate: number;
  lineTotal: number;
}

export const EstimatorView: React.FC<EstimatorViewProps> = ({
  rooms,
  onSelectRoomForEdit,
  projectName = "Aethel Luxury Interiors",
  clientName = "Valued Client",
  onOpenAiOcrModal,
}) => {
  const [viewMode, setViewMode] = useState<"category" | "room">("category");
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>("All");
  const [copied, setCopied] = useState(false);
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  const handleExportExcel = () => {
    exportProjectToExcel({
      projectName,
      clientName,
      rooms,
      discountPercent,
    });
  };

  // Flatten all active components with room metadata and materials
  const allComponentsWithMetadata: ComponentCostItem[] = rooms.flatMap((room) => {
    const roomRate = room.overrideRate !== null ? room.overrideRate : room.aiSuggestedRate;
    return room.components
      .filter((c) => c.enabled)
      .map((c) => {
        // Assign intelligent category if not present
        let cat = c.category || "Storage & Wardrobes";
        const lower = c.name.toLowerCase();
        if (lower.includes("wardrobe") || lower.includes("loft") || lower.includes("storage")) {
          cat = "Storage & Wardrobes";
        } else if (lower.includes("dresser") || lower.includes("mirror") || lower.includes("vanity")) {
          cat = "Vanity & Dressers";
        } else if (lower.includes("bed") || lower.includes("upholster") || lower.includes("panel")) {
          cat = "Beds & Paneling";
        } else if (lower.includes("credenza") || lower.includes("entertainment") || lower.includes("tv") || lower.includes("media")) {
          cat = "Media & TV Units";
        } else if (lower.includes("desk") || lower.includes("study") || lower.includes("book")) {
          cat = "Study & Bookshelves";
        } else if (lower.includes("kitchen") || lower.includes("crockery") || lower.includes("pantry")) {
          cat = "Kitchen & Dining";
        }

        const rate = c.customRate || roomRate;
        const lineTotal = c.area * rate;

        return {
          ...c,
          category: cat,
          roomName: room.name,
          roomId: room.id,
          carcass: c.carcass || room.carcass,
          shutter: c.shutter || room.shutter,
          finish: c.finish || room.finish,
          hardware: c.hardware || room.hardware,
          rate,
          lineTotal,
        };
      });
  });

  // Unique categories
  const categories = ["All", ...Array.from(new Set(allComponentsWithMetadata.map((i) => i.category)))];

  // Filtered components
  const filteredComponents: ComponentCostItem[] = selectedCategoryFilter === "All"
    ? allComponentsWithMetadata
    : allComponentsWithMetadata.filter((i) => i.category === selectedCategoryFilter);

  // Group by category for Category View
  const groupedByCategory: Record<string, ComponentCostItem[]> = {};
  filteredComponents.forEach((item) => {
    if (!groupedByCategory[item.category]) {
      groupedByCategory[item.category] = [];
    }
    groupedByCategory[item.category].push(item);
  });

  // Compute sums
  const totalSft = allComponentsWithMetadata.reduce((sum, c) => sum + c.area, 0);
  const subtotal = allComponentsWithMetadata.reduce((sum, c) => sum + c.lineTotal, 0);
  const discountAmount = Math.round((subtotal * discountPercent) / 100);
  const gstAmount = Math.round((subtotal - discountAmount) * 0.18);
  const grandTotal = subtotal - discountAmount + gstAmount;

  const handleExportCsv = () => {
    let csv = "Category,Component Name,Room,Width (Inches),Height (Inches),Area (Sft),Carcass Material,Shutter & Core,Surface Finish,Hardware,Rate / Sft (INR),Line Total (INR)\n";
    allComponentsWithMetadata.forEach((c) => {
      csv += `"${c.category}","${c.name}","${c.roomName}",${c.width},${c.height},${c.area},"${c.carcass}","${c.shutter}","${c.finish}","${c.hardware}",${c.rate},${c.lineTotal}\n`;
    });
    csv += `\nSubtotal,,,,,${totalSft},,,,,,${subtotal}\n`;
    csv += `Volume Discount (${discountPercent}%),,,,,,,,,,,${discountAmount}\n`;
    csv += `GST (18%),,,,,,,,,,,${gstAmount}\n`;
    csv += `Grand Proposal Total,,,,,${totalSft},,,,,,${grandTotal}\n`;

    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="p-4 space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708] flex items-center gap-1.5">
            <Calculator className="w-3.5 h-3.5" /> COSTING ESTIMATOR & BOQ
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
            Category & Material Costing Engine
          </h2>
          <p className="text-xs text-[#596171] mt-1">
            Real-time financial takeoff calculated directly from millimeter dimensions, square footage, and certified material specifications.
          </p>
        </div>

        {/* Export & Import Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto shrink-0">
          {onOpenAiOcrModal && (
            <button
              onClick={onOpenAiOcrModal}
              className="px-3.5 py-2 rounded-xl bg-[#FAF5E6] hover:bg-[#F5EDD5] border border-[#E5C86C] text-xs font-semibold text-[#8A6708] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
              title="Upload Excel or photo to parse rooms, wardrobes, panels & dressers"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upload Excel / AI OCR</span>
            </button>
          )}

          <button
            onClick={handleExportExcel}
            className="px-3.5 py-2 rounded-xl bg-[#8A6708] hover:bg-[#725406] text-xs font-semibold text-white flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download multi-sheet Excel (.xlsx) with BOQ and room breakdown"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Download Excel (.xlsx)</span>
          </button>

          <button
            onClick={downloadSampleExcelTemplate}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#EEF1F5] border border-[#DCE0E8] text-xs font-semibold text-[#596171] hover:text-[#16191F] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Download blank template with wardrobe, panel, dresser sample rows"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden md:inline">Blank Template</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-2 rounded-xl bg-white hover:bg-[#EEF1F5] border border-[#DCE0E8] text-xs font-semibold text-[#16191F] flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
            title="Copy full BOQ table to clipboard"
          >
            {copied ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-[#8A6708]" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <FileSpreadsheet className="w-3.5 h-3.5 text-[#596171]" />
                <span className="hidden sm:inline">Copy CSV</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* KPI Ribbon */}
      <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white border border-[#E2E5EB] shadow-xs">
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Total Sized Area</span>
          <span className="font-serif text-xl md:text-2xl text-[#16191F] font-semibold tabular-nums">
            {totalSft} Sft
          </span>
          <span className="text-[10px] text-[#7E8794] block mt-0.5">
            Across {allComponentsWithMetadata.length} pieces
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Blended Rate / Sft</span>
          <span className="font-serif text-xl md:text-2xl text-[#8A6708] font-bold tabular-nums">
            ₹{totalSft > 0 ? new Intl.NumberFormat("en-IN").format(Math.round(subtotal / totalSft)) : 0}
          </span>
          <span className="text-[10px] text-[#7E8794] block mt-0.5">
            Calibrated BWP & Hardware
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Grand Proposal Total</span>
          <span className="font-serif text-xl md:text-2xl text-[#8A6708] font-bold tabular-nums">
            ₹{new Intl.NumberFormat("en-IN").format(grandTotal)}
          </span>
          <span className="text-[10px] text-[#7E8794] block mt-0.5">
            Incl. GST (18%)
          </span>
        </div>
      </div>

      {/* View Switcher & Category Filter */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-2 rounded-xl bg-white border border-[#E2E5EB]">
        {/* Toggle between Category View and Room View */}
        <div className="flex items-center gap-1 bg-[#F1F3F6] p-1 rounded-lg">
          <button
            onClick={() => setViewMode("category")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "category"
                ? "bg-white text-[#8A6708] shadow-2xs"
                : "text-[#596171] hover:text-[#16191F]"
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>By Category & Materials</span>
          </button>
          <button
            onClick={() => setViewMode("room")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === "room"
                ? "bg-white text-[#8A6708] shadow-2xs"
                : "text-[#596171] hover:text-[#16191F]"
            }`}
          >
            <Grid className="w-3.5 h-3.5" />
            <span>By Room Zones ({rooms.length})</span>
          </button>
        </div>

        {/* Category Pills when in Category View */}
        {viewMode === "category" && (
          <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategoryFilter === cat
                    ? "bg-[#E0B638] text-[#1A1D24] font-semibold shadow-2xs"
                    : "bg-[#F7F8FA] border border-[#DCE0E8] text-[#596171] hover:text-[#16191F]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* VIEW 1: CATEGORY & MATERIAL COSTING ESTIMATOR */}
      {viewMode === "category" && (
        <div className="space-y-4">
          {Object.entries(groupedByCategory).map(([categoryName, items]) => {
            const categoryArea = items.reduce((sum, i) => sum + i.area, 0);
            const categoryCost = items.reduce((sum, i) => sum + i.lineTotal, 0);
            const avgRate = categoryArea > 0 ? Math.round(categoryCost / categoryArea) : 0;

            return (
              <div
                key={categoryName}
                className="border border-[#E2E5EB] rounded-2xl overflow-hidden bg-white shadow-xs"
              >
                {/* Category Header Ribbon */}
                <div className="p-4 bg-gradient-to-r from-[#F7F8FA] to-white border-b border-[#E5E8EE] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-[#FDF8E7] border border-[#E5C86C] text-[#8A6708] flex items-center justify-center font-bold">
                      <Layers className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-serif text-base font-semibold text-[#16191F]">
                        {categoryName}
                      </h3>
                      <span className="text-[11px] text-[#596171]">
                        {items.length} {items.length === 1 ? "Item" : "Items"} · {categoryArea} Sft Total · Avg ₹{new Intl.NumberFormat("en-IN").format(avgRate)}/Sft
                      </span>
                    </div>
                  </div>

                  <span className="font-serif text-lg font-bold text-[#8A6708] tabular-nums">
                    ₹{new Intl.NumberFormat("en-IN").format(categoryCost)}
                  </span>
                </div>

                {/* Table of items in this category */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[#FAFBFD] text-[#596171] border-b border-[#E5E8EE]">
                      <tr>
                        <th className="py-2.5 px-4 font-semibold uppercase tracking-wider text-[10px]">
                          Component & Zone
                        </th>
                        <th className="py-2.5 px-3 text-center font-semibold uppercase tracking-wider text-[10px]">
                          Dimensions & Size
                        </th>
                        <th className="py-2.5 px-3 font-semibold uppercase tracking-wider text-[10px]">
                          Material Specifications
                        </th>
                        <th className="py-2.5 px-3 text-right font-semibold uppercase tracking-wider text-[10px]">
                          Rate / Sft
                        </th>
                        <th className="py-2.5 px-4 text-right font-semibold uppercase tracking-wider text-[10px]">
                          Line Total
                        </th>
                        <th className="py-2.5 px-3 text-center font-semibold uppercase tracking-wider text-[10px]">
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E8EE]">
                      {items.map((item) => (
                        <tr key={item.id} className="hover:bg-[#FAFBFD] transition-colors">
                          <td className="py-3 px-4">
                            <span className="font-semibold text-[#16191F] block text-xs">
                              {item.name}
                            </span>
                            <span className="text-[10px] text-[#8A6708] font-medium">
                              {item.roomName}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-center">
                            <span className="font-bold text-[#16191F] tabular-nums block">
                              {item.area} Sft
                            </span>
                            <span className="text-[10px] text-[#7E8794] tabular-nums">
                              {item.width}"(W) × {item.height}"(H)
                            </span>
                          </td>

                          <td className="py-3 px-3 max-w-xs">
                            <span className="text-[#16191F] block text-[11px] font-medium truncate">
                              Carcass: {item.carcass}
                            </span>
                            <span className="text-[#596171] block text-[10px] truncate">
                              Shutter: {item.shutter} · {item.finish}
                            </span>
                            <span className="text-[#7E8794] block text-[10px] truncate">
                              Hardware: {item.hardware}
                            </span>
                          </td>

                          <td className="py-3 px-3 text-right tabular-nums text-[#596171]">
                            ₹{new Intl.NumberFormat("en-IN").format(item.rate)}
                          </td>

                          <td className="py-3 px-4 text-right tabular-nums font-bold text-[#8A6708]">
                            ₹{new Intl.NumberFormat("en-IN").format(item.lineTotal)}
                          </td>

                          <td className="py-3 px-3 text-center">
                            <button
                              onClick={() => onSelectRoomForEdit(item.roomId)}
                              className="p-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#E0B638] text-[#596171] hover:text-[#1A1D24] border border-[#E2E5EB] transition-colors inline-flex items-center gap-1 text-[10px] font-semibold cursor-pointer shadow-2xs"
                              title="Edit in AI Recommender"
                            >
                              <Edit3 className="w-3 h-3" />
                              <span>Resize</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ROOM-BY-ROOM SCHEDULE */}
      {viewMode === "room" && (
        <div className="border border-[#E2E5EB] rounded-2xl overflow-hidden bg-white shadow-xs">
          <div className="p-4 border-b border-[#E5E8EE] flex items-center justify-between bg-[#F7F8FA]">
            <h3 className="font-serif text-base text-[#16191F] font-semibold">
              Room-by-Room Schedule
            </h3>
            <span className="text-xs text-[#596171] font-medium">{rooms.length} Configured Zones</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F1F3F6] text-[#596171] border-b border-[#E2E5EB]">
                <tr>
                  <th className="py-3 px-4 font-semibold uppercase tracking-wider">Room & Tier</th>
                  <th className="py-3 px-3 font-semibold uppercase tracking-wider">Materials</th>
                  <th className="py-3 px-3 text-center font-semibold uppercase tracking-wider">Active Area</th>
                  <th className="py-3 px-3 text-right font-semibold uppercase tracking-wider">Rate/Sft</th>
                  <th className="py-3 px-4 text-right font-semibold uppercase tracking-wider">Amount</th>
                  <th className="py-3 px-3 text-center font-semibold uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E8EE]">
                {rooms.map((room) => {
                  const activeComponents = room.components.filter((c) => c.enabled);
                  const area = activeComponents.reduce((s, c) => s + c.area, 0);
                  const rate = room.overrideRate !== null ? room.overrideRate : room.aiSuggestedRate;
                  const cost = room.overrideTotalPrice !== null ? room.overrideTotalPrice : area * rate;

                  return (
                    <tr key={room.id} className="hover:bg-[#FAFBFD] transition-colors">
                      <td className="py-3.5 px-4">
                        <span className="font-serif text-sm font-semibold text-[#16191F] block">
                          {room.name}
                        </span>
                        <span className="text-[11px] text-[#8A6708] font-semibold">{room.tier}</span>
                      </td>
                      <td className="py-3.5 px-3 max-w-[200px]">
                        <span className="text-[#16191F] block truncate font-medium">{room.carcass}</span>
                        <span className="text-[#7E8794] text-[11px] block truncate">
                          {room.hardware} · {room.finish}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-center font-semibold text-[#16191F] tabular-nums">
                        {area} Sft
                      </td>
                      <td className="py-3.5 px-3 text-right text-[#596171] tabular-nums">
                        ₹{new Intl.NumberFormat("en-IN").format(rate)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-[#16191F] tabular-nums">
                        ₹{new Intl.NumberFormat("en-IN").format(cost)}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        <button
                          onClick={() => onSelectRoomForEdit(room.id)}
                          className="p-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#E0B638] text-[#596171] hover:text-[#1A1D24] border border-[#E2E5EB] transition-colors inline-flex items-center gap-1 text-[11px] font-semibold cursor-pointer shadow-2xs"
                          title="Edit in AI Recommender"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                          <span className="hidden md:inline">Edit</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Commercial Computation Ledger */}
      <div className="border border-[#E2E5EB] rounded-2xl p-4 bg-[#F7F8FA] shadow-xs space-y-2 text-xs">
        <div className="flex justify-between text-[#596171]">
          <span>Joinery & Interior Fabrication Subtotal:</span>
          <span className="font-serif text-sm font-semibold text-[#16191F] tabular-nums">
            ₹{new Intl.NumberFormat("en-IN").format(subtotal)}
          </span>
        </div>

        <div className="flex items-center justify-between text-[#596171]">
          <div className="flex items-center gap-2">
            <span>Architectural Volume Discount (%):</span>
            <input
              type="number"
              min="0"
              max="30"
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Math.max(0, Math.min(30, Number(e.target.value) || 0)))}
              className="w-14 bg-white border border-[#DCE0E8] rounded px-2 py-0.5 text-center text-[#8A6708] tabular-nums font-bold"
            />
          </div>
          <span className="text-[#8A6708] font-semibold tabular-nums">
            - ₹{new Intl.NumberFormat("en-IN").format(discountAmount)}
          </span>
        </div>

        <div className="flex justify-between text-[#7E8794]">
          <span>Applicable GST (18% Interior Works Contract):</span>
          <span className="tabular-nums font-medium">
            ₹{new Intl.NumberFormat("en-IN").format(gstAmount)}
          </span>
        </div>

        <div className="pt-2 border-t border-[#E5E8EE] flex justify-between text-sm">
          <span className="font-serif font-bold text-[#16191F]">Final Commercial Total:</span>
          <span className="font-serif text-lg font-bold text-[#8A6708] tabular-nums">
            ₹{new Intl.NumberFormat("en-IN").format(grandTotal)}
          </span>
        </div>
      </div>
    </div>
  );
};
