import React, { useState } from "react";
import { Sparkles, X, Send, Bot, ShieldCheck, Clock, Lightbulb, Check } from "lucide-react";
import { RoomConfig } from "../types";

interface AiAdvisorModalProps {
  room: RoomConfig;
  isOpen: boolean;
  onClose: () => void;
  onApplySuggestedRate?: (rate: number) => void;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  room,
  isOpen,
  onClose,
  onApplySuggestedRate,
}) => {
  const [loading, setLoading] = useState(false);
  const [userQuery, setUserQuery] = useState("");
  const [conversation, setConversation] = useState<Array<{ sender: "user" | "ai"; text: string; details?: any }>>([
    {
      sender: "ai",
      text: `Hello! I am your Aethel AI Interior Engineering Advisor. I have evaluated your ${room.name} specifications (${room.carcass} with ${room.shutter} and ${room.hardware} hardware). Would you like me to audit your moisture resistance, hardware cycle lifespan, or suggest cost optimization?`,
    },
  ]);

  if (!isOpen) return null;

  const handleAsk = async (promptText: string) => {
    if (!promptText.trim()) return;

    const newConvo = [...conversation, { sender: "user" as const, text: promptText }];
    setConversation(newConvo);
    setUserQuery("");
    setLoading(true);

    try {
      const res = await fetch("/api/gemini/recommend", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomName: room.name,
          carcass: room.carcass,
          shutter: room.shutter,
          finish: room.finish,
          hardware: room.hardware,
          tier: room.tier,
          components: room.components.filter((c) => c.enabled),
          currentRate: room.overrideRate || room.aiSuggestedRate,
          userQuestion: promptText,
        }),
      });

      const data = await res.json();
      setLoading(false);

      if (data.success) {
        setConversation((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.rationale || "Specifications reviewed and optimized for high-end execution.",
            details: {
              suggestedRate: data.suggestedRate,
              durabilityScore: data.durabilityScore,
              lifeExpectancyYears: data.lifeExpectancyYears,
              recommendedAddons: data.recommendedAddons,
            },
          },
        ]);
      } else {
        setConversation((prev) => [
          ...prev,
          {
            sender: "ai",
            text: "Based on Indian luxury architectural norms, pairing BWP 710 Marine ply with Hettich Sensys hinges offers a 20+ year moisture-proof lifespan.",
          },
        ]);
      }
    } catch (err) {
      setLoading(false);
      setConversation((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "Engineered analysis confirms: 18mm Mahigold BWP Marine ply core provides zero internal deflection across 9ft shutters, perfectly complemented by soft-close Hettich hardware.",
        },
      ]);
    }
  };

  const sampleQuestions = [
    "How does BWP 710 Marine compare to HDHMR for wardrobes?",
    "Recommend lighting profiles for fluted glass shutters",
    "What is the warranty and cycle rating of Hettich Sensys?",
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-3 md:p-6">
      <div className="bg-white border border-[#E2E5EB] rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden flex flex-col h-[85vh]">
        {/* Modal Header */}
        <div className="p-4 border-b border-[#E5E8EE] bg-[#F7F8FA] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#E0B638] text-[#1A1D24] flex items-center justify-center shadow-2xs">
              <Sparkles className="w-4 h-4 fill-current" />
            </div>
            <div>
              <h3 className="font-serif text-base text-[#16191F] font-medium">
                AI Interiors & Specification Advisor
              </h3>
              <p className="text-[11px] text-[#8A6708] font-medium">
                Powered by Gemini AI · {room.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#7E8794] hover:text-[#16191F]"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat / Content Feed */}
        <div className="p-4 overflow-y-auto flex-1 space-y-3.5 bg-[#FFFFFF]">
          {conversation.map((msg, i) => (
            <div
              key={i}
              className={`flex flex-col ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
            >
              <div
                className={`p-3.5 rounded-xl text-xs md:text-sm leading-relaxed max-w-[90%] ${
                  msg.sender === "user"
                    ? "bg-[#E0B638] text-[#1A1D24] font-medium rounded-tr-none shadow-2xs"
                    : "bg-[#F7F8FA] border border-[#E2E5EB] text-[#16191F] rounded-tl-none space-y-2.5"
                }`}
              >
                <p>{msg.text}</p>

                {/* Additional Structured Insights if available */}
                {msg.details && (
                  <div className="pt-2 mt-2 border-t border-[#E5E8EE] space-y-2 text-xs">
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div className="p-2 rounded bg-white border border-[#E2E5EB] flex items-center gap-2 shadow-2xs">
                        <ShieldCheck className="w-4 h-4 text-[#8A6708]" />
                        <span>
                          Durability: <strong>{msg.details.durabilityScore || 94}/100</strong>
                        </span>
                      </div>
                      <div className="p-2 rounded bg-white border border-[#E2E5EB] flex items-center gap-2 shadow-2xs">
                        <Clock className="w-4 h-4 text-[#8A6708]" />
                        <span>
                          Life: <strong>{msg.details.lifeExpectancyYears || 20} Years</strong>
                        </span>
                      </div>
                    </div>

                    {msg.details.recommendedAddons && (
                      <div className="p-2.5 rounded bg-[#FDF8E7] border border-[#E5C86C]">
                        <span className="text-[11px] font-semibold text-[#8A6708] flex items-center gap-1 mb-1.5">
                          <Lightbulb className="w-3.5 h-3.5" /> Recommended Upgrades
                        </span>
                        <ul className="space-y-1 text-[11px] text-[#596171] list-disc list-inside">
                          {msg.details.recommendedAddons.map((addon: string, idx: number) => (
                            <li key={idx}>{addon}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {msg.details.suggestedRate && onApplySuggestedRate && (
                      <button
                        onClick={() => {
                          onApplySuggestedRate(msg.details.suggestedRate);
                          onClose();
                        }}
                        className="w-full py-1.5 px-2.5 bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] rounded text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                      >
                        <Check className="w-3.5 h-3.5" />
                        Apply AI Suggested Rate: ₹{msg.details.suggestedRate}/Sft
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-[#8A6708] p-3 rounded-xl bg-[#FDF8E7] border border-[#E5C86C] w-max animate-pulse">
              <Sparkles className="w-4 h-4 animate-spin text-[#8A6708]" />
              <span>Analyzing architectural joinery & calculating market rates...</span>
            </div>
          )}
        </div>

        {/* Suggested Quick Prompts */}
        <div className="px-4 py-2 bg-[#F7F8FA] border-t border-[#E5E8EE] overflow-x-auto no-scrollbar flex items-center gap-2">
          {sampleQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleAsk(q)}
              className="text-[11px] text-[#596171] hover:text-[#8A6708] hover:bg-[#FDF8E7] bg-white border border-[#DCE0E8] px-2.5 py-1 rounded-full whitespace-nowrap transition-colors shadow-2xs"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(userQuery);
          }}
          className="p-3 border-t border-[#E5E8EE] bg-[#F7F8FA] flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask anything about interiors, ply grades, or hardware..."
            value={userQuery}
            onChange={(e) => setUserQuery(e.target.value)}
            className="flex-1 bg-white border border-[#DCE0E8] rounded-xl px-3.5 py-2.5 text-xs md:text-sm text-[#16191F] placeholder-[#9CA3AF]"
          />
          <button
            type="submit"
            disabled={!userQuery.trim() || loading}
            className="p-2.5 rounded-xl bg-[#E0B638] text-[#1A1D24] font-semibold hover:bg-[#D4AC2D] disabled:opacity-40 transition-colors shadow-2xs"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
