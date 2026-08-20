import React, { useState } from 'react';
import {
  X,
  SearchCheck,
  User,
  Activity,
  Calendar,
  MapPin,
  Users,
  ShieldAlert,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Flame,
  Printer
} from 'lucide-react';
import {
  Investigation,
  DiseaseReport,
  TimelineEvent,
  RiskAssessment,
  ContactPerson,
  UserSession
} from '../types';

interface InvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DiseaseReport;
  existingInvestigation?: Investigation | null;
  onSave: (investigation: Investigation) => void;
  onAddContact?: (contact: Partial<ContactPerson>) => void;
  onPrintPreview?: (investigation: Investigation, report: DiseaseReport) => void;
  user: UserSession;
}

export const InvestigationModal: React.FC<InvestigationModalProps> = ({
  isOpen,
  onClose,
  report,
  existingInvestigation,
  onSave,
  onAddContact,
  onPrintPreview,
  user
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'general' | 'timeline' | 'risks' | 'contacts' | 'ai_summary'>('general');

  // Form states pre-filled from report
  const [investigatorName, setInvestigatorName] = useState(existingInvestigation?.investigatorName || user.name);
  const [investigatorTeam, setInvestigatorTeam] = useState(existingInvestigation?.investigatorTeam || 'ทีม SRRT รพ.โพนนาแก้ว & สสอ.โพนนาแก้ว');
  const [investigationDate, setInvestigationDate] = useState(existingInvestigation?.investigationDate || new Date().toISOString().split('T')[0]);
  const [clinicalSummary, setClinicalSummary] = useState(
    existingInvestigation?.clinicalSummary || 
    `ผู้ป่วย ${report.patient.prefix}${report.patient.firstName} ${report.patient.lastName} อายุ ${report.patient.age} ปี อาชีพ ${report.patient.occupation} มีอาการ ${report.chiefComplaint} เริ่มป่วยเมื่อ ${report.onsetDate} ผลตรวจ ${report.labResult.testName}: ${report.labResult.result}`
  );

  // Timeline events
  const defaultTimeline: TimelineEvent[] = [
    { id: 'tl_1', date: report.onsetDate, time: '08:00', activityOrLocation: report.patient.villageName, description: 'เริ่มมีอาการไข้/อาการนำครั้งแรก', type: 'onset' },
    { id: 'tl_2', date: report.visitDate, time: '09:30', activityOrLocation: report.reportingUnit, description: `มารับการตรวจรักษาที่ ${report.reportingUnit}`, type: 'hospital' },
  ];
  const [timeline, setTimeline] = useState<TimelineEvent[]>(existingInvestigation?.timeline || defaultTimeline);

  // Risks Assessment
  const [risks, setRisks] = useState<RiskAssessment>(existingInvestigation?.risks || {
    travelHistory: false,
    travelDetails: '',
    sharedMeal: false,
    sharedMealDetails: '',
    animalContact: false,
    animalContactDetails: '',
    waterSourceExposure: false,
    waterSourceDetails: '',
    schoolOrCrowdedPlace: Boolean(report.patient.workplaceOrSchool),
    schoolDetails: report.patient.workplaceOrSchool || '',
    similarCasesInFamilyOrNeighborhood: false,
    clusterDetails: '',
    mosquitoBreedingIndex: {
      hi: report.disease === 'Dengue' ? 25.0 : undefined,
      ci: report.disease === 'Dengue' ? 18.0 : undefined,
      bi: report.disease === 'Dengue' ? 35.0 : undefined,
    },
    otherRisks: '',
  });

  // Source & Link
  const [probableSource, setProbableSource] = useState(existingInvestigation?.probableSourceOfInfection || (
    report.disease === 'Dengue' ? 'ยุงลายบ้าน (Aedes aegypti) ภายในชุมชน/โรงเรียน' :
    report.disease === 'HFMD' ? 'การสัมผัสน้ำมูก น้ำลาย ของเล่นร่วมกันในห้องเรียน' :
    report.disease === 'Leptospirosis' ? 'น้ำขังหรือโคลนในแปลงนาที่มีเชื้อเลปโตสไปรา' :
    report.disease === 'Diarrhea' ? 'อาหาร/น้ำดื่มปนเปื้อนในงานเลี้ยง' :
    'การสัมผัสใกล้ชิดในละแวกบ้าน'
  ));
  const [epidemiologicalLink, setEpidemiologicalLink] = useState(existingInvestigation?.epidemiologicalLink || `ผู้ป่วยในเขต ${report.patient.villageName} ${report.patient.subdistrict}`);
  
  // Action taken & recommendations
  const [actionTakenStr, setActionTakenStr] = useState(
    existingInvestigation?.actionTaken?.join('\n') ||
    `1. ลงพื้นที่สอบสวนโรคและค้นหาผู้สัมผัสเพิ่มเติม\n2. ประสาน อสม. และ รพ.สต. ในพื้นที่เฝ้าระวังผู้มีไข้ 14 วัน\n3. ดำเนินการควบคุมสิ่งแวดล้อมและมาตรการควบคุมโรคเฉพาะจุด`
  );
  const [recommendationsStr, setRecommendationsStr] = useState(
    existingInvestigation?.recommendations?.join('\n') ||
    `1. สุขศึกษาเรื่องการป้องกันโรคแก่คนในชุมชน\n2. ติดตามผู้สัมผัสใกล้ชิดตามกำหนดเวลา\n3. รายงานความก้าวหน้าต่อ สสอ.โพนนาแก้ว`
  );

  const [aiAnalysisSummary, setAiAnalysisSummary] = useState(existingInvestigation?.aiAnalysisSummary || '');
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  const [investigationStatus, setInvestigationStatus] = useState<'draft' | 'completed' | 'reviewed'>(existingInvestigation?.status || 'draft');

  // Timeline add/delete
  const [newTlDate, setNewTlDate] = useState(report.visitDate);
  const [newTlLoc, setNewTlLoc] = useState('');
  const [newTlDesc, setNewTlDesc] = useState('');
  const [newTlType, setNewTlType] = useState<TimelineEvent['type']>('contact');

  const handleAddTimeline = () => {
    if (!newTlLoc || !newTlDesc) {
      alert('กรุณาระบุสถานที่/กิจกรรม และรายละเอียด');
      return;
    }
    const newEvent: TimelineEvent = {
      id: `tl_${Date.now()}`,
      date: newTlDate,
      activityOrLocation: newTlLoc,
      description: newTlDesc,
      type: newTlType,
    };
    setTimeline([...timeline, newEvent].sort((a, b) => a.date.localeCompare(b.date)));
    setNewTlLoc('');
    setNewTlDesc('');
  };

  const handleDeleteTimeline = (id: string) => {
    setTimeline(timeline.filter(t => t.id !== id));
  };

  // AI Auto-Analysis with Gemini
  const handleGenerateAiReport = async () => {
    setIsGeneratingAi(true);
    try {
      const response = await fetch('/api/gemini/generate-investigation-report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          report,
          investigation: {
            investigatorName,
            investigatorTeam,
            investigationDate,
            clinicalSummary,
            timeline,
            risks,
            probableSourceOfInfection: probableSource,
            epidemiologicalLink,
            actionTaken: actionTakenStr.split('\n').filter(Boolean),
            recommendations: recommendationsStr.split('\n').filter(Boolean)
          }
        })
      });
      const data = await response.json();
      if (data.reportText) {
        setAiAnalysisSummary(data.reportText);
        setActiveTab('ai_summary');
      }
    } catch (err) {
      console.error(err);
      alert('ไม่สามารถเชื่อมต่อระบบ AI ได้ กำลังใช้ผลวิเคราะห์อัตโนมัติสำรอง');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  // Save handler
  const handleSave = () => {
    const invObj: Investigation = {
      id: existingInvestigation?.id || `inv_${Date.now()}`,
      reportId: report.id,
      patientId: report.patientId,
      investigatorName,
      investigatorTeam,
      investigationDate,
      clinicalSummary,
      timeline,
      risks,
      probableSourceOfInfection: probableSource,
      epidemiologicalLink,
      contactsIdentifiedCount: 0,
      actionTaken: actionTakenStr.split('\n').filter(Boolean),
      recommendations: recommendationsStr.split('\n').filter(Boolean),
      aiAnalysisSummary,
      status: investigationStatus,
      completedAt: investigationStatus === 'completed' ? new Date().toISOString() : undefined,
    };

    onSave(invObj);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-4xl max-h-[94vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-800 flex items-center justify-between bg-slate-950/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30 font-bold">
              <SearchCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  แบบสอบสวนโรคทางระบาดวิทยา (Epidemiological Investigation)
                </h2>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-500/40">
                  {report.diseaseNameTh}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                ผู้ป่วย: <strong className="text-slate-200">{report.patient.prefix}{report.patient.firstName} {report.patient.lastName}</strong> (HN: {report.patient.hn}) • {report.patient.villageName} {report.patient.subdistrict}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateAiReport}
              disabled={isGeneratingAi}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-900 to-indigo-900 hover:from-purple-800 hover:to-indigo-800 text-purple-200 text-xs font-semibold rounded-lg border border-purple-500/40 shadow transition"
              title="ร่างรายงานการสอบสวนโรคทางการด้วย Gemini AI"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-spin" />
              <span>{isGeneratingAi ? 'กำลังวิเคราะห์...' : 'AI ร่างรายงาน'}</span>
            </button>

            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 px-5 border-b border-slate-800 bg-slate-900/90 overflow-x-auto text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'general' ? 'border-teal-400 text-teal-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>A. ข้อมูลทั่วไป & อาการ</span>
          </button>

          <button
            onClick={() => setActiveTab('timeline')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'timeline' ? 'border-teal-400 text-teal-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>B. ไทม์ไลน์ (Timeline {timeline.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('risks')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'risks' ? 'border-teal-400 text-teal-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>C. ปัจจัยเสี่ยง & แหล่งโรค</span>
          </button>

          <button
            onClick={() => setActiveTab('contacts')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'contacts' ? 'border-teal-400 text-teal-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>D. มาตรการ & ข้อเสนอแนะ</span>
          </button>

          <button
            onClick={() => setActiveTab('ai_summary')}
            className={`px-3 py-2.5 border-b-2 transition flex items-center gap-1.5 whitespace-nowrap ${
              activeTab === 'ai_summary' ? 'border-purple-400 text-purple-300 font-bold' : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>E. รายงานฉบับเต็ม (AI Report)</span>
          </button>
        </div>

        {/* Tab Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          
          {/* TAB 1: General & Clinical Pre-filled */}
          {activeTab === 'general' && (
            <div className="space-y-4">
              
              {/* Auto-filled banner */}
              <div className="bg-teal-950/40 border border-teal-500/30 rounded-xl p-3 flex items-center gap-2 text-teal-200 text-xs">
                <CheckCircle2 className="w-4 h-4 text-teal-400 flex-shrink-0" />
                <span>ดึงข้อมูลผู้ป่วยจากระบบรับแจ้งโรคอัตโนมัติแล้ว (HN {report.patient.hn}) เจ้าหน้าที่สามารถแก้ไขเพิ่มเติมด้านล่าง</span>
              </div>

              {/* Investigator Team */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">ผู้สอบสวนโรคหลัก *</label>
                  <input
                    type="text"
                    value={investigatorName}
                    onChange={(e) => setInvestigatorName(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">ทีมสอบสวนโรค (SRRT Team) *</label>
                  <input
                    type="text"
                    value={investigatorTeam}
                    onChange={(e) => setInvestigatorTeam(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">วันที่ลงสอบสวนโรค *</label>
                  <input
                    type="date"
                    value={investigationDate}
                    onChange={(e) => setInvestigationDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              {/* Patient Summary Card */}
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <p className="font-semibold text-teal-300 text-xs">ข้อมูลผู้ป่วยและสถานที่เกิดโรค</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-slate-300">
                  <div><span className="text-slate-400">ชื่อ-สกุล:</span> {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}</div>
                  <div><span className="text-slate-400">อายุ:</span> {report.patient.age} ปี ({report.patient.gender === 'male' ? 'ชาย' : 'หญิง'})</div>
                  <div><span className="text-slate-400">อาชีพ:</span> {report.patient.occupation}</div>
                  <div><span className="text-slate-400">สถานศึกษา/ที่ทำงาน:</span> {report.patient.workplaceOrSchool || '-'}</div>
                  <div className="col-span-2"><span className="text-slate-400">ที่อยู่:</span> {report.patient.address} {report.patient.villageName} {report.patient.subdistrict} อ.โพนนาแก้ว จ.สกลนคร</div>
                  <div><span className="text-slate-400">พิกัด GPS:</span> {report.patient.lat?.toFixed(4)}, {report.patient.lng?.toFixed(4)}</div>
                  <div><span className="text-slate-400">โทรศัพท์:</span> {report.patient.phone || '-'}</div>
                </div>
              </div>

              {/* Clinical summary */}
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">สรุปประวัติการป่วย อาการสำคัญ และการรักษา</label>
                <textarea
                  value={clinicalSummary}
                  onChange={(e) => setClinicalSummary(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white focus:ring-2 focus:ring-teal-500"
                />
              </div>

            </div>
          )}

          {/* TAB 2: Timeline Builder */}
          {activeTab === 'timeline' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="font-semibold text-slate-200 text-xs">ลำดับเหตุการณ์การดำเนินโรคและกิจกรรม (Timeline of Events)</p>
                <span className="text-[11px] text-teal-400 font-mono">{timeline.length} เหตุการณ์</span>
              </div>

              {/* Timeline Items List */}
              <div className="space-y-2 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-700">
                {timeline.map((event, idx) => (
                  <div key={event.id} className="relative pl-9 flex items-start justify-between gap-3 bg-slate-800/60 p-3 rounded-xl border border-slate-700/70">
                    <span className="absolute left-2.5 top-3.5 w-3 h-3 rounded-full bg-teal-400 ring-4 ring-slate-900" />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-teal-300 font-mono text-xs">{event.date}</span>
                        {event.time && <span className="text-[10px] text-slate-400 font-mono">({event.time} น.)</span>}
                        <span className="text-[10px] font-semibold px-2 py-0.2 rounded bg-slate-900 text-slate-300 border border-slate-700">
                          {event.activityOrLocation}
                        </span>
                      </div>
                      <p className="text-xs text-slate-200 mt-1">{event.description}</p>
                    </div>

                    <button
                      onClick={() => handleDeleteTimeline(event.id)}
                      className="text-slate-500 hover:text-rose-400 p-1 transition"
                      title="ลบเหตุการณ์"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Timeline Event Form */}
              <div className="bg-slate-950/60 border border-dashed border-slate-700 rounded-xl p-3.5 space-y-2.5">
                <p className="text-xs font-semibold text-teal-400 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> เพิ่มเหตุการณ์ใน Timeline
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <input
                    type="date"
                    value={newTlDate}
                    onChange={(e) => setNewTlDate(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="สถานที่/กิจกรรม เช่น โรงเรียน, นา, ตลาด"
                    value={newTlLoc}
                    onChange={(e) => setNewTlLoc(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                  />
                  <input
                    type="text"
                    placeholder="รายละเอียดเหตุการณ์ / อาการที่เกิดขึ้น"
                    value={newTlDesc}
                    onChange={(e) => setNewTlDesc(e.target.value)}
                    className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white sm:col-span-2"
                  />
                </div>
                <div className="flex justify-end">
                  <button
                    onClick={handleAddTimeline}
                    className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-xs transition"
                  >
                    + บันทึกลง Timeline
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: Risk Factors & Source */}
          {activeTab === 'risks' && (
            <div className="space-y-4">
              
              <div className="bg-slate-800/60 border border-slate-700/80 rounded-xl p-4 space-y-3">
                <p className="font-semibold text-teal-300 text-xs">ปัจจัยเสี่ยงและประวัติการสัมผัสโรค (Risk Assessment)</p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  
                  {/* Travel */}
                  <label className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={risks.travelHistory}
                      onChange={(e) => setRisks({ ...risks, travelHistory: e.target.checked })}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">ประวัติการเดินทางออกนอกพื้นที่</span>
                      {risks.travelHistory && (
                        <input
                          type="text"
                          placeholder="ระบุสถานที่และวันที่เดินทาง"
                          value={risks.travelDetails || ''}
                          onChange={(e) => setRisks({ ...risks, travelDetails: e.target.value })}
                          className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  </label>

                  {/* Shared Meal */}
                  <label className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={risks.sharedMeal}
                      onChange={(e) => setRisks({ ...risks, sharedMeal: e.target.checked })}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">รับประทานอาหาร/น้ำดื่มร่วมกันในงานเลี้ยง</span>
                      {risks.sharedMeal && (
                        <input
                          type="text"
                          placeholder="ระบุชื่ออาหาร/งานบุญ/สถานที่"
                          value={risks.sharedMealDetails || ''}
                          onChange={(e) => setRisks({ ...risks, sharedMealDetails: e.target.value })}
                          className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  </label>

                  {/* Animal / Water contact */}
                  <label className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={risks.animalContact}
                      onChange={(e) => setRisks({ ...risks, animalContact: e.target.checked })}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">สัมผัสสัตว์เลี้ยง / สัตว์ป่า / ดินโคลน</span>
                      {risks.animalContact && (
                        <input
                          type="text"
                          placeholder="ระบุประวัติสัมผัสสัตว์/ทำนาลุยน้ำ"
                          value={risks.animalContactDetails || ''}
                          onChange={(e) => setRisks({ ...risks, animalContactDetails: e.target.value })}
                          className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  </label>

                  {/* School / Crowded */}
                  <label className="flex items-start gap-2.5 bg-slate-900/60 p-2.5 rounded-lg border border-slate-700/60 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={risks.schoolOrCrowdedPlace}
                      onChange={(e) => setRisks({ ...risks, schoolOrCrowdedPlace: e.target.checked })}
                      className="mt-0.5 rounded bg-slate-800 border-slate-700 text-teal-600"
                    />
                    <div>
                      <span className="font-semibold text-slate-200">โรงเรียน / ศูนย์เด็กเล็ก / สถานประกอบการ</span>
                      {risks.schoolOrCrowdedPlace && (
                        <input
                          type="text"
                          placeholder="ระบุชื่อโรงเรียน/ศูนย์เด็กเล็ก"
                          value={risks.schoolDetails || ''}
                          onChange={(e) => setRisks({ ...risks, schoolDetails: e.target.value })}
                          className="mt-1 w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  </label>
                </div>

                {/* Dengue Larval Indices */}
                {report.disease === 'Dengue' && (
                  <div className="mt-3 p-3 bg-slate-900 rounded-xl border border-rose-900/50 space-y-2">
                    <p className="text-xs font-bold text-rose-300">🦟 ผลสำรวจดัชนีลูกน้ำยุงลายในพื้นที่ (Mosquito Larval Indices)</p>
                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-400">House Index (HI %)</label>
                        <input
                          type="number"
                          value={risks.mosquitoBreedingIndex?.hi || 0}
                          onChange={(e) => setRisks({
                            ...risks,
                            mosquitoBreedingIndex: { ...risks.mosquitoBreedingIndex, hi: Number(e.target.value) }
                          })}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Container Index (CI %)</label>
                        <input
                          type="number"
                          value={risks.mosquitoBreedingIndex?.ci || 0}
                          onChange={(e) => setRisks({
                            ...risks,
                            mosquitoBreedingIndex: { ...risks.mosquitoBreedingIndex, ci: Number(e.target.value) }
                          })}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-400">Breteau Index (BI)</label>
                        <input
                          type="number"
                          value={risks.mosquitoBreedingIndex?.bi || 0}
                          onChange={(e) => setRisks({
                            ...risks,
                            mosquitoBreedingIndex: { ...risks.mosquitoBreedingIndex, bi: Number(e.target.value) }
                          })}
                          className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs text-white font-mono"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Source of Infection & Epi Link */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">แหล่งแพร่โรคที่น่าจะเป็น (Probable Source)</label>
                  <input
                    type="text"
                    value={probableSource}
                    onChange={(e) => setProbableSource(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-medium">ความเชื่อมโยงทางระบาดวิทยา (Epidemiological Link)</label>
                  <input
                    type="text"
                    value={epidemiologicalLink}
                    onChange={(e) => setEpidemiologicalLink(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: Action & Recommendations */}
          {activeTab === 'contacts' && (
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">มาตรการควบคุมโรคที่ได้ดำเนินการแล้ว (Action Taken)</label>
                <textarea
                  value={actionTakenStr}
                  onChange={(e) => setActionTakenStr(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1 font-medium">ข้อเสนอแนะในการป้องกันและควบคุมโรค (Recommendations)</label>
                <textarea
                  value={recommendationsStr}
                  onChange={(e) => setRecommendationsStr(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white font-mono focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="flex items-center justify-between bg-slate-800/60 p-3 rounded-xl border border-slate-700">
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium">สถานะการสอบสวนโรค (Investigation Status)</label>
                  <p className="text-[10px] text-slate-400">เมื่อตรวจสอบข้อมูลครบถ้วน ให้ปรับเป็น "สอบสวนสมบูรณ์"</p>
                </div>
                <select
                  value={investigationStatus}
                  onChange={(e) => setInvestigationStatus(e.target.value as any)}
                  className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white font-semibold"
                >
                  <option value="draft">ร่างแบบสอบสวน (Draft)</option>
                  <option value="completed">สอบสวนสมบูรณ์ (Completed)</option>
                  <option value="reviewed">ผ่านการตรวจสอบแล้ว (Reviewed)</option>
                </select>
              </div>
            </div>
          )}

          {/* TAB 5: AI Full Formal Report */}
          {activeTab === 'ai_summary' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span className="font-bold text-white text-xs">
                    ร่างรายงานการสอบสวนโรคฉบับสมบูรณ์ (วิเคราะห์โดย AI & ทีม SRRT รพ.โพนนาแก้ว)
                  </span>
                </div>
                <button
                  onClick={handleGenerateAiReport}
                  disabled={isGeneratingAi}
                  className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                >
                  {isGeneratingAi ? 'กำลังสร้างรายงาน...' : '🔄 วิเคราะห์ใหม่'}
                </button>
              </div>

              <textarea
                value={aiAnalysisSummary || 'ยังไม่มีรายงานฉบับเต็ม กรุณากดปุ่ม "AI ร่างรายงาน" ด้านบน เพื่อให้ระบบสร้างแบบรายงานมาตรฐานกรมควบคุมโรคให้อัตโนมัติ'}
                onChange={(e) => setAiAnalysisSummary(e.target.value)}
                rows={14}
                className="w-full bg-slate-950 border border-purple-900/60 rounded-xl p-4 text-xs text-slate-200 font-mono leading-relaxed focus:ring-2 focus:ring-purple-500"
              />
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="px-5 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition"
            >
              ปิดหน้าต่าง
            </button>

            {onPrintPreview && (
              <button
                type="button"
                onClick={() => {
                  const invObj: Investigation = {
                    id: existingInvestigation?.id || `inv_${Date.now()}`,
                    reportId: report.id,
                    patientId: report.patientId,
                    investigatorName,
                    investigatorTeam,
                    investigationDate,
                    clinicalSummary,
                    timeline,
                    risks,
                    probableSourceOfInfection: probableSource,
                    epidemiologicalLink,
                    contactsIdentifiedCount: 0,
                    actionTaken: actionTakenStr.split('\n').filter(Boolean),
                    recommendations: recommendationsStr.split('\n').filter(Boolean),
                    aiAnalysisSummary,
                    status: investigationStatus,
                  };
                  onPrintPreview(invObj, report);
                }}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
              >
                <Printer className="w-3.5 h-3.5 text-teal-400" />
                <span>พิมพ์แบบรายงาน (PDF)</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-teal-600 hover:from-indigo-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl shadow-lg transition transform active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>บันทึกผลการสอบสวนโรค</span>
          </button>
        </div>

      </div>
    </div>
  );
};
