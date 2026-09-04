import React, { useState } from "react";
import { Bell, User, Check, X, Sparkles, Building2, Phone, Mail } from "lucide-react";
import { NotificationItem } from "../types";

interface HeaderProps {
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  activeTabTitle?: string;
}

export const Header: React.FC<HeaderProps> = ({
  notifications,
  onMarkNotificationRead,
  activeTabTitle = "Ai Recommender",
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-[#E2E5EB] px-4 py-3 flex items-center justify-between">
      {/* Title */}
      <div className="flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-[#E0B638] animate-pulse" />
        <h1 className="text-xl md:text-2xl font-serif text-[#16191F] tracking-tight font-medium">
          {activeTabTitle}
        </h1>
      </div>

      {/* Right Action Icons */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <div className="relative">
          <button
            id="notifications-btn"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-lg text-[#596171] hover:text-[#8A6708] hover:bg-[#F1F3F6] transition-colors"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E0B638] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E5EB] rounded-xl shadow-xl p-3 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#E5E8EE]">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#7E8794]">
                  Project Advisories
                </span>
                <span className="text-[11px] text-[#8A6708] font-medium">
                  {unreadCount} unread
                </span>
              </div>
              <div className="space-y-2 max-h-72 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-xs text-[#7E8794] text-center py-4">No recent advisories</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => onMarkNotificationRead(n.id)}
                      className={`p-2.5 rounded-lg border text-left cursor-pointer transition-all ${
                        n.read
                          ? "bg-[#F8F9FA] border-transparent opacity-75"
                          : "bg-[#FDF8E7] border-[#E5C86C]/50"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[#16191F]">{n.title}</span>
                        <span className="text-[10px] text-[#7E8794]">{n.time}</span>
                      </div>
                      <p className="text-xs text-[#596171] leading-relaxed">{n.description}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className="relative">
          <button
            id="profile-btn"
            onClick={() => setShowProfile(!showProfile)}
            className="w-8 h-8 rounded-full bg-[#E0B638] hover:bg-[#D4AC2D] text-[#1A1D24] flex items-center justify-center transition-transform hover:scale-105 shadow-sm"
            aria-label="User Profile"
          >
            <User className="w-4 h-4 fill-current" />
          </button>

          {/* Profile Modal / Drawer */}
          {showProfile && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-[#E2E5EB] rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="flex items-start justify-between pb-3 border-b border-[#E5E8EE]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E0B638] text-[#1A1D24] flex items-center justify-center font-bold text-sm">
                    AI
                  </div>
                  <div>
                    <h2 className="text-sm font-semibold text-[#16191F]">Aethel Atelier</h2>
                    <p className="text-[11px] text-[#8A6708] font-medium">Bespoke Residential Partner</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfile(false)}
                  className="text-[#7E8794] hover:text-[#16191F]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="py-3 space-y-2 text-xs text-[#596171]">
                <div className="flex items-center gap-2">
                  <Building2 className="w-3.5 h-3.5 text-[#8A6708]" />
                  <span>The Camellias, Tower 4, Suite 402</span>
                </div>
                <div className="flex items-center gap-2">
                  <Phone className="w-3.5 h-3.5 text-[#8A6708]" />
                  <span>+91 98201 44552 (Architect Concierge)</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-[#8A6708]" />
                  <span>atelier@aethelinteriors.luxury</span>
                </div>
              </div>

              <div className="pt-3 border-t border-[#E5E8EE] flex items-center justify-between text-[11px]">
                <span className="text-[#7E8794]">Engine Version: v2.4 Luxury</span>
                <span className="text-[#8A6708] font-medium flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> AI Active
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
