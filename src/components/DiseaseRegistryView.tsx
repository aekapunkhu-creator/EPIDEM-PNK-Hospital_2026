import React, { useState } from 'react';
import {
  ClipboardList,
  Plus,
  Search,
  Filter,
  SearchCheck,
  Eye,
  Edit,
  Trash2,
  AlertCircle,
  FileSpreadsheet,
  Download,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Flame,
  ArrowRight,
  Share2,
  MapPin,
  Smartphone,
  Send,
  Lock,
  Crown
} from 'lucide-react';
import { DiseaseReport, DiseaseCategory, CaseStatus, UserSession } from '../types';

interface DiseaseRegistryViewProps {
  reports: DiseaseReport[];
  currentUser: UserSession;
  onOpenReportModal: () => void;
  onEditReport: (report: DiseaseReport) => void;
  onDeleteReport: (id: string, description: string) => void;
  onSelectReport: (report: DiseaseReport) => void;
  onCreateInvestigation: (report: DiseaseReport) => void;
  onShareGpsLink: (report: DiseaseReport) => void;
  onOpenMobileSurvey: (report: DiseaseReport) => void;
}

export const DiseaseRegistryView: React.FC<DiseaseRegistryViewProps> = ({
  reports,
  currentUser,
  onOpenReportModal,
  onEditReport,
  onDeleteReport,
  onSelectReport,
  onCreateInvestigation,
  onShareGpsLink,
  onOpenMobileSurvey,
}) => {
  const [filterDisease, setFilterDisease] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterSubdistrict, setFilterSubdistrict] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const isAdmin = currentUser.role === 'admin';

  // Filter logic
  const filteredReports = reports.filter(r => {
    if (filterDisease !== 'all' && r.disease !== filterDisease) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (filterSubdistrict !== 'all' && r.patient.subdistrict !== filterSubdistrict) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = `${r.patient.prefix}${r.patient.firstName} ${r.patient.lastName}`.toLowerCase().includes(q);
      const matchHn = r.patient.hn.toLowerCase().includes(q);
      const matchDisease = r.diseaseNameTh.toLowerCase().includes(q) || r.disease.toLowerCase().includes(q);
      const matchVillage = r.patient.villageName.toLowerCase().includes(q);
      if (!matchName && !matchHn && !matchDisease && !matchVillage) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5 pb-12">
      {/* Top Header & Action */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              ทะเบียนผู้ป่วยและการรับแจ้งโรค (506 Disease Registry)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกการรับแจ้งจาก ER, OPD, IPD, ห้อง LAB และ รพ.สต. ในเขตอำเภอโพนนาแก้ว • ส่งลิงก์ยิงพิกัด Android & iOS ได้ทุกเคส
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenReportModal}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>+ รับแจ้งผู้ป่วยใหม่</span>
          </button>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, HN, หมู่บ้าน..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          {/* Disease Filter */}
          <div>
            <select
              value={filterDisease}
              onChange={(e) => setFilterDisease(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">ทุกกลุ่มโรค</option>
              <option value="Dengue">โรคไข้เลือดออก (Dengue)</option>
              <option value="HFMD">โรคมือเท้าปาก (HFMD)</option>
              <option value="Influenza">โรคไข้หวัดใหญ่ (Influenza)</option>
              <option value="Diarrhea">อุจจาระร่วง / อาหารเป็นพิษ</option>
              <option value="Leptospirosis">ไข้ฉี่หนู (Leptospirosis)</option>
              <option value="Melioidosis">เมลิออยโดสิส (Melioidosis)</option>
              <option value="TB">วัณโรค (TB)</option>
              <option value="Chickenpox">โรคสุกใส (Chickenpox)</option>
              <option value="Tetanus">โรคบาดทะยัก (Tetanus)</option>
              <option value="COVID-19">โรคติดเชื้อไวรัสโคโรนา (COVID-19)</option>
              <option value="STREP_SUIS">โรคติดเชื้อสเตร็พโตคอคคัสซูอิส</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">ทุกสถานะงาน</option>
              <option value="reported">1. รับแจ้ง (Reported)</option>
              <option value="pending_investigation">2. รอสอบสวน (Pending)</option>
              <option value="investigating">3. กำลังสอบสวน (Investigating)</option>
              <option value="investigated">4. สอบสวนแล้ว (Investigated)</option>
              <option value="in_control">5. กำลังควบคุมโรค (In-Control)</option>
              <option value="closed">6. ปิดเหตุการณ์ (Closed)</option>
            </select>
          </div>

          {/* Subdistrict Filter */}
          <div>
            <select
              value={filterSubdistrict}
              onChange={(e) => setFilterSubdistrict(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            >
              <option value="all">ทุกตำบล (โพนนาแก้ว)</option>
              <option value="ตำบลนาแก้ว">ตำบลนาแก้ว</option>
              <option value="ตำบลบ้านแป้น">ตำบลบ้านแป้น</option>
              <option value="ตำบลบ้านโพน">ตำบลบ้านโพน</option>
              <option value="ตำบลนาตงวัฒนา">ตำบลนาตงวัฒนา</option>
              <option value="ตำบลเชียงสือ">ตำบลเชียงสือ</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
          <span>พบข้อมูลทั้งหมด <strong className="text-blue-600 font-bold">{filteredReports.length}</strong> รายการ</span>
          {(filterDisease !== 'all' || filterStatus !== 'all' || filterSubdistrict !== 'all' || searchTerm) && (
            <button
              onClick={() => {
                setFilterDisease('all');
                setFilterStatus('all');
                setFilterSubdistrict('all');
                setSearchTerm('');
              }}
              className="text-blue-600 hover:text-blue-700 font-bold"
            >
              ล้างตัวกรองทั้งหมด
            </button>
          )}
        </div>
      </div>

      {/* Reports Table Card */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3 px-4">ผู้ป่วย / HN</th>
                <th className="py-3 px-4">โรคเฝ้าระวัง</th>
                <th className="py-3 px-4">ที่อยู่ / พิกัด GPS</th>
                <th className="py-3 px-4">วันเริ่มป่วย / รับแจ้ง</th>
                <th className="py-3 px-4">ผลแล็บ / แผนกแจ้ง</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ & ยิงพิกัด</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="font-semibold text-slate-700 text-sm">ยังไม่มีข้อมูลผู้ป่วยในระบบ</p>
                      <p className="text-xs text-slate-400 max-w-sm">
                        ข้อมูลตัวอย่างเดิมถูกลบออกแล้ว ท่านสามารถเริ่มบันทึกเคสจริงได้โดยคลิกปุ่ม "+ รับแจ้งผู้ป่วยใหม่"
                      </p>
                      <button
                        onClick={onOpenReportModal}
                        className="mt-3 flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        <Plus className="w-4 h-4" />
                        <span>+ รับแจ้งผู้ป่วยใหม่</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map(report => (
                <tr key={report.id} className="hover:bg-slate-50 transition">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 border border-blue-100 flex items-center justify-center font-bold text-blue-600 text-xs shrink-0">
                        {report.patient.gender === 'male' ? 'ช' : 'ญ'}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">
                          {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          HN: <span className="font-mono font-medium">{report.patient.hn}</span> • อายุ {report.patient.age} ปี
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <span className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-md ${
                      report.disease === 'Dengue' ? 'bg-rose-100 text-rose-700' :
                      report.disease === 'HFMD' ? 'bg-amber-100 text-amber-700' :
                      report.disease === 'Leptospirosis' ? 'bg-emerald-100 text-emerald-700' :
                      report.disease === 'Melioidosis' ? 'bg-red-100 text-red-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {report.diseaseNameTh}
                    </span>
                    <p className="text-[10px] text-slate-400 mt-0.5">ICD-10: {report.icd10} ({report.caseType})</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-slate-800 font-medium">{report.patient.villageName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span className="text-[11px] text-slate-500">{report.patient.subdistrict}</span>
                      {report.patient.gpsAccuracy ? (
                        <span className="text-[9px] px-1.5 py-0.2 bg-emerald-100 text-emerald-800 rounded font-mono font-semibold" title={`พิกัด ${report.patient.lat.toFixed(4)}, ${report.patient.lng.toFixed(4)}`}>
                          📍 GPS ±{report.patient.gpsAccuracy}ม.
                        </span>
                      ) : (
                        <span className="text-[9px] px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-semibold">
                          ⚠️ พิกัดตำบล
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-slate-800">เริ่มป่วย: {report.onsetDate}</p>
                    <p className="text-[11px] text-slate-500">รับแจ้ง: {report.reportDate}</p>
                  </td>

                  <td className="py-3 px-4">
                    <p className="text-slate-800 font-medium truncate max-w-[130px]">{report.reportingUnit}</p>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                      report.labResult?.result === 'Positive' ? 'bg-red-100 text-red-700' :
                      report.labResult?.result === 'Pending' ? 'bg-amber-100 text-amber-700' :
                      'bg-slate-100 text-slate-600'
                    }`}>
                      {report.labResult?.testName}: {report.labResult?.result || 'รอผล'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-center">
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
                  </td>

                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {/* Share GPS Link (Android/iOS) */}
                      <button
                        onClick={() => onShareGpsLink(report)}
                        className="p-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-lg transition"
                        title="📲 ส่งลิงก์ยิงพิกัด GPS (Android / iOS) ให้ รพ.สต."
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>

                      {/* Direct Mobile GPS Field Capture */}
                      <button
                        onClick={() => onOpenMobileSurvey(report)}
                        className="p-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition"
                        title="📍 เปิดหน้าจอยิงพิกัด & บันทึกผลควบคุมโรค"
                      >
                        <MapPin className="w-3.5 h-3.5" />
                      </button>

                      {/* Start Investigation */}
                      <button
                        onClick={() => onCreateInvestigation(report)}
                        className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                        title="เริ่มสอบสวนโรคเคสนี้"
                      >
                        <SearchCheck className="w-3.5 h-3.5" />
                      </button>

                      {/* Edit */}
                      <button
                        onClick={() => onEditReport(report)}
                        className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition"
                        title="แก้ไขข้อมูลรับแจ้ง"
                      >
                        <Edit className="w-3.5 h-3.5" />
                      </button>

                      {/* Delete (Protected for Admin) */}
                      <button
                        onClick={() => {
                          const desc = `${report.patient.prefix}${report.patient.firstName} ${report.patient.lastName} (HN: ${report.patient.hn}, โรค: ${report.diseaseNameTh})`;
                          onDeleteReport(report.id, desc);
                        }}
                        className={`p-1.5 rounded-lg transition ${
                          isAdmin 
                            ? 'bg-red-50 hover:bg-red-100 text-red-600' 
                            : 'bg-slate-100 hover:bg-red-50 text-slate-400 hover:text-red-500'
                        }`}
                        title={isAdmin ? "ลบเคสนี้ (Admin)" : "ลบเคสนี้ (ต้องใช้สิทธิ์ Admin)"}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              )))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
