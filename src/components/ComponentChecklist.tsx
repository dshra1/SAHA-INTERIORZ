import React, { useState } from "react";
import { Check, Plus, Trash2, ChevronDown, ChevronUp, Calculator, Layers, ArrowRight, Sparkles, FileSpreadsheet } from "lucide-react";
import { InteriorComponent } from "../types";

interface ComponentChecklistProps {
  components: InteriorComponent[];
  roomName?: string;
  carcass?: string;
  shutter?: string;
  finish?: string;
  hardware?: string;
  ratePerSft?: number;
  onToggleComponent: (id: string) => void;
  onUpdateDimensions: (id: string, width: number, height: number, customArea?: number) => void;
  onAddComponent: (name: string, width: number, height: number, category?: string) => void;
  onDeleteComponent: (id: string) => void;
  onNavigateToEstimator?: () => void;
  onOpenAiOcrModal?: () => void;
}

export const ComponentChecklist: React.FC<ComponentChecklistProps> = ({
  components,
  roomName = "Active Zone",
  carcass = "18mm BWP 710 Marine Ply",
  shutter = "HDHMR Board",
  finish = "High Gloss Acrylic",
  hardware = "German Soft-Close",
  ratePerSft = 1450,
  onToggleComponent,
  onUpdateDimensions,
  onAddComponent,
  onDeleteComponent,
  onNavigateToEstimator,
  onOpenAiOcrModal,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState("Storage & Wardrobes");
  const [newItemWidth, setNewItemWidth] = useState(48);
  const [newItemHeight, setNewItemHeight] = useState(48);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;
    onAddComponent(newItemName.trim(), newItemWidth, newItemHeight, newItemCategory);
    setNewItemName("");
    setNewItemCategory("Storage & Wardrobes");
    setNewItemWidth(48);
    setNewItemHeight(48);
    setShowAddForm(false);
  };

  const activeComponents = components.filter((c) => c.enabled);
  const totalActiveArea = activeComponents.reduce((sum, c) => sum + c.area, 0);
  const totalActiveCost = activeComponents.reduce((sum, c) => {
    const rate = c.customRate || ratePerSft;
    return sum + c.area * rate;
  }, 0);

  return (
    <div className="mx-4 my-4 space-y-4">
      {/* Section Header */}
      <div className="flex items-center justify-between px-1">
        <div>
          <h3 className="font-serif text-lg text-[#16191F] font-semibold tracking-tight">
            Component Checklist & Dimensions
          </h3>
          <p className="text-[11px] text-[#596171]">
            Toggle items, fine-tune inches, and view line-item costing based on size & materials.
          </p>
        </div>
        <span className="text-[11px] font-semibold text-[#8A6708] bg-[#FDF8E7] border border-[#E5C86C] px-2.5 py-1 rounded-lg shrink-0">
          ₹{new Intl.NumberFormat("en-IN").format(ratePerSft)}/Sft Base
        </span>
      </div>

      {/* Component Items List */}
      <div className="space-y-3">
        {components.map((item) => {
          const itemRate = item.customRate || ratePerSft;
          const itemCost = item.area * itemRate;
          const isExpanded = expandedItemId === item.id;

          // Material percentage breakdown approximation
          const carcassCost = Math.round(itemCost * 0.48);
          const shutterCost = Math.round(itemCost * 0.24);
          const finishCost = Math.round(itemCost * 0.16);
          const hardwareCost = Math.round(itemCost * 0.12);

          return (
            <div
              key={item.id}
              id={`interior-item-${item.id}`}
              className={`p-4 rounded-xl border transition-all ${
                item.enabled
                  ? "bg-white border-[#E2E5EB] shadow-xs"
                  : "bg-[#F8F9FA] border-[#E5E8EE] opacity-75"
              }`}
            >
              {/* Top row: Checkbox, Title, Costing & Area Badge */}
              <div className="flex items-center justify-between gap-3 mb-2.5">
                <div
                  className="flex items-center gap-3 cursor-pointer select-none flex-1"
                  onClick={() => onToggleComponent(item.id)}
                >
                  {/* Custom Checkbox */}
                  <div
                    className={`w-5 h-5 rounded-md flex items-center justify-center transition-colors shrink-0 ${
                      item.enabled
                        ? "bg-[#E0B638] text-[#1A1D24] shadow-2xs"
                        : "bg-white border border-[#C4C8D2] text-transparent hover:border-[#8A6708]"
                    }`}
                  >
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  <div>
                    <span
                      className={`text-sm font-semibold transition-colors block ${
                        item.enabled ? "text-[#16191F]" : "text-[#7E8794]"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.category && (
                      <span className="text-[10px] text-[#7E8794] font-medium">
                        {item.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Size & Cost Badge */}
                <div className="flex items-center gap-2 shrink-0">
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#8A6708] tabular-nums block font-serif">
                      ₹{new Intl.NumberFormat("en-IN").format(itemCost)}
                    </span>
                    <span className="text-[10px] text-[#596171] tabular-nums">
                      {item.area} Sft · ₹{itemRate}/Sft
                    </span>
                  </div>

                  {components.length > 2 && (
                    <button
                      onClick={() => onDeleteComponent(item.id)}
                      className="text-[#9CA3AF] hover:text-[#DC2626] p-1 transition-colors ml-1"
                      title="Remove item"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Inputs row: Width (Inches) and Height (Inches) */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-[#596171] mb-1 font-medium">
                    Width (Inches)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="300"
                    value={item.width}
                    onChange={(e) => {
                      const newWidth = Math.max(0, parseInt(e.target.value) || 0);
                      onUpdateDimensions(item.id, newWidth, item.height);
                    }}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-sm text-[#16191F] tabular-nums font-semibold focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-[#596171] mb-1 font-medium">
                    Height (Inches)
                  </label>
                  <input
                    type="number"
                    min="6"
                    max="300"
                    value={item.height}
                    onChange={(e) => {
                      const newHeight = Math.max(0, parseInt(e.target.value) || 0);
                      onUpdateDimensions(item.id, item.width, newHeight);
                    }}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-sm text-[#16191F] tabular-nums font-semibold focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Sizing & Material Breakdown Toggle */}
              {item.enabled && (
                <div className="mt-3 pt-2 border-t border-[#E5E8EE]">
                  <button
                    onClick={() => setExpandedItemId(isExpanded ? null : item.id)}
                    className="text-[11px] text-[#8A6708] font-semibold flex items-center justify-between w-full hover:underline cursor-pointer"
                  >
                    <span className="flex items-center gap-1.5">
                      <Calculator className="w-3.5 h-3.5" />
                      <span>Cost Breakdown: {item.area} Sft × ₹{itemRate}/Sft = ₹{new Intl.NumberFormat("en-IN").format(itemCost)}</span>
                    </span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {isExpanded && (
                    <div className="mt-2 p-2.5 rounded-lg bg-[#F7F8FA] border border-[#E2E5EB] space-y-1.5 text-[11px] animate-in fade-in">
                      <div className="flex justify-between text-[#596171]">
                        <span>Carcass ({carcass.slice(0, 24)}...):</span>
                        <span className="font-semibold text-[#16191F] tabular-nums">₹{new Intl.NumberFormat("en-IN").format(carcassCost)} (48%)</span>
                      </div>
                      <div className="flex justify-between text-[#596171]">
                        <span>Shutter ({shutter.slice(0, 24)}...):</span>
                        <span className="font-semibold text-[#16191F] tabular-nums">₹{new Intl.NumberFormat("en-IN").format(shutterCost)} (24%)</span>
                      </div>
                      <div className="flex justify-between text-[#596171]">
                        <span>Surface Finish ({finish.slice(0, 24)}...):</span>
                        <span className="font-semibold text-[#16191F] tabular-nums">₹{new Intl.NumberFormat("en-IN").format(finishCost)} (16%)</span>
                      </div>
                      <div className="flex justify-between text-[#596171]">
                        <span>Hardware & Soft-Close ({hardware}):</span>
                        <span className="font-semibold text-[#16191F] tabular-nums">₹{new Intl.NumberFormat("en-IN").format(hardwareCost)} (12%)</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Custom Component Trigger */}
      {!showAddForm ? (
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <button
            id="add-component-trigger-btn"
            onClick={() => setShowAddForm(true)}
            className="w-full sm:flex-1 py-2.5 rounded-xl border border-dashed border-[#DCE0E8] bg-white text-xs font-semibold text-[#596171] hover:text-[#8A6708] hover:border-[#8A6708]/50 hover:bg-[#FAF6EB] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Interior Component</span>
          </button>

          {onOpenAiOcrModal && (
            <button
              onClick={onOpenAiOcrModal}
              className="w-full sm:w-auto py-2.5 px-3.5 rounded-xl border border-[#E5C86C] bg-[#FAF5E6] hover:bg-[#F5EDD5] text-xs font-semibold text-[#8A6708] flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer shrink-0"
              title="Upload Excel or photo schedule to auto-populate rooms and items"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Import Excel / Schedule</span>
            </button>
          )}
        </div>
      ) : (
        <form
          onSubmit={handleAddSubmit}
          className="p-4 bg-white border border-[#E5C86C] rounded-xl space-y-3 animate-in fade-in shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8A6708]">
              New Interior Piece
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="text-xs text-[#7E8794] hover:text-[#16191F]"
            >
              Cancel
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <div>
              <label className="block text-[11px] text-[#596171] mb-1 font-medium">Component Name *</label>
              <input
                type="text"
                placeholder="e.g. Floating Vanity Console, Walk-in Wardrobe"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-[11px] text-[#596171] mb-1 font-medium">Category</label>
              <select
                value={newItemCategory}
                onChange={(e) => setNewItemCategory(e.target.value)}
                className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              >
                <option>Storage & Wardrobes</option>
                <option>Vanity & Dressers</option>
                <option>Media & TV Credenzas</option>
                <option>Beds & Acoustic Paneling</option>
                <option>Kitchen & Dining Cabinetry</option>
                <option>Study & Bookshelves</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] text-[#596171] mb-1 font-medium">
                Width (Inches)
              </label>
              <input
                type="number"
                value={newItemWidth}
                onChange={(e) => setNewItemWidth(parseInt(e.target.value) || 0)}
                className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#596171] mb-1 font-medium">
                Height (Inches)
              </label>
              <input
                type="number"
                value={newItemHeight}
                onChange={(e) => setNewItemHeight(parseInt(e.target.value) || 0)}
                className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={!newItemName.trim()}
              className="px-4 py-2 bg-[#E0B638] text-[#1A1D24] font-semibold text-xs rounded-lg hover:bg-[#D4AC2D] disabled:opacity-50 transition-colors shadow-2xs cursor-pointer"
            >
              Add to Room
            </button>
          </div>
        </form>
      )}

      {/* Live Category-Wise Costing Summary Card */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-white to-[#F7F8FA] border border-[#E2E5EB] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FDF8E7] border border-[#E5C86C] text-[#8A6708] flex items-center justify-center font-bold shadow-2xs">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h4 className="font-serif text-sm font-semibold text-[#16191F]">
                {roomName} Costing Estimator Summary
              </h4>
              <span className="text-[10px] text-[#596171]">
                Based on active dimensions ({totalActiveArea} Sft) & certified materials
              </span>
            </div>
          </div>

          <span className="font-serif text-base font-bold text-[#8A6708] tabular-nums">
            ₹{new Intl.NumberFormat("en-IN").format(totalActiveCost)}
          </span>
        </div>

        {/* Breakdown table */}
        <div className="overflow-x-auto rounded-xl border border-[#E5E8EE] bg-white">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-[#F7F8FA] text-[#596171] border-b border-[#E5E8EE]">
              <tr>
                <th className="py-2 px-3 font-semibold">Active Item / Category</th>
                <th className="py-2 px-2 text-center font-semibold">Size</th>
                <th className="py-2 px-2 text-right font-semibold">Rate</th>
                <th className="py-2 px-3 text-right font-semibold">Estimated Cost</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E8EE]">
              {activeComponents.map((item) => {
                const itemRate = item.customRate || ratePerSft;
                const cost = item.area * itemRate;
                return (
                  <tr key={item.id} className="hover:bg-[#FAFBFD]">
                    <td className="py-2 px-3">
                      <span className="font-semibold text-[#16191F] block">{item.name}</span>
                      <span className="text-[10px] text-[#7E8794]">{item.width}" × {item.height}"</span>
                    </td>
                    <td className="py-2 px-2 text-center font-medium text-[#16191F] tabular-nums">
                      {item.area} Sft
                    </td>
                    <td className="py-2 px-2 text-right text-[#596171] tabular-nums">
                      ₹{itemRate}
                    </td>
                    <td className="py-2 px-3 text-right font-bold text-[#8A6708] tabular-nums">
                      ₹{new Intl.NumberFormat("en-IN").format(cost)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Link to Full Project Costing Estimator */}
        {onNavigateToEstimator && (
          <button
            onClick={onNavigateToEstimator}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-[#FAFBFD] border border-[#E5C86C] text-xs font-semibold text-[#8A6708] flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer group"
          >
            <Sparkles className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
            <span>Open Full Project Costing Estimator (All Rooms & Categories)</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </button>
        )}
      </div>
    </div>
  );
};
