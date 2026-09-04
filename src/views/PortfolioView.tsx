import React, { useState, useEffect } from "react";
import { PORTFOLIO_PROJECTS } from "../data/initialData";
import {
  MapPin,
  Calendar,
  Check,
  Building2,
  UserCheck,
  Plus,
  Trash2,
  Edit3,
  Phone,
  Mail,
  Briefcase,
  Layers,
  Sparkles,
  Search,
  UserPlus,
  FolderKanban,
  X,
  Compass,
} from "lucide-react";
import { PortfolioItem, ArchitectEntry } from "../types";

const STORAGE_KEY_ARCHITECTS = "aethel_luxury_architects";
const STORAGE_KEY_PROJECTS = "aethel_luxury_projects";

interface PortfolioViewProps {
  architects?: ArchitectEntry[];
  projects?: PortfolioItem[];
  onAddArchitect?: (architect: Omit<ArchitectEntry, "id">) => void;
  onUpdateArchitect?: (architect: ArchitectEntry) => void;
  onDeleteArchitect?: (id: string) => void;
  onAssignArchitect?: (projectId: string, architectId: string | null) => void;
}

export const PortfolioView: React.FC<PortfolioViewProps> = ({
  architects: propArchitects,
  projects: propProjects,
  onAddArchitect: propOnAdd,
  onUpdateArchitect: propOnUpdate,
  onDeleteArchitect: propOnDelete,
  onAssignArchitect: propOnAssign,
}) => {
  // Local state initialized with empty architects (existing ones removed)
  const [localArchitects, setLocalArchitects] = useState<ArchitectEntry[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_ARCHITECTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    // Remove existing ones: start strictly empty so user can do entry manually
    return [];
  });

  const [localProjects, setLocalProjects] = useState<PortfolioItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_PROJECTS);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return PORTFOLIO_PROJECTS;
  });

  // Effective state
  const architects = propArchitects ?? localArchitects;
  const projects = propProjects ?? localProjects;

  // View mode: 'projects' or 'architects'
  const [activeTab, setActiveTab] = useState<"projects" | "architects">("projects");

  // Filter & search
  const [searchQuery, setSearchQuery] = useState("");

  // Modals
  const [selectedProject, setSelectedProject] = useState<PortfolioItem | null>(null);
  const [isArchitectModalOpen, setIsArchitectModalOpen] = useState(false);
  const [editingArchitect, setEditingArchitect] = useState<ArchitectEntry | null>(null);
  const [assigningProjectId, setAssigningProjectId] = useState<string | null>(null);

  // Form inputs for Architect Manual Entry
  const [formName, setFormName] = useState("");
  const [formFirm, setFormFirm] = useState("");
  const [formRole, setFormRole] = useState("Lead Principal Architect");
  const [formProjectId, setFormProjectId] = useState("all");
  const [formPhone, setFormPhone] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formCity, setFormCity] = useState("Gurugram");
  const [formCoaNumber, setFormCoaNumber] = useState("");
  const [formNotes, setFormNotes] = useState("");
  const [formError, setFormError] = useState("");

  // Persist local changes
  useEffect(() => {
    if (!propArchitects) {
      try {
        localStorage.setItem(STORAGE_KEY_ARCHITECTS, JSON.stringify(localArchitects));
      } catch {
        // ignore
      }
    }
  }, [localArchitects, propArchitects]);

  useEffect(() => {
    if (!propProjects) {
      try {
        localStorage.setItem(STORAGE_KEY_PROJECTS, JSON.stringify(localProjects));
      } catch {
        // ignore
      }
    }
  }, [localProjects, propProjects]);

  // Open modal for new entry
  const handleOpenNewModal = (preselectedProjectId?: string) => {
    setEditingArchitect(null);
    setFormName("");
    setFormFirm("");
    setFormRole("Lead Principal Architect");
    setFormProjectId(preselectedProjectId || "all");
    setFormPhone("");
    setFormEmail("");
    setFormCity("Gurugram");
    setFormCoaNumber("");
    setFormNotes("");
    setFormError("");
    setIsArchitectModalOpen(true);
  };

  // Open modal for editing
  const handleOpenEditModal = (arch: ArchitectEntry) => {
    setEditingArchitect(arch);
    setFormName(arch.name);
    setFormFirm(arch.firm);
    setFormRole(arch.role);
    setFormProjectId(arch.projectId || "all");
    setFormPhone(arch.phone || "");
    setFormEmail(arch.email || "");
    setFormCity(arch.city || "");
    setFormCoaNumber(arch.coaNumber || "");
    setFormNotes(arch.notes || "");
    setFormError("");
    setIsArchitectModalOpen(true);
  };

  // Save manual entry
  const handleSaveArchitect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setFormError("Architect Name is required.");
      return;
    }
    if (!formFirm.trim()) {
      setFormError("Architecture Firm / Studio Name is required.");
      return;
    }

    const assignedProj = projects.find((p) => p.id === formProjectId);
    const projectName = assignedProj ? assignedProj.title : formProjectId === "all" ? "All Projects / General" : undefined;

    if (editingArchitect) {
      const updated: ArchitectEntry = {
        ...editingArchitect,
        name: formName.trim(),
        firm: formFirm.trim(),
        role: formRole.trim(),
        projectId: formProjectId === "all" ? undefined : formProjectId,
        projectName,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        city: formCity.trim() || undefined,
        coaNumber: formCoaNumber.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      if (propOnUpdate) {
        propOnUpdate(updated);
      } else {
        setLocalArchitects((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
        // Also update projects if associated
        if (formProjectId && formProjectId !== "all") {
          setLocalProjects((prev) =>
            prev.map((p) =>
              p.id === formProjectId
                ? { ...p, architectId: updated.id, architectName: updated.name, architectFirm: updated.firm }
                : p
            )
          );
        }
      }
    } else {
      const newEntry: ArchitectEntry = {
        id: `arch-${Date.now()}`,
        name: formName.trim(),
        firm: formFirm.trim(),
        role: formRole.trim(),
        projectId: formProjectId === "all" ? undefined : formProjectId,
        projectName,
        phone: formPhone.trim() || undefined,
        email: formEmail.trim() || undefined,
        city: formCity.trim() || undefined,
        coaNumber: formCoaNumber.trim() || undefined,
        notes: formNotes.trim() || undefined,
      };

      if (propOnAdd) {
        propOnAdd(newEntry);
      } else {
        setLocalArchitects((prev) => [newEntry, ...prev]);
        if (formProjectId && formProjectId !== "all") {
          setLocalProjects((prev) =>
            prev.map((p) =>
              p.id === formProjectId
                ? { ...p, architectId: newEntry.id, architectName: newEntry.name, architectFirm: newEntry.firm }
                : p
            )
          );
        }
      }
    }

    setIsArchitectModalOpen(false);
  };

  // Delete manual entry
  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to remove this architect entry?")) {
      if (propOnDelete) {
        propOnDelete(id);
      } else {
        setLocalArchitects((prev) => prev.filter((a) => a.id !== id));
        setLocalProjects((prev) =>
          prev.map((p) =>
            p.architectId === id
              ? { ...p, architectId: undefined, architectName: undefined, architectFirm: undefined }
              : p
          )
        );
      }
    }
  };

  // Assign architect to project
  const handleAssignToProject = (projectId: string, architectId: string | null) => {
    if (propOnAssign) {
      propOnAssign(projectId, architectId);
    } else {
      const arch = architects.find((a) => a.id === architectId);
      setLocalProjects((prev) =>
        prev.map((p) =>
          p.id === projectId
            ? {
                ...p,
                architectId: architectId || undefined,
                architectName: arch ? arch.name : undefined,
                architectFirm: arch ? arch.firm : undefined,
              }
            : p
        )
      );
      if (arch) {
        setLocalArchitects((prev) =>
          prev.map((a) =>
            a.id === arch.id
              ? {
                  ...a,
                  projectId,
                  projectName: projects.find((pr) => pr.id === projectId)?.title,
                }
              : a
          )
        );
      }
    }
    setAssigningProjectId(null);
  };

  // Filtered architects
  const filteredArchitects = architects.filter((a) => {
    const q = searchQuery.toLowerCase();
    return (
      a.name.toLowerCase().includes(q) ||
      a.firm.toLowerCase().includes(q) ||
      a.role.toLowerCase().includes(q) ||
      (a.city && a.city.toLowerCase().includes(q)) ||
      (a.projectName && a.projectName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="p-4 space-y-5 pb-20 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-1">
        <div>
          <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708]">
            PROJECTS & ARCHITECT ROSTER
          </span>
          <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
            Architectural Projects & Directory
          </h2>
          <p className="text-xs text-[#596171] mt-1">
            Manage your bespoke residential commissions, assign lead architects, and maintain clean manual entries.
          </p>
        </div>

        <button
          onClick={() => handleOpenNewModal()}
          className="self-start md:self-auto px-4 py-2.5 rounded-xl bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add Architect Manually</span>
        </button>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-[#E2E5EB] pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("projects")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "projects"
                ? "bg-white text-[#16191F] border border-[#E2E5EB] shadow-xs"
                : "text-[#596171] hover:text-[#16191F] hover:bg-white/50"
            }`}
          >
            <FolderKanban className="w-3.5 h-3.5 text-[#8A6708]" />
            <span>Projects Showcase</span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#F7F8FA] border border-[#E2E5EB] text-[#596171]">
              {projects.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("architects")}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "architects"
                ? "bg-white text-[#16191F] border border-[#E2E5EB] shadow-xs"
                : "text-[#596171] hover:text-[#16191F] hover:bg-white/50"
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-[#8A6708]" />
            <span>Architects Directory</span>
            <span
              className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                architects.length > 0
                  ? "bg-[#FDF8E7] text-[#8A6708] border border-[#E5C86C]"
                  : "bg-[#F7F8FA] text-[#7E8794] border border-[#E2E5EB]"
              }`}
            >
              {architects.length}
            </span>
          </button>
        </div>
      </div>

      {/* VIEW 1: PROJECTS SHOWCASE */}
      {activeTab === "projects" && (
        <div className="space-y-6">
          {projects.map((proj) => {
            // Find assigned architect
            const assignedArchitect = architects.find(
              (a) => a.id === proj.architectId || a.projectId === proj.id
            );

            return (
              <div
                key={proj.id}
                className="rounded-2xl bg-white border border-[#E2E5EB] overflow-hidden hover:border-[#B58914]/40 transition-all shadow-xs"
              >
                {/* Project Image */}
                <div className="relative h-64 md:h-80 w-full overflow-hidden bg-[#E2E5EB]">
                  <img
                    src={proj.image}
                    alt={proj.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />
                  <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-[#E2E5EB] text-[11px] font-semibold text-[#8A6708] shadow-xs">
                    {proj.category}
                  </div>
                  <div className="absolute bottom-3 left-4 right-4 flex items-end justify-between">
                    <div>
                      <h3 className="font-serif text-xl md:text-2xl text-white font-medium drop-shadow-md">
                        {proj.title}
                      </h3>
                      <div className="flex items-center gap-3 text-xs text-white/90 mt-1 drop-shadow-sm">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5 text-[#E0B638]" />
                          {proj.location}
                        </span>
                        <span>·</span>
                        <span>{proj.areaSft} Sft</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-white/80 block">Execution Budget</span>
                      <span className="font-serif text-base md:text-lg font-bold text-[#F3CD57] tabular-nums drop-shadow-sm">
                        {proj.budgetFormatted}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Project Details & Assigned Architect */}
                <div className="p-4 space-y-3.5">
                  {/* Assigned Architect Card */}
                  <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-white border border-[#DCE0E8] text-[#8A6708] flex items-center justify-center shrink-0 shadow-2xs">
                        <Building2 className="w-4 h-4" />
                      </div>
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6708] block">
                          Lead Architect & Design Studio
                        </span>
                        {assignedArchitect ? (
                          <div className="mt-0.5">
                            <span className="font-serif text-sm font-semibold text-[#16191F]">
                              {assignedArchitect.name}
                            </span>
                            <span className="text-xs text-[#596171] ml-2 font-medium">
                              — {assignedArchitect.firm}
                            </span>
                            <span className="text-[10px] ml-2 px-2 py-0.5 rounded bg-white border border-[#E2E5EB] text-[#8A6708] font-semibold">
                              {assignedArchitect.role}
                            </span>
                          </div>
                        ) : proj.architectName ? (
                          <div className="mt-0.5">
                            <span className="font-serif text-sm font-semibold text-[#16191F]">
                              {proj.architectName}
                            </span>
                            {proj.architectFirm && (
                              <span className="text-xs text-[#596171] ml-2">
                                — {proj.architectFirm}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-[#7E8794] italic mt-0.5 block">
                            No architect assigned yet. You can add or link one manually.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-start md:self-center shrink-0">
                      {assignedArchitect ? (
                        <>
                          {assignedArchitect.phone && (
                            <a
                              href={`tel:${assignedArchitect.phone}`}
                              className="p-1.5 rounded-lg bg-white hover:bg-[#FAFBFD] border border-[#DCE0E8] text-[#596171] hover:text-[#16191F] text-xs flex items-center gap-1 shadow-2xs"
                              title="Call Architect"
                            >
                              <Phone className="w-3.5 h-3.5 text-[#8A6708]" />
                              <span className="hidden sm:inline">{assignedArchitect.phone}</span>
                            </a>
                          )}
                          <button
                            onClick={() => handleOpenEditModal(assignedArchitect)}
                            className="px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#FAFBFD] border border-[#DCE0E8] text-[#16191F] text-xs font-medium flex items-center gap-1 shadow-2xs cursor-pointer"
                          >
                            <Edit3 className="w-3.5 h-3.5 text-[#8A6708]" />
                            <span>Edit Entry</span>
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => setAssigningProjectId(proj.id)}
                          className="px-3 py-1.5 rounded-lg bg-white hover:bg-[#FAFBFD] border border-[#DCE0E8] text-[#8A6708] hover:border-[#8A6708] text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition-all"
                        >
                          <UserPlus className="w-3.5 h-3.5" />
                          <span>Assign Architect</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Architectural Specifications */}
                  <div>
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#596171] block mb-1.5">
                      Architectural Specifications
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {proj.keySpecs.map((spec, i) => (
                        <span
                          key={i}
                          className="text-xs px-2.5 py-1 rounded-lg bg-[#F7F8FA] border border-[#E2E5EB] text-[#16191F] font-medium"
                        >
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E5E8EE] flex items-center justify-between text-xs text-[#596171]">
                    <span>Delivered in {proj.completionYear} · 15-Year Structural Dossier</span>
                    <button
                      onClick={() => setSelectedProject(proj)}
                      className="text-[#8A6708] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                    >
                      View Material Schedule
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW 2: ARCHITECTS DIRECTORY (MANUAL ENTRY REPOSITORY) */}
      {activeTab === "architects" && (
        <div className="space-y-4">
          {/* Search bar & count */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#7E8794] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search architects by name, firm, role, or project..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white border border-[#DCE0E8] rounded-xl pl-9 pr-3 py-2 text-xs text-[#16191F] focus:border-[#D4AF37] shadow-2xs"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-[#7E8794] hover:text-[#16191F]"
                >
                  Clear
                </button>
              )}
            </div>

            <button
              onClick={() => handleOpenNewModal()}
              className="px-3.5 py-2 rounded-xl bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Architect Entry</span>
            </button>
          </div>

          {/* If No Architects: Empty State */}
          {filteredArchitects.length === 0 ? (
            <div className="p-8 rounded-2xl bg-white border border-[#E2E5EB] text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-2xl bg-[#FDF8E7] border border-[#E5C86C] text-[#8A6708] flex items-center justify-center mx-auto shadow-2xs">
                <Compass className="w-7 h-7 stroke-[1.5]" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="font-serif text-lg text-[#16191F] font-semibold">
                  {searchQuery ? "No matching architects found" : "No Architects Registered Yet"}
                </h3>
                <p className="text-xs text-[#596171] mt-1.5 leading-relaxed">
                  {searchQuery
                    ? "Try adjusting your search query or reset the filter."
                    : "All default architect listings have been removed as requested. You can now manually enter your designated architects, design firms, and consultant partners below."}
                </p>
              </div>
              <div>
                <button
                  onClick={() => handleOpenNewModal()}
                  className="px-4 py-2.5 bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-2"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Add First Architect Manually</span>
                </button>
              </div>
            </div>
          ) : (
            /* Architects Grid */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredArchitects.map((arch) => (
                <div
                  key={arch.id}
                  className="p-4 rounded-2xl bg-white border border-[#E2E5EB] hover:border-[#B58914]/40 transition-all shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6708] block">
                          {arch.firm}
                        </span>
                        <h3 className="font-serif text-base text-[#16191F] font-semibold leading-snug">
                          {arch.name}
                        </h3>
                      </div>
                      <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-[#FDF8E7] text-[#8A6708] border border-[#E5C86C] font-semibold shrink-0">
                        {arch.role}
                      </span>
                    </div>

                    {/* Associated Project Tag */}
                    <div className="mb-2">
                      <span className="text-[11px] text-[#596171]">
                        Project:{" "}
                        <strong className="text-[#16191F]">
                          {arch.projectName || "General Atelier Consultant"}
                        </strong>
                      </span>
                    </div>

                    {/* Notes if any */}
                    {arch.notes && (
                      <p className="text-xs text-[#596171] bg-[#F7F8FA] p-2 rounded-lg border border-[#E2E5EB] mb-2 leading-relaxed">
                        {arch.notes}
                      </p>
                    )}

                    {/* Meta info */}
                    <div className="space-y-1 text-xs text-[#596171] pt-1">
                      {arch.city && (
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#8A6708]" />
                          <span>{arch.city}</span>
                        </div>
                      )}
                      {arch.coaNumber && (
                        <div className="flex items-center gap-1.5 text-[11px]">
                          <span className="text-[#7E8794]">COA Reg:</span>
                          <span className="font-mono text-[#16191F] font-medium">{arch.coaNumber}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Footer */}
                  <div className="pt-3 border-t border-[#E5E8EE] flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {arch.phone && (
                        <a
                          href={`tel:${arch.phone}`}
                          className="p-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF1F5] text-[#596171] hover:text-[#16191F] border border-[#E2E5EB]"
                          title="Call"
                        >
                          <Phone className="w-3.5 h-3.5 text-[#8A6708]" />
                        </a>
                      )}
                      {arch.email && (
                        <a
                          href={`mailto:${arch.email}`}
                          className="p-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF1F5] text-[#596171] hover:text-[#16191F] border border-[#E2E5EB]"
                          title="Email"
                        >
                          <Mail className="w-3.5 h-3.5 text-[#8A6708]" />
                        </a>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => handleOpenEditModal(arch)}
                        className="px-2.5 py-1.5 rounded-lg bg-[#F7F8FA] hover:bg-[#EEF1F5] text-[#16191F] text-xs font-semibold flex items-center gap-1 border border-[#E2E5EB] cursor-pointer"
                        title="Edit Entry"
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#8A6708]" />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(arch.id)}
                        className="p-1.5 rounded-lg bg-[#F7F8FA] hover:bg-red-50 text-[#7E8794] hover:text-red-600 border border-[#E2E5EB] cursor-pointer transition-colors"
                        title="Delete Architect"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ARCHITECT MANUAL ENTRY & EDIT */}
      {isArchitectModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5EB] rounded-2xl p-5 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-[#E5E8EE] pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708]">
                  MANUAL ARCHITECT ENTRY
                </span>
                <h3 className="font-serif text-lg text-[#16191F] font-semibold">
                  {editingArchitect ? "Edit Architect Details" : "Register Project Architect"}
                </h3>
              </div>
              <button
                onClick={() => setIsArchitectModalOpen(false)}
                className="p-1 rounded-lg text-[#7E8794] hover:text-[#16191F] hover:bg-[#F1F3F6]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-2.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveArchitect} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Name */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Architect Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Ar. Ritu Sehgal"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>

                {/* Firm */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Architecture Firm / Studio *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Studio Lotus / Morphogenesis"
                    value={formFirm}
                    onChange={(e) => setFormFirm(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Role */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Designation / Role
                  </label>
                  <select
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  >
                    <option>Lead Principal Architect</option>
                    <option>Principal Architect</option>
                    <option>Lead Interior Architect</option>
                    <option>Senior Project Associate</option>
                    <option>Turnkey Joinery Consultant</option>
                    <option>Landscape & Facade Specialist</option>
                  </select>
                </div>

                {/* Project Assignment */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Assign to Project
                  </label>
                  <select
                    value={formProjectId}
                    onChange={(e) => setFormProjectId(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  >
                    <option value="all">General / All Projects</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Phone */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Direct Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98201 XXXXX"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="architect@studio.com"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* City */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    City / Practice Location
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Gurugram / New Delhi"
                    value={formCity}
                    onChange={(e) => setFormCity(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>

                {/* COA License */}
                <div>
                  <label className="block text-[#596171] mb-1 font-semibold">
                    COA / License Registration No. (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., CA/2019/84920"
                    value={formCoaNumber}
                    onChange={(e) => setFormCoaNumber(e.target.value)}
                    className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[#596171] mb-1 font-semibold">
                  Architectural Scope & Joinery Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g., Overseeing bespoke walk-in wardrobe engineering and acoustic wall paneling."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-[#16191F] focus:border-[#D4AF37]"
                />
              </div>

              <div className="pt-3 border-t border-[#E5E8EE] flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsArchitectModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-white border border-[#DCE0E8] text-[#596171] hover:text-[#16191F] text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] text-xs font-semibold shadow-xs cursor-pointer"
                >
                  {editingArchitect ? "Update Architect" : "Save Architect Entry"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSIGN ARCHITECT QUICK PICKER */}
      {assigningProjectId && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5EB] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 animate-in fade-in">
            <div className="flex items-start justify-between border-b border-[#E5E8EE] pb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708]">
                  ASSIGN ARCHITECT
                </span>
                <h3 className="font-serif text-base text-[#16191F] font-semibold">
                  {projects.find((p) => p.id === assigningProjectId)?.title}
                </h3>
              </div>
              <button
                onClick={() => setAssigningProjectId(null)}
                className="text-xs text-[#7E8794] hover:text-[#16191F]"
              >
                Close
              </button>
            </div>

            <div className="space-y-2">
              <span className="text-xs text-[#596171] block font-medium">
                Choose from registered architects or add a new entry:
              </span>

              {architects.length === 0 ? (
                <div className="p-4 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] text-center space-y-2">
                  <p className="text-xs text-[#596171]">No registered architects available yet.</p>
                  <button
                    onClick={() => {
                      const projId = assigningProjectId;
                      setAssigningProjectId(null);
                      handleOpenNewModal(projId);
                    }}
                    className="px-3 py-1.5 rounded-lg bg-[#E0B638] text-[#1A1D24] text-xs font-semibold cursor-pointer shadow-2xs"
                  >
                    + Enter Architect Manually
                  </button>
                </div>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {architects.map((arch) => (
                    <div
                      key={arch.id}
                      onClick={() => handleAssignToProject(assigningProjectId, arch.id)}
                      className="p-3 rounded-xl bg-[#F7F8FA] hover:bg-[#FAFBFD] border border-[#E2E5EB] hover:border-[#8A6708] text-xs cursor-pointer flex items-center justify-between transition-all"
                    >
                      <div>
                        <span className="font-semibold text-[#16191F] block">{arch.name}</span>
                        <span className="text-[#596171] text-[11px] block">{arch.firm} · {arch.role}</span>
                      </div>
                      <span className="text-[11px] font-semibold text-[#8A6708]">Assign</span>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const projId = assigningProjectId;
                      setAssigningProjectId(null);
                      handleOpenNewModal(projId);
                    }}
                    className="w-full py-2 rounded-xl border border-dashed border-[#DCE0E8] hover:border-[#8A6708] text-[#8A6708] text-xs font-semibold text-center cursor-pointer block"
                  >
                    + Add New Architect Entry
                  </button>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setAssigningProjectId(null)}
                className="px-4 py-2 rounded-lg bg-[#F7F8FA] text-xs font-semibold text-[#596171]"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: MATERIAL SCHEDULE */}
      {selectedProject && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5EB] rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708]">
                  PROJECT DOSSIER
                </span>
                <h3 className="font-serif text-lg text-[#16191F] font-medium">
                  {selectedProject.title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProject(null)}
                className="text-xs text-[#7E8794] hover:text-[#16191F]"
              >
                Close
              </button>
            </div>

            <div>
              <span className="text-xs text-[#596171] block mb-2 font-medium">
                Certified Materials & Mechanisms Used:
              </span>
              <ul className="space-y-2 text-xs text-[#16191F]">
                {selectedProject.materialsUsed.map((mat, idx) => (
                  <li key={idx} className="flex items-center gap-2 p-2 rounded-lg bg-[#F7F8FA] border border-[#E2E5EB]">
                    <Check className="w-3.5 h-3.5 text-[#8A6708]" />
                    <span>{mat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => setSelectedProject(null)}
              className="w-full py-2 bg-[#E0B638] text-[#1A1D24] font-semibold text-xs rounded-lg hover:bg-[#D4AC2D] transition-colors shadow-2xs cursor-pointer"
            >
              Back to Projects
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
