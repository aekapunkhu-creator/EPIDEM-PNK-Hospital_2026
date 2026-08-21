import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Bell, 
  Bot, 
  UserCircle, 
  FileSpreadsheet, 
  Sparkles,
  ChevronDown,
  RefreshCw,
  Search,
  Activity,
  Plus,
  Lock,
  Crown,
  MapPin,
  LogOut,
  KeyRound,
  Cloud,
  Database,
  CheckCircle2
} from 'lucide-react';
import { UserSession, RoleType, EpiAlert } from '../types';
import { storageService } from '../services/storageService';

interface HeaderProps {
  user: UserSession;
  alerts: EpiAlert[];
  onOpenLoginModal: () => void;
  onOpenReportModal: () => void;
  onOpenAiAssistant: () => void;
  onOpenAlerts: () => void;
  onOpenSheetsModal: () => void;
  onNavigateToUsers?: () => void;
  onLogout?: () => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onResetData: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  alerts,
  onOpenLoginModal,
  onOpenReportModal,
  onOpenAiAssistant,
  onOpenAlerts,
  onOpenSheetsModal,
  onNavigateToUsers,
  onLogout,
  searchTerm,
  onSearchChange,
  onResetData,
}) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [cloudStatus, setCloudStatus] = useState(storageService.getCloudSyncStatus());
  const unreadAlerts = alerts.filter(a => !a.isRead);

  useEffect(() => {
    const unsub = storageService.subscribe(() => {
      setCloudStatus(storageService.getCloudSyncStatus());
    });
    return () => unsub();
  }, []);

  const isAdmin = user.role === 'admin';
  const isPcu = user.role.startsWith('pcu_');

  return (
    <header className="h-16 bg-white border-b border-slate-200 text-slate-800 sticky top-0 z-30 shadow-xs px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Title / Logo context */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-lg shadow-md shadow-blue-600/20 shrink-0">
          P
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-bold text-slate-800 tracking-tight leading-none truncate">
              PNK EPI Command Center
            </h1>
            <span className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200 rounded-md">
              รพ.โพนนาแก้ว
            </span>
            {/* Live Shared Firebase Badge */}
            <div 
              title="เชื่อมต่อฐานข้อมูล Google Cloud Firebase แบบ Realtime (ทุกคนที่เปิดลิงก์จะเห็นและแชร์ฐานข้อมูลเดียวกันทันที)"
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <Cloud className="w-3.5 h-3.5 text-emerald-600" />
              <span>Firebase Cloud (แชร์ Realtime)</span>
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-0.5 truncate hidden md:block">
            ระบบสารสนเทศงานระบาดวิทยา & ศูนย์ปฏิบัติการควบคุมโรค จ.สกลนคร
          </p>
        </div>
      </div>

      {/* Global Search Bar */}
      <div className="flex-1 max-w-md mx-2 hidden lg:block">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหา HN, ชื่อผู้ป่วย, โรค, ตำบล, หมู่บ้าน..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full bg-slate-100/80 border border-slate-200 rounded-xl pl-10 pr-8 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition"
          />
          {searchTerm && (
            <button 
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Action Buttons & User Menu */}
      <div className="flex items-center gap-2 shrink-0">
        {/* Quick Report Button */}
        <button
          onClick={onOpenReportModal}
          className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
          title="รับแจ้งผู้ป่วยโรคติดต่อใหม่ (รง. 506)"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">+ รับแจ้ง 506 ใหม่</span>
        </button>

        {/* AI Epidemiologist Assistant */}
        <button
          onClick={onOpenAiAssistant}
          className="flex items-center gap-1.5 px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-semibold rounded-xl transition"
          title="ปรึกษา AI ระบาดวิทยา (Gemini)"
        >
          <Sparkles className="w-3.5 h-3.5 text-indigo-600 animate-pulse" />
          <span className="hidden sm:inline">AI ระบาดวิทยา</span>
        </button>

        {/* Google Sheets Sync / Export Button */}
        <button
          onClick={onOpenSheetsModal}
          className="p-2 text-slate-600 hover:text-emerald-700 bg-slate-100 hover:bg-emerald-50 rounded-xl border border-slate-200 transition"
          title="Google Sheets & Google Drive Integration"
        >
          <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
        </button>

        {/* Alerts Bell */}
        <button
          onClick={onOpenAlerts}
          className="relative p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-full transition"
          title="การแจ้งเตือนเหตุการณ์ระบาด & แจ้งเตือน รพ.สต."
        >
          <Bell className="w-4 h-4" />
          {unreadAlerts.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full animate-ping"></span>
          )}
          {unreadAlerts.length > 0 && (
            <span className="absolute top-0 right-0 w-3 h-3 bg-red-500 border-2 border-white rounded-full"></span>
          )}
        </button>

        {/* User Account & Security Role Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className={`flex items-center gap-2 pl-2 pr-2.5 py-1.5 rounded-xl border text-left transition ${
              isAdmin 
                ? 'bg-purple-50 hover:bg-purple-100/70 border-purple-200' 
                : isPcu
                ? 'bg-emerald-50 hover:bg-emerald-100/70 border-emerald-200'
                : 'bg-slate-50 hover:bg-slate-100 border-slate-200'
            }`}
          >
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              isAdmin 
                ? 'bg-purple-600 text-white' 
                : isPcu 
                ? 'bg-emerald-600 text-white'
                : 'bg-blue-600 text-white'
            }`}>
              {isAdmin ? '👑' : isPcu ? '🏘️' : user.name.charAt(0)}
            </div>

            <div className="hidden xl:block">
              <p className="text-xs font-bold text-slate-800 leading-tight max-w-[130px] truncate">
                {user.name}
              </p>
              <div className="flex items-center gap-1 mt-0.5">
                <span className={`text-[10px] font-bold ${
                  isAdmin ? 'text-purple-700' : isPcu ? 'text-emerald-700' : 'text-blue-600'
                }`}>
                  {isAdmin ? 'Admin (ลบข้อมูลได้)' : user.pcuName || user.role}
                </span>
              </div>
            </div>

            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* Profile & Security Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-3xl shadow-2xl z-50 p-3 text-xs animate-in fade-in zoom-in-95">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl mb-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">เข้าสู่ระบบด้วย:</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    isAdmin ? 'bg-purple-100 text-purple-700' : isPcu ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {isAdmin ? '👑 สิทธิ์ Admin' : isPcu ? '📍 สิทธิ์ รพ.สต.' : 'สิทธิ์ทั่วไป'}
                  </span>
                </div>
                <p className="font-bold text-slate-800 text-xs mt-1">{user.name}</p>
                <p className="text-[11px] text-slate-500">{user.department}</p>
                {user.assignedSubdistrict && (
                  <p className="text-[10px] text-emerald-700 font-semibold mt-1">
                    📍 พื้นที่รับผิดชอบ: {user.assignedSubdistrict} ({user.pcuName})
                  </p>
                )}
                
                {/* Cloud sync status note */}
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                  <span className="text-slate-600 flex items-center gap-1">
                    <Cloud className="w-3.5 h-3.5 text-emerald-600" /> ฐานข้อมูล:
                  </span>
                  <span className="text-emerald-700 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Firebase Realtime
                  </span>
                </div>

                {/* Security Note on Deletion */}
                <div className="mt-1 pt-1 border-t border-slate-200 text-[10px]">
                  {isAdmin ? (
                    <span className="text-purple-700 font-bold flex items-center gap-1">
                      <Crown className="w-3 h-3" /> คุณมีสิทธิ์ลบข้อมูลผู้ป่วยและรายงาน
                    </span>
                  ) : (
                    <span className="text-slate-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" /> สิทธิ์ลบข้อมูลสงวนไว้เฉพาะผู้ดูแลระบบ (Admin)
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-1">
                {onNavigateToUsers && (
                  <button
                    onClick={() => {
                      setShowProfileMenu(false);
                      onNavigateToUsers();
                    }}
                    className="w-full text-left px-3 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 font-bold flex items-center justify-between transition"
                  >
                    <div className="flex items-center gap-2">
                      <Crown className="w-4 h-4 text-purple-600" />
                      <span>จัดการผู้ใช้งาน & สิทธิ์ระบบ (Admin)</span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onOpenLoginModal();
                  }}
                  className="w-full text-left px-3 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold flex items-center justify-between transition"
                >
                  <div className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4 text-blue-600" />
                    <span>เข้าสู่ระบบด้วย User & Password / สลับผู้ใช้งาน</span>
                  </div>
                </button>

                <button
                  onClick={() => {
                    if (confirm('ต้องการรีเซ็ตและซิงค์ข้อมูลเริ่มต้นไปยัง Firebase Cloud หรือไม่?')) {
                      onResetData();
                      setShowProfileMenu(false);
                    }
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl text-slate-600 hover:bg-slate-50 flex items-center gap-2 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5 text-slate-400" />
                  <span>ซิงค์ข้อมูลตัวอย่างเริ่มต้น (Reset Cloud Data)</span>
                </button>

                {onLogout && (
                  <div className="pt-1 mt-1 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setShowProfileMenu(false);
                        onLogout();
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 font-bold flex items-center gap-2 transition"
                    >
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span>ออกจากระบบ (Logout)</span>
                    </button>
                  </div>
                )}
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};
