import React from "react";
import { Sliders, ShieldCheck, Sparkles, CheckCircle2 } from "lucide-react";
import {
  CARCASS_OPTIONS,
  SHUTTER_OPTIONS,
  FINISH_OPTIONS,
  HARDWARE_OPTIONS,
} from "../data/initialData";

interface MaterialSpecEngineProps {
  carcass: string;
  shutter: string;
  finish: string;
  hardware: string;
  onUpdateCarcass: (value: string) => void;
  onUpdateShutter: (value: string) => void;
  onUpdateFinish: (value: string) => void;
  onUpdateHardware: (value: string) => void;
  durabilityScore?: number;
}

export const MaterialSpecEngine: React.FC<MaterialSpecEngineProps> = ({
  carcass,
  shutter,
  finish,
  hardware,
  onUpdateCarcass,
  onUpdateShutter,
  onUpdateFinish,
  onUpdateHardware,
  durabilityScore = 94,
}) => {
  const selectedCarcassObj = CARCASS_OPTIONS.find((c) => c.name === carcass);
  const selectedShutterObj = SHUTTER_OPTIONS.find((s) => s.name === shutter);
  const selectedFinishObj = FINISH_OPTIONS.find((f) => f.name === finish);
  const selectedHardwareObj = HARDWARE_OPTIONS.find((h) => h.name === hardware);

  return (
    <div className="mx-4 my-4 p-5 rounded-xl bg-white border border-[#E2E5EB] shadow-xs">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-serif text-lg text-[#16191F] font-medium tracking-tight">
          Material & Specification Engine
        </h3>
        <button
          className="text-[#8A6708] p-1.5 hover:bg-[#F1F3F6] rounded-lg transition-colors"
          title="Engine Specifications"
        >
          <Sliders className="w-4 h-4" />
        </button>
      </div>

      <div className="space-y-4">
        {/* Carcass Material */}
        <div>
          <label className="block text-xs text-[#596171] mb-1.5 font-medium">
            Carcass Material
          </label>
          <div className="relative">
            <select
              id="carcass-select"
              value={carcass}
              onChange={(e) => onUpdateCarcass(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3.5 py-2.5 text-sm text-[#16191F] appearance-none pr-9 focus:border-[#D4AF37] transition-all cursor-pointer font-medium"
            >
              {CARCASS_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.name} className="bg-white text-[#16191F]">
                  {opt.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7E8794]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          {selectedCarcassObj && (
            <div className="flex flex-wrap gap-1.5 mt-1.5">
              {selectedCarcassObj.badges.map((b) => (
                <span
                  key={b}
                  className="text-[10px] uppercase tracking-wider text-[#596171] bg-[#F1F3F6] px-2 py-0.5 rounded border border-[#E2E5EB]"
                >
                  {b}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Shutter Material */}
        <div>
          <label className="block text-xs text-[#596171] mb-1.5 font-medium">
            Shutter Material
          </label>
          <div className="relative">
            <select
              id="shutter-select"
              value={shutter}
              onChange={(e) => onUpdateShutter(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3.5 py-2.5 text-sm text-[#16191F] appearance-none pr-9 focus:border-[#D4AF37] transition-all cursor-pointer font-medium"
            >
              {SHUTTER_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.name} className="bg-white text-[#16191F]">
                  {opt.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7E8794]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Finish Type & Texture */}
        <div>
          <label className="block text-xs text-[#596171] mb-1.5 font-medium">
            Finish Type & Texture
          </label>
          <div className="relative">
            <select
              id="finish-select"
              value={finish}
              onChange={(e) => onUpdateFinish(e.target.value)}
              className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3.5 py-2.5 text-sm text-[#16191F] appearance-none pr-9 focus:border-[#D4AF37] transition-all cursor-pointer font-medium"
            >
              {FINISH_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.name} className="bg-white text-[#16191F]">
                  {opt.name}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-[#7E8794]">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Hardware & Channels Brand */}
        <div>
          <label className="block text-xs text-[#596171] mb-2 font-medium">
            Hardware & Channels Brand
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {["Hettich", "Blum", "Hafele"].map((brandName) => {
              const isSelected = hardware === brandName;
              return (
                <button
                  key={brandName}
                  type="button"
                  id={`hardware-btn-${brandName.toLowerCase()}`}
                  onClick={() => onUpdateHardware(brandName)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-medium transition-all text-center ${
                    isSelected
                      ? "bg-[#E0B638] text-[#1A1D24] font-semibold shadow-2xs"
                      : "bg-[#F7F8FA] text-[#596171] border border-[#DCE0E8] hover:border-[#B58914]/40 hover:text-[#16191F]"
                  }`}
                >
                  {brandName}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Spec Certification Tag */}
        <div className="mt-2 pt-3 border-t border-[#E5E8EE] flex items-center justify-between text-xs text-[#596171]">
          <span className="flex items-center gap-1.5 text-[#16191F]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8A6708]" />
            <span>Durability Index: <strong className="text-[#8A6708]">{durabilityScore}/100</strong></span>
          </span>
          <span className="text-[11px] text-[#7E8794]">15-Yr Architectural Warranty</span>
        </div>
      </div>
    </div>
  );
};
