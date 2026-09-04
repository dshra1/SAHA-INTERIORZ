import React, { useState } from "react";
import { X, Download, Printer, CheckCircle2, FileSpreadsheet, Share2 } from "lucide-react";
import { RoomConfig } from "../types";

interface BoqModalProps {
  room: RoomConfig;
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export const BoqModal: React.FC<BoqModalProps> = ({
  room,
  isOpen,
  onClose,
  projectName = "Penthouse 402 - The Camellias",
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const totalArea = room.components
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.area, 0);

  const effectiveRate = room.overrideRate !== null ? room.overrideRate : room.aiSuggestedRate;
  const grandTotal =
    room.overrideTotalPrice !== null ? room.overrideTotalPrice : totalArea * effectiveRate;

  // Material Line Items
  const lineItems = [
    {
      code: "ML-01",
      description: `${room.carcass} (Zero Core Gaps, IS:710 Marine Grade)`,
      unit: "Sheets (8x4)",
      qty: Math.max(2, Math.ceil(totalArea / 12)),
      rate: 3400,
      amount: Math.max(2, Math.ceil(totalArea / 12)) * 3400,
    },
    {
      code: "ML-02",
      description: `${room.shutter} Substrate for Facias`,
      unit: "Sheets (8x4)",
      qty: Math.max(1, Math.ceil(totalArea / 22)),
      rate: 2600,
      amount: Math.max(1, Math.ceil(totalArea / 22)) * 2600,
    },
    {
      code: "ML-03",
      description: `${room.finish} Face Treatment (1.5mm Laser Edge)`,
      unit: "Sheets (8x4)",
      qty: Math.max(1, Math.ceil(totalArea / 22)),
      rate: 4200,
      amount: Math.max(1, Math.ceil(totalArea / 22)) * 4200,
    },
    {
      code: "HW-01",
      description: `${room.hardware} Sensys Soft-Close 110° Concealed Hinges`,
      unit: "Pairs",
      qty: Math.max(4, Math.ceil(totalArea / 4.5)),
      rate: 650,
      amount: Math.max(4, Math.ceil(totalArea / 4.5)) * 650,
    },
    {
      code: "HW-02",
      description: `${room.hardware} Quadro 4D Undermount Soft-Close Runners`,
      unit: "Sets",
      qty: 4,
      rate: 2100,
      amount: 8400,
    },
    {
      code: "LB-01",
      description: "Master Cabinetmaker Carpentry, Joinery & Laser Leveling",
      unit: "Sft",
      qty: totalArea,
      rate: 380,
      amount: totalArea * 380,
    },
    {
      code: "AD-01",
      description: "PUR Moisture Proof Adhesive & 2mm PVC Edge Banding",
      unit: "Rmt",
      qty: totalArea * 2,
      rate: 45,
      amount: totalArea * 2 * 45,
    },
  ];

  const itemsTotal = lineItems.reduce((acc, item) => acc + item.amount, 0);

  const handleCopyCsv = () => {
    const csvContent =
      "Item Code,Description,Qty,Unit,Rate (INR),Amount (INR)\n" +
      lineItems
        .map(
          (i) =>
            `"${i.code}","${i.description}",${i.qty},"${i.unit}",${i.rate},${i.amount}`
        )
        .join("\n") +
      `\nGrand Total: ₹${grandTotal}`;

    navigator.clipboard.writeText(csvContent);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="bg-white border border-[#E2E5EB] rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E5E8EE] flex items-start justify-between bg-[#F7F8FA]">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708]">
              DETAILED BILL OF QUANTITIES (BOQ)
            </span>
            <h2 className="font-serif text-xl md:text-2xl text-[#16191F] font-medium mt-0.5">
              {room.name} Interiors Schedule
            </h2>
            <p className="text-xs text-[#596171] mt-0.5">
              Project: {projectName} · {room.tier}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7E8794] hover:text-[#16191F] hover:bg-[#EEF1F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-5">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB]">
              <span className="block text-[11px] text-[#596171]">Total Area</span>
              <span className="text-lg font-serif text-[#16191F] font-semibold tabular-nums">
                {totalArea} Sft
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB]">
              <span className="block text-[11px] text-[#596171]">Effective Rate</span>
              <span className="text-lg font-serif text-[#8A6708] font-bold tabular-nums">
                ₹{new Intl.NumberFormat("en-IN").format(effectiveRate)}/Sft
              </span>
            </div>
            <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB]">
              <span className="block text-[11px] text-[#596171]">Estimated Total</span>
              <span className="text-lg font-serif text-[#8A6708] font-bold tabular-nums">
                ₹{new Intl.NumberFormat("en-IN").format(grandTotal)}
              </span>
            </div>
          </div>

          {/* Active Components Breakdown */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#596171] mb-2">
              Configured Room Interior Units
            </h3>
            <div className="divide-y divide-[#E5E8EE] border border-[#E2E5EB] rounded-xl overflow-hidden bg-white">
              {room.components
                .filter((c) => c.enabled)
                .map((comp) => (
                  <div
                    key={comp.id}
                    className="p-3 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-medium text-[#16191F]">{comp.name}</span>
                      <span className="text-[#7E8794] block text-[11px]">
                        Dimensions: {comp.width}&quot; (W) × {comp.height}&quot; (H)
                      </span>
                    </div>
                    <span className="text-[#8A6708] font-serif tabular-nums font-semibold">
                      {comp.area} Sft
                    </span>
                  </div>
                ))}
            </div>
          </div>

          {/* Detailed Line Items Table */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#596171] mb-2">
              Factory Material & Hardware Takeoff
            </h3>
            <div className="border border-[#E2E5EB] rounded-xl overflow-hidden shadow-2xs">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#F1F3F6] text-[#596171] border-b border-[#E2E5EB]">
                  <tr>
                    <th className="py-2.5 px-3 font-semibold">Description</th>
                    <th className="py-2.5 px-2 text-center font-semibold">Qty</th>
                    <th className="py-2.5 px-2 text-right font-semibold">Rate</th>
                    <th className="py-2.5 px-3 text-right font-semibold">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E8EE] bg-white">
                  {lineItems.map((item) => (
                    <tr key={item.code} className="hover:bg-[#F8F9FA] transition-colors">
                      <td className="py-2 px-3 text-[#16191F] leading-snug">
                        {item.description}
                      </td>
                      <td className="py-2 px-2 text-center text-[#596171] tabular-nums">
                        {item.qty} {item.unit.split(" ")[0]}
                      </td>
                      <td className="py-2 px-2 text-right text-[#596171] tabular-nums">
                        ₹{item.rate}
                      </td>
                      <td className="py-2 px-3 text-right font-semibold text-[#16191F] tabular-nums">
                        ₹{new Intl.NumberFormat("en-IN").format(item.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Specification Assurance */}
          <div className="p-3.5 rounded-xl bg-[#FDF8E7] border border-[#E5C86C] text-xs text-[#596171] leading-relaxed">
            <strong className="text-[#8A6708] block mb-1">Architectural Quality Assurance:</strong>
            {room.aiRationale ||
              "Materials calibrated to IS:710 standards with boiling waterproof longevity. 15-year comprehensive hardware warranty."}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[#E5E8EE] bg-[#F7F8FA] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCsv}
              className="px-3 py-2 rounded-lg bg-white hover:bg-[#EEF1F5] text-xs text-[#16191F] flex items-center gap-1.5 transition-colors border border-[#DCE0E8] shadow-2xs"
            >
              {copied ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#8A6708]" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <FileSpreadsheet className="w-3.5 h-3.5 text-[#8A6708]" />
                  <span>Copy CSV</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="px-3 py-2 rounded-lg bg-white hover:bg-[#EEF1F5] text-xs text-[#16191F] flex items-center gap-1.5 transition-colors border border-[#DCE0E8] shadow-2xs"
            >
              <Printer className="w-3.5 h-3.5 text-[#8A6708]" />
              <span>Print Sheet</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold transition-colors shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
