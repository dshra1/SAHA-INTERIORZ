import React, { useState, useEffect } from "react";
import { Calendar, Clock, MapPin, User, Phone, CheckCircle2, Building, ShieldCheck, UserCheck } from "lucide-react";
import { ArchitectEntry } from "../types";

export const BookingView: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [consultType, setConsultType] = useState("Laser Site Measurement & Structural Audit");
  const [date, setDate] = useState("2026-09-15");
  const [timeSlot, setTimeSlot] = useState("11:00 AM - 01:00 PM");
  const [name, setName] = useState("Vikramaditya Singhania");
  const [phone, setPhone] = useState("+91 98201 44552");
  const [address, setAddress] = useState("Penthouse 402, The Camellias, Golf Course Road, Gurugram");

  // Read manually entered architects from localStorage
  const [registeredArchitects, setRegisteredArchitects] = useState<ArchitectEntry[]>([]);
  const [selectedArchitect, setSelectedArchitect] = useState<string>("auto");
  const [customArchitectName, setCustomArchitectName] = useState<string>("");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aethel_luxury_architects");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRegisteredArchitects(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  // Determine assigned architect display text
  const getAssignedArchitectText = () => {
    if (selectedArchitect === "custom" && customArchitectName.trim()) {
      return customArchitectName.trim();
    }
    if (selectedArchitect !== "auto") {
      const found = registeredArchitects.find((a) => a.id === selectedArchitect);
      if (found) {
        return `${found.name} (${found.firm})`;
      }
    }
    return "Senior Interior & Joinery Specialist (Atelier Team)";
  };

  return (
    <div className="p-4 space-y-5 pb-20 max-w-2xl mx-auto">
      {/* Header */}
      <div className="px-1">
        <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708]">
          ARCHITECT CONCIERGE
        </span>
        <h2 className="font-serif text-2xl md:text-3xl text-[#16191F] font-medium tracking-tight mt-0.5">
          Schedule Consultation & Survey
        </h2>
        <p className="text-xs text-[#596171] mt-1">
          Arrange an on-site laser dimension audit with our Master Joinery Engineers.
        </p>
      </div>

      {!submitted ? (
        <form
          onSubmit={handleSubmit}
          className="p-5 rounded-2xl bg-white border border-[#E2E5EB] space-y-4 shadow-xs"
        >
          {/* Consultation Type */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-[#596171] mb-2 font-semibold">
              Consultation Package
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { title: "Laser Site Measurement & Structural Audit", time: "2 Hours" },
                { title: "Material Sample Kit & Veneer Review", time: "1.5 Hours" },
                { title: "Architectural Interior Feasibility", time: "1 Hour" },
                { title: "Turnkey BOQ & Hardware Sign-off", time: "1 Hour" },
              ].map((item) => (
                <div
                  key={item.title}
                  onClick={() => setConsultType(item.title)}
                  className={`p-3 rounded-xl border text-xs cursor-pointer transition-all ${
                    consultType === item.title
                      ? "bg-[#FDF8E7] border-[#E5C86C] text-[#8A6708] font-medium shadow-2xs"
                      : "bg-white border-[#E2E5EB] text-[#596171] hover:border-[#DCE0E8]"
                  }`}
                >
                  <div className="font-semibold">{item.title}</div>
                  <div className="text-[11px] text-[#7E8794] mt-0.5">{item.time}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div>
              <label className="block text-xs text-[#596171] mb-1.5 font-semibold">
                Preferred Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2.5 text-xs text-[#16191F] focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#596171] mb-1.5 font-semibold">
                Time Slot
              </label>
              <select
                value={timeSlot}
                onChange={(e) => setTimeSlot(e.target.value)}
                className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2.5 text-xs text-[#16191F] focus:border-[#D4AF37]"
              >
                <option>10:00 AM - 12:00 PM</option>
                <option>11:00 AM - 01:00 PM</option>
                <option>02:30 PM - 04:30 PM</option>
                <option>05:00 PM - 07:00 PM</option>
              </select>
            </div>
          </div>

          {/* Lead Architect / Designer Selection */}
          <div className="pt-2">
            <label className="block text-xs text-[#596171] mb-1.5 font-semibold flex items-center justify-between">
              <span>Lead Architect / Design Partner</span>
              <span className="text-[10px] text-[#7E8794] font-normal">
                {registeredArchitects.length > 0
                  ? `${registeredArchitects.length} registered in Projects`
                  : "Manual Entry Enabled"}
              </span>
            </label>
            <select
              value={selectedArchitect}
              onChange={(e) => setSelectedArchitect(e.target.value)}
              className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2.5 text-xs text-[#16191F] focus:border-[#D4AF37]"
            >
              <option value="auto">Assign Senior Joinery Consultant (Atelier Team)</option>
              {registeredArchitects.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} — {a.firm} ({a.role})
                </option>
              ))}
              <option value="custom">+ Enter Architect Name Manually...</option>
            </select>

            {selectedArchitect === "custom" && (
              <input
                type="text"
                placeholder="Enter Architect Name & Firm manually..."
                value={customArchitectName}
                onChange={(e) => setCustomArchitectName(e.target.value)}
                className="w-full mt-2 bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F] focus:border-[#D4AF37]"
              />
            )}
          </div>

          {/* Client Details */}
          <div className="space-y-3 pt-2">
            <div>
              <label className="block text-xs text-[#596171] mb-1 font-semibold">
                Client Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#596171] mb-1 font-semibold">
                Direct Contact Phone
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              />
            </div>

            <div>
              <label className="block text-xs text-[#596171] mb-1 font-semibold">
                Site Location & Suite Address
              </label>
              <textarea
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                rows={2}
                className="w-full bg-white border border-[#DCE0E8] rounded-lg px-3 py-2 text-xs text-[#16191F]"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] font-semibold text-xs rounded-xl shadow-xs transition-all cursor-pointer mt-2"
          >
            Confirm Bespoke Appointment
          </button>
        </form>
      ) : (
        <div className="p-6 rounded-2xl bg-white border border-[#E5C86C] text-center space-y-4 animate-in fade-in shadow-sm">
          <div className="w-12 h-12 rounded-full bg-[#FDF8E7] text-[#8A6708] border border-[#E5C86C] flex items-center justify-center mx-auto shadow-2xs">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-[#8A6708]">
              APPOINTMENT RESERVED
            </span>
            <h3 className="font-serif text-xl text-[#16191F] font-medium mt-1">
              Confirmed for {name}
            </h3>
            <p className="text-xs text-[#596171] mt-1 max-w-sm mx-auto">
              Our Senior Joinery Architect has been assigned to your residence at {address} on {date} ({timeSlot}).
            </p>
          </div>

          <div className="p-3 rounded-xl bg-[#F7F8FA] border border-[#E2E5EB] text-xs text-left max-w-sm mx-auto space-y-1 text-[#596171]">
            <div><strong className="text-[#16191F]">Service:</strong> {consultType}</div>
            <div><strong className="text-[#16191F]">Lead Architect:</strong> {getAssignedArchitectText()}</div>
            <div><strong className="text-[#16191F]">Confirmation Ref:</strong> AETHEL-BK-{Math.floor(1000 + Math.random() * 9000)}</div>
          </div>

          <button
            onClick={() => setSubmitted(false)}
            className="px-4 py-2 rounded-lg bg-white border border-[#DCE0E8] text-xs text-[#8A6708] hover:bg-[#F7F8FA] transition-colors font-semibold shadow-2xs cursor-pointer"
          >
            Modify Booking
          </button>
        </div>
      )}
    </div>
  );
};
