import React, { useState } from "react";
import { Plus, X } from "lucide-react";
import { RoomConfig } from "../types";

interface RoomSelectorProps {
  rooms: RoomConfig[];
  activeRoomId: string;
  onSelectRoom: (roomId: string) => void;
  onAddRoom: (name: string, tier: "Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier") => void;
}

export const RoomSelector: React.FC<RoomSelectorProps> = ({
  rooms,
  activeRoomId,
  onSelectRoom,
  onAddRoom,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomTier, setNewRoomTier] = useState<"Bespoke Tier" | "Modern Luxury Tier" | "Signature Penthouse Tier">("Bespoke Tier");

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;
    onAddRoom(newRoomName.trim(), newRoomTier);
    setNewRoomName("");
    setShowAddModal(false);
  };

  return (
    <div className="py-2.5 px-4 overflow-x-auto no-scrollbar">
      <div className="flex items-center gap-2.5 min-w-max">
        {rooms.map((room) => {
          const isActive = room.id === activeRoomId;
          return (
            <button
              key={room.id}
              id={`room-tab-${room.id}`}
              onClick={() => onSelectRoom(room.id)}
              className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                isActive
                  ? "bg-[#E0B638] text-[#1A1D24] font-semibold shadow-sm shadow-[#E0B638]/20"
                  : "bg-white text-[#596171] hover:text-[#16191F] hover:bg-[#F1F3F6] border border-[#E2E5EB]"
              }`}
            >
              {room.name}
            </button>
          );
        })}

        {/* Add Room Button */}
        <button
          id="add-room-btn"
          onClick={() => setShowAddModal(true)}
          className="px-3 py-2.5 rounded-lg text-xs font-medium bg-white hover:bg-[#F1F3F6] text-[#7E8794] hover:text-[#8A6708] border border-dashed border-[#DCE0E8] flex items-center gap-1.5 transition-colors"
          title="Add Custom Room"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Room</span>
        </button>
      </div>

      {/* Add Room Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E5EB] rounded-xl p-5 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-[#E5E8EE]">
              <h3 className="font-serif text-lg text-[#16191F] font-medium">Add Bespoke Room</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#7E8794] hover:text-[#16191F]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-[#7E8794] mb-1.5 font-medium">
                  Room Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Master Walk-in Wardrobe, Home Theater"
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2.5 text-sm text-[#16191F] placeholder-[#9CA3AF]"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-[#7E8794] mb-1.5 font-medium">
                  Specification Tier
                </label>
                <select
                  value={newRoomTier}
                  onChange={(e) => setNewRoomTier(e.target.value as any)}
                  className="w-full bg-[#F7F8FA] border border-[#DCE0E8] rounded-lg px-3 py-2.5 text-sm text-[#16191F]"
                >
                  <option value="Bespoke Tier">Bespoke Tier (Marine 710 + Hettich)</option>
                  <option value="Modern Luxury Tier">Modern Luxury Tier (HDHMR + Hafele)</option>
                  <option value="Signature Penthouse Tier">Signature Penthouse Tier (Birch/PU + Blum)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-lg text-xs font-medium text-[#596171] hover:bg-[#F1F3F6]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newRoomName.trim()}
                  className="px-4 py-2 rounded-lg text-xs font-semibold bg-[#E0B638] text-[#1A1D24] hover:bg-[#D4AC2D] disabled:opacity-50 transition-colors shadow-xs"
                >
                  Create Room
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
