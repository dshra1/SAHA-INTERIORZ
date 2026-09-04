import React, { useState } from "react";
import {
  CARCASS_OPTIONS,
  SHUTTER_OPTIONS,
  FINISH_OPTIONS,
  HARDWARE_OPTIONS,
} from "../data/initialData";
import { ShieldCheck, Award, Layers, Check, Sparkles } from "lucide-react";

export const MaterialsView: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<
    "all" | "carcass" | "shutter" | "finish" | "hardware"
  >("all");

  const allMaterials = [
    ...CARCASS_OPTIONS,
    ...SHUTTER_OPTIONS,
    ...FINISH_OPTIONS,
    ...HARDWARE_OPTIONS,
  ];

  const filteredMaterials =
    activeCategory === "all"
      ? allMaterials
      : allMaterials.filter((m) => m.category === activeCategory);

  const categories = [
    { id: "all", label: "All Specifications" },
    { id: "carcass", label: "Carcass Plywood" },
    { id: "shutter", label: "Shutter Substrates" },
    { id: "finish", label: "Finishes & Textures" },
    { id: "hardware", label: "Hardware & Mechanisms" },
  ];

  return (
    <div className="p-4 space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708]">
          SPECIFICATION LIBRARY
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
          Certified Material Standards
        </h2>
        <p className="text-xs text-[#596171] mt-1">
          Architectural materials and mechanisms certified for high-humidity residential longevity.
        </p>
      </div>

      {/* Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id as any)}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
              activeCategory === cat.id
                ? "bg-[#E0B638] text-[#1A1D24] font-semibold shadow-xs"
                : "bg-white text-[#596171] hover:text-[#16191F] border border-[#DCE0E8] shadow-2xs"
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredMaterials.map((mat) => (
          <div
            key={mat.id}
            className="p-4 rounded-2xl bg-white border border-[#E2E5EB] hover:border-[#B58914]/40 transition-all space-y-3 flex flex-col justify-between shadow-xs"
          >
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-semibold text-[#8A6708]">
                    {mat.category} · {mat.brand || "Bespoke Grade"}
                  </span>
                  <h3 className="font-serif text-base text-[#16191F] font-medium leading-snug">
                    {mat.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                  <span className="text-[11px] px-2 py-0.5 rounded bg-[#FDF8E7] text-[#8A6708] border border-[#E5C86C] font-semibold shadow-2xs">
                    {mat.durability}/100 Rating
                  </span>
                </div>
              </div>

              <p className="text-xs text-[#596171] leading-relaxed">
                {mat.description}
              </p>
            </div>

            <div className="pt-3 border-t border-[#E5E8EE] flex items-center justify-between">
              <div className="flex flex-wrap gap-1">
                {mat.badges.map((b, i) => (
                  <span
                    key={i}
                    className="text-[10px] px-2 py-0.5 rounded bg-[#F7F8FA] text-[#16191F] border border-[#E2E5EB] font-medium"
                  >
                    {b}
                  </span>
                ))}
              </div>
              <span className="text-[11px] text-[#8A6708] font-semibold whitespace-nowrap pl-2">
                {mat.warrantyYears} Yr Warranty
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
