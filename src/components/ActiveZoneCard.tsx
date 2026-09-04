import React, { useState } from "react";
import { Award, ChevronDown, Check } from "lucide-react";
import { RoomConfig } from "../types";

interface ActiveZoneCardProps {
  room: RoomConfig;
  onUpdateTier: (tier: "Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier") => void;
}

export const ActiveZoneCard: React.FC<ActiveZoneCardProps> = ({ room, onUpdateTier }) => {
  const [showTierMenu, setShowTierMenu] = useState(false);

  const tiers: Array<"Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier"> = [
    "Bespoke Tier",
    "Modern Luxury Tier",
    "Signature Penthouse Tier",
  ];

  return (
    <div className="mx-4 my-2 p-5 rounded-xl bg-white border border-[#E2E5EB] shadow-xs relative overflow-hidden">
      {/* Background ambient gold gradient highlight */}
      <div className="absolute -right-12 -top-12 w-44 h-44 bg-[#E0B638]/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top row: ACTIVE ZONE label + Tier Badge */}
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[#8A6708]">
          ACTIVE ZONE
        </span>

        {/* Tier dropdown badge */}
        <div className="relative">
          <button
            id="tier-badge-btn"
            onClick={() => setShowTierMenu(!showTierMenu)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FDF8E7] border border-[#E5C86C] text-[#8A6708] text-xs font-medium hover:bg-[#FAF0D4] transition-colors shadow-2xs"
          >
            <Award className="w-3.5 h-3.5 text-[#8A6708]" />
            <span>{room.tier}</span>
            <ChevronDown className="w-3 h-3 opacity-80" />
          </button>

          {showTierMenu && (
            <div className="absolute right-0 mt-1.5 w-60 bg-white border border-[#E2E5EB] rounded-xl shadow-xl py-1.5 z-40 animate-in fade-in duration-100">
              {tiers.map((t) => (
                <button
                  key={t}
                  onClick={() => {
                    onUpdateTier(t);
                    setShowTierMenu(false);
                  }}
                  className={`w-full text-left px-3.5 py-2 text-xs flex items-center justify-between hover:bg-[#F1F3F6] transition-colors ${
                    room.tier === t ? "text-[#8A6708] bg-[#FDF8E7]/60 font-semibold" : "text-[#596171]"
                  }`}
                >
                  <span>{t}</span>
                  {room.tier === t && <Check className="w-3.5 h-3.5 text-[#8A6708]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Customization Headline */}
      <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] tracking-tight leading-tight mb-2 font-medium">
        {room.name} Customization
      </h2>

      {/* Subtitle */}
      <p className="text-xs md:text-sm text-[#596171] leading-relaxed max-w-2xl">
        {room.subtitle}
      </p>
    </div>
  );
};
