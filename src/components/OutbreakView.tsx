import React, { useState, useMemo } from 'react';
import {
  Flame,
  Plus,
  Users,
  Activity,
  MapPin,
  Calendar,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  FileText,
  Clock,
  ArrowRight,
  UserCheck,
  Building,
  Target,
  Edit3,
  Trash2,
  Search,
  CheckSquare,
  Square,
  Printer,
  ChevronRight,
  Radio,
  Share2,
  ExternalLink,
  Info,
  X,
  Stethoscope,
  PhoneCall,
  Bed,
  Layers,
  HeartPulse
} from 'lucide-react';
import { 
  OutbreakEvent, 
  DiseaseReport, 
  ContactPerson, 
  ControlActivity, 
  Investigation, 
  UserSession, 
  DiseaseCategory,
  EocDirective 
} from '../types';
import { PHON_NA_KAEO_SUBDISTRICTS, PHON_NA_KAEO_VILLAGES, getVillagesBySubdistrict } from '../data/mockData';
import { DISEASE_GROUPS, getDiseaseInfo, getDiseaseColor } from '../data/diseaseCatalog';
import { NavTab } from './Sidebar';

interface OutbreakViewProps {
  outbreaks: OutbreakEvent[];
  reports: DiseaseReport[];
  contacts: ContactPerson[];
  controlActivities?: ControlActivity[];
  investigations?: Investigation[];
  currentUser?: UserSession;
  onSelectOutbreak?: (outbreak: OutbreakEvent) => void;
  onSaveOutbreak: (outbreak: OutbreakEvent) => void;
  onDeleteOutbreak?: (id: string) => void;
  onSaveReport?: (report: DiseaseReport) => void;
  onSaveContact?: (contact: ContactPerson) => void;
  onSaveControlActivity?: (activity: ControlActivity) => void;
  onOpenInvestigationModal?: (report: DiseaseReport, inv?: Investigation) => void;
  onNavigateToTab?: (tab: NavTab) => void;
}

export const OutbreakView: React.FC<OutbreakViewProps> = ({
  outbreaks,
  reports,
  contacts,
  controlActivities = [],
  investigations = [],
  currentUser,
  onSelectOutbreak,
  onSaveOutbreak,
  onDeleteOutbreak,
  onSaveReport,
  onSaveContact,
  onSaveControlActivity,
  onOpenInvestigationModal,
  onNavigateToTab,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string>(outbreaks[0]?.id || '');
  const [activeSubTab, setActiveSubTab] = useState<'analytics' | 'cases' | 'contacts' | 'eoc' | 'map'>('analytics');
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingOutbreak, setEditingOutbreak] = useState<OutbreakEvent | null>(null);
  const [isAttachCasesModalOpen, setIsAttachCasesModalOpen] = useState(false);
  const [isAddDirectiveModalOpen, setIsAddDirectiveModalOpen] = useState(false);
  const [isSitRepPrintModalOpen, setIsSitRepPrintModalOpen] = useState(false);
  const [filterSearch, setFilterSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'under_control' | 'closed'>('all');

  // Currently selected event
  const selectedEvent = useMemo(() => {
    return outbreaks.find(o => o.id === selectedEventId) || outbreaks[0] || null;
  }, [outbreaks, selectedEventId]);

  // Dynamic Case linkage: A report is linked if its outbreakId matches OR its ID is in caseIds array
  const outbreakCases = useMemo(() => {
    if (!selectedEvent) return [];
    return reports.filter(r => 
      r.outbreakId === selectedEvent.id || 
      (selectedEvent.caseIds && selectedEvent.caseIds.includes(r.id))
    );
  }, [reports, selectedEvent]);

  // Contacts linked to these outbreak cases
  const outbreakContacts = useMemo(() => {
    if (outbreakCases.length === 0) return [];
    const caseIds = new Set(outbreakCases.map(c => c.id));
    return contacts.filter(c => caseIds.has(c.reportId));
  }, [contacts, outbreakCases]);

  // Control activities linked to this outbreak
  const outbreakActivities = useMemo(() => {
    if (!selectedEvent) return [];
    return controlActivities.filter(a => 
      a.relatedOutbreakId === selectedEvent.id ||
      (a.subdistrict === selectedEvent.subdistrict && a.relatedDisease === selectedEvent.disease)
    );
  }, [controlActivities, selectedEvent]);

  // -------------------------------------------------------------
  // AUTOMATIC CLUSTER DETECTION ENGINE (ตรวจจับคลัสเตอร์สงสัยจากฐานข้อมูล 506)
  // -------------------------------------------------------------
  const detectedClusters = useMemo(() => {
    const unlinkedReports = reports.filter(r => !r.outbreakId);
    const groups: Record<string, DiseaseReport[]> = {};

    unlinkedReports.forEach(r => {
      // Group by disease and subdistrict and village
      const key = `${r.disease}|${r.patient.subdistrict}|${r.patient.villageName}`;
      if (!groups[key]) groups[key] = [];
      groups[key].push(r);
    });

    const clusters: Array<{
      key: string;
      disease: DiseaseCategory;
      diseaseNameTh: string;
      subdistrict: string;
      villageName: string;
      cases: DiseaseReport[];
      firstOnset: string;
      latestOnset: string;
    }> = [];

    Object.entries(groups).forEach(([key, groupCases]) => {
      if (groupCases.length >= 2) {
        const sorted = [...groupCases].sort((a, b) => new Date(a.onsetDate).getTime() - new Date(b.onsetDate).getTime());
        const first = sorted[0];
        const latest = sorted[sorted.length - 1];
        clusters.push({
          key,
          disease: first.disease,
          diseaseNameTh: first.diseaseNameTh || first.disease,
          subdistrict: first.patient.subdistrict,
          villageName: first.patient.villageName,
          cases: sorted,
          firstOnset: first.onsetDate,
          latestOnset: latest.onsetDate,
        });
      }
    });

    return clusters;
  }, [reports]);

  // Handle 1-Click Launch Outbreak from Cluster
  const handleLaunchOutbreakFromCluster = (cluster: typeof detectedClusters[0]) => {
    const newObId = `ob_${Date.now()}`;
    const subInfo = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === cluster.subdistrict);
    const popRisk = subInfo ? Math.round(subInfo.population / 4) : 500;
    const caseIds = cluster.cases.map(c => c.id);
    const indexCase = cluster.cases[0];

    const newOutbreak: OutbreakEvent = {
      id: newObId,
      title: `เหตุการณ์ระบาด ${cluster.diseaseNameTh} (${cluster.villageName} ${cluster.subdistrict})`,
      disease: cluster.disease,
      diseaseNameTh: cluster.diseaseNameTh,
      subdistrict: cluster.subdistrict,
      villageName: cluster.villageName,
      specificLocation: `ชุมชน${cluster.villageName} และพื้นที่ใกล้เคียง`,
      startDate: cluster.firstOnset,
      reportedDate: new Date().toISOString().split('T')[0],
      status: 'active',
      indexCaseHn: indexCase?.patient?.hn,
      indexCaseName: indexCase ? `${indexCase.patient.prefix || ''}${indexCase.patient.firstName} ${indexCase.patient.lastName}` : undefined,
      caseIds: caseIds,
      totalCases: cluster.cases.length,
      confirmedCases: cluster.cases.filter(c => c.caseType === 'Confirmed').length,
      contactsCount: 0,
      populationAtRisk: popRisk,
      attackRatePercent: Number(((cluster.cases.length / popRisk) * 100).toFixed(2)),
      secondaryAttackRatePercent: 0,
      caseFatalityRatePercent: 0,
      leadInvestigator: currentUser?.name || 'ทีม SRRT รพ.โพนนาแก้ว',
      centerLat: indexCase?.patient?.lat || subInfo?.centerLat || 17.1850,
      centerLng: indexCase?.patient?.lng || subInfo?.centerLng || 104.3820,
      summary: `ตรวจพบคลาสเตอร์การระบาดของ ${cluster.diseaseNameTh} ในพื้นที่ ${cluster.villageName} ${cluster.subdistrict} จำนวน ${cluster.cases.length} ราย เริ่มเปิดศูนย์ EOC เฝ้าระวังและตัดวงจรโรค`,
      controlMeasuresExecuted: [
        'ทีม SRRT ลงพื้นที่สอบสวนโรคเร่งด่วน',
        'ค้นหาผู้ป่วยและผู้สัมผัสเพิ่มเติมในชุมชน (Active Case Finding)',
        'ประสาน รพ.สต. และ อสม. เฝ้าระวังผู้มีอาการสงสัย 14 วัน'
      ],
      eocLevel: 'Level 1',
      eocActivatedAt: new Date().toISOString().split('T')[0],
      eocCommander: 'นพ. ผู้อำนวยการ รพ.โพนนาแก้ว / สาธารณสุขอำเภอ',
      eocOperationsLead: currentUser?.name || 'หัวหน้าทีม SRRT / CDCU',
      eocPlanningLead: 'กลุ่มงานระบาดวิทยา รพ.โพนนาแก้ว',
      eocLogisticsLead: 'ฝ่ายพัสดุและยานพาหนะ สสอ.โพนนาแก้ว',
      eocRiskCommLead: 'งานสุขศึกษาและประชาสัมพันธ์',
      outbreakType: 'Common Source',
      eocDirectives: [
        {
          id: `dir_${Date.now()}_1`,
          commandText: `ลงพื้นที่สอบสวนโรคเคส ${cluster.cases.map(c => c.patient.hn).join(', ')} ภายใน 24 ชม.`,
          assignedSection: 'Operations',
          assignedTo: 'ทีม SRRT อำเภอ & รพ.สต.',
          dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          status: 'in_progress',
          createdAt: new Date().toISOString(),
        },
        {
          id: `dir_${Date.now()}_2`,
          commandText: 'จัดทำแบบรายงานสถานการณ์ (SitRep ฉบับที่ 1) รายงานนายแพทย์สาธารณสุขจังหวัด',
          assignedSection: 'Planning',
          assignedTo: 'นักวิชาการสาธารณสุข',
          dueDate: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
          status: 'pending',
          createdAt: new Date().toISOString(),
        }
      ]
    };

    onSaveOutbreak(newOutbreak);

    // Link reports to this outbreak
    if (onSaveReport) {
      cluster.cases.forEach(c => {
        onSaveReport({
          ...c,
          outbreakId: newObId
        });
      });
    }

    setSelectedEventId(newObId);
    alert(`เปิดเหตุการณ์ระบาดและศูนย์ EOC สำเร็จ! ผูกเคสผู้ป่วย ${cluster.cases.length} รายเรียบร้อย`);
  };

  // -------------------------------------------------------------
  // CALCULATE EPIDEMIOLOGICAL METRICS (คำนวณตัวชี้วัดระบาดวิทยา)
  // -------------------------------------------------------------
  const epiMetrics = useMemo(() => {
    if (!selectedEvent) return null;

    const totalCasesCount = outbreakCases.length > 0 ? outbreakCases.length : selectedEvent.totalCases;
    const popRisk = selectedEvent.populationAtRisk || 500;
    const attackRate = Number(((totalCasesCount / popRisk) * 100).toFixed(2));
    
    const symptomaticContacts = outbreakContacts.filter(c => c.status === 'symptomatic' || c.status === 'converted_case').length;
    const totalContacts = outbreakContacts.length > 0 ? outbreakContacts.length : (selectedEvent.contactsCount || 1);
    const secondaryAttackRate = totalContacts > 0 ? Number(((symptomaticContacts / totalContacts) * 100).toFixed(2)) : 0;

    const admittedCount = outbreakCases.filter(c => c.isAdmitted).length;
    const hospitalizationRate = totalCasesCount > 0 ? Number(((admittedCount / totalCasesCount) * 100).toFixed(1)) : 0;

    // Age groups
    let under15 = 0;
    let age15to60 = 0;
    let over60 = 0;
    let maleCount = 0;
    let femaleCount = 0;

    outbreakCases.forEach(c => {
      if (c.patient.age < 15) under15++;
      else if (c.patient.age <= 60) age15to60++;
      else over60++;

      if (c.patient.gender === 'male') maleCount++;
      else if (c.patient.gender === 'female') femaleCount++;
    });

    // Epidemic Curve Day by Day Data
    const onsetMap: Record<string, { date: string; confirmed: number; probable: number; suspected: number; total: number }> = {};
    
    outbreakCases.forEach(c => {
      const d = c.onsetDate || c.reportDate || selectedEvent.startDate;
      if (!onsetMap[d]) {
        onsetMap[d] = { date: d, confirmed: 0, probable: 0, suspected: 0, total: 0 };
      }
      if (c.caseType === 'Confirmed') onsetMap[d].confirmed += 1;
      else if (c.caseType === 'Probable') onsetMap[d].probable += 1;
      else onsetMap[d].suspected += 1;
      onsetMap[d].total += 1;
    });

    const epiCurveData = Object.values(onsetMap).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return {
      totalCasesCount,
      popRisk,
      attackRate,
      secondaryAttackRate,
      hospitalizationRate,
      admittedCount,
      under15,
      age15to60,
      over60,
      maleCount,
      femaleCount,
      epiCurveData,
      symptomaticContacts,
      totalContacts
    };
  }, [selectedEvent, outbreakCases, outbreakContacts]);

  // AI Field Epidemiologist Analysis
  const handleRunAiAnalysis = async (ob: OutbreakEvent) => {
    setIsAnalyzing(true);
    try {
      const response = await fetch('/api/gemini/analyze-outbreak', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          outbreak: ob,
          cases: outbreakCases,
          contacts: outbreakContacts,
          subdistrict: ob.subdistrict,
        })
      });
      const data = await response.json();
      setAiAnalysis(data.analysis || 'ผลการวิเคราะห์ทางระบาดวิทยาสมบูรณ์');
    } catch (err) {
      console.error(err);
      setAiAnalysis('เกิดข้อผิดพลาดในการเชื่อมต่อ AI กำลังใช้ข้อมูลวิเคราะห์มาตรฐาน');
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Toggle Case Linkage to current Outbreak
  const handleToggleCaseLinkage = (report: DiseaseReport) => {
    if (!selectedEvent || !onSaveReport) return;

    const isCurrentlyLinked = report.outbreakId === selectedEvent.id || 
      (selectedEvent.caseIds && selectedEvent.caseIds.includes(report.id));

    let updatedCaseIds = [...(selectedEvent.caseIds || [])];

    if (isCurrentlyLinked) {
      // Unlink
      onSaveReport({ ...report, outbreakId: undefined });
      updatedCaseIds = updatedCaseIds.filter(id => id !== report.id);
    } else {
      // Link
      onSaveReport({ ...report, outbreakId: selectedEvent.id });
      if (!updatedCaseIds.includes(report.id)) {
        updatedCaseIds.push(report.id);
      }
    }

    const updatedOb: OutbreakEvent = {
      ...selectedEvent,
      caseIds: updatedCaseIds,
      totalCases: updatedCaseIds.length,
      attackRatePercent: Number(((updatedCaseIds.length / (selectedEvent.populationAtRisk || 500)) * 100).toFixed(2))
    };
    onSaveOutbreak(updatedOb);
  };

  // Set Index Case
  const handleSetIndexCase = (report: DiseaseReport) => {
    if (!selectedEvent) return;
    const updated: OutbreakEvent = {
      ...selectedEvent,
      indexCaseHn: report.patient.hn,
      indexCaseName: `${report.patient.prefix || ''}${report.patient.firstName} ${report.patient.lastName} (${report.patient.age} ปี)`
    };
    onSaveOutbreak(updated);
    alert(`ตั้งค่าผู้ป่วย HN: ${report.patient.hn} (${report.patient.firstName}) เป็น Index Case เรียบร้อย`);
  };

  // Directives Handler
  const handleToggleDirective = (dirId: string) => {
    if (!selectedEvent) return;
    const currentDirs = selectedEvent.eocDirectives || [];
    const updatedDirs = currentDirs.map(d => {
      if (d.id === dirId) {
        const nextStatus = d.status === 'completed' ? 'in_progress' : 'completed';
        return {
          ...d,
          status: nextStatus as 'pending' | 'in_progress' | 'completed',
          completedAt: nextStatus === 'completed' ? new Date().toISOString().split('T')[0] : undefined
        };
      }
      return d;
    });

    onSaveOutbreak({
      ...selectedEvent,
      eocDirectives: updatedDirs
    });
  };

  // Filtered Outbreaks List
  const filteredOutbreaks = outbreaks.filter(ob => {
    if (statusFilter !== 'all' && ob.status !== statusFilter) return false;
    if (filterSearch) {
      const q = filterSearch.toLowerCase();
      return (
        ob.title.toLowerCase().includes(q) ||
        ob.diseaseNameTh.toLowerCase().includes(q) ||
        ob.subdistrict.toLowerCase().includes(q) ||
        ob.villageName.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* 1. TOP HEADER & ACTION BAR */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-6 bg-red-600 rounded-full animate-pulse"></span>
            <h1 className="text-lg sm:text-xl font-black text-slate-800 tracking-tight flex items-center gap-2">
              <span>ศูนย์บัญชาการเหตุการณ์ระบาด & EOC</span>
              <span className="text-xs px-2.5 py-0.5 rounded-lg bg-red-100 text-red-700 font-bold border border-red-200">
                Outbreak Management
              </span>
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รวมศูนย์เชื่อมโยงเคสผู้ป่วย 506, คลัสเตอร์ระบาด, คำนวณ Attack Rate / Epi Curve และติดตามข้อสั่งการ ICS อ.โพนนาแก้ว
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {detectedClusters.length > 0 && (
            <span className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-50 border border-amber-300 text-amber-800 text-xs font-bold rounded-xl animate-bounce">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>ตรวจพบ {detectedClusters.length} คลัสเตอร์สงสัย!</span>
            </span>
          )}

          <button
            onClick={() => {
              setEditingOutbreak(null);
              setIsCreateModalOpen(true);
            }}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-md shadow-red-600/20 transition active:scale-95 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>เปิดเหตุการณ์ระบาด / EOC ใหม่</span>
          </button>
        </div>
      </div>

      {/* 2. AUTOMATIC CLUSTER DETECTION NOTIFICATION BANNER */}
      {detectedClusters.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-red-500/10 border border-amber-200 rounded-3xl p-5 space-y-3 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Flame className="w-5 h-5 text-red-600 animate-pulse" />
              <span>ระบบอัจฉริยะตรวจจับคลัสเตอร์ระบาดอัตโนมัติ (Automated Cluster Detection)</span>
            </div>
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-md bg-amber-200/60 text-amber-900">
              วิเคราะห์จากฐานข้อมูล 506 ล่าสุด
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {detectedClusters.map((cl, idx) => (
              <div key={cl.key} className="bg-white border border-amber-200 rounded-2xl p-4 shadow-2xs space-y-2.5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-100 text-rose-700">
                      {cl.diseaseNameTh}
                    </span>
                    <span className="text-[11px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded-md">
                      พบ {cl.cases.length} รายในพื้นที่
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-slate-800 mt-2">
                    📍 {cl.villageName} ({cl.subdistrict})
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    วันเริ่มป่วย: {cl.firstOnset} ถึง {cl.latestOnset}
                  </p>
                </div>

                <button
                  onClick={() => handleLaunchOutbreakFromCluster(cl)}
                  className="w-full mt-2 py-2 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>เปิดศูนย์ EOC จากคลัสเตอร์นี้ทันที</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 3. OUTBREAK SELECTION GRID & SEARCH */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
              เหตุการณ์ระบาดทั้งหมด ({filteredOutbreaks.length} รายการ)
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อเหตุการณ์ / โรค / พื้นที่..."
                value={filterSearch}
                onChange={(e) => setFilterSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 w-48 sm:w-60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(e: any) => setStatusFilter(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-2.5 py-1.5 text-xs font-medium text-slate-700 focus:outline-none"
            >
              <option value="all">ทุกสถานะ</option>
              <option value="active">กำลังระบาด (Active)</option>
              <option value="under_control">ควบคุมได้ (Under Control)</option>
              <option value="closed">ปิดเหตุการณ์ (Closed)</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredOutbreaks.map(ob => {
            const isSelected = selectedEvent?.id === ob.id;
            const casesCount = reports.filter(r => r.outbreakId === ob.id || (ob.caseIds && ob.caseIds.includes(r.id))).length;
            const colorInfo = getDiseaseColor(ob.disease);

            return (
              <div
                key={ob.id}
                onClick={() => {
                  setSelectedEventId(ob.id);
                  setAiAnalysis('');
                  if (onSelectOutbreak) onSelectOutbreak(ob);
                }}
                className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'bg-red-50/50 border-red-400 shadow-md ring-2 ring-red-500/20'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs shadow-2xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-1">
                    <span 
                      className="text-[10px] font-bold px-2 py-0.5 rounded-md uppercase"
                      style={{ backgroundColor: colorInfo.bg, color: colorInfo.main }}
                    >
                      {ob.diseaseNameTh || ob.disease}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      ob.status === 'active' ? 'bg-red-100 text-red-700' :
                      ob.status === 'under_control' ? 'bg-amber-100 text-amber-700' :
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {ob.status === 'active' ? '🔴 กำลังระบาด' :
                       ob.status === 'under_control' ? '🟡 ควบคุมได้' : '🟢 ปิดเหตุการณ์'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-800 mt-2.5 line-clamp-1">
                    {ob.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{ob.specificLocation} ({ob.villageName} {ob.subdistrict})</span>
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium">ผู้ป่วย</p>
                      <p className="text-sm font-black text-red-600">{casesCount || ob.totalCases} ราย</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium">Attack Rate</p>
                      <p className="text-sm font-black text-amber-600">{ob.attackRatePercent || 0}%</p>
                    </div>
                    <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium">EOC Level</p>
                      <p className="text-xs font-bold text-blue-700 mt-0.5">{ob.eocLevel || 'Level 1'}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 text-[11px] text-slate-400">
                    <span>เริ่ม: {ob.startDate}</span>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingOutbreak(ob);
                          setIsCreateModalOpen(true);
                        }}
                        className="p-1 hover:text-blue-600 transition"
                        title="แก้ไขเหตุการณ์"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      {onDeleteOutbreak && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            if (confirm(`ยืนยันลบเหตุการณ์ระบาด: ${ob.title} ?`)) {
                              onDeleteOutbreak(ob.id);
                            }
                          }}
                          className="p-1 hover:text-red-600 transition"
                          title="ลบเหตุการณ์"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. DETAILED OPERATIONAL & ANALYTICAL WORKBENCH FOR SELECTED OUTBREAK */}
      {selectedEvent && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          {/* Main Title & Action Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 pb-5">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-red-100 text-red-700">
                  {selectedEvent.diseaseNameTh}
                </span>
                <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-700">
                  EOC {selectedEvent.eocLevel || 'Level 1'}
                </span>
                <span className="text-xs font-medium text-slate-400">
                  ID: {selectedEvent.id}
                </span>
              </div>

              <h2 className="text-lg font-black text-slate-800 mt-1.5">
                {selectedEvent.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1 flex flex-wrap items-center gap-3">
                <span>📍 {selectedEvent.specificLocation} ({selectedEvent.villageName} {selectedEvent.subdistrict})</span>
                <span>• วันที่เริ่มระบาด: {selectedEvent.startDate}</span>
                <span>• ผู้บัญชาการเหตุการณ์: <strong>{selectedEvent.eocCommander || 'ผอ.รพ.โพนนาแก้ว'}</strong></span>
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setIsSitRepPrintModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์รายงาน SitRep</span>
              </button>

              <button
                onClick={() => setIsAttachCasesModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 text-xs font-bold rounded-xl transition cursor-pointer"
              >
                <UserCheck className="w-4 h-4" />
                <span>ผูกเคสผู้ป่วยเข้าเหตุการณ์ ({outbreakCases.length})</span>
              </button>

              <button
                onClick={() => handleRunAiAnalysis(selectedEvent)}
                disabled={isAnalyzing}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isAnalyzing ? 'AI กำลังวิเคราะห์ข้อมูล...' : 'AI วิเคราะห์ระบาดวิทยา & สรุปมาตรการ'}</span>
              </button>
            </div>
          </div>

          {/* AI Field Epidemiologist Insights Output */}
          {aiAnalysis && (
            <div className="bg-gradient-to-br from-indigo-50/80 to-blue-50/80 border border-indigo-200 rounded-2xl p-5 space-y-3 text-xs shadow-2xs">
              <div className="flex items-center justify-between text-indigo-900 font-bold">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>ผลการวิเคราะห์ทางระบาดวิทยาภาคสนามโดย AI (Gemini Field Epidemiologist):</span>
                </div>
                <button
                  onClick={() => setAiAnalysis('')}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-indigo-950 leading-relaxed whitespace-pre-line text-xs font-medium bg-white/70 p-4 rounded-xl border border-indigo-100">
                {aiAnalysis}
              </p>
            </div>
          )}

          {/* SUB-TABS NAVIGATION */}
          <div className="flex items-center gap-2 border-b border-slate-200 overflow-x-auto pb-1">
            <button
              onClick={() => setActiveSubTab('analytics')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'analytics'
                  ? 'border-red-600 text-red-600 bg-red-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>1. การวิเคราะห์ระบาดวิทยา & Epidemic Curve</span>
            </button>

            <button
              onClick={() => setActiveSubTab('cases')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'cases'
                  ? 'border-red-600 text-red-600 bg-red-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>2. รายชื่อผู้ป่วยในเหตุการณ์ ({outbreakCases.length} ราย)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('contacts')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'contacts'
                  ? 'border-red-600 text-red-600 bg-red-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>3. ผู้สัมผัส & เครือข่ายระบาด ({outbreakContacts.length} คน)</span>
            </button>

            <button
              onClick={() => setActiveSubTab('eoc')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'eoc'
                  ? 'border-red-600 text-red-600 bg-red-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>4. ข้อสั่งการ EOC & มาตรการ 3-3-1</span>
            </button>

            <button
              onClick={() => setActiveSubTab('map')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition whitespace-nowrap cursor-pointer ${
                activeSubTab === 'map'
                  ? 'border-red-600 text-red-600 bg-red-50/30'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <MapPin className="w-4 h-4" />
              <span>5. จุดเกิดเหตุ & พิกัด GIS</span>
            </button>
          </div>

          {/* ========================================================= */}
          {/* SUB-TAB 1: EPIDEMIOLOGICAL ANALYTICS & CURVE */}
          {/* ========================================================= */}
          {activeSubTab === 'analytics' && epiMetrics && (
            <div className="space-y-6">
              {/* Key Metric Indicator Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-red-50/60 border border-red-200 rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-red-700 uppercase">Attack Rate (อัตราการเกิดโรค)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-red-700">{epiMetrics.attackRate}%</span>
                    <span className="text-[11px] text-slate-500">({epiMetrics.totalCasesCount} / {epiMetrics.popRisk} คน)</span>
                  </div>
                  <div className="w-full bg-red-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-red-600 h-1.5 rounded-full" style={{ width: `${Math.min(epiMetrics.attackRate * 5, 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-amber-50/60 border border-amber-200 rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-amber-700 uppercase">Secondary Attack Rate (SAR)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-amber-700">{epiMetrics.secondaryAttackRate}%</span>
                    <span className="text-[11px] text-slate-500">({epiMetrics.symptomaticContacts} / {epiMetrics.totalContacts} ผู้สัมผัส)</span>
                  </div>
                  <div className="w-full bg-amber-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-amber-500 h-1.5 rounded-full" style={{ width: `${Math.min(epiMetrics.secondaryAttackRate, 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-200 rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-blue-700 uppercase">Hospitalization Rate (Admit)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-blue-700">{epiMetrics.hospitalizationRate}%</span>
                    <span className="text-[11px] text-slate-500">({epiMetrics.admittedCount} รายนอน รพ.)</span>
                  </div>
                  <div className="w-full bg-blue-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${Math.min(epiMetrics.hospitalizationRate, 100)}%` }}></div>
                  </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-200 rounded-2xl p-4">
                  <p className="text-[11px] font-bold text-emerald-700 uppercase">Case Fatality Rate (CFR)</p>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-2xl font-black text-emerald-700">0.0%</span>
                    <span className="text-[11px] text-emerald-600 font-bold">ไม่มีผู้เสียชีวิต</span>
                  </div>
                  <div className="w-full bg-emerald-200 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div className="bg-emerald-500 h-1.5 rounded-full" style={{ width: `0%` }}></div>
                  </div>
                </div>
              </div>

              {/* EPIDEMIC CURVE VISUALIZER */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-red-600" />
                      <span>Epidemic Curve (กราฟการกระจายผู้ป่วยตามวันเริ่มป่วย Onset Date)</span>
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ลักษณะการระบาด: <strong>{selectedEvent.outbreakType || 'Common Source Outbreak'}</strong>
                    </p>
                  </div>

                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-red-600"></span>
                      <span className="text-slate-600 text-[11px]">ยืนยัน (Confirmed)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-amber-500"></span>
                      <span className="text-slate-600 text-[11px]">น่าจะป่วย (Probable)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-3 h-3 rounded-xs bg-blue-400"></span>
                      <span className="text-slate-600 text-[11px]">สงสัย (Suspected)</span>
                    </span>
                  </div>
                </div>

                {epiMetrics.epiCurveData.length > 0 ? (
                  <div className="space-y-2 pt-2">
                    <div className="flex items-end gap-3 h-48 px-4 overflow-x-auto border-b border-slate-300 pb-2">
                      {epiMetrics.epiCurveData.map((d) => {
                        const maxH = Math.max(...epiMetrics.epiCurveData.map(x => x.total), 3);
                        const heightPercent = Math.max((d.total / maxH) * 100, 15);
                        const isIndex = selectedEvent.startDate === d.date;

                        return (
                          <div key={d.date} className="flex flex-col items-center gap-1 min-w-[50px] flex-1">
                            <span className="text-[10px] font-black text-slate-700">{d.total}</span>
                            <div className="w-full max-w-[40px] flex flex-col justify-end rounded-t-lg overflow-hidden" style={{ height: `${heightPercent}%` }}>
                              {d.confirmed > 0 && (
                                <div 
                                  className="bg-red-600 w-full transition-all"
                                  style={{ height: `${(d.confirmed / d.total) * 100}%` }}
                                  title={`ยืนยัน: ${d.confirmed} ราย`}
                                />
                              )}
                              {d.probable > 0 && (
                                <div 
                                  className="bg-amber-500 w-full transition-all"
                                  style={{ height: `${(d.probable / d.total) * 100}%` }}
                                  title={`น่าจะป่วย: ${d.probable} ราย`}
                                />
                              )}
                              {d.suspected > 0 && (
                                <div 
                                  className="bg-blue-400 w-full transition-all"
                                  style={{ height: `${(d.suspected / d.total) * 100}%` }}
                                  title={`สงสัย: ${d.suspected} ราย`}
                                />
                              )}
                            </div>
                            <span className={`text-[10px] font-bold mt-1 text-center whitespace-nowrap ${isIndex ? 'text-red-700 bg-red-100 px-1 rounded-xs' : 'text-slate-500'}`}>
                              {d.date.slice(5)}
                              {isIndex && ' (Index)'}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 px-2">
                      <span>⬅️ วันเริ่มป่วยรายแรก: {selectedEvent.startDate}</span>
                      <span>วันที่รายงานล่าสุด: {selectedEvent.reportedDate} ➡️</span>
                    </div>
                  </div>
                ) : (
                  <div className="p-8 text-center text-slate-400 text-xs">
                    ยังไม่มีข้อมูลวันที่เริ่มป่วยของเคสในคลัสเตอร์นี้
                  </div>
                )}
              </div>

              {/* Demographic Profile Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">สัดส่วนกลุ่มอายุ (Age Distribution)</h4>
                  <div className="space-y-2 text-xs">
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>เด็กเล็ก & นักเรียน (&lt; 15 ปี)</span>
                        <span className="font-bold text-slate-800">{epiMetrics.under15} ราย</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${(epiMetrics.under15 / Math.max(epiMetrics.totalCasesCount, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>วัยแรงงาน (15 - 60 ปี)</span>
                        <span className="font-bold text-slate-800">{epiMetrics.age15to60} ราย</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${(epiMetrics.age15to60 / Math.max(epiMetrics.totalCasesCount, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-[11px] font-medium text-slate-600 mb-1">
                        <span>ผู้สูงอายุ (&gt; 60 ปี)</span>
                        <span className="font-bold text-slate-800">{epiMetrics.over60} ราย</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2">
                        <div className="bg-amber-500 h-2 rounded-full" style={{ width: `${(epiMetrics.over60 / Math.max(epiMetrics.totalCasesCount, 1)) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-2xl p-4 space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 uppercase">สัดส่วนเพศ (Gender Ratio)</h4>
                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="bg-blue-50/60 border border-blue-100 p-3 rounded-xl">
                      <p className="text-[11px] font-medium text-blue-600">ชาย (Male)</p>
                      <p className="text-lg font-black text-blue-700">{epiMetrics.maleCount} ราย</p>
                      <p className="text-[10px] text-slate-400">
                        {epiMetrics.totalCasesCount > 0 ? ((epiMetrics.maleCount / epiMetrics.totalCasesCount) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                    <div className="bg-rose-50/60 border border-rose-100 p-3 rounded-xl">
                      <p className="text-[11px] font-medium text-rose-600">หญิง (Female)</p>
                      <p className="text-lg font-black text-rose-700">{epiMetrics.femaleCount} ราย</p>
                      <p className="text-[10px] text-slate-400">
                        {epiMetrics.totalCasesCount > 0 ? ((epiMetrics.femaleCount / epiMetrics.totalCasesCount) * 100).toFixed(0) : 0}%
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 2: LINKED CASES LIST */}
          {/* ========================================================= */}
          {activeSubTab === 'cases' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">
                    ผู้ป่วยที่เชื่อมโยงในเหตุการณ์นี้ ({outbreakCases.length} ราย)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    สามารถกดเปิดดูประวัติการสอบสวน หรือตั้งค่า Index Case ได้ทันที
                  </p>
                </div>

                <button
                  onClick={() => setIsAttachCasesModalOpen(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>ผูกเคสจากระบบ 506 เพิ่ม</span>
                </button>
              </div>

              {outbreakCases.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200 rounded-2xl">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-100/70 text-slate-600 font-bold border-b border-slate-200 text-[11px] uppercase">
                        <th className="py-3 px-3">ผู้ป่วย / HN</th>
                        <th className="py-3 px-3">ประเภทเคส</th>
                        <th className="py-3 px-3">วันเริ่มป่วย</th>
                        <th className="py-3 px-3">ที่อยู่ / หมู่บ้าน</th>
                        <th className="py-3 px-3">ผลแล็บ / อาการ</th>
                        <th className="py-3 px-3">สถานะ</th>
                        <th className="py-3 px-3 text-right">การจัดการ</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {outbreakCases.map(c => {
                        const isIndex = selectedEvent.indexCaseHn === c.patient.hn;
                        const existingInv = investigations.find(i => i.reportId === c.id);

                        return (
                          <tr key={c.id} className="hover:bg-slate-50/80 transition">
                            <td className="py-3 px-3 font-bold text-slate-800">
                              <div className="flex items-center gap-2">
                                <div>
                                  <p className="flex items-center gap-1.5">
                                    <span>{c.patient.prefix}{c.patient.firstName} {c.patient.lastName}</span>
                                    {isIndex && (
                                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-red-600 text-white">
                                        INDEX CASE
                                      </span>
                                    )}
                                  </p>
                                  <p className="text-[10px] text-slate-400 font-normal">HN: {c.patient.hn} • อายุ {c.patient.age} ปี ({c.patient.gender === 'male' ? 'ชาย' : 'หญิง'})</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-3">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                c.caseType === 'Confirmed' ? 'bg-red-100 text-red-700' :
                                c.caseType === 'Probable' ? 'bg-amber-100 text-amber-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {c.caseType}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-slate-600 font-medium">{c.onsetDate}</td>
                            <td className="py-3 px-3 text-slate-600">
                              <p className="font-medium text-slate-700">{c.patient.villageName}</p>
                              <p className="text-[10px] text-slate-400">{c.patient.subdistrict}</p>
                            </td>
                            <td className="py-3 px-3 text-slate-600">
                              <p className="text-[11px] font-medium text-slate-800 line-clamp-1">{c.labResult?.testName}: <strong className="text-red-600">{c.labResult?.result}</strong></p>
                              {c.isAdmitted && (
                                <span className="text-[10px] text-blue-700 font-semibold flex items-center gap-1 mt-0.5">
                                  <Bed className="w-3 h-3" /> Admit: {c.admissionWard || 'IPD'}
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-3">
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                                {c.status}
                              </span>
                            </td>
                            <td className="py-3 px-3 text-right">
                              <div className="flex items-center justify-end gap-1.5">
                                {onOpenInvestigationModal && (
                                  <button
                                    onClick={() => onOpenInvestigationModal(c, existingInv)}
                                    className="px-2 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-[11px] font-bold transition flex items-center gap-1 cursor-pointer"
                                    title="เปิดแบบสอบสวนโรค"
                                  >
                                    <FileText className="w-3 h-3" />
                                    <span>สอบสวน</span>
                                  </button>
                                )}

                                {!isIndex && (
                                  <button
                                    onClick={() => handleSetIndexCase(c)}
                                    className="px-2 py-1 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 text-[11px] font-bold transition cursor-pointer"
                                    title="ตั้งเป็นผู้ป่วยรายแรก (Index Case)"
                                  >
                                    ตั้งเป็น Index
                                  </button>
                                )}

                                <button
                                  onClick={() => handleToggleCaseLinkage(c)}
                                  className="px-2 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[11px] font-bold transition cursor-pointer"
                                  title="ปลดเคสออกจากเหตุการณ์ระบาดนี้"
                                >
                                  ปลดออก
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="p-10 text-center bg-slate-50 border border-slate-200 rounded-3xl space-y-3">
                  <Users className="w-8 h-8 text-slate-300 mx-auto" />
                  <p className="text-xs font-bold text-slate-600">ยังไม่มีผู้ป่วยเชื่อมโยงกับเหตุการณ์นี้</p>
                  <button
                    onClick={() => setIsAttachCasesModalOpen(true)}
                    className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    เลือกเคสผู้ป่วย 506 เข้าเหตุการณ์
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 3: CONTACT TRACING NETWORK */}
          {/* ========================================================= */}
          {activeSubTab === 'contacts' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-xs font-bold text-slate-800 uppercase">
                    ผู้สัมผัสโรคในคลัสเตอร์นี้ ({outbreakContacts.length} คน)
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    ติดตามอาการและประเมิน Secondary Attack Rate (SAR)
                  </p>
                </div>

                {onNavigateToTab && (
                  <button
                    onClick={() => onNavigateToTab('contacts')}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 font-bold text-xs rounded-xl transition cursor-pointer"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>ไปที่แท็บติดตามผู้สัมผัสเต็มรูปแบบ</span>
                  </button>
                )}
              </div>

              {outbreakContacts.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {outbreakContacts.map(con => (
                    <div key={con.id} className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">{con.name} (อายุ {con.age} ปี)</span>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                          con.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          con.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          เสี่ยง: {con.riskLevel}
                        </span>
                      </div>

                      <p className="text-xs text-slate-600">
                        สัมผัสกับเคส: <strong>HN {con.caseHn} ({con.caseName})</strong>
                      </p>
                      <p className="text-[11px] text-slate-500">
                        ลักษณะการสัมผัส: {con.exposureType} • วันที่สัมผัส: {con.exposureDate}
                      </p>

                      <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-xs">
                        <span className="text-[11px] text-slate-500">
                          สถานะ: <strong className={con.status === 'symptomatic' ? 'text-red-600' : 'text-slate-700'}>{con.status}</strong>
                        </span>
                        {con.phone && (
                          <span className="text-[11px] text-blue-600 font-medium flex items-center gap-1">
                            <PhoneCall className="w-3 h-3" /> {con.phone}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-slate-400 text-xs bg-slate-50 rounded-2xl border border-slate-200">
                  ยังไม่มีผู้สัมผัสที่บันทึกไว้ในเคสของคลัสเตอร์นี้
                </div>
              )}
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 4: EOC COMMAND STRUCTURE & DIRECTIVES */}
          {/* ========================================================= */}
          {activeSubTab === 'eoc' && (
            <div className="space-y-6">
              {/* EOC Command Hierarchy (Incident Command System) */}
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      โครงสร้างบัญชาการเหตุการณ์ (ICS Command Structure)
                    </h3>
                  </div>
                  <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-blue-100 text-blue-800">
                    ศูนย์ EOC {selectedEvent.eocLevel || 'Level 1'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-blue-700 uppercase">ผู้บัญชาการเหตุการณ์ (Incident Commander)</p>
                    <p className="font-bold text-slate-800">{selectedEvent.eocCommander || 'ผอ.รพ.โพนนาแก้ว'}</p>
                    <p className="text-[10px] text-slate-400">อนุมัติแผน สั่งการเปิด/ปิดศูนย์ EOC</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-red-700 uppercase">ฝ่ายปฏิบัติการ (Operations Chief)</p>
                    <p className="font-bold text-slate-800">{selectedEvent.eocOperationsLead || 'หัวหน้าทีม SRRT / CDCU'}</p>
                    <p className="text-[10px] text-slate-400">ลงพื้นที่สอบสวน ควบคุมโรค พ่นสารเคมี</p>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-slate-200 space-y-1">
                    <p className="text-[10px] font-bold text-amber-700 uppercase">ฝ่ายแผน & ระบาดวิทยา (Planning & Situation)</p>
                    <p className="font-bold text-slate-800">{selectedEvent.eocPlanningLead || 'กลุ่มงานระบาดวิทยา'}</p>
                    <p className="text-[10px] text-slate-400">วิเคราะห์ข้อมูล Epi Curve และทำ SitRep</p>
                  </div>
                </div>
              </div>

              {/* EOC Directives & Action Tracker */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-600" />
                    <span>ระบบติดตามข้อสั่งการ EOC & มอบหมายภารกิจ (EOC Directives Tracker)</span>
                  </h3>

                  <button
                    onClick={() => setIsAddDirectiveModalOpen(true)}
                    className="flex items-center gap-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มข้อสั่งการ</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {(selectedEvent.eocDirectives && selectedEvent.eocDirectives.length > 0) ? (
                    selectedEvent.eocDirectives.map((dir) => (
                      <div
                        key={dir.id}
                        onClick={() => handleToggleDirective(dir.id)}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start justify-between gap-3 ${
                          dir.status === 'completed'
                            ? 'bg-slate-50 border-slate-200 opacity-75'
                            : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <button className="mt-0.5 text-emerald-600">
                            {dir.status === 'completed' ? (
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 fill-emerald-100" />
                            ) : (
                              <Square className="w-5 h-5 text-slate-300" />
                            )}
                          </button>
                          <div>
                            <p className={`text-xs font-bold ${dir.status === 'completed' ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {dir.commandText}
                            </p>
                            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                              <span>ฝ่าย: <strong>{dir.assignedSection}</strong></span>
                              <span>• ผู้รับผิดชอบ: <strong>{dir.assignedTo}</strong></span>
                              <span>• กำหนดส่ง: <strong>{dir.dueDate}</strong></span>
                            </p>
                          </div>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md shrink-0 ${
                          dir.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                          dir.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-600'
                        }`}>
                          {dir.status === 'completed' ? 'เสร็จสิ้น' : dir.status === 'in_progress' ? 'กำลังทำ' : 'รอดำเนินการ'}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-slate-400 text-xs bg-slate-50 border border-slate-200 rounded-2xl">
                      ยังไม่มีข้อสั่งการสำหรับเหตุการณ์นี้ กดปุ่ม "+ เพิ่มข้อสั่งการ" ด้านบนเพื่อมอบหมายงาน
                    </div>
                  )}
                </div>
              </div>

              {/* 3-3-1 Measures Checklist */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-3xl p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-rose-900 font-bold text-xs uppercase">
                    <Clock className="w-4 h-4 text-rose-600" />
                    <span>มาตรการควบคุมโรค 3-3-1 (3 Hours - 3 Days - 1 Day)</span>
                  </div>
                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('control')}
                      className="text-xs text-rose-700 font-bold hover:underline"
                    >
                      ดูมาตรการทั้งหมด ➔
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="bg-white p-3.5 rounded-2xl border border-rose-100 space-y-1">
                    <p className="font-bold text-red-600">⚡ 3 ชั่วโมงแรก (Alert)</p>
                    <p className="text-[11px] text-slate-600">รับแจ้งเหตุและแจ้งเตือนทีม SRRT ระดับตำบล/อำเภอ</p>
                    <span className="text-[10px] font-bold text-emerald-600">✓ ดำเนินการแล้ว</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-rose-100 space-y-1">
                    <p className="font-bold text-amber-600">🔍 3 วัน (Investigate)</p>
                    <p className="text-[11px] text-slate-600">ลงสอบสวนโรคและค้นหาผู้ป่วย/ผู้สัมผัสเพิ่มเติม</p>
                    <span className="text-[10px] font-bold text-blue-600">กำลังดำเนินการ</span>
                  </div>

                  <div className="bg-white p-3.5 rounded-2xl border border-rose-100 space-y-1">
                    <p className="font-bold text-emerald-600">🛡️ 1 วัน (Control & Spray)</p>
                    <p className="text-[11px] text-slate-600">พ่นสารเคมีกำจัดยุง/ฆ่าเชื้อ ตัดวงจรการระบาดทันที</p>
                    <span className="text-[10px] font-bold text-emerald-600">✓ พ่นรอบที่ 1 แล้ว</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* SUB-TAB 5: SPOT MAP & GIS COORDINATES */}
          {/* ========================================================= */}
          {activeSubTab === 'map' && (
            <div className="space-y-4">
              <div className="bg-slate-50 border border-slate-200 rounded-3xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800 uppercase">
                      พิกัดศูนย์กลางการระบาด (Epicenter GIS Coordinates)
                    </h3>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      ละติจูด: {selectedEvent.centerLat} • ลองจิจูด: {selectedEvent.centerLng} ({selectedEvent.specificLocation})
                    </p>
                  </div>

                  {onNavigateToTab && (
                    <button
                      onClick={() => onNavigateToTab('map')}
                      className="flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer"
                    >
                      <MapPin className="w-4 h-4" />
                      <span>เปิดแผนที่ระบาดวิทยาแบบเต็มจอ (Epi Map)</span>
                    </button>
                  )}
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200 space-y-2">
                  <h4 className="text-xs font-bold text-slate-700">พิกัดผู้ป่วยในคลัสเตอร์นี้:</h4>
                  <div className="space-y-1.5 text-xs">
                    {outbreakCases.map((c, i) => (
                      <div key={c.id} className="flex items-center justify-between p-2 bg-slate-50 rounded-xl">
                        <span className="font-bold text-slate-700">{i + 1}. {c.patient.prefix}{c.patient.firstName} {c.patient.lastName} (HN: {c.patient.hn})</span>
                        <span className="text-[11px] text-slate-500">📍 {c.patient.lat.toFixed(4)}, {c.patient.lng.toFixed(4)} ({c.patient.villageName})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 1: CREATE / EDIT OUTBREAK MODAL */}
      {/* ========================================================= */}
      {isCreateModalOpen && (
        <CreateOutbreakModal
          isOpen={isCreateModalOpen}
          onClose={() => {
            setIsCreateModalOpen(false);
            setEditingOutbreak(null);
          }}
          initialData={editingOutbreak}
          currentUser={currentUser}
          reports={reports}
          onSave={(newOb) => {
            onSaveOutbreak(newOb);
            setIsCreateModalOpen(false);
            setEditingOutbreak(null);
            setSelectedEventId(newOb.id);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 2: ATTACH CASES MODAL */}
      {/* ========================================================= */}
      {isAttachCasesModalOpen && selectedEvent && (
        <AttachCasesModal
          isOpen={isAttachCasesModalOpen}
          onClose={() => setIsAttachCasesModalOpen(false)}
          outbreak={selectedEvent}
          reports={reports}
          onToggleLink={handleToggleCaseLinkage}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 3: ADD EOC DIRECTIVE MODAL */}
      {/* ========================================================= */}
      {isAddDirectiveModalOpen && selectedEvent && (
        <AddDirectiveModal
          isOpen={isAddDirectiveModalOpen}
          onClose={() => setIsAddDirectiveModalOpen(false)}
          onAddDirective={(newDir) => {
            const currentDirs = selectedEvent.eocDirectives || [];
            onSaveOutbreak({
              ...selectedEvent,
              eocDirectives: [...currentDirs, newDir]
            });
            setIsAddDirectiveModalOpen(false);
          }}
        />
      )}

      {/* ========================================================= */}
      {/* MODAL 4: SITUATION REPORT (SITREP) PRINT PREVIEW MODAL */}
      {/* ========================================================= */}
      {isSitRepPrintModalOpen && selectedEvent && (
        <SitRepPrintModal
          isOpen={isSitRepPrintModalOpen}
          onClose={() => setIsSitRepPrintModalOpen(false)}
          outbreak={selectedEvent}
          cases={outbreakCases}
          contacts={outbreakContacts}
          metrics={epiMetrics}
        />
      )}
    </div>
  );
};

// =========================================================================
// SUB-MODAL COMPONENTS
// =========================================================================

// 1. Create/Edit Outbreak Modal
const CreateOutbreakModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  initialData?: OutbreakEvent | null;
  currentUser?: UserSession;
  reports: DiseaseReport[];
  onSave: (ob: OutbreakEvent) => void;
}> = ({ isOpen, onClose, initialData, currentUser, reports, onSave }) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [disease, setDisease] = useState<DiseaseCategory>(initialData?.disease || 'Dengue');
  const [diseaseNameTh, setDiseaseNameTh] = useState(initialData?.diseaseNameTh || 'โรคไข้เลือดออก');
  const [subdistrict, setSubdistrict] = useState(initialData?.subdistrict || 'ตำบลนาแก้ว');
  const [villageName, setVillageName] = useState(initialData?.villageName || 'บ้านนาแก้ว');
  const [specificLocation, setSpecificLocation] = useState(initialData?.specificLocation || '');
  const [startDate, setStartDate] = useState(initialData?.startDate || new Date().toISOString().split('T')[0]);
  const [status, setStatus] = useState<OutbreakEvent['status']>(initialData?.status || 'active');
  const [populationAtRisk, setPopulationAtRisk] = useState<number>(initialData?.populationAtRisk || 500);
  const [eocLevel, setEocLevel] = useState<OutbreakEvent['eocLevel']>(initialData?.eocLevel || 'Level 1');
  const [eocCommander, setEocCommander] = useState(initialData?.eocCommander || 'นพ. ผู้อำนวยการ รพ.โพนนาแก้ว');
  const [summary, setSummary] = useState(initialData?.summary || '');

  const availableVillages = useMemo(() => {
    return getVillagesBySubdistrict(subdistrict);
  }, [subdistrict]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('กรุณากรอกชื่อเหตุการณ์ระบาด');
      return;
    }

    const subInfo = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === subdistrict);

    const newOutbreak: OutbreakEvent = {
      id: initialData?.id || `ob_${Date.now()}`,
      title,
      disease,
      diseaseNameTh,
      subdistrict,
      villageName,
      specificLocation: specificLocation || `บริเวณ ${villageName} ${subdistrict}`,
      startDate,
      reportedDate: initialData?.reportedDate || new Date().toISOString().split('T')[0],
      status,
      caseIds: initialData?.caseIds || [],
      totalCases: initialData?.totalCases || 0,
      confirmedCases: initialData?.confirmedCases || 0,
      contactsCount: initialData?.contactsCount || 0,
      populationAtRisk: Number(populationAtRisk) || 500,
      attackRatePercent: initialData?.attackRatePercent || 0,
      leadInvestigator: currentUser?.name || 'ทีม SRRT รพ.โพนนาแก้ว',
      centerLat: subInfo?.centerLat || 17.1850,
      centerLng: subInfo?.centerLng || 104.3820,
      summary: summary || `เหตุการณ์ระบาด ${diseaseNameTh} ในพื้นที่ ${villageName} ${subdistrict}`,
      controlMeasuresExecuted: initialData?.controlMeasuresExecuted || ['เริ่มมาตรการเฝ้าระวัง 3-3-1'],
      eocLevel,
      eocCommander,
      eocDirectives: initialData?.eocDirectives || []
    };

    onSave(newOutbreak);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
        <div className="bg-red-600 px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-white" />
            <h3 className="font-black text-base">
              {initialData ? 'แก้ไขข้อมูลเหตุการณ์ระบาด' : 'เปิดเหตุการณ์ระบาด / ศูนย์ EOC ใหม่'}
            </h3>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">ชื่อเหตุการณ์ระบาด (Outbreak Title) *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="เช่น Outbreak ไข้เลือดออก คลัสเตอร์บ้านนาแก้ว ม.1"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 font-bold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">กลุ่มโรคระบาด *</label>
              <select
                value={disease}
                onChange={(e) => {
                  const val = e.target.value as DiseaseCategory;
                  setDisease(val);
                  const info = getDiseaseInfo(val);
                  if (info) setDiseaseNameTh(info.nameTh);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
              >
                {DISEASE_GROUPS.map(grp => (
                  <optgroup key={grp.groupName} label={grp.groupName}>
                    {grp.diseases.map(d => (
                      <option key={d.value} value={d.value}>{d.nameTh}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ระดับ EOC (Activation Level)</label>
              <select
                value={eocLevel}
                onChange={(e: any) => setEocLevel(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-blue-700 focus:bg-white focus:outline-none"
              >
                <option value="Level 1">EOC Level 1 (ระดับตำบล/อำเภอ)</option>
                <option value="Level 2">EOC Level 2 (ระดับจังหวัด)</option>
                <option value="Level 3">EOC Level 3 (ระดับเขต/ประเทศ)</option>
                <option value="Standby">Standby (เฝ้าระวังปกติ)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ตำบล *</label>
              <select
                value={subdistrict}
                onChange={(e) => {
                  setSubdistrict(e.target.value);
                  const firstV = getVillagesBySubdistrict(e.target.value)[0]?.name || '';
                  setVillageName(firstV);
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
              >
                {PHON_NA_KAEO_SUBDISTRICTS.map(s => (
                  <option key={s.id} value={s.nameTh}>{s.nameTh}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">หมู่บ้าน *</label>
              <select
                value={villageName}
                onChange={(e) => setVillageName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
              >
                {availableVillages.map(v => (
                  <option key={v.id} value={v.name}>{v.name} (ม.{v.moo})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">สถานที่เกิดเหตุเฉพาะเจาะจง</label>
              <input
                type="text"
                value={specificLocation}
                onChange={(e) => setSpecificLocation(e.target.value)}
                placeholder="เช่น โรงเรียนบ้านนาแก้ว / ศูนย์เด็กเล็ก"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">ประชากรกลุ่มเสี่ยง (คน)</label>
              <input
                type="number"
                value={populationAtRisk}
                onChange={(e) => setPopulationAtRisk(Number(e.target.value))}
                placeholder="500"
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-amber-700 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">วันที่เริ่มระบาด (Start Date)</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">สถานะเหตุการณ์</label>
              <select
                value={status}
                onChange={(e: any) => setStatus(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-800 focus:bg-white focus:outline-none"
              >
                <option value="active">🔴 กำลังระบาด (Active)</option>
                <option value="under_control">🟡 ควบคุมได้ (Under Control)</option>
                <option value="closed">🟢 ปิดเหตุการณ์ (Closed)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้บัญชาการเหตุการณ์ (Incident Commander)</label>
            <input
              type="text"
              value={eocCommander}
              onChange={(e) => setEocCommander(e.target.value)}
              placeholder="นพ. ผู้อำนวยการ รพ.โพนนาแก้ว"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-medium text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">สรุปสถานการณ์เบื้องต้น</label>
            <textarea
              rows={2}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="ระบุข้อมูลสรุปของการระบาดและมาตรการที่ได้สั่งการ..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl shadow-md shadow-red-600/20"
            >
              บันทึกเหตุการณ์ระบาด
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 2. Attach Cases Modal
const AttachCasesModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  outbreak: OutbreakEvent;
  reports: DiseaseReport[];
  onToggleLink: (rep: DiseaseReport) => void;
}> = ({ isOpen, onClose, outbreak, reports, onToggleLink }) => {
  const [search, setSearch] = useState('');
  const [filterSameDisease, setFilterSameDisease] = useState(false);

  const candidateReports = useMemo(() => {
    return reports.filter(r => {
      if (filterSameDisease && r.disease !== outbreak.disease) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          r.patient.firstName.toLowerCase().includes(q) ||
          r.patient.lastName.toLowerCase().includes(q) ||
          r.patient.hn.includes(q) ||
          r.patient.villageName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [reports, outbreak, search, filterSameDisease]);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8 flex flex-col max-h-[85vh]">
        <div className="bg-blue-600 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-black text-base">ผูกเคสผู้ป่วยเข้าเหตุการณ์ระบาด</h3>
            <p className="text-xs text-blue-100 mt-0.5">{outbreak.title}</p>
          </div>
          <button onClick={onClose} className="text-white/80 hover:text-white p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อผู้ป่วย, HN, หรือหมู่บ้าน..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={filterSameDisease}
              onChange={(e) => setFilterSameDisease(e.target.checked)}
              className="rounded-sm text-blue-600"
            />
            <span>แสดงเฉพาะโรค {outbreak.diseaseNameTh}</span>
          </label>
        </div>

        <div className="p-4 overflow-y-auto space-y-2 flex-1 divide-y divide-slate-100">
          {candidateReports.map(rep => {
            const isLinked = rep.outbreakId === outbreak.id || (outbreak.caseIds && outbreak.caseIds.includes(rep.id));

            return (
              <div key={rep.id} className="pt-2 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800">
                      {rep.patient.prefix}{rep.patient.firstName} {rep.patient.lastName}
                    </span>
                    <span className="text-[10px] text-slate-400">HN: {rep.patient.hn}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-slate-100 text-slate-600">
                      {rep.diseaseNameTh || rep.disease}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    📍 {rep.patient.villageName} ({rep.patient.subdistrict}) • เริ่มป่วย: {rep.onsetDate}
                  </p>
                </div>

                <button
                  onClick={() => onToggleLink(rep)}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer ${
                    isLinked
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  }`}
                >
                  {isLinked ? '✓ ผูกแล้ว (ปลดออก)' : '+ ผูกเข้าเหตุการณ์'}
                </button>
              </div>
            );
          })}
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 text-right shrink-0">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-800 text-white font-bold text-xs rounded-xl shadow-xs"
          >
            เสร็จสิ้น
          </button>
        </div>
      </div>
    </div>
  );
};

// 3. Add EOC Directive Modal
const AddDirectiveModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onAddDirective: (dir: EocDirective) => void;
}> = ({ isOpen, onClose, onAddDirective }) => {
  const [commandText, setCommandText] = useState('');
  const [assignedSection, setAssignedSection] = useState<EocDirective['assignedSection']>('Operations');
  const [assignedTo, setAssignedTo] = useState('');
  const [dueDate, setDueDate] = useState(new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandText.trim()) return;

    onAddDirective({
      id: `dir_${Date.now()}`,
      commandText,
      assignedSection,
      assignedTo: assignedTo || 'ทีม SRRT / ผู้รับผิดชอบ',
      dueDate,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-sm">เพิ่มข้อสั่งการ EOC (New Directive)</h3>
          <button onClick={onClose} className="text-white/80 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">คำสั่งการ / ภารกิจมอบหมาย *</label>
            <textarea
              rows={3}
              required
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder="ระบุข้อสั่งการมอบหมายงาน..."
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">ฝ่ายรับผิดชอบ</label>
              <select
                value={assignedSection}
                onChange={(e: any) => setAssignedSection(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none font-medium"
              >
                <option value="Operations">ฝ่ายปฏิบัติการ (Operations)</option>
                <option value="Planning">ฝ่ายแผนและสถานการณ์ (Planning)</option>
                <option value="Logistics">ฝ่ายส่งกำลังบำรุง (Logistics)</option>
                <option value="RiskComm">ฝ่ายสื่อสารความเสี่ยง (Risk Comm)</option>
                <option value="Finance">ฝ่ายการเงินและบริหาร (Finance)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">กำหนดแล้วเสร็จ</label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1">ผู้รับผิดชอบ / หน่วยงาน</label>
            <input
              type="text"
              value={assignedTo}
              onChange={(e) => setAssignedTo(e.target.value)}
              placeholder="เช่น ทีม SRRT อำเภอ, รพ.สต.นาแก้ว"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:bg-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-100 font-bold rounded-xl">
              ยกเลิก
            </button>
            <button type="submit" className="px-5 py-2 bg-slate-900 text-white font-bold rounded-xl shadow-xs">
              บันทึกข้อสั่งการ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// 4. Situation Report (SitRep) Print Modal
const SitRepPrintModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  outbreak: OutbreakEvent;
  cases: DiseaseReport[];
  contacts: ContactPerson[];
  metrics: any;
}> = ({ isOpen, onClose, outbreak, cases, contacts, metrics }) => {
  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl shadow-xl w-full max-w-3xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6 flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-white" />
            <h3 className="font-bold text-base">รายงานสรุปสถานการณ์ภาวะฉุกเฉิน (Situation Report - SitRep)</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-xs"
            >
              สั่งพิมพ์รายงาน (Print)
            </button>
            <button onClick={onClose} className="text-white/80 hover:text-white p-1">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-8 overflow-y-auto space-y-6 text-xs text-slate-800 font-sans leading-relaxed bg-slate-50">
          <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
            {/* Header */}
            <div className="text-center border-b border-slate-200 pb-4 space-y-1">
              <p className="text-sm font-black uppercase tracking-wider text-slate-900">
                รายงานสถานการณ์ภาวะฉุกเฉินทางสาธารณสุข (EOC SITUATION REPORT ฉบับที่ 1)
              </p>
              <p className="text-xs font-bold text-slate-700">
                ศูนย์ปฏิบัติการภาวะฉุกเฉินทางสาธารณสุข (EOC) อำเภอโพนนาแก้ว จังหวัดสกลนคร
              </p>
              <p className="text-[11px] text-slate-500">
                วันที่รายงาน: {new Date().toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Event Overview */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase border-l-4 border-red-600 pl-2">
                1. ข้อมูลเหตุการณ์ระบาด (Incident Overview)
              </h4>
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-xl">
                <p><strong>ชื่อเหตุการณ์:</strong> {outbreak.title}</p>
                <p><strong>กลุ่มโรค:</strong> {outbreak.diseaseNameTh} ({outbreak.disease})</p>
                <p><strong>พื้นที่เกิดเหตุ:</strong> {outbreak.specificLocation} {outbreak.villageName} {outbreak.subdistrict}</p>
                <p><strong>วันที่เริ่มระบาด:</strong> {outbreak.startDate}</p>
                <p><strong>ระดับศูนย์ EOC:</strong> {outbreak.eocLevel || 'Level 1'}</p>
                <p><strong>ผู้บัญชาการเหตุการณ์:</strong> {outbreak.eocCommander || 'ผอ.รพ.โพนนาแก้ว'}</p>
              </div>
            </div>

            {/* Epidemiological Summary */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase border-l-4 border-blue-600 pl-2">
                2. ข้อมูลระบาดวิทยาและตัวชี้วัดสำคัญ (Epidemiological Summary)
              </h4>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="p-3 bg-red-50 rounded-xl border border-red-100">
                  <p className="text-[10px] text-slate-500">ผู้ป่วยสะสม</p>
                  <p className="text-lg font-black text-red-600">{cases.length || outbreak.totalCases} ราย</p>
                </div>
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-100">
                  <p className="text-[10px] text-slate-500">Attack Rate</p>
                  <p className="text-lg font-black text-amber-700">{metrics?.attackRate || 0}%</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <p className="text-[10px] text-slate-500">ผู้สัมผัสโรค</p>
                  <p className="text-lg font-black text-blue-700">{contacts.length} คน</p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                  <p className="text-[10px] text-slate-500">อัตราป่วยตาย</p>
                  <p className="text-lg font-black text-emerald-700">0.0%</p>
                </div>
              </div>
            </div>

            {/* Cases Line Listing */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase border-l-4 border-amber-600 pl-2">
                3. บัญชีรายชื่อผู้ป่วย (Line Listing of Cases - {cases.length} ราย)
              </h4>
              <table className="w-full text-left text-[11px] border border-slate-200">
                <thead className="bg-slate-100 font-bold border-b border-slate-200">
                  <tr>
                    <th className="p-2">ลำดับ</th>
                    <th className="p-2">HN / ชื่อ-สกุล</th>
                    <th className="p-2">อายุ / เพศ</th>
                    <th className="p-2">วันเริ่มป่วย</th>
                    <th className="p-2">ที่อยู่</th>
                    <th className="p-2">ผลแล็บ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {cases.map((c, i) => (
                    <tr key={c.id}>
                      <td className="p-2">{i + 1}</td>
                      <td className="p-2 font-bold">{c.patient.prefix}{c.patient.firstName} {c.patient.lastName} ({c.patient.hn})</td>
                      <td className="p-2">{c.patient.age} ปี / {c.patient.gender}</td>
                      <td className="p-2">{c.onsetDate}</td>
                      <td className="p-2">{c.patient.villageName}</td>
                      <td className="p-2">{c.labResult?.result || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Actions Taken */}
            <div className="space-y-2">
              <h4 className="font-bold text-slate-900 uppercase border-l-4 border-emerald-600 pl-2">
                4. มาตรการควบคุมโรคที่ดำเนินการแล้ว (Response & Measures Taken)
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-slate-700">
                {outbreak.controlMeasuresExecuted?.map((m, i) => (
                  <li key={i}>{m}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
