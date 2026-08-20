import React, { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  AlertTriangle,
  Flame,
  CheckSquare,
  Sparkles,
  Users,
  Search
} from 'lucide-react';
import { ControlActivity, DiseaseReport } from '../types';

interface ControlMeasuresViewProps {
  activities: ControlActivity[];
  reports: DiseaseReport[];
  onToggleActivity: (id: string) => void;
  onAddActivity: (act: ControlActivity) => void;
}

export const ControlMeasuresView: React.FC<ControlMeasuresViewProps> = ({
  activities,
  reports,
  onToggleActivity,
  onAddActivity,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [isAdding, setIsAdding] = useState(false);

  // New task form state
  const [targetReportId, setTargetReportId] = useState(reports[0]?.id || '');
  const [taskTitle, setTaskTitle] = useState('');
  const [taskOutcome, setTaskOutcome] = useState('');
  const [category, setCategory] = useState<ControlActivity['category']>('chemical_spray');
  const [assignedTo, setAssignedTo] = useState('ทีม SRRT รพ.โพนนาแก้ว & อสม.');
  const [targetLocation, setTargetLocation] = useState('รัศมี 100 เมตร รอบบ้านผู้ป่วย');
  const [subdistrict, setSubdistrict] = useState('ตำบลนาแก้ว');
  const [villageName, setVillageName] = useState('บ้านนาแก้ว');
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0]);

  const handleCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle) {
      alert('กรุณาระบุชื่องานมาตรการ');
      return;
    }

    const linkedReport = reports.find(r => r.id === targetReportId);

    const newAct: ControlActivity = {
      id: `act_${Date.now()}`,
      title: taskTitle,
      category,
      targetLocation,
      subdistrict: linkedReport?.patient.subdistrict || subdistrict,
      villageName: linkedReport?.patient.villageName || villageName,
      relatedDisease: linkedReport?.disease || 'Dengue',
      relatedReportId: targetReportId,
      relatedOutbreakId: linkedReport?.outbreakId,
      assignedTo,
      dueDate,
      isCompleted: false,
      outcomeSummary: taskOutcome,
      hiAfter: 0,
      ciAfter: 0,
      createdAt: new Date().toISOString(),
    };

    onAddActivity(newAct);
    setIsAdding(false);
    setTaskTitle('');
    setTaskOutcome('');
  };

  const filteredActivities = activities.filter(a => {
    if (filterCategory !== 'all' && a.category !== filterCategory) return false;
    return true;
  });

  const completedCount = activities.filter(a => a.isCompleted).length;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              แผนงานและมาตรการควบคุมโรค (Disease Control & 3-3-1 Protocol)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            ติดตามการพ่นสารเคมี, ทำลายแหล่งเพาะพันธุ์, สำรวจ HI/CI, สุขศึกษาชุมชน และการเปิด EOC อำเภอโพนนาแก้ว
          </p>
        </div>

        <button
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มกิจกรรมควบคุมโรค</span>
        </button>
      </div>

      {/* 3-3-1 Protocol Standard Banner */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-emerald-600 rounded-full"></span>
            <h2 className="text-sm font-bold text-slate-800">
              มาตรฐานมาตรการ 3-3-1 ในการควบคุมโรคไข้เลือดออก & โรคติดต่อสำคัญ (อ.โพนนาแก้ว)
            </h2>
          </div>
          <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
            ดำเนินงานแล้ว {completedCount}/{activities.length} มาตรการ
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
          {/* Step 1: 3 Hours */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-100 text-blue-700 uppercase">
                3 ชั่วโมงแรก
              </span>
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs">รับแจ้ง & รายงานทันที</h3>
            <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
              ER/OPD/IPD/LAB แจ้งงานระบาดวิทยา รพ.โพนนาแก้ว ทันทีที่พบผู้ป่วยสงสัย เพื่อบันทึกข้อมูลเข้าสู่ระบบ
            </p>
          </div>

          {/* Step 2: 3 Days */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-100 text-amber-700 uppercase">
                3 วันแรก
              </span>
              <Clock className="w-4 h-4 text-amber-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs">ลงพื้นที่สอบสวน & พ่นยา</h3>
            <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
              ทีม SRRT ร่วมกับ รพ.สต. และ อสม. ลงพื้นที่สำรวจลูกน้ำยุงลาย พ่นสารเคมีรัศมี 100 เมตร และค้นหาผู้ป่วยเพิ่มเติม
            </p>
          </div>

          {/* Step 3: 1 Day/Week */}
          <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700 uppercase">
                1 สัปดาห์
              </span>
              <Clock className="w-4 h-4 text-emerald-600" />
            </div>
            <h3 className="font-bold text-slate-800 text-xs">ประเมินผล & ตัดวงจรโรค</h3>
            <p className="text-slate-500 mt-1 leading-relaxed text-[11px]">
              ประเมินค่า HI & CI ต้องเป็น 0% ในรัศมี 100 เมตร รอบบ้านผู้ป่วย และติดตามผู้สัมผัสจนครบ 14 วัน
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {[
          { key: 'all', label: 'กิจกรรมทั้งหมด' },
          { key: 'chemical_spray', label: 'พ่นสารเคมี / ULV' },
          { key: 'larval_control', label: 'กำจัดลูกน้ำ / ใส่ทรายอะเบท' },
          { key: 'health_education', label: 'สุขศึกษาชุมชน / สื่อสารความเสี่ยง' },
          { key: 'quarantine', label: 'กักกันโรค / สังเกตอาการ' },
          { key: 'eoc_meeting', label: 'ประชุม EOC / สรุปสถานการณ์' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilterCategory(tab.key)}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              filterCategory === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Control Activities List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredActivities.map(act => {
          const report = reports.find(r => r.id === act.relatedReportId);

          return (
            <div
              key={act.id}
              className={`bg-white border rounded-3xl p-5 shadow-xs transition flex flex-col justify-between ${
                act.isCompleted
                  ? 'border-emerald-200 bg-emerald-50/20'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                    act.category === 'chemical_spray' ? 'bg-red-100 text-red-700' :
                    act.category === 'larval_control' ? 'bg-blue-100 text-blue-700' :
                    act.category === 'health_education' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {act.category === 'chemical_spray' ? 'พ่นสารเคมี' :
                     act.category === 'larval_control' ? 'กำจัดลูกน้ำ' :
                     act.category === 'health_education' ? 'สุขศึกษา' : 'มาตรการ EOC'}
                  </span>

                  <span className="text-xs text-slate-400 font-medium">
                    กำหนด: {act.dueDate}
                  </span>
                </div>

                <h3 className={`text-sm font-bold ${act.isCompleted ? 'text-slate-500 line-through' : 'text-slate-800'}`}>
                  {act.title}
                </h3>

                <p className="text-xs text-slate-500 mt-1">
                  📍 {act.targetLocation} ({act.villageName} {act.subdistrict})
                </p>

                {report && (
                  <p className="text-[11px] text-blue-600 mt-1 font-medium">
                    เคส: {report.patient.firstName} {report.patient.lastName} ({report.diseaseNameTh})
                  </p>
                )}

                {act.outcomeSummary && (
                  <div className="mt-2.5 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                    <span className="font-bold text-slate-700">ผลการปฏิบัติ: </span>
                    {act.outcomeSummary}
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  ผู้รับผิดชอบ: <strong className="text-slate-700 font-semibold">{act.assignedTo}</strong>
                </span>

                <button
                  onClick={() => onToggleActivity(act.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                    act.isCompleted
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-xs'
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{act.isCompleted ? 'เสร็จสิ้นแล้ว' : 'บันทึกเสร็จงาน'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Modal */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              เพิ่มกิจกรรมควบคุมโรค (Add Control Measure)
            </h2>

            <form onSubmit={handleCreateTask} className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">เชื่อมโยงเคสผู้ป่วย *</label>
                <select
                  value={targetReportId}
                  onChange={(e) => setTargetReportId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.patient.firstName} {r.patient.lastName} ({r.diseaseNameTh} - {r.patient.villageName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ชื่องานมาตรการ *</label>
                <input
                  type="text"
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  placeholder="เช่น พ่นหมอกควันรอบบ้านผู้ป่วย 100 ม. ครั้งที่ 1"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">ประเภทมาตรการ</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="chemical_spray">พ่นสารเคมี / หมอกควัน (ULV)</option>
                    <option value="larval_control">กำจัดแหล่งเพาะพันธุ์ / ใส่ทราย</option>
                    <option value="health_education">สุขศึกษาชุมชน</option>
                    <option value="quarantine">กักกันโรค / สังเกตอาการ</option>
                    <option value="eoc_meeting">ประชุม EOC อำเภอ</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">กำหนดแล้วเสร็จ</label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">สถานที่เป้าหมาย</label>
                <input
                  type="text"
                  value={targetLocation}
                  onChange={(e) => setTargetLocation(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ผู้รับผิดชอบ</label>
                <input
                  type="text"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">บันทึกผลการปฏิบัติเบื้องต้น</label>
                <textarea
                  value={taskOutcome}
                  onChange={(e) => setTaskOutcome(e.target.value)}
                  placeholder="เช่น สำรวจ 45 หลังคาเรือน พบลูกน้ำ 2 หลังคาเรือน ค่า HI 4.4%..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdding(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
                >
                  บันทึกกิจกรรม
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
