import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Building2,
  Calendar,
  Layers,
  Calculator,
  ArrowRight,
  ShieldCheck,
  Award,
  UserCheck,
  UserPlus,
  Plus,
  Search,
  MapPin,
  FolderKanban,
  CheckCircle2,
  ChevronRight,
  Trash2,
  Edit3,
  X,
  Sliders,
  DollarSign,
  Maximize2,
  FileSpreadsheet,
} from "lucide-react";
import { RoomConfig, ArchitectEntry, PortfolioItem } from "../types";
import { NavTabId } from "../components/BottomNavigation";

const STORAGE_KEY_PROJECTS = "aethel_luxury_projects";
const STORAGE_KEY_ARCHITECTS = "aethel_luxury_architects";

const PRESET_IMAGES = [
  { label: "Luxury Penthouse Suite", url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80" },
  { label: "Modern Villa Residence", url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1200&q=80" },
  { label: "Minimalist Master Suite", url: "https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=80" },
  { label: "Bespoke Culinary Kitchen", url: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1200&q=80" },
  { label: "Contemporary Living Room", url: "https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=1200&q=80" },
];

interface HomeViewProps {
  rooms: RoomConfig[];
  projects: PortfolioItem[];
  activeProjectId: string;
  onSelectProject: (projectId: string) => void;
  onAddProject: (project: PortfolioItem) => void;
  onDeleteProject?: (projectId: string) => void;
  onNavigateTab: (tab: NavTabId) => void;
  onSelectRoom: (roomId: string) => void;
  onOpenAiOcrModal?: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  rooms,
  projects,
  activeProjectId,
  onSelectProject,
  onAddProject,
  onDeleteProject,
  onNavigateTab,
  onSelectRoom,
  onOpenAiOcrModal,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("All");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<PortfolioItem | null>(null);

  // Manual architects loaded from localStorage for assignment
  const [registeredArchitects, setRegisteredArchitects] = useState<ArchitectEntry[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARCHITECTS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setRegisteredArchitects(parsed);
      }
    } catch {
      // ignore
    }
  }, []);

  // Form State for Add New Project
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("Full Residence Interiors");
  const [newLocation, setNewLocation] = useState("");
  const [newAreaSft, setNewAreaSft] = useState(4500);
  const [newBudget, setNewBudget] = useState("₹ 35.0 Lakhs");
  const [newClientName, setNewClientName] = useState("");
  const [newArchitectId, setNewArchitectId] = useState("");
  const [newCustomArchitect, setNewCustomArchitect] = useState("");
  const [newImage, setNewImage] = useState(PRESET_IMAGES[0].url);
  const [newSpecs, setNewSpecs] = useState("BWP 710 Marine Ply, Soft-Close Hardware, High Gloss PU");

  const handleCreateProjectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    let archName = "";
    let archFirm = "";
    if (newArchitectId === "custom" && newCustomArchitect.trim()) {
      archName = newCustomArchitect.trim();
      archFirm = "Independent Studio";
    } else if (newArchitectId) {
      const found = registeredArchitects.find((a) => a.id === newArchitectId);
      if (found) {
        archName = found.name;
        archFirm = found.firm;
      }
    }

    const created: PortfolioItem = {
      id: `proj-${Date.now()}`,
      title: newTitle.trim(),
      category: newCategory,
      location: newLocation.trim() || "Gurugram, NCR",
      areaSft: Number(newAreaSft) || 3000,
      completionYear: "2026",
      image: newImage || PRESET_IMAGES[0].url,
      budgetFormatted: newBudget.trim() || "₹ 30.0 Lakhs",
      clientName: newClientName.trim() || undefined,
      status: "Active",
      keySpecs: newSpecs.split(",").map((s) => s.trim()).filter(Boolean),
      materialsUsed: ["18mm BWP 710 Marine Ply", "Hettich Soft-Close", "Anti-Scratch Acrylic"],
      architectId: newArchitectId && newArchitectId !== "custom" ? newArchitectId : undefined,
      architectName: archName || undefined,
      architectFirm: archFirm || undefined,
    };

    onAddProject(created);
    onSelectProject(created.id);
    setIsAddModalOpen(false);

    // Reset Form
    setNewTitle("");
    setNewLocation("");
    setNewAreaSft(4500);
    setNewBudget("₹ 35.0 Lakhs");
    setNewClientName("");
    setNewArchitectId("");
    setNewCustomArchitect("");
  };

  // Filter projects
  const filteredProjects = projects.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.architectName && p.architectName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (p.clientName && p.clientName.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCat = filterCategory === "All" || p.category === filterCategory;
    return matchesSearch && matchesCat;
  });

  // Aggregate project stats
  const activeProject = projects.find((p) => p.id === activeProjectId) || projects[0] || null;
  const totalProjectArea = rooms.reduce((acc, r) => {
    const activeArea = r.components
      .filter((c) => c.enabled)
      .reduce((sum, c) => sum + c.area, 0);
    return acc + activeArea;
  }, 0);

  const totalProjectCost = rooms.reduce((acc, r) => {
    const activeArea = r.components
      .filter((c) => c.enabled)
      .reduce((sum, c) => sum + c.area, 0);
    const rate = r.overrideRate !== null ? r.overrideRate : r.aiSuggestedRate;
    const roomCost = r.overrideTotalPrice !== null ? r.overrideTotalPrice : activeArea * rate;
    return acc + roomCost;
  }, 0);

  return (
    <div className="p-4 space-y-5 pb-24 max-w-4xl mx-auto">
      {/* Top Banner Header with Primary Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708] flex items-center gap-1.5">
            <Building2 className="w-3.5 h-3.5" /> AETHEL LUXURY RESIDENCES
          </span>
          <h1 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
            Projects & Commissions
          </h1>
          <p className="text-xs text-[#596171] mt-1">
            Manage architectural interior projects, configure interior zones, and compute size-based material costing.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {onOpenAiOcrModal && (
            <button
              onClick={onOpenAiOcrModal}
              className="px-3.5 py-2.5 rounded-xl bg-[#FAF5E6] hover:bg-[#F3ECCF] border border-[#E5C86C] text-xs font-semibold text-[#8A6708] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upload Excel / AI OCR</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab("estimator")}
            className="px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#DCE0E8] text-xs font-semibold text-[#16191F] flex items-center gap-1.5 shadow-2xs transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-[#8A6708]" />
            <span>Costing Estimator</span>
          </button>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>Add New Project</span>
          </button>
        </div>
      </div>

      {/* High-Level Overview Ribbon */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-2xl bg-white border border-[#E2E5EB] shadow-xs">
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Total Commissions</span>
          <span className="font-serif text-xl text-[#16191F] font-bold tabular-nums">
            {projects.length} Projects
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Active Commission</span>
          <span className="font-serif text-sm font-semibold text-[#8A6708] truncate block mt-0.5">
            {activeProject ? activeProject.title : "None"}
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Configured Sft</span>
          <span className="font-serif text-xl text-[#16191F] font-bold tabular-nums">
            {totalProjectArea} Sft
          </span>
        </div>
        <div>
          <span className="text-[11px] text-[#596171] block font-medium">Active Room BOQ</span>
          <span className="font-serif text-xl text-[#8A6708] font-bold tabular-nums">
            ₹{new Intl.NumberFormat("en-IN").format(totalProjectCost)}
          </span>
        </div>
      </div>

      {/* Prominent Direct Notice & Costing Estimator Launchpad */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-[#FDF8E7] to-white border border-[#E5C86C] shadow-2xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#E0B638] text-[#1A1D24] flex items-center justify-center font-bold shadow-2xs shrink-0">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-[#8A6708] block">
              REAL-TIME COSTING ENGINE
            </span>
            <h3 className="font-serif text-sm md:text-base font-semibold text-[#16191F]">
              Costing Estimator based on Size & Material for Each Category
            </h3>
            <p className="text-[11px] text-[#596171] mt-0.5">
              Instant breakdown for Wardrobes, Dressers, Beds, TV units, & Kitchens priced by dimensions and material grades.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {onOpenAiOcrModal && (
            <button
              onClick={onOpenAiOcrModal}
              className="px-3.5 py-2 rounded-xl bg-white hover:bg-[#F7F8FA] border border-[#E5C86C] text-[#8A6708] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Upload Excel Takeoff</span>
            </button>
          )}

          <button
            onClick={() => onNavigateTab("estimator")}
            className="px-4 py-2 rounded-xl bg-[#16191F] hover:bg-[#252932] text-white text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            <span>Open Costing Estimator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Search and Category Filters */}
      <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#7E8794] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search projects by title, location, client, or architect..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-white border border-[#DCE0E8] rounded-xl text-xs text-[#16191F] placeholder-[#7E8794] focus:border-[#D4AF37]"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {["All", "Full Residence Interiors", "Master Suite & Wardrobes", "Culinary Suite", "Villa Interior"].map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-all cursor-pointer ${
                filterCategory === cat
                  ? "bg-[#E0B638] text-[#1A1D24] font-semibold shadow-2xs"
                  : "bg-white border border-[#DCE0E8] text-[#596171] hover:text-[#16191F]"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredProjects.map((project) => {
          const isActive = project.id === activeProjectId;

          return (
            <div
              key={project.id}
              className={`rounded-2xl border transition-all overflow-hidden bg-white flex flex-col justify-between ${
                isActive
                  ? "border-[#E0B638] ring-1 ring-[#E0B638] shadow-sm"
                  : "border-[#E2E5EB] hover:border-[#CBD0DC] shadow-xs"
              }`}
            >
              <div>
                {/* Image header with category pill and active badge */}
                <div className="relative h-44 w-full overflow-hidden bg-[#E5E8EE]">
                  <img
                    src={project.image}
                    alt={project.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                  <div className="absolute top-3 left-3 flex items-center gap-1.5">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-white/95 text-[#16191F] backdrop-blur-md shadow-xs">
                      {project.category}
                    </span>
                    {isActive && (
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-[#E0B638] text-[#1A1D24] shadow-xs">
                        Active Commission
                      </span>
                    )}
                  </div>

                  {/* Top-Right Card Actions */}
                  <div className="absolute top-3 right-3 flex items-center gap-1.5">
                    {onDeleteProject && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setProjectToDelete(project);
                        }}
                        className="p-1.5 rounded-full bg-black/55 hover:bg-red-600 text-white/90 hover:text-white backdrop-blur-md transition-all cursor-pointer shadow-xs group"
                        title={`Delete project "${project.title}"`}
                        aria-label={`Delete project ${project.title}`}
                      >
                        <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                      </button>
                    )}
                  </div>

                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                    <span className="text-xs font-semibold flex items-center gap-1 drop-shadow-xs">
                      <MapPin className="w-3.5 h-3.5 text-[#E0B638]" />
                      {project.location}
                    </span>
                    <span className="text-xs font-bold font-serif bg-black/40 px-2 py-0.5 rounded backdrop-blur-xs">
                      {project.budgetFormatted}
                    </span>
                  </div>
                </div>

                {/* Body Content */}
                <div className="p-4 space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-serif text-lg font-semibold text-[#16191F]">
                        {project.title}
                      </h3>
                      {project.clientName && (
                        <span className="text-xs text-[#596171] block mt-0.5">
                          Client: {project.clientName}
                        </span>
                      )}
                    </div>
                    <span className="text-xs font-bold text-[#8A6708] bg-[#FDF8E7] border border-[#E5C86C] px-2 py-0.5 rounded-lg tabular-nums shrink-0">
                      {project.areaSft} Sft
                    </span>
                  </div>

                  {/* Architect Info */}
                  <div className="p-2.5 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-md bg-white border border-[#DCE0E8] text-[#8A6708] flex items-center justify-center shrink-0">
                        <Building2 className="w-3 h-3" />
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-[#7E8794] block">Lead Architect</span>
                        {project.architectName ? (
                          <span className="font-semibold text-[#16191F]">
                            {project.architectName} {project.architectFirm && `(${project.architectFirm})`}
                          </span>
                        ) : (
                          <span className="text-[#7E8794] italic text-[11px]">Manual Entry Pending</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={() => onNavigateTab("portfolio")}
                      className="text-[11px] font-semibold text-[#8A6708] hover:underline cursor-pointer"
                    >
                      {project.architectName ? "Directory →" : "+ Assign"}
                    </button>
                  </div>

                  {/* Key specs pills */}
                  {project.keySpecs && project.keySpecs.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {project.keySpecs.slice(0, 3).map((spec, i) => (
                        <span key={i} className="text-[10px] px-2 py-0.5 bg-[#F1F3F6] text-[#596171] rounded-md font-medium">
                          {spec}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons Footer */}
              <div className="p-3 bg-[#FAFBFD] border-t border-[#E5E8EE] flex items-center justify-between gap-2">
                {!isActive ? (
                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE0E8] hover:border-[#E0B638] text-xs font-semibold text-[#16191F] transition-colors cursor-pointer shadow-2xs"
                  >
                    Set as Active
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-[#8A6708] flex items-center gap-1 px-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Active Project
                  </span>
                )}

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                      onNavigateTab("estimator");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-white border border-[#E5C86C] hover:bg-[#FDF8E7] text-xs font-semibold text-[#8A6708] flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Calculator className="w-3 h-3" />
                    <span>Costing Estimator</span>
                  </button>

                  <button
                    onClick={() => {
                      onSelectProject(project.id);
                      onNavigateTab("ai_recommender");
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                  >
                    <span>Configure</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>

                  {onDeleteProject && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setProjectToDelete(project);
                      }}
                      className="p-1.5 rounded-lg bg-white border border-[#DCE0E8] hover:border-red-300 hover:bg-red-50 text-[#7E8794] hover:text-red-600 transition-colors cursor-pointer shadow-2xs"
                      title={`Delete "${project.title}"`}
                      aria-label="Delete project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="p-8 rounded-2xl bg-white border border-dashed border-[#DCE0E8] text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-[#F7F8FA] text-[#7E8794] flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-serif text-base font-semibold text-[#16191F]">No Matching Projects</h4>
            <p className="text-xs text-[#596171] mt-1">
              Adjust your search filter or click "+ Add New Project" to register your commission.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-[#E0B638] text-[#1A1D24] text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add New Project</span>
          </button>
        </div>
      )}

      {/* MODAL: ADD NEW PROJECT */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl border border-[#E2E5EB] max-w-lg w-full max-h-[90vh] overflow-y-auto p-5 shadow-xl space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#E5E8EE] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708]">
                  NEW RESIDENTIAL COMMISSION
                </span>
                <h3 className="font-serif text-lg font-semibold text-[#16191F]">
                  Add Project to Registry
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 rounded-lg text-[#7E8794] hover:text-[#16191F] hover:bg-[#F1F3F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProjectSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block text-[#596171] font-semibold mb-1">
                  Project Title / Residence Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. The Magnolias Sky Villa, Oberoi Three Sixty Penthouse"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F] focus:border-[#D4AF37]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Project Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  >
                    <option>Full Residence Interiors</option>
                    <option>Master Suite & Wardrobes</option>
                    <option>Culinary Suite</option>
                    <option>Villa Interior</option>
                    <option>Penthouse Duplex</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Client Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Vikramaditya Singhania"
                    value={newClientName}
                    onChange={(e) => setNewClientName(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Site Location & City
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Golf Course Road, Gurugram"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  />
                </div>

                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Carpet / Interior Area (Sft)
                  </label>
                  <input
                    type="number"
                    value={newAreaSft}
                    onChange={(e) => setNewAreaSft(Number(e.target.value) || 0)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F] tabular-nums"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Target BOQ Budget
                  </label>
                  <input
                    type="text"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    placeholder="e.g. ₹ 35.0 Lakhs"
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  />
                </div>

                <div>
                  <label className="block text-[#596171] font-semibold mb-1 flex items-center justify-between">
                    <span>Lead Architect</span>
                    <span className="text-[10px] text-[#7E8794]">Manual Entry</span>
                  </label>
                  <select
                    value={newArchitectId}
                    onChange={(e) => setNewArchitectId(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  >
                    <option value="">Unassigned (Assign Later)</option>
                    {registeredArchitects.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name} — {a.firm}
                      </option>
                    ))}
                    <option value="custom">+ Enter Architect Name Manually...</option>
                  </select>
                </div>
              </div>

              {newArchitectId === "custom" && (
                <div>
                  <label className="block text-[#596171] font-semibold mb-1">
                    Architect Name & Practice
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ar. Sunita Singhania (Singhania Architects)"
                    value={newCustomArchitect}
                    onChange={(e) => setNewCustomArchitect(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                  />
                </div>
              )}

              {/* Cover Image Presets */}
              <div>
                <label className="block text-[#596171] font-semibold mb-1.5">
                  Select Visual Vignette Cover
                </label>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {PRESET_IMAGES.map((preset, idx) => (
                    <div
                      key={idx}
                      onClick={() => setNewImage(preset.url)}
                      className={`relative rounded-lg overflow-hidden h-14 border cursor-pointer transition-all ${
                        newImage === preset.url
                          ? "border-[#E0B638] ring-2 ring-[#E0B638]"
                          : "border-[#E2E5EB] opacity-70 hover:opacity-100"
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-[#596171] font-semibold mb-1">
                  Key Interior Specs (Comma-separated)
                </label>
                <input
                  type="text"
                  value={newSpecs}
                  onChange={(e) => setNewSpecs(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl px-3 py-2 text-xs text-[#16191F]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#E5E8EE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DCE0E8] text-xs font-semibold text-[#596171] hover:bg-[#F7F8FA]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold shadow-2xs cursor-pointer"
                >
                  Create & Activate Project
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Delete Commission Confirmation Modal */}
      {projectToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full border border-[#E2E5EB] shadow-2xl p-5 space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center shrink-0 shadow-2xs">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-[#16191F]">
                  Delete Commission?
                </h3>
                <p className="text-xs text-[#596171]">
                  This action will permanently delete this project from your records.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#596171] font-medium">Commission Title:</span>
                <span className="font-semibold text-[#16191F]">{projectToDelete.title}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#596171] font-medium">Location:</span>
                <span className="text-[#16191F]">{projectToDelete.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#596171] font-medium">Category:</span>
                <span className="text-[#16191F]">{projectToDelete.category}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#596171] font-medium">Execution Budget:</span>
                <span className="font-bold text-[#8A6708]">{projectToDelete.budgetFormatted}</span>
              </div>
              {projectToDelete.id === activeProjectId && (
                <div className="mt-2 pt-2 border-t border-[#E2E5EB] text-[#8A6708] font-medium flex items-center gap-1.5 text-[11px]">
                  <span className="w-2 h-2 rounded-full bg-[#E0B638] shrink-0" />
                  <span>This is your active commission. Another commission will be automatically selected.</span>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setProjectToDelete(null)}
                className="px-4 py-2 rounded-xl border border-[#DCE0E8] text-xs font-semibold text-[#596171] hover:bg-[#F7F8FA] hover:text-[#16191F] transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteProject) {
                    onDeleteProject(projectToDelete.id);
                  }
                  setProjectToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Project</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
