import React from "react";
import { PROJECT_MILESTONES } from "../data/initialData";
import { CheckCircle2, Clock, Circle, ArrowUpRight } from "lucide-react";

export const TrackerView: React.FC = () => {
  return (
    <div className="p-4 space-y-5 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708]">
          EXECUTION TRACKER
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
          Project Delivery Pipeline
        </h2>
        <p className="text-xs text-[#596171] mt-1">
          Live manufacturing and on-site joinery milestones for Penthouse 402, The Camellias.
        </p>
      </div>

      {/* Overall Progress Meter */}
      <div className="p-5 rounded-2xl bg-white border border-[#E2E5EB] space-y-3 shadow-xs">
        <div className="flex items-center justify-between text-xs">
          <span className="text-[#16191F] font-semibold">Turnkey Fabrication Progress</span>
          <span className="font-serif text-sm font-bold text-[#8A6708]">48% Overall</span>
        </div>
        <div className="w-full bg-[#EEF1F5] h-2.5 rounded-full overflow-hidden border border-[#E2E5EB]">
          <div className="bg-[#E0B638] h-full rounded-full transition-all duration-700" style={{ width: "48%" }} />
        </div>
        <div className="flex justify-between text-[11px] text-[#7E8794] font-medium">
          <span>Laser Audit Complete</span>
          <span>Target Handover: Oct 04</span>
        </div>
      </div>

      {/* Milestones Pipeline */}
      <div className="space-y-4">
        {PROJECT_MILESTONES.map((milestone) => {
          const isCompleted = milestone.status === "completed";
          const isInProgress = milestone.status === "in_progress";

          return (
            <div
              key={milestone.id}
              className={`p-4 rounded-2xl border transition-all ${
                isInProgress
                  ? "bg-[#FDF8E7]/50 border-[#E5C86C] shadow-xs"
                  : "bg-white border-[#E2E5EB] shadow-2xs"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  {isCompleted ? (
                    <CheckCircle2 className="w-5 h-5 text-[#8A6708]" />
                  ) : isInProgress ? (
                    <Clock className="w-5 h-5 text-[#8A6708] animate-pulse" />
                  ) : (
                    <Circle className="w-5 h-5 text-[#BDC4D0]" />
                  )}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A6708]">
                      {milestone.stage}
                    </span>
                    <h3 className="font-serif text-base text-[#16191F] font-medium leading-snug">
                      {milestone.title}
                    </h3>
                  </div>
                </div>

                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-medium ${
                    isCompleted
                      ? "bg-[#FDF8E7] text-[#8A6708] border border-[#E5C86C]"
                      : isInProgress
                      ? "bg-[#E0B638] text-[#1A1D24] font-semibold"
                      : "bg-[#F7F8FA] text-[#7E8794] border border-[#E2E5EB]"
                  }`}
                >
                  {milestone.date}
                </span>
              </div>

              {/* Deliverables Checklist */}
              <div className="pt-2 pl-7 space-y-1">
                {milestone.deliverables.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-[#596171]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CBD1DC]" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
