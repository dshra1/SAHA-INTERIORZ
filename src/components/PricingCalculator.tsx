import React, { useState } from "react";
import { Sparkles, RotateCcw, Bookmark, ChevronRight, Info } from "lucide-react";

interface PricingCalculatorProps {
  totalArea: number;
  aiSuggestedRate: number;
  overrideRate: number | null;
  overrideTotalPrice: number | null;
  onUpdateOverrideRate: (rate: number | null) => void;
  onUpdateTotalPrice: (total: number | null) => void;
  onResetToAiDefault: () => void;
  onRecalculateBOQ: () => void;
  onSaveAndPush: () => void;
  isRecalculating?: boolean;
}

export const PricingCalculator: React.FC<PricingCalculatorProps> = ({
  totalArea,
  aiSuggestedRate,
  overrideRate,
  overrideTotalPrice,
  onUpdateOverrideRate,
  onUpdateTotalPrice,
  onResetToAiDefault,
  onRecalculateBOQ,
  onSaveAndPush,
  isRecalculating = false,
}) => {
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Active rate is overrideRate if set, otherwise aiSuggestedRate
  const effectiveRate = overrideRate !== null ? overrideRate : aiSuggestedRate;

  // Active total is overrideTotalPrice if set, otherwise totalArea * effectiveRate
  const effectiveTotal =
    overrideTotalPrice !== null ? overrideTotalPrice : totalArea * effectiveRate;

  const formattedRate = new Intl.NumberFormat("en-IN").format(effectiveRate);
  const formattedTotal = new Intl.NumberFormat("en-IN").format(effectiveTotal);
  const formattedAiRate = new Intl.NumberFormat("en-IN").format(aiSuggestedRate);

  return (
    <div className="mx-4 my-4 p-5 rounded-xl bg-white border border-[#E2E5EB] shadow-xs">
      {/* Header with AI Optimized Badge */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-[#16191F] font-medium tracking-tight">
          Pricing & Cost Calculator
        </h3>
        <span className="text-[11px] font-medium text-[#8A6708] bg-[#FDF8E7] border border-[#E5C86C] px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-2xs">
          <Sparkles className="w-3 h-3 text-[#8A6708]" />
          AI Optimized
        </span>
      </div>

      {/* Top Metrics Box: Total Area & AI Suggested Rate */}
      <div className="grid grid-cols-2 gap-4 p-4 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] mb-4">
        <div>
          <span className="block text-xs text-[#596171] mb-1 font-medium">
            Total Area
          </span>
          <span className="text-xl md:text-2xl font-serif text-[#16191F] tabular-nums font-semibold">
            {totalArea} Sft
          </span>
        </div>

        <div>
          <span className="block text-xs text-[#596171] mb-1 font-medium">
            AI Suggested Rate / Sft
          </span>
          <span className="text-xl md:text-2xl font-serif text-[#8A6708] tabular-nums font-bold">
            ₹{formattedAiRate} / Sft
          </span>
        </div>
      </div>

      {/* Override Rate (₹ per Sft) */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-[#596171] font-medium">
            Override Rate (₹ per Sft)
          </label>
          <button
            type="button"
            onClick={onResetToAiDefault}
            className="text-[11px] text-[#8A6708] hover:underline font-medium cursor-pointer"
          >
            Reset to AI Default
          </button>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-sm text-[#7E8794] font-medium pointer-events-none">
            ₹
          </span>
          <input
            type="number"
            value={effectiveRate}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onUpdateOverrideRate(val);
            }}
            className="w-full bg-white border border-[#DCE0E8] rounded-lg pl-8 pr-3.5 py-2.5 text-sm text-[#16191F] tabular-nums font-semibold focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Total Room Price Override (₹) */}
      <div className="mb-5">
        <div className="flex items-center justify-between mb-1.5">
          <label className="text-xs text-[#596171] font-medium">
            Total Room Price Override (₹)
          </label>
          <span className="text-[11px] text-[#7E8794]">Editable total</span>
        </div>
        <div className="relative flex items-center">
          <span className="absolute left-3.5 text-sm text-[#8A6708] font-medium pointer-events-none">
            ₹
          </span>
          <input
            type="number"
            value={effectiveTotal}
            onChange={(e) => {
              const val = e.target.value === "" ? null : Number(e.target.value);
              onUpdateTotalPrice(val);
            }}
            className="w-full bg-white border border-[#DCE0E8] rounded-lg pl-8 pr-3.5 py-2.5 text-base text-[#8A6708] tabular-nums font-bold focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Breakdown Accordion Toggle */}
      <button
        type="button"
        onClick={() => setShowBreakdown(!showBreakdown)}
        className="w-full py-2 px-3 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF1F5] border border-[#E2E5EB] text-xs text-[#596171] hover:text-[#16191F] flex items-center justify-between transition-colors mb-4"
      >
        <span className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-[#8A6708]" />
          <span>View Cost Component Breakdown (Joinery, Hardware, Labor)</span>
        </span>
        <ChevronRight
          className={`w-4 h-4 transition-transform ${showBreakdown ? "rotate-90" : ""}`}
        />
      </button>

      {showBreakdown && (
        <div className="p-3.5 rounded-lg bg-[#F7F8FA] border border-[#E2E5EB] text-xs space-y-2 mb-4 animate-in fade-in">
          <div className="flex justify-between text-[#596171]">
            <span>Carcass Plywood & Heavy Joinery (42%)</span>
            <span className="tabular-nums font-semibold text-[#16191F]">
              ₹{new Intl.NumberFormat("en-IN").format(Math.round(effectiveTotal * 0.42))}
            </span>
          </div>
          <div className="flex justify-between text-[#596171]">
            <span>Shutters, Acrylic & Laser Edge-banding (34%)</span>
            <span className="tabular-nums font-semibold text-[#16191F]">
              ₹{new Intl.NumberFormat("en-IN").format(Math.round(effectiveTotal * 0.34))}
            </span>
          </div>
          <div className="flex justify-between text-[#596171]">
            <span>Soft-Close Hardware & Hinges (14%)</span>
            <span className="tabular-nums font-semibold text-[#16191F]">
              ₹{new Intl.NumberFormat("en-IN").format(Math.round(effectiveTotal * 0.14))}
            </span>
          </div>
          <div className="flex justify-between text-[#596171]">
            <span>On-site Installation & Precision Laser Leveling (10%)</span>
            <span className="tabular-nums font-semibold text-[#16191F]">
              ₹{new Intl.NumberFormat("en-IN").format(Math.round(effectiveTotal * 0.1))}
            </span>
          </div>
        </div>
      )}

      {/* Action Buttons matching screenshot */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        {/* Recalculate BOQ Button */}
        <button
          id="recalculate-boq-btn"
          type="button"
          onClick={onRecalculateBOQ}
          disabled={isRecalculating}
          className="py-3 px-3 rounded-lg border border-[#DCE0E8] hover:border-[#B58914]/40 bg-[#F7F8FA] text-[#16191F] text-xs md:text-sm font-medium flex items-center justify-center gap-2 hover:bg-[#EEF1F5] transition-all cursor-pointer disabled:opacity-50"
        >
          <RotateCcw
            className={`w-4 h-4 text-[#7E8794] ${isRecalculating ? "animate-spin text-[#8A6708]" : ""}`}
          />
          <span className="text-center leading-tight">
            {isRecalculating ? "Calculating..." : "Recalculate\nBOQ"}
          </span>
        </button>

        {/* Save & Push Button */}
        <button
          id="save-push-btn"
          type="button"
          onClick={onSaveAndPush}
          className="py-3 px-3 rounded-lg bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-sm shadow-[#E0B638]/20 transition-all cursor-pointer"
        >
          <Bookmark className="w-4 h-4 fill-current" />
          <span>Save & Push</span>
        </button>
      </div>
    </div>
  );
};
