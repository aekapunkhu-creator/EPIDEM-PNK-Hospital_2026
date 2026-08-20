import React, { useState } from 'react';
import {
  SearchCheck,
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  Calendar,
  User,
  MapPin,
  CheckCircle2,
  Sparkles,
  Printer,
  Clock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { Investigation, DiseaseReport } from '../types';

interface InvestigationViewProps {
  investigations: Investigation[];
  reports: DiseaseReport[];
  onOpenInvestigationModal: (report: DiseaseReport, inv?: Investigation | null) => void;
  onDeleteInvestigation: (id: string) => void;
  onPrintInvestigation: (inv: Investigation, report: DiseaseReport) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  investigations,
  reports,
  onOpenInvestigationModal,
  onDeleteInvestigation,
  onPrintInvestigation,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // Reports pending investigation (needs investigation!)
  const pendingReports = reports.filter(r => !r.investigationId || r.status === 'pending_investigation');

  // Merged filtered investigations
  const filteredInvestigations = investigations.filter(inv => {
    const report = reports.find(r => r.id === inv.reportId);
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = report ? `${report.patient.prefix}${report.patient.firstName} ${report.patient.lastName}`.toLowerCase().includes(q) : false;
      const matchHn = report ? report.patient.hn.toLowerCase().includes(q) : false;
      const matchDisease = report ? report.diseaseNameTh.toLowerCase().includes(q) : false;
      const matchInvestigator = inv.investigatorName.toLowerCase().includes(q);
      if (!matchName && !matchHn && !matchDisease && !matchInvestigator) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              ระบบสอบสวนโรคทางระบาดวิทยา (Epidemiological Investigation Engine)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บันทึกประวัติ, ไทม์ไลน์ (Timeline), ปัจจัยเสี่ยง, แหล่งแพร่โรค และ AI สรุปรายงานมาตรฐานกระทรวงสาธารณสุข
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 border border-blue-200">
            สอบสวนแล้ว {investigations.length} เคส
          </span>
        </div>
      </div>

      {/* Pending Investigation Urgent Callout */}
      {pendingReports.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-3xl p-5 shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600 animate-spin" />
              <h2 className="text-xs sm:text-sm font-bold text-amber-900">
                ผู้ป่วยที่รอการสอบสวนโรค (Pending Investigation: {pendingReports.length} ราย)
              </h2>
            </div>
            <span className="text-[11px] text-amber-700 font-medium">คลิก "เปิดแบบสอบสวน" เพื่อดึงข้อมูลอัตโนมัติ</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {pendingReports.map(rep => (
              <div 
                key={rep.id}
                className="bg-white border border-amber-200/80 hover:border-amber-400 rounded-2xl p-4 flex flex-col justify-between gap-2 transition shadow-xs"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700">
                      {rep.diseaseNameTh}
                    </span>
                    <span className="text-[11px] font-mono font-bold text-blue-600">HN {rep.patient.hn}</span>
                  </div>
                  <h3 className="text-xs font-bold text-slate-800 mt-2">
                    {rep.patient.prefix}{rep.patient.firstName} {rep.patient.lastName} ({rep.patient.age} ปี)
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    📍 {rep.patient.villageName} {rep.patient.subdistrict}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">เริ่มป่วย: {rep.onsetDate}</p>
                </div>

                <button
                  onClick={() => onOpenInvestigationModal(rep, null)}
                  className="w-full mt-2 flex items-center justify-center gap-1.5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
                >
                  <SearchCheck className="w-3.5 h-3.5" />
                  <span>เปิดแบบสอบสวนโรค</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้ป่วย, HN, ผู้สอบสวน..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full sm:w-48"
          >
            <option value="all">ทุกสถานะการสอบสวน</option>
            <option value="draft">ร่างแบบสอบสวน (Draft)</option>
            <option value="completed">สอบสวนสมบูรณ์ (Completed)</option>
            <option value="reviewed">ตรวจสอบแล้ว (Reviewed)</option>
          </select>
        </div>
      </div>

      {/* Investigations Table */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
              <tr>
                <th className="py-3 px-4">ผู้ป่วย / โรค</th>
                <th className="py-3 px-4">สมมติฐานแหล่งโรค</th>
                <th className="py-3 px-4">ดัชนี HI/CI</th>
                <th className="py-3 px-4">ผู้สอบสวน / วันที่</th>
                <th className="py-3 px-4 text-center">สถานะ</th>
                <th className="py-3 px-4 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvestigations.map(inv => {
                const report = reports.find(r => r.id === inv.reportId);
                return (
                  <tr key={inv.id} className="hover:bg-slate-50 transition">
                    <td className="py-3 px-4">
                      {report ? (
                        <div>
                          <p className="font-bold text-slate-800">
                            {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            HN: {report.patient.hn} • <span className="text-blue-600 font-semibold">{report.diseaseNameTh}</span>
                          </p>
                          <p className="text-[10px] text-slate-400">{report.patient.villageName} {report.patient.subdistrict}</p>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">ไม่พบข้อมูลผู้ป่วย</span>
                      )}
                    </td>

                    <td className="py-3 px-4 max-w-xs">
                      <p className="text-slate-700 font-medium line-clamp-2">{inv.hypothesisSummary || 'กำลังรวบรวมประวัติ'}</p>
                      {inv.riskFactors && inv.riskFactors.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {inv.riskFactors.slice(0, 2).map((rf, idx) => (
                            <span key={idx} className="text-[9px] px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                              {rf}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {inv.houseIndex !== undefined ? (
                        <div className="space-y-0.5 text-[11px]">
                          <p className="text-slate-600">HI: <strong className={inv.houseIndex > 5 ? 'text-red-600' : 'text-emerald-600'}>{inv.houseIndex}%</strong></p>
                          <p className="text-slate-600">CI: <strong className={inv.containerIndex !== undefined && inv.containerIndex > 5 ? 'text-red-600' : 'text-emerald-600'}>{inv.containerIndex}%</strong></p>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[11px]">-</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <p className="font-medium text-slate-800">{inv.investigatorName}</p>
                      <p className="text-[11px] text-slate-400">วันที่: {inv.investigationDate}</p>
                    </td>

                    <td className="py-3 px-4 text-center">
                      <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-md uppercase ${
                        inv.status === 'completed' ? 'bg-green-100 text-green-700' :
                        inv.status === 'reviewed' ? 'bg-blue-100 text-blue-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {inv.status === 'completed' ? 'สมบูรณ์' :
                         inv.status === 'reviewed' ? 'ตรวจแล้ว' : 'ร่างแบบ'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {report && (
                          <button
                            onClick={() => onPrintInvestigation(inv, report)}
                            className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition"
                            title="พิมพ์รายงานสอบสวนโรคมาตรฐาน สธ."
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                        )}
                        {report && (
                          <button
                            onClick={() => onOpenInvestigationModal(report, inv)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
                            title="แก้ไขการสอบสวน"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('ต้องการลบแบบสอบสวนโรคนี้ใช่หรือไม่?')) {
                              onDeleteInvestigation(inv.id);
                            }
                          }}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition"
                          title="ลบแบบสอบสวน"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
