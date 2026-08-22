import React from 'react';
import {
  Users,
  Activity,
  AlertOctagon,
  ShieldCheck,
  SearchCheck,
  Flame,
  Clock,
  TrendingUp,
  MapPin,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
  ArrowRight,
  Eye,
  CheckCircle2,
  Calendar,
  Building2,
  Sparkles
} from 'lucide-react';
import {
  DiseaseReport,
  Investigation,
  ContactPerson,
  ControlActivity,
  OutbreakEvent,
  EpiAlert,
  SubdistrictInfo
} from '../types';
import { PHON_NA_KAEO_SUBDISTRICTS } from '../data/mockData';
import { NavTab } from './Sidebar';
import { getDiseaseInfo, getDiseaseColor } from '../data/diseaseCatalog';

interface DashboardViewProps {
  reports: DiseaseReport[];
  investigations: Investigation[];
  contacts: ContactPerson[];
  controlActivities: ControlActivity[];
  outbreaks: OutbreakEvent[];
  alerts: EpiAlert[];
  onNavigate: (tab: NavTab) => void;
  onOpenReportModal: () => void;
  onSelectReport: (report: DiseaseReport) => void;
  onSelectOutbreak: (outbreak: OutbreakEvent) => void;
  onOpenAiAssistant: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports,
  investigations,
  contacts,
  controlActivities,
  outbreaks,
  alerts,
  onNavigate,
  onOpenReportModal,
  onSelectReport,
  onSelectOutbreak,
  onOpenAiAssistant
}) => {
  // Key Stats
  const totalReports = reports.length;
  const pendingInvest = reports.filter(r => r.status === 'reported' || r.status === 'pending_investigation').length;
  const ongoingInvest = investigations.filter(i => i.status === 'draft' || (reports.find(r => r.investigationId === i.id)?.status === 'investigating')).length;
  const inControlCases = reports.filter(r => r.status === 'in_control').length;
  const activeOutbreaks = outbreaks.filter(o => o.status === 'active' || o.status === 'under_control').length;
  const contactsMonitored = contacts.length;
  const symptomaticContacts = contacts.filter(c => c.status === 'symptomatic').length;
  const completedActivities = controlActivities.filter(a => a.isCompleted).length;
  const totalActivities = controlActivities.length;

  // Disease Distribution
  const diseaseCounts: Record<string, { count: number; nameTh: string; color: string; badge: string }> = {};
  reports.forEach(r => {
    if (!diseaseCounts[r.disease]) {
      const info = getDiseaseInfo(r.disease);
      const nameTh = r.diseaseNameTh || info?.nameTh || r.disease;
      
      let color = 'bg-slate-50 text-slate-700 border-slate-200';
      let badge = 'bg-slate-100 text-slate-800';
      if (r.disease === 'Dengue' || r.disease === 'DENGUE_FEVER' || r.disease === 'DENGUE_SHOCK') {
        color = 'bg-rose-50 text-rose-700 border-rose-200';
        badge = 'bg-rose-100 text-rose-700';
      } else if (r.disease === 'HFMD') {
        color = 'bg-amber-50 text-amber-700 border-amber-200';
        badge = 'bg-amber-100 text-amber-700';
      } else if (r.disease === 'Influenza' || r.disease === 'INFLUENZA') {
        color = 'bg-blue-50 text-blue-700 border-blue-200';
        badge = 'bg-blue-100 text-blue-700';
      } else if (r.disease === 'Diarrhea' || r.disease === 'ACUTE_DIARRHEA' || r.disease === 'FOOD_POISONING') {
        color = 'bg-purple-50 text-purple-700 border-purple-200';
        badge = 'bg-purple-100 text-purple-700';
      } else if (r.disease === 'Leptospirosis' || r.disease === 'LEPTOSPIROSIS') {
        color = 'bg-emerald-50 text-emerald-700 border-emerald-200';
        badge = 'bg-emerald-100 text-emerald-700';
      } else if (r.disease === 'Melioidosis' || r.disease === 'MELIOIDOSIS') {
        color = 'bg-red-50 text-red-700 border-red-200';
        badge = 'bg-red-100 text-red-700';
      } else if (r.disease === 'TB' || r.disease === 'XDR_TB') {
        color = 'bg-orange-50 text-orange-700 border-orange-200';
        badge = 'bg-orange-100 text-orange-700';
      } else if (r.disease === 'Rabies_Exposure' || r.disease === 'RABIES') {
        color = 'bg-yellow-50 text-yellow-700 border-yellow-200';
        badge = 'bg-yellow-100 text-yellow-700';
      } else if (r.disease === 'COVID-19' || (r.disease as string) === 'COVID19') {
        color = 'bg-indigo-50 text-indigo-700 border-indigo-200';
        badge = 'bg-indigo-100 text-indigo-700';
      } else if (r.disease === 'Chickenpox' || r.disease === 'VARICELLA') {
        color = 'bg-amber-50 text-amber-800 border-amber-200';
        badge = 'bg-amber-100 text-amber-800';
      } else if (r.disease === 'Tetanus' || r.disease === 'TETANUS') {
        color = 'bg-rose-50 text-rose-800 border-rose-300';
        badge = 'bg-rose-100 text-rose-800';
      } else if (r.disease === 'STREP_SUIS') {
        color = 'bg-fuchsia-50 text-fuchsia-800 border-fuchsia-200';
        badge = 'bg-fuchsia-100 text-fuchsia-800';
      } else if (r.disease === 'RTI_DEAD') {
        color = 'bg-slate-100 text-slate-800 border-slate-300';
        badge = 'bg-slate-200 text-slate-800';
      } else if (r.disease === 'DROWNING') {
        color = 'bg-cyan-50 text-cyan-800 border-cyan-200';
        badge = 'bg-cyan-100 text-cyan-800';
      }
      
      diseaseCounts[r.disease] = { count: 0, nameTh, color, badge };
    }
    diseaseCounts[r.disease].count += 1;
  });

  // Subdistrict Breakdown
  const subdistrictStats = PHON_NA_KAEO_SUBDISTRICTS.map(sub => {
    const subReports = reports.filter(r => r.patient.subdistrict === sub.nameTh || r.patient.subdistrict.includes(sub.nameEn));
    const subOutbreaks = outbreaks.filter(o => o.subdistrict === sub.nameTh && o.status !== 'closed');
    const dengueCount = subReports.filter(r => r.disease === 'Dengue').length;
    return {
      ...sub,
      caseCount: subReports.length,
      outbreakCount: subOutbreaks.length,
      dengueCount,
    };
  });

  // Critical Alerts
  const urgentAlerts = alerts.filter(a => a.severity === 'high');

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner: Status Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-50 text-green-700 border border-green-200">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                สถานะเฝ้าระวังโรค: Active Surveillance
              </span>
              <span className="text-xs text-slate-500">
                ข้อมูลอัปเดตเรียลไทม์
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-800 tracking-tight">
              ศูนย์ปฏิบัติการภาวะฉุกเฉินทางระบาดวิทยา (Epi Command Center)
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
              โรงพยาบาลโพนนาแก้ว บูรณาการงานควบคุมโรคติดต่อ 5 ตำบล (นาแก้ว, บ้านแป้น, บ้านแก้ง, นาทม, เชียงสือ)
            </p>
          </div>

          {/* Quick Command Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={onOpenReportModal}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
            >
              <Plus className="w-4 h-4" />
              <span>รับแจ้งผู้ป่วยใหม่</span>
            </button>
            <button
              onClick={onOpenAiAssistant}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-semibold rounded-xl transition"
            >
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI วิเคราะห์ระบาดวิทยา</span>
            </button>
            <button
              onClick={() => onNavigate('map')}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>เปิดแผนที่ GIS</span>
            </button>
          </div>
        </div>

        {/* High Severity Ticker */}
        {urgentAlerts.length > 0 && (
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 bg-red-50/80 border-l-4 border-l-red-500 px-4 py-2.5 rounded-r-xl">
            <div className="flex items-center gap-2 text-xs text-red-800">
              <AlertTriangle className="w-4 h-4 text-red-600 flex-shrink-0 animate-bounce" />
              <span className="font-bold">แจ้งเตือนเร่งด่วน:</span>
              <span className="truncate font-medium">{urgentAlerts[0].title} — {urgentAlerts[0].description}</span>
            </div>
            <button
              onClick={() => onNavigate('outbreaks')}
              className="text-xs font-bold text-red-700 hover:text-red-900 flex items-center gap-1 flex-shrink-0"
            >
              ดูรายละเอียด <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        )}
      </div>

      {/* KPI Counters Grid - Sleek Theme */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* 1. Total Cases */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-blue-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">รายงานทั้งหมด</p>
            <span className="text-green-600 text-xs font-bold bg-green-50 px-1.5 py-0.5 rounded">+12%</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-slate-800">{totalReports} <span className="text-sm text-slate-400 font-normal">ราย</span></p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-blue-600 h-full w-[70%]"></div>
          </div>
        </div>

        {/* 2. Pending Investigation */}
        <div 
          onClick={() => onNavigate('reports')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">รอสอบสวนโรค</p>
            <span className="text-red-600 text-xs font-bold bg-red-50 px-1.5 py-0.5 rounded">ด่วน</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-orange-500">{String(pendingInvest).padStart(2, '0')} <span className="text-sm text-slate-400 font-normal">เคส</span></p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-orange-500 h-full w-[45%]"></div>
          </div>
        </div>

        {/* 3. Investigating */}
        <div 
          onClick={() => onNavigate('investigations')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">กำลังสอบสวน</p>
            <span className="text-indigo-600 text-xs font-bold bg-indigo-50 px-1.5 py-0.5 rounded">SRRT</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-indigo-600">{String(ongoingInvest).padStart(2, '0')} <span className="text-sm text-slate-400 font-normal">เคส</span></p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full w-[60%]"></div>
          </div>
        </div>

        {/* 4. Active Outbreaks */}
        <div 
          onClick={() => onNavigate('outbreaks')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-red-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">เหตุระบาด</p>
            <span className="bg-red-100 text-red-600 text-[10px] px-2 py-0.5 rounded uppercase font-bold">Warning</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-red-600">{String(activeOutbreaks).padStart(2, '0')} <span className="text-sm text-slate-400 font-normal">จุด</span></p>
          <p className="text-[11px] text-slate-500 mt-3 font-medium truncate">ต.นาแก้ว, ต.บ้านแป้น</p>
        </div>

        {/* 5. Contacts Monitored */}
        <div 
          onClick={() => onNavigate('contacts')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-cyan-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">ผู้สัมผัสโรค</p>
            <span className="text-slate-500 text-xs font-medium">14-Day</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-slate-800">{contactsMonitored} <span className="text-sm text-slate-400 font-normal">คน</span></p>
          <div className="flex mt-4 gap-1">
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-green-500"></div>
            <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
          </div>
        </div>

        {/* 6. Control Measures */}
        <div 
          onClick={() => onNavigate('control')}
          className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">มาตรการ 3-3-1</p>
            <span className="text-emerald-600 text-xs font-bold">100m</span>
          </div>
          <p className="text-3xl font-bold mt-2 text-emerald-600">{completedActivities}/{totalActivities}</p>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-600 h-full transition-all"
              style={{ width: `${Math.round((completedActivities / (totalActivities || 1)) * 100)}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Disease Distribution & Recent Cases */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Disease Category Breakdown Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                <h2 className="text-base font-bold text-slate-800">
                  การกระจายของผู้ป่วยแยกตามกลุ่มโรคเฝ้าระวัง
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('analytics')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                ดูกราฟวิเคราะห์ <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Object.entries(diseaseCounts).length === 0 ? (
                <div className="col-span-full py-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-xs font-semibold text-slate-600">ยังไม่มีผู้ป่วยรายงานในระบบ</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">กดปุ่ม "รับแจ้งผู้ป่วยใหม่" เพื่อบันทึกข้อมูล 506</p>
                </div>
              ) : (
                Object.entries(diseaseCounts).map(([diseaseKey, item]) => (
                  <div 
                    key={diseaseKey}
                    onClick={() => onNavigate('reports')}
                    className={`p-3.5 rounded-2xl border ${item.color} hover:shadow-xs cursor-pointer transition`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${item.badge}`}>
                        {diseaseKey}
                      </span>
                      <span className="text-xl font-black text-slate-800">{item.count}</span>
                    </div>
                    <p className="text-xs font-bold text-slate-700 mt-2 truncate">
                      {item.nameTh}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Reported Cases Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs flex flex-col">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                <h2 className="text-base font-bold text-slate-800">
                  ผู้ป่วยที่รายงานล่าสุด (ระบบรับแจ้งโรค 506)
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('reports')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
              >
                ดูทั้งหมด ({reports.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="p-4 divide-y divide-slate-100">
              {reports.length === 0 ? (
                <div className="py-8 text-center text-slate-400">
                  <p className="text-xs font-medium text-slate-600">ไม่มีข้อมูลผู้ป่วยที่ต้องแสดงผล</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">ลบข้อมูลตัวอย่างเรียบร้อย พร้อมสำหรับการบันทึกเคสจริง</p>
                </div>
              ) : (
                reports.slice(0, 4).map(report => (
                <div 
                  key={report.id}
                  onClick={() => onSelectReport(report)}
                  className="py-3 px-3 flex items-center justify-between gap-3 hover:bg-slate-50 rounded-xl transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-slate-100 rounded-xl flex items-center justify-center text-lg shrink-0">
                      {report.disease === 'Dengue' ? '🦟' : report.disease === 'HFMD' ? '🧒' : report.disease === 'Leptospirosis' ? '🌾' : '🤒'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-800">
                          {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}
                        </span>
                        <span className="text-[11px] text-slate-500">
                          ({report.patient.age} ปี, {report.patient.gender === 'male' ? 'ชาย' : 'หญิง'})
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5 truncate">
                        HN: {report.patient.hn} • <span className="text-slate-700 font-semibold">{report.diseaseNameTh}</span> • {report.patient.villageName} {report.patient.subdistrict}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                      report.status === 'reported' ? 'bg-orange-100 text-orange-700' :
                      report.status === 'pending_investigation' ? 'bg-red-100 text-red-700' :
                      report.status === 'investigating' ? 'bg-blue-100 text-blue-700' :
                      report.status === 'in_control' ? 'bg-teal-100 text-teal-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      {report.status === 'reported' ? 'รับแจ้ง' :
                       report.status === 'pending_investigation' ? 'รอสอบสวน' :
                       report.status === 'investigating' ? 'กำลังสอบสวน' :
                       report.status === 'in_control' ? 'กำลังควบคุม' : 'สอบสวนแล้ว'}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-1">เริ่มป่วย {report.onsetDate}</p>
                  </div>
                </div>
              )))}
            </div>

            <div className="p-4 border-t border-slate-100">
              <button 
                onClick={() => onNavigate('reports')}
                className="w-full py-2.5 text-blue-600 font-bold text-xs bg-blue-50 rounded-xl hover:bg-blue-100 transition"
              >
                ดูรายงานทะเบียน 506 ทั้งหมด
              </button>
            </div>
          </div>
        </div>

        {/* Right Column (5 cols): Subdistricts & Outbreak Status */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Active Outbreak Spotlight */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                <h2 className="text-base font-bold text-slate-800">
                  เหตุระบาดที่กำลังดำเนินการ (Active Outbreaks)
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('outbreaks')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                จัดการ
              </button>
            </div>

            <div className="space-y-3">
              {outbreaks.map(ob => (
                <div 
                  key={ob.id}
                  onClick={() => onSelectOutbreak(ob)}
                  className="p-4 rounded-2xl border border-slate-200 hover:border-red-300 hover:bg-red-50/30 transition cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 uppercase">
                      {ob.diseaseNameTh}
                    </span>
                    <span className="text-xs font-bold text-red-600">
                      {ob.totalCases} ราย (AR {ob.attackRatePercent}%)
                    </span>
                  </div>
                  <h3 className="text-xs sm:text-sm font-bold text-slate-800 mt-2 line-clamp-1">
                    {ob.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    📍 {ob.specificLocation} ({ob.villageName} {ob.subdistrict})
                  </p>
                  <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                    <span>เริ่มระบาด: {ob.startDate}</span>
                    <span className="text-blue-600 font-bold">คลิกดูสรุปเหตุการณ์ →</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Phon Na Kaeo Subdistricts Surveillance Table */}
          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
                <h2 className="text-base font-bold text-slate-800">
                  สถานการณ์รายตำบล (อ.โพนนาแก้ว)
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('map')}
                className="text-xs text-blue-600 hover:text-blue-700 font-bold"
              >
                ดูบนแผนที่
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-[11px] text-slate-500 font-bold uppercase">
                    <th className="pb-2">ตำบล / รพ.สต.</th>
                    <th className="pb-2 text-center">ผู้ป่วย</th>
                    <th className="pb-2 text-center">ไข้เลือดออก</th>
                    <th className="pb-2 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {subdistrictStats.map(sub => (
                    <tr key={sub.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5">
                        <p className="font-bold text-slate-800">{sub.nameTh}</p>
                        <p className="text-[11px] text-slate-400">{sub.healthCenter} ({sub.villagesCount} ม.)</p>
                      </td>
                      <td className="py-2.5 text-center font-bold text-slate-800">
                        {sub.caseCount}
                      </td>
                      <td className="py-2.5 text-center font-bold text-rose-600">
                        {sub.dengueCount}
                      </td>
                      <td className="py-2.5 text-right">
                        {sub.outbreakCount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                            Outbreak ({sub.outbreakCount})
                          </span>
                        ) : sub.caseCount > 0 ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700">
                            เฝ้าระวัง
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-green-100 text-green-700">
                            ปกติ
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
