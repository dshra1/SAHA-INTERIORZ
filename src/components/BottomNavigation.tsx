import React from "react";
import {
  Home,
  LayoutGrid,
  Calculator,
  Layers,
  Sparkles,
  CalendarCheck,
  TrendingUp,
} from "lucide-react";

export type NavTabId =
  | "home"
  | "portfolio"
  | "estimator"
  | "materials"
  | "ai_recommender"
  | "booking"
  | "tracker";

interface BottomNavigationProps {
  activeTab: NavTabId;
  onSelectTab: (tab: NavTabId) => void;
}

export const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onSelectTab,
}) => {
  const tabs = [
    { id: "home" as NavTabId, label: "Home / Projects", icon: Home },
    { id: "estimator" as NavTabId, label: "Costing Estimator", icon: Calculator },
    { id: "ai_recommender" as NavTabId, label: "AI Recommender", icon: Sparkles },
    { id: "materials" as NavTabId, label: "Materials", icon: Layers },
    { id: "portfolio" as NavTabId, label: "Architects & Gallery", icon: LayoutGrid },
    { id: "booking" as NavTabId, label: "Booking", icon: CalendarCheck },
    { id: "tracker" as NavTabId, label: "Tracker", icon: TrendingUp },
  ];

  return (
    <nav className="sticky bottom-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#E2E5EB] px-2 py-2">
      <div className="flex items-center justify-around max-w-lg mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              id={`nav-btn-${tab.id}`}
              onClick={() => onSelectTab(tab.id)}
              className={`flex flex-col items-center justify-center py-1 px-1.5 rounded-lg transition-all ${
                isActive
                  ? "text-[#8A6708]"
                  : "text-[#7E8794] hover:text-[#16191F] hover:bg-[#F1F3F6]"
              }`}
            >
              <div className="relative">
                <Icon className={`w-5 h-5 ${isActive ? "stroke-[2.5]" : "stroke-[1.75]"}`} />
                {isActive && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-[#E0B638] rounded-full" />
                )}
              </div>
              <span
                className={`text-[10px] mt-1 tracking-tight leading-none whitespace-nowrap ${
                  isActive ? "font-semibold text-[#8A6708]" : "font-medium"
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
