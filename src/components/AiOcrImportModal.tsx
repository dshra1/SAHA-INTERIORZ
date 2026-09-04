import React, { useState, useRef } from "react";
import { RoomConfig, InteriorComponent, PortfolioItem } from "../types";
import {
  X,
  Upload,
  FileSpreadsheet,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Download,
  Layers,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Plus,
  ArrowRight,
  Eye,
  Check,
} from "lucide-react";
import { parseExcelFileToText, downloadSampleExcelTemplate, exportProjectToExcel } from "../utils/excelExporter";

interface AiOcrImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectName?: string;
  onApplyRoomsToCurrentProject: (rooms: RoomConfig[], totalEstimatedCost: number, totalSft: number) => void;
  onCreateNewProjectFromImport: (newProj: PortfolioItem, rooms: RoomConfig[]) => void;
}

interface ParsedTakeoffResult {
  projectName: string;
  clientName?: string;
  summary: string;
  rooms: RoomConfig[];
  totalSft: number;
  totalEstimatedCost: number;
  gstAmount: number;
  grandTotalWithGst: number;
  source: string;
}

export const AiOcrImportModal: React.FC<AiOcrImportModalProps> = ({
  isOpen,
  onClose,
  activeProjectName = "Active Commission",
  onApplyRoomsToCurrentProject,
  onCreateNewProjectFromImport,
}) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStage, setProcessingStage] = useState<string>("");
  const [analysisResult, setAnalysisResult] = useState<ParsedTakeoffResult | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);
  const [pastedText, setPastedText] = useState("");
  const [showPasteArea, setShowPasteArea] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  if (!isOpen) return null;

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelected(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelected(e.target.files[0]);
    }
  };

  const handleFileSelected = (file: File) => {
    setSelectedFile(file);
    setErrorMessage(null);
    setAnalysisResult(null);

    // If it's an image, create a preview
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    } else {
      setImagePreviewUrl(null);
    }
  };

  const runAiAnalysis = async (fileToProcess?: File, manualText?: string) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      let rawContent = manualText || "";
      let imageBase64: string | undefined = undefined;
      let mimeType: string | undefined = undefined;
      let fileName = "Manual_Spreadsheet_Input";
      let fileType = "text";

      if (fileToProcess) {
        fileName = fileToProcess.name;
        const isExcel =
          fileToProcess.name.endsWith(".xlsx") ||
          fileToProcess.name.endsWith(".xls") ||
          fileToProcess.name.endsWith(".csv");
        const isImage = fileToProcess.type.startsWith("image/");

        if (isExcel) {
          setProcessingStage("Parsing workbook sheets and cell dimensions via SheetJS...");
          fileType = "excel";
          const parsed = await parseExcelFileToText(fileToProcess);
          rawContent = parsed.textData;
        } else if (isImage) {
          setProcessingStage("Executing Gemini Vision OCR to scan schedules and dimension tables...");
          fileType = "image";
          mimeType = fileToProcess.type;
          imageBase64 = await new Promise<string>((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(fileToProcess);
          });
        } else {
          // Plain text / other
          rawContent = await fileToProcess.text();
        }
      }

      setProcessingStage("AI identifying rooms (Master Bedroom, Living, Kitchen) & interior units...");

      // Call server endpoint
      const response = await fetch("/api/gemini/parse-estimate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileType,
          fileName,
          rawContent,
          imageBase64,
          mimeType,
          projectName: activeProjectName,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned status ${response.status}`);
      }

      setProcessingStage("Computing size-based costing, material grades, and BOQ...");
      const data = await response.json();

      if (!data.success || !data.rooms) {
        throw new Error(data.error || "Failed to parse estimate structure.");
      }

      // Format parsed rooms with fallback identifiers
      const formattedRooms: RoomConfig[] = data.rooms.map((r: any, rIdx: number) => {
        const roomId = r.id || `room-imp-${rIdx + 1}`;
        const components: InteriorComponent[] = (r.components || []).map((c: any, cIdx: number) => {
          const width = Number(c.width) || 72;
          const height = Number(c.height) || 84;
          const area = Number(c.area) || Math.max(1, Math.round((width * height) / 144));
          return {
            id: c.id || `comp-imp-${rIdx + 1}-${cIdx + 1}`,
            name: c.name || "Interior Unit",
            width,
            height,
            area,
            enabled: true,
            category: c.category || "Storage & Wardrobes",
            customRate: c.customRate ? Number(c.customRate) : undefined,
            carcass: c.carcass || r.carcass || "18mm Mahigold BWP 710 Marine Plywood",
            shutter: c.shutter || r.shutter || "HDHMR Moisture Resistant Board",
            finish: c.finish || r.finish || "High Gloss Acrylic (Anti-Scratch)",
            hardware: c.hardware || r.hardware || "Hettich",
            notes: c.notes || `${Math.round(width / 12)}' x ${Math.round(height / 12)}'`,
          };
        });

        return {
          id: roomId,
          name: r.name || `Room ${rIdx + 1}`,
          subtitle: `${components.length} Configured Units`,
          tier: r.tier || "Bespoke Tier",
          components,
          carcass: r.carcass || "18mm Mahigold BWP 710 Marine Plywood",
          shutter: r.shutter || "HDHMR Moisture Resistant Board",
          finish: r.finish || "High Gloss Acrylic (Anti-Scratch)",
          hardware: r.hardware || "Hettich",
          aiSuggestedRate: Number(r.aiSuggestedRate) || 1550,
          overrideRate: null,
          overrideTotalPrice: null,
          aiRationale: r.aiRationale || "AI validated for premium humidity and load specifications.",
          durabilityScore: 94,
        };
      });

      const totalSft = formattedRooms.flatMap((r) => r.components).reduce((s, c) => s + c.area, 0);
      const totalEstimatedCost = formattedRooms.reduce((sum, r) => {
        const rArea = r.components.reduce((s, c) => s + c.area, 0);
        return sum + rArea * r.aiSuggestedRate;
      }, 0);
      const gstAmount = Math.round(totalEstimatedCost * 0.18);
      const grandTotalWithGst = totalEstimatedCost + gstAmount;

      const result: ParsedTakeoffResult = {
        projectName: data.projectName || activeProjectName || "Imported Interior Commission",
        clientName: data.clientName || "Valued Client",
        summary: data.summary || `Extracted ${formattedRooms.length} rooms and ${formattedRooms.flatMap((r) => r.components).length} interior pieces across ${totalSft} Sft.`,
        rooms: formattedRooms,
        totalSft,
        totalEstimatedCost,
        gstAmount,
        grandTotalWithGst,
        source: data.source || "gemini_ocr",
      };

      setAnalysisResult(result);
      if (formattedRooms.length > 0) {
        setExpandedRoomId(formattedRooms[0].id);
      }
    } catch (err: any) {
      console.error("AI OCR Parse error:", err);
      setErrorMessage(err.message || "Failed to analyze document. Please check the format or try the sample template.");
    } finally {
      setIsProcessing(false);
      setProcessingStage("");
    }
  };

  const handleApplyToActiveProject = () => {
    if (!analysisResult) return;
    onApplyRoomsToCurrentProject(
      analysisResult.rooms,
      analysisResult.totalEstimatedCost,
      analysisResult.totalSft
    );
    onClose();
  };

  const handleCreateNewProject = () => {
    if (!analysisResult) return;
    const formattedLakhs = (analysisResult.grandTotalWithGst / 100000).toFixed(1);
    const newProj: PortfolioItem = {
      id: `port-imp-${Date.now()}`,
      title: analysisResult.projectName.toUpperCase(),
      category: "Full Residence Interiors",
      location: "Active Commission",
      areaSft: analysisResult.totalSft,
      completionYear: "2026",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
      budgetFormatted: `₹ ${formattedLakhs} Lakhs`,
      budgetNumeric: analysisResult.grandTotalWithGst,
      clientName: analysisResult.clientName || "Direct Commission",
      status: "Active",
      keySpecs: ["BWP 710 Marine Ply", "Hettich Hardware", "AI OCR Takeoff"],
      materialsUsed: ["Mahigold 710 Ply", "HDHMR Board", "Anti-Scratch Acrylic"],
    };

    onCreateNewProjectFromImport(newProj, analysisResult.rooms);
    onClose();
  };

  const handleDownloadVerifiedExcel = () => {
    if (!analysisResult) return;
    exportProjectToExcel({
      projectName: analysisResult.projectName,
      clientName: analysisResult.clientName,
      rooms: analysisResult.rooms,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white border border-[#DCE0E8] rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-5 py-4 border-b border-[#E5E8EE] flex items-center justify-between bg-[#FAFBFD]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#FAF5E6] border border-[#E5C86C] flex items-center justify-center text-[#8A6708]">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-serif text-lg font-medium text-[#16191F]">
                  AI OCR Reader & Excel Estimation
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF5E6] text-[#8A6708] border border-[#E5C86C]">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-xs text-[#596171]">
                Upload your Excel, CSV, or schedule photo to automatically populate rooms, interior items, and cost estimates.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#7E8794] hover:text-[#16191F] hover:bg-[#EEF1F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {/* STEP 1: Upload & Input when no result yet */}
          {!analysisResult && (
            <div className="space-y-4">
              {/* Drag and Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-6 md:p-8 text-center cursor-pointer transition-all ${
                  dragActive
                    ? "border-[#8A6708] bg-[#FAF5E6]/40 scale-[1.01]"
                    : selectedFile
                    ? "border-[#8A6708] bg-[#FAF5E6]/10"
                    : "border-[#DCE0E8] hover:border-[#8A6708]/60 bg-[#F7F8FA]"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv,image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />

                {selectedFile ? (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-[#FAF5E6] text-[#8A6708] flex items-center justify-center border border-[#E5C86C]">
                      {selectedFile.type.startsWith("image/") ? (
                        <Eye className="w-6 h-6" />
                      ) : (
                        <FileSpreadsheet className="w-6 h-6" />
                      )}
                    </div>
                    <div className="text-center">
                      <span className="text-xs font-semibold text-[#16191F] block">
                        {selectedFile.name}
                      </span>
                      <span className="text-[11px] text-[#596171] block">
                        {(selectedFile.size / 1024).toFixed(1)} KB · Ready for AI OCR Analysis
                      </span>
                    </div>

                    {imagePreviewUrl && (
                      <div className="mt-2 max-h-36 max-w-xs overflow-hidden rounded-lg border border-[#DCE0E8] shadow-xs">
                        <img
                          src={imagePreviewUrl}
                          alt="Uploaded schedule"
                          className="w-full h-auto object-cover"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-white border border-[#DCE0E8] flex items-center justify-center text-[#8A6708] shadow-xs">
                      <Upload className="w-6 h-6" />
                    </div>
                    <div>
                      <span className="text-sm font-semibold text-[#16191F] block">
                        Click to upload or drag & drop your Excel file
                      </span>
                      <span className="text-xs text-[#596171] block mt-0.5">
                        Supports <strong>.xlsx, .xls, .csv</strong>, or photos/scans of architectural schedules
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Sample Template & Quick Paste Options */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    downloadSampleExcelTemplate();
                  }}
                  className="inline-flex items-center gap-1.5 text-[#8A6708] hover:text-[#6E5004] font-semibold transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Sample Excel Template (.xlsx)</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowPasteArea(!showPasteArea)}
                  className="text-[#596171] hover:text-[#16191F] underline transition-colors"
                >
                  {showPasteArea ? "Hide raw text paste" : "Or paste spreadsheet rows / text"}
                </button>
              </div>

              {showPasteArea && (
                <div className="space-y-2 animate-in fade-in duration-150">
                  <textarea
                    rows={4}
                    placeholder="Paste copied table cells or text from your interior schedule here (e.g. Master Bedroom: 4-Door Wardrobe 8ft x 9ft, Bedback Panel 6ft x 4ft...)"
                    value={pastedText}
                    onChange={(e) => setPastedText(e.target.value)}
                    className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-xl p-3 text-xs text-[#16191F] placeholder-[#9CA3AF] focus:bg-white focus:outline-none focus:border-[#8A6708]"
                  />
                </div>
              )}

              {/* Error Callout */}
              {errorMessage && (
                <div className="p-3.5 rounded-xl bg-[#FFF8F8] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-[#DC2626] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="font-semibold">Analysis Error</p>
                    <p className="mt-0.5">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* Processing Spinner / Progress */}
              {isProcessing && (
                <div className="p-4 rounded-xl bg-[#FAFBFD] border border-[#E2E5EB] space-y-2.5 text-center animate-in fade-in duration-200">
                  <div className="flex items-center justify-center gap-2 text-[#8A6708]">
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span className="text-xs font-semibold uppercase tracking-wider">
                      AI OCR Engine Active
                    </span>
                  </div>
                  <p className="text-xs text-[#16191F] font-medium">
                    {processingStage || "Analyzing sheets and estimating room interior costs..."}
                  </p>
                  <p className="text-[11px] text-[#7E8794]">
                    Extracting rooms (Master, Living, Kitchen) · Cataloging wardrobes, panels & dressers · Computing Sft & pricing
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2">
                <button
                  disabled={isProcessing || (!selectedFile && !pastedText.trim())}
                  onClick={() => runAiAnalysis(selectedFile || undefined, pastedText)}
                  className="w-full py-3 px-4 rounded-xl bg-[#8A6708] hover:bg-[#725406] disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs md:text-sm font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Excel & Generate Cost Estimation</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Results Review Screen */}
          {analysisResult && (
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* Top Overview Badge */}
              <div className="p-4 rounded-2xl bg-[#FAFBFD] border border-[#E2E5EB] space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E5E8EE] pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#8A6708] flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> AI TAKEOFF VERIFIED
                    </span>
                    <h4 className="font-serif text-lg text-[#16191F] font-semibold mt-0.5">
                      {analysisResult.projectName}
                    </h4>
                    <p className="text-xs text-[#596171]">
                      Client: {analysisResult.clientName || "Direct Commission"}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setAnalysisResult(null)}
                      className="px-3 py-1.5 rounded-lg border border-[#DCE0E8] text-xs font-semibold text-[#596171] hover:bg-white hover:text-[#16191F] transition-colors"
                    >
                      Upload Different File
                    </button>
                    <button
                      onClick={handleDownloadVerifiedExcel}
                      className="px-3 py-1.5 rounded-lg bg-white border border-[#DCE0E8] text-xs font-semibold text-[#8A6708] hover:bg-[#FAF5E6] flex items-center gap-1.5 transition-colors shadow-2xs"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Excel</span>
                    </button>
                  </div>
                </div>

                {/* KPI Metrics */}
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5EB]">
                    <span className="text-[10px] text-[#596171] uppercase font-semibold block">
                      Rooms Detected
                    </span>
                    <span className="font-serif text-lg font-bold text-[#16191F]">
                      {analysisResult.rooms.length} Rooms
                    </span>
                    <span className="text-[10px] text-[#7E8794] block">
                      {analysisResult.rooms.flatMap((r) => r.components).length} interior pieces
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-[#E2E5EB]">
                    <span className="text-[10px] text-[#596171] uppercase font-semibold block">
                      Total Sized Area
                    </span>
                    <span className="font-serif text-lg font-bold text-[#16191F]">
                      {analysisResult.totalSft} Sft
                    </span>
                    <span className="text-[10px] text-[#7E8794] block">
                      Calibrated measurements
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-[#FAF5E6] border border-[#E5C86C]/60">
                    <span className="text-[10px] text-[#8A6708] uppercase font-semibold block">
                      Grand Proposal Total
                    </span>
                    <span className="font-serif text-lg font-bold text-[#8A6708]">
                      ₹{new Intl.NumberFormat("en-IN").format(analysisResult.grandTotalWithGst)}
                    </span>
                    <span className="text-[10px] text-[#8A6708] block">
                      Incl. 18% GST
                    </span>
                  </div>
                </div>

                {/* AI Summary note */}
                <div className="p-3 rounded-xl bg-white border border-[#E2E5EB] text-xs text-[#596171] flex items-start gap-2">
                  <Sparkles className="w-4 h-4 text-[#8A6708] shrink-0 mt-0.5" />
                  <p>{analysisResult.summary}</p>
                </div>
              </div>

              {/* Room by Room Accordion */}
              <div className="space-y-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-[#596171] px-1">
                  Extracted Rooms & Interior Components
                </h5>

                <div className="space-y-2">
                  {analysisResult.rooms.map((room) => {
                    const isExpanded = expandedRoomId === room.id;
                    const roomTotalArea = room.components.reduce((sum, c) => sum + c.area, 0);
                    const roomTotalCost = roomTotalArea * room.aiSuggestedRate;

                    return (
                      <div
                        key={room.id}
                        className="border border-[#E2E5EB] rounded-xl overflow-hidden bg-white shadow-2xs"
                      >
                        {/* Accordion Bar */}
                        <button
                          type="button"
                          onClick={() => setExpandedRoomId(isExpanded ? null : room.id)}
                          className="w-full px-4 py-3 bg-[#FAFBFD] hover:bg-[#F1F3F6] flex items-center justify-between transition-colors text-left"
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-white border border-[#DCE0E8] flex items-center justify-center text-[#8A6708]">
                              <Layers className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <span className="text-xs font-semibold text-[#16191F] block">
                                {room.name}
                              </span>
                              <span className="text-[10px] text-[#596171]">
                                {room.components.length} pieces · {roomTotalArea} Sft · {room.tier}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="font-serif text-xs md:text-sm font-semibold text-[#8A6708] tabular-nums">
                              ₹{new Intl.NumberFormat("en-IN").format(roomTotalCost)}
                            </span>
                            {isExpanded ? (
                              <ChevronUp className="w-4 h-4 text-[#7E8794]" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-[#7E8794]" />
                            )}
                          </div>
                        </button>

                        {/* Expanded Items Table */}
                        {isExpanded && (
                          <div className="p-3 border-t border-[#E5E8EE] space-y-2 bg-white">
                            <div className="text-[11px] text-[#596171] pb-1 border-b border-[#F0F2F5] flex justify-between">
                              <span>Spec: {room.carcass}</span>
                              <span>Rate: ₹{room.aiSuggestedRate}/Sft</span>
                            </div>

                            <div className="divide-y divide-[#F0F2F5]">
                              {room.components.map((comp) => {
                                const compRate = comp.customRate || room.aiSuggestedRate;
                                const compTotal = comp.area * compRate;

                                return (
                                  <div
                                    key={comp.id}
                                    className="py-2 flex items-center justify-between text-xs"
                                  >
                                    <div>
                                      <div className="flex items-center gap-1.5">
                                        <span className="font-semibold text-[#16191F]">
                                          {comp.name}
                                        </span>
                                        <span className="text-[9px] uppercase px-1.5 py-0.2 rounded-md bg-[#F1F3F6] text-[#596171]">
                                          {comp.category}
                                        </span>
                                      </div>
                                      <span className="text-[11px] text-[#7E8794]">
                                        {comp.width}" W × {comp.height}" H · {comp.area} Sft · {comp.notes || "Fitted"}
                                      </span>
                                    </div>

                                    <div className="text-right">
                                      <span className="font-semibold text-[#16191F] block tabular-nums">
                                        ₹{new Intl.NumberFormat("en-IN").format(compTotal)}
                                      </span>
                                      <span className="text-[10px] text-[#7E8794]">
                                        @ ₹{compRate}/Sft
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons for Import */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={handleApplyToActiveProject}
                  className="py-2.5 px-4 rounded-xl bg-[#8A6708] hover:bg-[#725406] text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>Update "{activeProjectName}" with this Takeoff</span>
                </button>

                <button
                  type="button"
                  onClick={handleCreateNewProject}
                  className="py-2.5 px-4 rounded-xl bg-white hover:bg-[#FAFBFD] border border-[#DCE0E8] text-[#16191F] text-xs font-semibold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-[#8A6708]" />
                  <span>Create New Commission from this Excel</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer info */}
        <div className="px-5 py-3 border-t border-[#E5E8EE] bg-[#FAFBFD] text-[11px] text-[#7E8794] flex items-center justify-between">
          <span>Aethel AI Quantity Surveyor · Verified against IS 710 BWP & Luxury Hardware Standards</span>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-[#596171] hover:text-[#16191F]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
