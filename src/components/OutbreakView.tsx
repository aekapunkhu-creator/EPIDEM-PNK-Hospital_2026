import React, { useState } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { OutbreakEvent, DiseaseReport, ContactPerson } from '../types';

interface OutbreakViewProps {
  outbreaks: OutbreakEvent[];
  reports: DiseaseReport[];
  contacts: ContactPerson[];
  onSelectOutbreak: (outbreak: OutbreakEvent) => void;
  onSaveOutbreak: (outbreak: OutbreakEvent) => void;
}

export const OutbreakView: React.FC<OutbreakViewProps> = ({
  outbreaks,
  reports,
  contacts,
  onSelectOutbreak,
  onSaveOutbreak,
}) => {
  const [selectedEvent, setSelectedEvent] = useState<OutbreakEvent | null>(outbreaks[0] || null);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Cases linked to selected outbreak
  const outbreakCases = reports.filter(r => r.outbreakId === selectedEvent?.id);
  const outbreakContacts = contacts.filter(c => outbreakCases.some(r => r.id === c.reportId));

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
      setAiAnalysis(data.analysis || 'ผลการวิเคราะห์สมบูรณ์');
    } catch (err) {
      console.error(err);
      setAiAnalysis('เกิดข้อผิดพลาดในการเชื่อมต่อ AI กำลังใช้ข้อมูลวิเคราะห์มาตรฐาน');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-red-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              การจัดการเหตุการณ์ระบาด (Outbreak Management & EOC)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            รวมศูนย์เคสผู้ป่วย คลัสเตอร์ คำนวณ Attack Rate และวิเคราะห์ Epidemic Curve ในอำเภอโพนนาแก้ว
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-red-50 text-red-700 border border-red-200">
            {outbreaks.filter(o => o.status === 'active').length} เหตุการณ์ระบาดต่อเนื่อง
          </span>
        </div>
      </div>

      {/* Outbreak Selection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {outbreaks.map(ob => {
          const isSelected = selectedEvent?.id === ob.id;
          return (
            <div
              key={ob.id}
              onClick={() => {
                setSelectedEvent(ob);
                setAiAnalysis('');
              }}
              className={`p-5 rounded-3xl border transition cursor-pointer relative overflow-hidden ${
                isSelected
                  ? 'bg-red-50/40 border-red-300 shadow-sm ring-2 ring-red-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-red-100 text-red-700 uppercase">
                  {ob.diseaseNameTh}
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                  ob.status === 'active' ? 'bg-red-100 text-red-700' :
                  ob.status === 'under_control' ? 'bg-amber-100 text-amber-700' :
                  'bg-green-100 text-green-700'
                }`}>
                  {ob.status === 'active' ? 'กำลังระบาด' :
                   ob.status === 'under_control' ? 'ควบคุมได้' : 'ปิดเหตุการณ์'}
                </span>
              </div>

              <h2 className="text-sm font-bold text-slate-800 mt-2 line-clamp-1">{ob.title}</h2>
              <p className="text-xs text-slate-500 mt-1">
                📍 {ob.specificLocation} ({ob.villageName} {ob.subdistrict})
              </p>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-slate-100 text-center">
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">ผู้ป่วย</p>
                  <p className="text-sm font-bold text-red-600">{ob.totalCases} ราย</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">ประชากรเสี่ยง</p>
                  <p className="text-sm font-bold text-slate-700">{ob.populationAtRisk} คน</p>
                </div>
                <div className="bg-slate-50 p-2 rounded-xl border border-slate-100">
                  <p className="text-[10px] text-slate-400">Attack Rate</p>
                  <p className="text-sm font-bold text-amber-600">{ob.attackRatePercent}%</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detail Pane for Selected Outbreak */}
      {selectedEvent && (
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-6 bg-red-600 rounded-full"></span>
                <h2 className="text-base font-bold text-slate-800">{selectedEvent.title}</h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                เริ่มระบาด: {selectedEvent.startDate} • จุดเกิดเหตุ: {selectedEvent.specificLocation}
              </p>
            </div>

            <button
              onClick={() => handleRunAiAnalysis(selectedEvent)}
              disabled={isAnalyzing}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-600/20 transition disabled:opacity-50"
            >
              <Sparkles className="w-4 h-4" />
              <span>{isAnalyzing ? 'AI กำลังประมวลผล...' : 'AI วิเคราะห์สถานการณ์ & สรุปมาตรการ'}</span>
            </button>
          </div>

          {/* AI Epidemic Analysis Output */}
          {aiAnalysis && (
            <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 space-y-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 font-bold">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>สรุปการวิเคราะห์ทางระบาดวิทยาโดย AI (Epidemiological AI Insights):</span>
              </div>
              <p className="text-indigo-950 leading-relaxed whitespace-pre-line text-xs font-medium">
                {aiAnalysis}
              </p>
            </div>
          )}

          {/* Linked Cases in this Outbreak */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              รายชื่อผู้ป่วยที่เชื่อมโยงในเหตุการณ์นี้ ({outbreakCases.length} ราย)
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 text-[11px] uppercase">
                    <th className="py-2.5 px-3">ผู้ป่วย / HN</th>
                    <th className="py-2.5 px-3">วันที่เริ่มป่วย</th>
                    <th className="py-2.5 px-3">ที่อยู่</th>
                    <th className="py-2.5 px-3">ผลแล็บ</th>
                    <th className="py-2.5 px-3 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {outbreakCases.map(c => (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="py-2.5 px-3 font-bold text-slate-800">
                        {c.patient.prefix}{c.patient.firstName} {c.patient.lastName} (HN: {c.patient.hn})
                      </td>
                      <td className="py-2.5 px-3 text-slate-600">{c.onsetDate}</td>
                      <td className="py-2.5 px-3 text-slate-600">{c.patient.villageName}</td>
                      <td className="py-2.5 px-3 text-slate-600">
                        {c.labResult?.testName}: <strong className="text-red-600">{c.labResult?.result}</strong>
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700">
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};
