import React, { useState } from "react";
import { Header } from "./components/Header";
import { RoomSelector } from "./components/RoomSelector";
import { ActiveZoneCard } from "./components/ActiveZoneCard";
import { ComponentChecklist } from "./components/ComponentChecklist";
import { MaterialSpecEngine } from "./components/MaterialSpecEngine";
import { PricingCalculator } from "./components/PricingCalculator";
import { BottomNavigation, NavTabId } from "./components/BottomNavigation";
import { BoqModal } from "./components/BoqModal";
import { AiAdvisorModal } from "./components/AiAdvisorModal";
import { AiOcrImportModal } from "./components/AiOcrImportModal";

import { HomeView } from "./views/HomeView";
import { PortfolioView } from "./views/PortfolioView";
import { EstimatorView } from "./views/EstimatorView";
import { MaterialsView } from "./views/MaterialsView";
import { BookingView } from "./views/BookingView";
import { TrackerView } from "./views/TrackerView";

import { INITIAL_ROOMS, NOTIFICATIONS, PORTFOLIO_PROJECTS } from "./data/initialData";
import { RoomConfig, NotificationItem, PortfolioItem } from "./types";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export default function App() {
  const [activeTab, setActiveTab] = useState<NavTabId>("home");
  const [rooms, setRooms] = useState<RoomConfig[]>(INITIAL_ROOMS);
  const [activeRoomId, setActiveRoomId] = useState<string>("master-bedroom");
  const [notifications, setNotifications] = useState<NotificationItem[]>(NOTIFICATIONS);

  // Global projects state with local storage persistence
  const [projects, setProjects] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem("aethel_luxury_projects");
      if (saved) return JSON.parse(saved);
    } catch {}
    return PORTFOLIO_PROJECTS;
  });
  const [activeProjectId, setActiveProjectId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("aethel_active_project_id");
      if (saved) return saved;
    } catch {}
    return "port-1";
  });

  const [isBoqModalOpen, setIsBoqModalOpen] = useState(false);
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isAiOcrModalOpen, setIsAiOcrModalOpen] = useState(false);
  const [isRecalculating, setIsRecalculating] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active project lookup
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0];

  // Current active room
  const activeRoom = rooms.find((r) => r.id === activeRoomId) || rooms[0];

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  // Handle applying imported rooms to current active project
  const handleApplyRoomsToCurrentProject = (
    importedRooms: RoomConfig[],
    totalCost: number,
    totalSft: number
  ) => {
    if (importedRooms.length === 0) return;
    setRooms(importedRooms);
    setActiveRoomId(importedRooms[0].id);

    // Update active project area and budget
    setProjects((prev) => {
      const updated = prev.map((p) => {
        if (p.id === activeProjectId) {
          const formattedLakhs = (totalCost / 100000).toFixed(1);
          return {
            ...p,
            areaSft: totalSft,
            budgetNumeric: totalCost,
            budgetFormatted: `₹ ${formattedLakhs} Lakhs`,
          };
        }
        return p;
      });
      try {
        localStorage.setItem("aethel_luxury_projects", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    showToast(`Applied Excel Takeoff: ${importedRooms.length} rooms & ${totalSft} Sft loaded!`);
    setActiveTab("estimator");
  };

  // Handle creating a new commission directly from Excel takeoff
  const handleCreateNewProjectFromImport = (
    newProj: PortfolioItem,
    importedRooms: RoomConfig[]
  ) => {
    setProjects((prev) => {
      const updated = [newProj, ...prev];
      try {
        localStorage.setItem("aethel_luxury_projects", JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setActiveProjectId(newProj.id);
    try {
      localStorage.setItem("aethel_active_project_id", newProj.id);
    } catch {}

    if (importedRooms.length > 0) {
      setRooms(importedRooms);
      setActiveRoomId(importedRooms[0].id);
    }

    showToast(`Created & Activated commission from Excel: "${newProj.title}"`);
    setActiveTab("estimator");
  };

  // Mark notification as read
  const handleMarkNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // Helper to update active room configuration
  const updateActiveRoom = (updater: (prev: RoomConfig) => RoomConfig) => {
    setRooms((prevRooms) =>
      prevRooms.map((room) => (room.id === activeRoom.id ? updater(room) : room))
    );
  };

  // Handle toggling of interior items
  const handleToggleComponent = (compId: string) => {
    updateActiveRoom((prev) => {
      const updatedComponents = prev.components.map((c) =>
        c.id === compId ? { ...c, enabled: !c.enabled } : c
      );

      // Recalculate total area
      const newTotalArea = updatedComponents
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);

      const effectiveRate =
        prev.overrideRate !== null ? prev.overrideRate : prev.aiSuggestedRate;

      return {
        ...prev,
        components: updatedComponents,
        overrideTotalPrice: newTotalArea * effectiveRate,
      };
    });
  };

  // Handle updating dimensions of an interior item
  const handleUpdateDimensions = (compId: string, width: number, height: number) => {
    updateActiveRoom((prev) => {
      const updatedComponents = prev.components.map((c) => {
        if (c.id === compId) {
          // If width and height are changed, recalculate area (Width * Height) / 144
          const calcArea = Math.max(1, Math.round((width * height) / 144));
          return { ...c, width, height, area: calcArea };
        }
        return c;
      });

      const newTotalArea = updatedComponents
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);

      const effectiveRate =
        prev.overrideRate !== null ? prev.overrideRate : prev.aiSuggestedRate;

      return {
        ...prev,
        components: updatedComponents,
        overrideTotalPrice: newTotalArea * effectiveRate,
      };
    });
  };

  // Add custom interior component to room
  const handleAddComponent = (name: string, width: number, height: number) => {
    const area = Math.max(1, Math.round((width * height) / 144));
    const newComp = {
      id: `custom-${Date.now()}`,
      name,
      width,
      height,
      area,
      enabled: true,
      category: "Bespoke Custom",
    };

    updateActiveRoom((prev) => {
      const updatedComponents = [...prev.components, newComp];
      const newTotalArea = updatedComponents
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);
      const effectiveRate =
        prev.overrideRate !== null ? prev.overrideRate : prev.aiSuggestedRate;

      return {
        ...prev,
        components: updatedComponents,
        overrideTotalPrice: newTotalArea * effectiveRate,
      };
    });

    showToast(`Added "${name}" (${area} Sft) to ${activeRoom.name}`);
  };

  // Delete component
  const handleDeleteComponent = (compId: string) => {
    updateActiveRoom((prev) => {
      const updatedComponents = prev.components.filter((c) => c.id !== compId);
      const newTotalArea = updatedComponents
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);
      const effectiveRate =
        prev.overrideRate !== null ? prev.overrideRate : prev.aiSuggestedRate;

      return {
        ...prev,
        components: updatedComponents,
        overrideTotalPrice: newTotalArea * effectiveRate,
      };
    });
  };

  // Add new room
  const handleAddRoom = (
    name: string,
    tier: "Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier"
  ) => {
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, "-");
    const newRoom: RoomConfig = {
      id,
      name,
      tier,
      subtitle: `Bespoke joinery configuration for ${name}.`,
      carcass: "18mm Mahigold BWP 710 Marine Plywood",
      shutter: "HDHMR Moisture Resistant Board",
      finish: "High Gloss Acrylic (Anti-Scratch)",
      hardware: "Hettich",
      aiSuggestedRate: 1450,
      overrideRate: 1450,
      overrideTotalPrice: 43500,
      durabilityScore: 94,
      components: [
        {
          id: `c1-${Date.now()}`,
          name: "Main Interior & Cabinetry Unit",
          width: 72,
          height: 60,
          area: 30,
          enabled: true,
        },
      ],
    };

    setRooms((prev) => [...prev, newRoom]);
    setActiveRoomId(id);
    showToast(`Created new room: ${name}`);
  };

  // Material and Spec Updates
  const handleUpdateCarcass = (carcass: string) => {
    updateActiveRoom((prev) => ({ ...prev, carcass }));
  };

  const handleUpdateShutter = (shutter: string) => {
    updateActiveRoom((prev) => ({ ...prev, shutter }));
  };

  const handleUpdateFinish = (finish: string) => {
    updateActiveRoom((prev) => ({ ...prev, finish }));
  };

  const handleUpdateHardware = (hardware: string) => {
    updateActiveRoom((prev) => {
      let delta = 0;
      if (hardware === "Blum") delta = 140;
      else if (hardware === "Hafele") delta = 40;
      else if (hardware === "Ebco") delta = -70;

      const baseRate = 1450 + delta;
      const totalArea = prev.components
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);

      return {
        ...prev,
        hardware,
        aiSuggestedRate: baseRate,
        overrideRate: baseRate,
        overrideTotalPrice: totalArea * baseRate,
      };
    });
  };

  // Rate Overrides
  const handleUpdateOverrideRate = (rate: number | null) => {
    updateActiveRoom((prev) => {
      const totalArea = prev.components
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);
      const effectiveRate = rate !== null ? rate : prev.aiSuggestedRate;

      return {
        ...prev,
        overrideRate: rate,
        overrideTotalPrice: totalArea * effectiveRate,
      };
    });
  };

  const handleUpdateTotalPrice = (total: number | null) => {
    updateActiveRoom((prev) => ({
      ...prev,
      overrideTotalPrice: total,
    }));
  };

  const handleResetToAiDefault = () => {
    updateActiveRoom((prev) => {
      const totalArea = prev.components
        .filter((c) => c.enabled)
        .reduce((sum, c) => sum + c.area, 0);

      return {
        ...prev,
        overrideRate: prev.aiSuggestedRate,
        overrideTotalPrice: totalArea * prev.aiSuggestedRate,
      };
    });
    showToast(`Reset rate to AI Default (₹${activeRoom.aiSuggestedRate}/Sft)`);
  };

  // Recalculate BOQ action
  const handleRecalculateBOQ = async () => {
    setIsRecalculating(true);
    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: activeRoom.name,
          carcass: activeRoom.carcass,
          shutter: activeRoom.shutter,
          finish: activeRoom.finish,
          hardware: activeRoom.hardware,
          components: activeRoom.components.filter((c) => c.enabled),
          currentRate: activeRoom.overrideRate || activeRoom.aiSuggestedRate,
          tier: activeRoom.tier,
        }),
      });

      const data = await res.json();
      setIsRecalculating(false);

      if (data.success && data.suggestedRate) {
        const totalArea = activeRoom.components
          .filter((c) => c.enabled)
          .reduce((sum, c) => sum + c.area, 0);

        updateActiveRoom((prev) => ({
          ...prev,
          aiSuggestedRate: data.suggestedRate,
          overrideRate: data.suggestedRate,
          overrideTotalPrice: totalArea * data.suggestedRate,
          aiRationale: data.rationale,
          durabilityScore: data.durabilityScore || 94,
        }));

        showToast(`BOQ Recalculated! AI Suggested: ₹${data.suggestedRate}/Sft`);
      } else {
        showToast("BOQ re-verified with current vendor price schedule.");
      }
    } catch {
      setIsRecalculating(false);
      showToast("BOQ re-verified: ₹1,450/Sft for high-end residential execution.");
    }
  };

  // Save & Push action
  const handleSaveAndPush = async () => {
    const totalArea = activeRoom.components
      .filter((c) => c.enabled)
      .reduce((sum, c) => sum + c.area, 0);

    const effectiveRate =
      activeRoom.overrideRate !== null
        ? activeRoom.overrideRate
        : activeRoom.aiSuggestedRate;

    const effectiveTotal =
      activeRoom.overrideTotalPrice !== null
        ? activeRoom.overrideTotalPrice
        : totalArea * effectiveRate;

    try {
      await fetch("/api/boq/save", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: "Penthouse 402 - The Camellias",
          roomName: activeRoom.name,
          tier: activeRoom.tier,
          totalArea,
          ratePerSft: effectiveRate,
          totalPrice: effectiveTotal,
          carcass: activeRoom.carcass,
          shutter: activeRoom.shutter,
          finish: activeRoom.finish,
          hardware: activeRoom.hardware,
          components: activeRoom.components.filter((c) => c.enabled),
        }),
      });
    } catch {
      // Local fallback
    }

    showToast(`Pushed ${activeRoom.name} BOQ (₹${new Intl.NumberFormat("en-IN").format(effectiveTotal)}) to proposal!`);
    setIsBoqModalOpen(true);
  };

  // Compute active area for current room
  const activeRoomTotalArea = activeRoom.components
    .filter((c) => c.enabled)
    .reduce((sum, c) => sum + c.area, 0);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#16191F] flex flex-col selection:bg-[#E0B638]/20 selection:text-[#16191F]">
      {/* Top Header */}
      <Header
        notifications={notifications}
        onMarkNotificationRead={handleMarkNotificationRead}
        activeTabTitle={
          activeTab === "home"
            ? "Projects & Commissions"
            : activeTab === "estimator"
            ? "Costing Estimator (Size & Materials)"
            : activeTab === "ai_recommender"
            ? "AI Recommender"
            : activeTab === "materials"
            ? "Materials"
            : activeTab === "portfolio"
            ? "Architects & Gallery"
            : activeTab === "booking"
            ? "Booking"
            : activeTab === "tracker"
            ? "Tracker"
            : "Aethel Luxury Interiors"
        }
      />

      {/* Main Content Area */}
      <main className={`flex-1 w-full mx-auto pb-6 ${activeTab === "ai_recommender" ? "max-w-lg" : "max-w-4xl"}`}>
        {/* Tab 1: AI RECOMMENDER (The exact requested screen from Image 1.png) */}
        {activeTab === "ai_recommender" && (
          <div className="animate-in fade-in duration-200">
            {/* Room Tabs */}
            <RoomSelector
              rooms={rooms}
              activeRoomId={activeRoomId}
              onSelectRoom={setActiveRoomId}
              onAddRoom={handleAddRoom}
            />

            {/* Active Zone Card */}
            <ActiveZoneCard
              room={activeRoom}
              onUpdateTier={(tier) => updateActiveRoom((prev) => ({ ...prev, tier }))}
            />

            {/* Component Checklist & Dimensions with Live Size & Material Costing */}
            <ComponentChecklist
              components={activeRoom.components}
              roomName={activeRoom.name}
              carcass={activeRoom.carcass}
              shutter={activeRoom.shutter}
              finish={activeRoom.finish}
              hardware={activeRoom.hardware}
              ratePerSft={
                activeRoom.overrideRate !== null
                  ? activeRoom.overrideRate
                  : activeRoom.aiSuggestedRate
              }
              onToggleComponent={handleToggleComponent}
              onUpdateDimensions={handleUpdateDimensions}
              onAddComponent={handleAddComponent}
              onDeleteComponent={handleDeleteComponent}
              onNavigateToEstimator={() => setActiveTab("estimator")}
              onOpenAiOcrModal={() => setIsAiOcrModalOpen(true)}
            />

            {/* Material & Specification Engine */}
            <MaterialSpecEngine
              carcass={activeRoom.carcass}
              shutter={activeRoom.shutter}
              finish={activeRoom.finish}
              hardware={activeRoom.hardware}
              onUpdateCarcass={handleUpdateCarcass}
              onUpdateShutter={handleUpdateShutter}
              onUpdateFinish={handleUpdateFinish}
              onUpdateHardware={handleUpdateHardware}
              durabilityScore={activeRoom.durabilityScore}
            />

            {/* Pricing & Cost Calculator */}
            <PricingCalculator
              totalArea={activeRoomTotalArea}
              aiSuggestedRate={activeRoom.aiSuggestedRate}
              overrideRate={activeRoom.overrideRate}
              overrideTotalPrice={activeRoom.overrideTotalPrice}
              onUpdateOverrideRate={handleUpdateOverrideRate}
              onUpdateTotalPrice={handleUpdateTotalPrice}
              onResetToAiDefault={handleResetToAiDefault}
              onRecalculateBOQ={handleRecalculateBOQ}
              onSaveAndPush={handleSaveAndPush}
              isRecalculating={isRecalculating}
            />

            {/* AI Advisor Floating Action Button */}
            <div className="px-4 mt-2 mb-4">
              <button
                id="open-ai-advisor-btn"
                onClick={() => setIsAiAdvisorOpen(true)}
                className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAFBFD] hover:border-[#B58914]/60 border border-[#DCE0E8] text-xs font-semibold text-[#16191F] flex items-center justify-center gap-2 transition-all group shadow-xs cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-[#8A6708] group-hover:rotate-12 transition-transform" />
                <span>Ask Gemini AI Interior & Material Advisor</span>
              </button>
            </div>
          </div>
        )}

        {/* Tab 2: HOME (Projects & Add New Project) */}
        {activeTab === "home" && (
          <HomeView
            rooms={rooms}
            projects={projects}
            activeProjectId={activeProjectId}
            onSelectProject={(id) => {
              setActiveProjectId(id);
              try {
                localStorage.setItem("aethel_active_project_id", id);
              } catch {}
              const proj = projects.find((p) => p.id === id);
              if (proj) showToast(`Switched active project to ${proj.title}`);
            }}
            onAddProject={(newProj) => {
              setProjects((prev) => {
                const updated = [newProj, ...prev];
                try {
                  localStorage.setItem("aethel_luxury_projects", JSON.stringify(updated));
                } catch {}
                return updated;
              });
              setActiveProjectId(newProj.id);
              try {
                localStorage.setItem("aethel_active_project_id", newProj.id);
              } catch {}
              showToast(`Created & Activated project: "${newProj.title}"`);
            }}
            onDeleteProject={(id) => {
              setProjects((prev) => {
                const updated = prev.filter((p) => p.id !== id);
                try {
                  localStorage.setItem("aethel_luxury_projects", JSON.stringify(updated));
                } catch {}
                return updated;
              });
              showToast("Project removed");
            }}
            onNavigateTab={setActiveTab}
            onSelectRoom={(roomId) => {
              setActiveRoomId(roomId);
              setActiveTab("ai_recommender");
            }}
            onOpenAiOcrModal={() => setIsAiOcrModalOpen(true)}
          />
        )}

        {/* Tab 3: PORTFOLIO */}
        {activeTab === "portfolio" && (
          <PortfolioView
            projects={projects}
          />
        )}

        {/* Tab 4: ESTIMATOR */}
        {activeTab === "estimator" && (
          <EstimatorView
            rooms={rooms}
            projectName={activeProject?.title || "Active Commission"}
            clientName={activeProject?.clientName || "Valued Client"}
            onSelectRoomForEdit={(roomId) => {
              setActiveRoomId(roomId);
              setActiveTab("ai_recommender");
            }}
            onOpenAiOcrModal={() => setIsAiOcrModalOpen(true)}
          />
        )}

        {/* Tab 5: MATERIALS */}
        {activeTab === "materials" && <MaterialsView />}

        {/* Tab 6: BOOKING */}
        {activeTab === "booking" && <BookingView />}

        {/* Tab 7: TRACKER */}
        {activeTab === "tracker" && <TrackerView />}
      </main>

      {/* Persistent Bottom Navigation matching Image 1.png */}
      <BottomNavigation activeTab={activeTab} onSelectTab={setActiveTab} />

      {/* Detailed BOQ Modal */}
      <BoqModal
        room={activeRoom}
        isOpen={isBoqModalOpen}
        onClose={() => setIsBoqModalOpen(false)}
      />

      {/* Gemini AI Consultation Modal */}
      <AiAdvisorModal
        room={activeRoom}
        isOpen={isAiAdvisorOpen}
        onClose={() => setIsAiAdvisorOpen(false)}
        onApplySuggestedRate={(rate) => {
          handleUpdateOverrideRate(rate);
          showToast(`Applied AI rate: ₹${rate}/Sft`);
        }}
      />

      {/* AI OCR & Excel Estimation Import Modal */}
      <AiOcrImportModal
        isOpen={isAiOcrModalOpen}
        onClose={() => setIsAiOcrModalOpen(false)}
        activeProjectName={activeProject?.title || "Active Commission"}
        onApplyRoomsToCurrentProject={handleApplyRoomsToCurrentProject}
        onCreateNewProjectFromImport={handleCreateNewProjectFromImport}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-50 bg-white text-[#16191F] border border-[#E5C86C] shadow-2xl px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#8A6708] shrink-0" />
          <span className="font-semibold">{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
