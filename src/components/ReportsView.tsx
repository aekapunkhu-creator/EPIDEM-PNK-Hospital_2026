import React, { useState } from 'react';
import {
  FileText,
  Download,
  FileSpreadsheet,
  Printer,
  CheckCircle2,
  Calendar,
  Filter,
  Layers,
  Database
} from 'lucide-react';
import { DiseaseReport, OutbreakEvent } from '../types';

interface ReportsViewProps {
  reports: DiseaseReport[];
  outbreaks: OutbreakEvent[];
  onOpenSheetsModal: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  reports,
  outbreaks,
  onOpenSheetsModal,
}) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'outbreak_summary'>('weekly');

  const exportCsv = () => {
    const headers = [
      'ID', 'HN', 'ชื่อ-นามสกุล', 'อายุ', 'เพศ', 'เบอร์โทร', 'ที่อยู่', 'ตำบล', 'อำเภอ', 'จังหวัด',
      'โรค', 'ICD10', 'วันเริ่มป่วย', 'วันตรวจ', 'หน่วยงานรายงาน', 'ผลแล็บ', 'สถานะ'
    ];

    const rows = reports.map(r => [
      r.id,
      r.patient.hn,
      `"${r.patient.prefix}${r.patient.firstName} ${r.patient.lastName}"`,
      r.patient.age,
      r.patient.gender,
      r.patient.phone || '',
      `"${r.patient.address} ${r.patient.villageName}"`,
      r.patient.subdistrict,
      r.patient.district,
      r.patient.province,
      `"${r.diseaseNameTh}"`,
      r.icd10,
      r.onsetDate,
      r.visitDate,
      `"${r.reportingUnit}"`,
      `"${r.labResult?.result || 'N/A'}"`,
      r.status
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `PNK_EPI_506_Export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              ศูนย์รายงานระบาดวิทยา 506 & การส่งออกข้อมูล (Surveillance Reports)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            สรุปสถานการณ์เฝ้าระวังโรคประจำวัน/ประจำสัปดาห์ สำหรับส่งต่อ สสอ.โพนนาแก้ว และ สสจ.สกลนคร
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportCsv}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition transform active:scale-95"
          >
            <Download className="w-4 h-4" />
            <span>ส่งออก CSV (Excel 506)</span>
          </button>

          <button
            onClick={onOpenSheetsModal}
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Google Sheets Sync</span>
          </button>
        </div>
      </div>

      {/* Surveillance Summary Sheet Preview */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-800">
              ตัวอย่างรายงาน 506 โรงพยาบาลโพนนาแก้ว (Weekly 506 Preview)
            </h2>
            <p className="text-xs text-slate-500">ข้อมูลพร้อมส่งออกและเชื่อมโยง API งานระบาดวิทยา</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์รายงาน</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px]">
                <th className="py-2.5 px-3">HN</th>
                <th className="py-2.5 px-3">ชื่อ-สกุล</th>
                <th className="py-2.5 px-3">โรค (ICD-10)</th>
                <th className="py-2.5 px-3">ตำบล</th>
                <th className="py-2.5 px-3">วันเริ่มป่วย</th>
                <th className="py-2.5 px-3">ผลแล็บ</th>
                <th className="py-2.5 px-3 text-right">สถานะ 506</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map(r => (
                <tr key={r.id} className="hover:bg-slate-50 transition">
                  <td className="py-2 px-3 font-semibold text-blue-600">{r.patient.hn}</td>
                  <td className="py-2 px-3 text-slate-800 font-sans">{r.patient.prefix}{r.patient.firstName} {r.patient.lastName}</td>
                  <td className="py-2 px-3 text-slate-700 font-sans">{r.diseaseNameTh} ({r.icd10})</td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{r.patient.subdistrict}</td>
                  <td className="py-2 px-3 text-slate-600">{r.onsetDate}</td>
                  <td className="py-2 px-3 text-slate-600 font-sans">{r.labResult?.testName}: {r.labResult?.result}</td>
                  <td className="py-2 px-3 text-right font-sans">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
