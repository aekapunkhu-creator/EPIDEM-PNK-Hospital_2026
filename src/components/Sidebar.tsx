import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  SearchCheck,
  Users,
  ShieldCheck,
  Flame,
  MapPin,
  BarChart3,
  FileText,
  Bot,
  FileSpreadsheet,
  AlertTriangle,
  Hospital,
  Clock,
  CheckCircle2
} from 'lucide-react';
import { DiseaseReport, Investigation, ContactPerson, OutbreakEvent } from '../types';

export type NavTab = 
  | 'dashboard'
  | 'reports'
  | 'investigations'
  | 'contacts'
  | 'control'
  | 'outbreaks'
  | 'map'
  | 'analytics'
  | 'export_reports'
  | 'ai_advisor'
  | 'sheets_sync'
  | 'users';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  reports: DiseaseReport[];
  investigations: Investigation[];
  contacts: ContactPerson[];
  outbreaks: OutbreakEvent[];
  pendingUsersCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  reports,
  investigations,
  contacts,
  outbreaks,
  pendingUsersCount = 0
}) => {
  const pendingReports = reports.filter(r => r.status === 'reported' || r.status === 'pending_investigation').length;
  const ongoingInvestigations = investigations.filter(i => i.status === 'draft').length;
  const symptomaticContacts = contacts.filter(c => c.status === 'symptomatic').length;
  const activeOutbreaks = outbreaks.filter(o => o.status === 'active' || o.status === 'under_control').length;

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.ElementType;
    badge?: number;
    badgeColor?: string;
    category?: string;
  }[] = [
    {
      id: 'dashboard',
      label: 'แดชบอร์ดกลาง',
      icon: LayoutDashboard,
      category: 'ภาพรวม'
    },
    {
      id: 'reports',
      label: 'ระบบรับแจ้งโรค 506',
      icon: ClipboardList,
      badge: pendingReports,
      badgeColor: 'bg-amber-500 text-slate-900',
      category: 'กระบวนการระบาดวิทยา'
    },
    {
      id: 'investigations',
      label: 'การสอบสวนโรค',
      icon: SearchCheck,
      badge: ongoingInvestigations,
      badgeColor: 'bg-blue-600 text-white',
      category: 'กระบวนการระบาดวิทยา'
    },
    {
      id: 'contacts',
      label: 'ติดตามผู้สัมผัสโรค',
      icon: Users,
      badge: symptomaticContacts > 0 ? symptomaticContacts : contacts.length,
      badgeColor: symptomaticContacts > 0 ? 'bg-red-500 text-white' : 'bg-slate-700 text-slate-300',
      category: 'กระบวนการระบาดวิทยา'
    },
    {
      id: 'control',
      label: 'แผนควบคุมโรค & 3-3-1',
      icon: ShieldCheck,
      category: 'กระบวนการระบาดวิทยา'
    },
    {
      id: 'outbreaks',
      label: 'การระบาด (Outbreak)',
      icon: Flame,
      badge: activeOutbreaks,
      badgeColor: 'bg-red-600 text-white animate-pulse',
      category: 'เหตุการณ์และแผนที่'
    },
    {
      id: 'map',
      label: 'แผนที่ระบาดวิทยา',
      icon: MapPin,
      category: 'เหตุการณ์และแผนที่'
    },
    {
      id: 'analytics',
      label: 'วิเคราะห์แนวโน้ม & สถิติ',
      icon: BarChart3,
      category: 'ข้อมูลและรายงาน'
    },
    {
      id: 'export_reports',
      label: 'รายงานสรุป 506',
      icon: FileText,
      category: 'ข้อมูลและรายงาน'
    },
    {
      id: 'ai_advisor',
      label: 'ผู้ช่วย AI ระบาดวิทยา',
      icon: Bot,
      category: 'เครื่องมืออัจฉริยะ'
    },
    {
      id: 'sheets_sync',
      label: 'Google Sheets / Drive',
      icon: FileSpreadsheet,
      category: 'เครื่องมืออัจฉริยะ'
    },
    {
      id: 'users',
      label: 'จัดการผู้ใช้งาน (Admin)',
      icon: Users,
      badge: pendingUsersCount,
      badgeColor: 'bg-purple-500 text-white font-bold',
      category: 'บริหารจัดการระบบ'
    },
  ];

  // Group items by category
  const categories = Array.from(new Set(navItems.map(item => item.category || 'ทั่วไป')));

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0 min-h-[calc(100vh-64px)] select-none">
      {/* Brand Header */}
      <div className="p-4 sm:p-5 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/40">
        <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md shadow-blue-600/30 shrink-0">
          P
        </div>
        <div className="min-w-0">
          <h1 className="text-white font-bold text-base leading-none truncate">PNK EPI</h1>
          <p className="text-slate-400 text-[11px] mt-1 tracking-wider truncate">รพ.โพนนาแก้ว สกลนคร</p>
        </div>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 py-3 px-3 space-y-3 overflow-y-auto">
        {categories.map(cat => (
          <div key={cat} className="space-y-1">
            <p className="px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {cat}
            </p>
            {navItems.filter(item => item.category === cat).map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 text-xs font-medium rounded-xl transition-colors group ${
                    isActive
                      ? 'bg-blue-600/15 text-blue-400 font-bold border border-blue-600/30'
                      : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 transition ${isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${item.badgeColor || 'bg-slate-700 text-slate-300'}`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Session Profile Footer */}
      <div className="p-4 bg-slate-950/70 border-t border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-blue-400 text-xs font-bold shrink-0">
            SR
          </div>
          <div className="overflow-hidden min-w-0">
            <p className="text-slate-200 text-xs font-medium truncate">ทีม SRRT รพ.โพนนาแก้ว</p>
            <p className="text-slate-400 text-[10px] truncate uppercase">Epidemiology Center</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
