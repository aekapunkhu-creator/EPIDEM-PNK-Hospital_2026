import React, { useState } from 'react';
import {
  X,
  ClipboardList,
  User,
  Hospital,
  FlaskConical,
  Calendar,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Navigation,
  RefreshCw,
  Bell,
  Send
} from 'lucide-react';
import {
  DiseaseReport,
  DiseaseCategory,
  CaseType,
  CaseStatus,
  UserSession,
  EpiAlert
} from '../types';
import { PHON_NA_KAEO_SUBDISTRICTS, PHON_NA_KAEO_VILLAGES } from '../data/mockData';
import { storageService } from '../services/storageService';

interface ReportDiseaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (report: DiseaseReport) => void;
  user: UserSession;
  initialData?: DiseaseReport | null;
}

const DISEASE_OPTIONS: { category: DiseaseCategory; nameTh: string; icd10: string }[] = [
  { category: 'Dengue', nameTh: 'โรคไข้เลือดออก (DHF/DF)', icd10: 'A91' },
  { category: 'HFMD', nameTh: 'โรคมือ เท้า ปาก (HFMD)', icd10: 'B08.4' },
  { category: 'Influenza', nameTh: 'โรคไข้หวัดใหญ่ (Influenza)', icd10: 'J10.1' },
  { category: 'Diarrhea', nameTh: 'โรคอุจจาระร่วงเฉียบพลัน / อาหารเป็นพิษ', icd10: 'A05.9' },
  { category: 'Leptospirosis', nameTh: 'โรคเลปโตสไปโรซิส (ไข้ฉี่หนู)', icd10: 'A27.9' },
  { category: 'Melioidosis', nameTh: 'โรคเมลิออยโดสิส (Melioidosis)', icd10: 'A24.1' },
  { category: 'TB', nameTh: 'วัณโรคปอด (Tuberculosis)', icd10: 'A15.0' },
  { category: 'Rabies_Exposure', nameTh: 'สัมผัสสัตว์สงสัยโรคพิษสุนัขบ้า', icd10: 'Z20.3' },
  { category: 'COVID19', nameTh: 'โรคติดเชื้อไวรัสโคโรนา 2019', icd10: 'U07.1' },
  { category: 'Chickenpox', nameTh: 'โรคสุกใส (Chickenpox)', icd10: 'B01.9' },
  { category: 'Other', nameTh: 'โรคติดต่ออื่นๆ ที่ต้องเฝ้าระวัง', icd10: 'Z00' },
];

export const ReportDiseaseModal: React.FC<ReportDiseaseModalProps> = ({
  isOpen,
  onClose,
  onSave,
  user,
  initialData
}) => {
  if (!isOpen) return null;

  const isEditing = Boolean(initialData);

  // Form State
  const [hn, setHn] = useState(initialData?.patient?.hn || '');
  const [cid, setCid] = useState(initialData?.patient?.cid || '');
  const [prefix, setPrefix] = useState(initialData?.patient?.prefix || 'นาย');
  const [firstName, setFirstName] = useState(initialData?.patient?.firstName || '');
  const [lastName, setLastName] = useState(initialData?.patient?.lastName || '');
  const [age, setAge] = useState<number>(initialData?.patient?.age || 25);
  const [gender, setGender] = useState<'male' | 'female'>(initialData?.patient?.gender || 'male');
  const [phone, setPhone] = useState(initialData?.patient?.phone || '');
  const [occupation, setOccupation] = useState(initialData?.patient?.occupation || 'เกษตรกร');
  const [workplaceOrSchool, setWorkplaceOrSchool] = useState(initialData?.patient?.workplaceOrSchool || '');
  const [address, setAddress] = useState(initialData?.patient?.address || '12 หมู่ 1');
  const [moo, setMoo] = useState<number>(initialData?.patient?.moo || 1);
  const [villageName, setVillageName] = useState(initialData?.patient?.villageName || 'บ้านนาแก้ว');
  const [subdistrict, setSubdistrict] = useState(initialData?.patient?.subdistrict || 'ตำบลนาแก้ว');

  // GPS Coordinates
  const [lat, setLat] = useState<number>(initialData?.patient?.lat || 17.1850);
  const [lng, setLng] = useState<number>(initialData?.patient?.lng || 104.3820);
  const [gpsAccuracy, setGpsAccuracy] = useState<number | undefined>(initialData?.patient?.gpsAccuracy);
  const [isLocating, setIsLocating] = useState<boolean>(false);

  // Disease Info
  const [disease, setDisease] = useState<DiseaseCategory>(initialData?.disease || 'Dengue');
  const [diseaseNameTh, setDiseaseNameTh] = useState(initialData?.diseaseNameTh || 'โรคไข้เลือดออก (DHF/DF)');
  const [icd10, setIcd10] = useState(initialData?.icd10 || 'A91');
  const [caseType, setCaseType] = useState<CaseType>(initialData?.caseType || 'Confirmed');
  const [onsetDate, setOnsetDate] = useState(initialData?.onsetDate || new Date().toISOString().split('T')[0]);
  const [visitDate, setVisitDate] = useState(initialData?.visitDate || new Date().toISOString().split('T')[0]);
  const [reportingUnit, setReportingUnit] = useState(initialData?.reportingUnit || user.department || 'แผนกผู้ป่วยนอก (OPD)');
  const [reporterName, setReporterName] = useState(initialData?.reporterName || user.name);
  const [chiefComplaint, setChiefComplaint] = useState(initialData?.chiefComplaint || '');
  const [symptomsStr, setSymptomsStr] = useState(initialData?.symptoms?.join(', ') || 'ไข้สูง, ปวดศีรษะ, ปวดเมื่อยตามตัว');
  const [isAdmitted, setIsAdmitted] = useState(initialData?.isAdmitted || false);
  const [admissionWard, setAdmissionWard] = useState(initialData?.admissionWard || 'ตึกผู้ป่วยใน ชั้น 2');
  const [labTestName, setLabTestName] = useState(initialData?.labResult?.testName || 'Dengue NS1 Ag');
  const [labResult, setLabResult] = useState(initialData?.labResult?.result || 'Positive');
  const [status, setStatus] = useState<CaseStatus>(initialData?.status || 'reported');
  const [notes, setNotes] = useState(initialData?.notes || '');

  // Quick GPS lookup from browser
  const handleGetCurrentGps = () => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      alert('เบราว์เซอร์นี้ไม่รองรับการดึง Geolocation');
      setIsLocating(false);
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLat(pos.coords.latitude);
        setLng(pos.coords.longitude);
        setGpsAccuracy(Math.round(pos.coords.accuracy));
        setIsLocating(false);
      },
      (err) => {
        setIsLocating(false);
        alert(`ไม่สามารถดึงพิกัดได้: ${err.message}`);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  // Handle disease change to auto-suggest ICD-10
  const handleDiseaseChange = (cat: DiseaseCategory) => {
    setDisease(cat);
    const found = DISEASE_OPTIONS.find(d => d.category === cat);
    if (found) {
      setDiseaseNameTh(found.nameTh);
      setIcd10(found.icd10);
      if (cat === 'Dengue') {
        setLabTestName('Dengue NS1 Ag / Dengue IgM');
        setChiefComplaint('ไข้สูงลอย 3 วัน ปวดกระบอกตา ปวดเมื่อยตามตัว มีจุดเลือดออก');
      } else if (cat === 'HFMD') {
        setLabTestName('Enterovirus / Coxsackie PCR');
        setChiefComplaint('มีแผลในปาก ตุ่มน้ำใสที่ฝ่ามือและฝ่าเท้า มีไข้');
      } else if (cat === 'Influenza') {
        setLabTestName('Influenza A/B Rapid Ag');
        setChiefComplaint('ไข้สูง ไอ เจ็บคอ ปวดกล้ามเนื้อ');
      } else if (cat === 'Leptospirosis') {
        setLabTestName('Leptospira IgM Rapid Test / MAT');
        setChiefComplaint('ไข้สูง หนาวสั่น ปวดน่องรุนแรง ตาแดง ประวัติลุยน้ำขัง');
      } else if (cat === 'Diarrhea') {
        setLabTestName('Stool Exam / Culture');
        setChiefComplaint('ถ่ายเหลวเป็นน้ำหลายครั้ง คลื่นไส้ อาเจียน ปวดท้อง');
      }
    }
  };

  // Handle subdistrict change
  const handleSubdistrictChange = (subName: string) => {
    setSubdistrict(subName);
    const subObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === subName);
    if (subObj) {
      const vils = PHON_NA_KAEO_VILLAGES.filter(v => v.subdistrictId === subObj.id);
      if (vils.length > 0) {
        setVillageName(vils[0].name);
        setMoo(vils[0].moo);
        setLat(vils[0].lat);
        setLng(vils[0].lng);
      } else {
        setLat(subObj.centerLat);
        setLng(subObj.centerLng);
      }
    }
  };

  const handleVillageChange = (vName: string) => {
    setVillageName(vName);
    const subObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === subdistrict);
    const vilObj = PHON_NA_KAEO_VILLAGES.find(v => v.name === vName && v.subdistrictId === subObj?.id);
    if (vilObj) {
      setMoo(vilObj.moo);
      setLat(vilObj.lat);
      setLng(vilObj.lng);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName || !lastName || !hn) {
      alert('กรุณากรอกข้อมูล HN, ชื่อ และนามสกุลของผู้ป่วย');
      return;
    }

    const subObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === subdistrict);
    const targetHealthCenter = subObj?.healthCenter || `รพ.สต.${subdistrict.replace('ตำบล', '')}`;

    const report: DiseaseReport = {
      id: initialData?.id || `rep_${Date.now()}`,
      patientId: initialData?.patientId || `pt_${Date.now()}`,
      patient: {
        id: initialData?.patient?.id || `pt_${Date.now()}`,
        hn,
        cid,
        prefix,
        firstName,
        lastName,
        age: Number(age),
        gender,
        phone,
        occupation,
        workplaceOrSchool,
        address,
        moo: Number(moo),
        villageName,
        subdistrict,
        district: 'โพนนาแก้ว',
        province: 'สกลนคร',
        underlyingDiseases: ['ไม่มี'],
        lat: lat,
        lng: lng,
        gpsAccuracy: gpsAccuracy,
        gpsTimestamp: initialData?.patient?.gpsTimestamp || new Date().toISOString(),
        gpsRecordedBy: initialData?.patient?.gpsRecordedBy || user.name,
      },
      disease,
      diseaseNameTh,
      icd10,
      caseType,
      onsetDate,
      visitDate,
      reportDate: initialData?.reportDate || new Date().toISOString().split('T')[0],
      reportingUnit,
      reporterName,
      reporterRole: user.role,
      chiefComplaint,
      symptoms: symptomsStr.split(',').map(s => s.trim()).filter(Boolean),
      isAdmitted,
      admissionWard: isAdmitted ? admissionWard : undefined,
      labResult: {
        testName: labTestName,
        result: labResult,
        testedDate: visitDate,
      },
      status,
      investigationId: initialData?.investigationId,
      outbreakId: initialData?.outbreakId,
      notes,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // If new case creation, automatically send a targeted notification to the specific รพ.สต.
    if (!isEditing) {
      const pcuAlert: EpiAlert = {
        id: `alt_pcu_${Date.now()}`,
        type: 'new_case_subdistrict_alert',
        severity: disease === 'Dengue' || disease === 'Melioidosis' ? 'high' : 'medium',
        title: `🔔 แจ้งเตือน ${targetHealthCenter}: รับแจ้งเคสใหม่ (${diseaseNameTh})`,
        description: `ผู้ป่วย ${prefix}${firstName} ${lastName} (HN: ${hn}) ที่อยู่ ${villageName} ม.${moo} ${subdistrict} กรุณาลงพื้นที่ยิงพิกัด GPS และดำเนินการควบคุมโรคตามมาตรการ 3-3-1`,
        subdistrict: subdistrict,
        villageName: villageName,
        relatedDisease: disease,
        relatedId: report.id,
        isRead: false,
        createdAt: new Date().toISOString(),
        actionRequired: 'ลงพื้นที่ยิงพิกัด GPS และควบคุมโรคภาคสนาม',
        targetSubdistrict: subdistrict,
        targetPcuName: targetHealthCenter,
        isFieldSurveyPending: true,
      };

      storageService.saveAlert(pcuAlert);
    }

    onSave(report);
    onClose();
  };

  const currentSubObj = PHON_NA_KAEO_SUBDISTRICTS.find(s => s.nameTh === subdistrict);
  const currentVillages = PHON_NA_KAEO_VILLAGES.filter(v => v.subdistrictId === currentSubObj?.id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 text-slate-800">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <ClipboardList className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold">
                {isEditing ? 'แก้ไขข้อมูลรับแจ้งผู้ป่วย (506 Intake)' : 'แบบรับแจ้งผู้ป่วยโรคติดต่อและระบาดวิทยา (รง. 506)'}
              </h2>
              <p className="text-xs text-blue-100">
                โรงพยาบาลโพนนาแก้ว จ.สกลนคร • ระบบจะส่งแจ้งเตือนไปยัง รพ.สต. พื้นที่อัตโนมัติ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6 text-xs">
          
          {/* Section 1: Patient Demographics */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <User className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                1. ข้อมูลผู้ป่วยและประชากร (Patient Demographics)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  HN (Hospital Number) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="เช่น 67001423"
                  value={hn}
                  onChange={(e) => setHn(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  เลขประจำตัวประชาชน (CID 13 หลัก)
                </label>
                <input
                  type="text"
                  maxLength={13}
                  placeholder="3470500xxxxxx"
                  value={cid}
                  onChange={(e) => setCid(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="flex gap-2">
                <div className="w-24">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">คำนำหน้า</label>
                  <select
                    value={prefix}
                    onChange={(e) => setPrefix(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-2 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  >
                    <option value="นาย">นาย</option>
                    <option value="นาง">นาง</option>
                    <option value="น.ส.">น.ส.</option>
                    <option value="ด.ช.">ด.ช.</option>
                    <option value="ด.ญ.">ด.ญ.</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-700 mb-1">
                    ชื่อจริง <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="ชื่อผู้ป่วย"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">
                  นามสกุล <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="นามสกุล"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">เพศ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as 'male' | 'female')}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">เบอร์โทรศัพท์</label>
                <input
                  type="text"
                  placeholder="08x-xxxxxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location Details (with Geolocation) */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-600" />
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                  2. ที่อยู่ขณะป่วย & พิกัดแผนที่ (Address & Geolocation)
                </h3>
              </div>
              <button
                type="button"
                onClick={handleGetCurrentGps}
                disabled={isLocating}
                className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg transition flex items-center gap-1 text-[11px]"
              >
                {isLocating ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Navigation className="w-3 h-3" />}
                <span>ดึงพิกัด GPS เดี๋ยวนี้</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ตำบล (อ.โพนนาแก้ว)</label>
                <select
                  value={subdistrict}
                  onChange={(e) => handleSubdistrictChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {PHON_NA_KAEO_SUBDISTRICTS.map(s => (
                    <option key={s.id} value={s.nameTh}>{s.nameTh} ({s.healthCenter})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">หมู่บ้าน</label>
                <select
                  value={villageName}
                  onChange={(e) => handleVillageChange(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                >
                  {currentVillages.map(v => (
                    <option key={v.id} value={v.name}>{v.name} (หมู่ {v.moo})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">บ้านเลขที่ / ซอย</label>
                <input
                  type="text"
                  placeholder="เช่น 45/2 หมู่ 1"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* GPS Coords */}
            <div className="p-3 bg-emerald-50/60 border border-emerald-200/60 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span className="text-[11px] text-emerald-900 font-medium">
                  พิกัดละติจูด/ลองจิจูด: <strong>{lat.toFixed(5)}, {lng.toFixed(5)}</strong>
                  {gpsAccuracy ? ` (ความแม่นยำ ±${gpsAccuracy}ม.)` : ''}
                </span>
              </div>
              <div className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                <Bell className="w-3.5 h-3.5" />
                <span>รพ.สต. เจ้าของพื้นที่: {currentSubObj?.healthCenter}</span>
              </div>
            </div>
          </div>

          {/* Section 3: Clinical & Disease Diagnosis */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <FlaskConical className="w-4 h-4 text-indigo-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                3. การวินิจฉัยโรค & ผลตรวจทางห้องปฏิบัติการ (Diagnosis & Lab)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">กลุ่มโรคที่รับแจ้ง</label>
                <select
                  value={disease}
                  onChange={(e) => handleDiseaseChange(e.target.value as DiseaseCategory)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-blue-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  {DISEASE_OPTIONS.map(d => (
                    <option key={d.category} value={d.category}>{d.nameTh}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">รหัสโรค ICD-10</label>
                <input
                  type="text"
                  value={icd10}
                  onChange={(e) => setIcd10(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ประเภทผู้ป่วย</label>
                <select
                  value={caseType}
                  onChange={(e) => setCaseType(e.target.value as CaseType)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                >
                  <option value="Confirmed">ผู้ป่วยยืนยัน (Confirmed Case)</option>
                  <option value="Probable">ผู้ป่วยน่าจะใช่ (Probable Case)</option>
                  <option value="Suspected">ผู้ป่วยสงสัย (Suspected Case)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">วันเริ่มมีอาการป่วย (Onset Date)</label>
                <input
                  type="date"
                  value={onsetDate}
                  onChange={(e) => setOnsetDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">วันที่มารับการรักษา (Visit Date)</label>
                <input
                  type="date"
                  value={visitDate}
                  onChange={(e) => setVisitDate(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-1">อาการสำคัญแรกรับ (Chief Complaint)</label>
              <input
                type="text"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                placeholder="ระบุอาการสำคัญ เช่น ไข้สูง 3 วัน ปวดกระบอกตา มีผื่น"
                className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>
          </div>

          {/* Section 4: Reporting Unit & Workflow */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
              <Hospital className="w-4 h-4 text-blue-600" />
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                4. หน่วยงานที่รายงาน & สถานะงาน (Reporting Unit)
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">หน่วยงานที่รับแจ้ง</label>
                <input
                  type="text"
                  value={reportingUnit}
                  onChange={(e) => setReportingUnit(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">ชื่อผู้รายงาน</label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-700 mb-1">สถานะเคส</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as CaseStatus)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="reported">1. รับแจ้งใหม่ (Reported)</option>
                  <option value="pending_investigation">2. รอสอบสวนโรค (Pending)</option>
                  <option value="investigating">3. กำลังสอบสวน (Investigating)</option>
                  <option value="in_control">4. กำลังควบคุมโรค (In-Control)</option>
                  <option value="investigated">5. สอบสวนแล้ว (Investigated)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Targeted Notification Preview Banner */}
          {!isEditing && (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
              <Bell className="w-5 h-5 text-amber-600 shrink-0 mt-0.5 animate-bounce" />
              <div>
                <p className="font-bold text-xs">ระบบจะส่งการแจ้งเตือนอัตโนมัติไปยัง {currentSubObj?.healthCenter}:</p>
                <p className="text-[11px] text-amber-800 mt-0.5 leading-relaxed">
                  เจ้าหน้าที่ รพ.สต. ในพื้นที่ <strong>{subdistrict}</strong> จะได้รับการแจ้งเตือนเคสนี้ทันทีเพื่อลงพื้นที่ยิงพิกัด GPS และปฏิบัติตามมาตรการ 3-3-1
                </p>
              </div>
            </div>
          )}

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition text-xs"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20 transition text-xs flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{isEditing ? 'บันทึกการแก้ไข' : 'บันทึกรับแจ้ง & แจ้งเตือน รพ.สต.'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
