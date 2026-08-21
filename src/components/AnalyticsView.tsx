import React, { useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart as PieChartIcon,
  Calendar,
  Filter,
  Download,
  Activity,
  Layers
} from 'lucide-react';
import { DiseaseReport, DiseaseCategory } from '../types';
import { PHON_NA_KAEO_SUBDISTRICTS } from '../data/mockData';

interface AnalyticsViewProps {
  reports: DiseaseReport[];
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({ reports }) => {
  const [selectedDisease, setSelectedDisease] = useState<string>('all');

  // Disease breakdown
  const diseaseMap: Record<string, number> = {};
  reports.forEach(r => {
    diseaseMap[r.diseaseNameTh] = (diseaseMap[r.diseaseNameTh] || 0) + 1;
  });

  // Age group breakdown
  const ageGroups = {
    '0-4 ปี': reports.filter(r => r.patient.age <= 4).length,
    '5-14 ปี': reports.filter(r => r.patient.age >= 5 && r.patient.age <= 14).length,
    '15-24 ปี': reports.filter(r => r.patient.age >= 15 && r.patient.age <= 24).length,
    '25-59 ปี': reports.filter(r => r.patient.age >= 25 && r.patient.age <= 59).length,
    '60 ปีขึ้นไป': reports.filter(r => r.patient.age >= 60).length,
  };

  // Gender breakdown
  const maleCount = reports.filter(r => r.patient.gender === 'male').length;
  const femaleCount = reports.filter(r => r.patient.gender === 'female').length;

  // Onset timeline (Epidemic Curve Simulation)
  const onsetDatesMap: Record<string, number> = {};
  reports.forEach(r => {
    onsetDatesMap[r.onsetDate] = (onsetDatesMap[r.onsetDate] || 0) + 1;
  });
  const sortedDates = Object.keys(onsetDatesMap).sort();

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              การวิเคราะห์ข้อมูลทางระบาดวิทยา (Epidemiological Analytics)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            วิเคราะห์ข้อมูลตามตัวแปร 3 มิติ: บุคคล (Person), เวลา (Time), และสถานที่ (Place) ของอำเภอโพนนาแก้ว
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-slate-50 text-blue-700 border border-slate-200 font-bold">
            ประชากรรวม ~45,000 คน
          </span>
        </div>
      </div>

      {/* Grid: Epidemic Curve (Time) */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span>เส้นโค้งการระบาด (Epidemic Curve by Onset Date)</span>
            </h2>
            <p className="text-xs text-slate-500">แสดงจำนวนผู้ป่วยรายวันตามวันที่เริ่มมีอาการ</p>
          </div>
        </div>

        {/* Custom Bar Chart for Epi Curve */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end gap-3 px-2 border-b border-l border-slate-200">
            {sortedDates.map(date => {
              const count = onsetDatesMap[date];
              const heightPercent = Math.min(100, Math.max(15, count * 30));

              return (
                <div key={date} className="flex-1 flex flex-col items-center gap-1 group">
                  <span className="text-[10px] font-bold text-blue-600 opacity-0 group-hover:opacity-100 transition">
                    {count} ราย
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[40px] bg-blue-600 hover:bg-blue-700 rounded-t-md transition duration-200"
                  />
                  <span className="text-[10px] text-slate-500 font-mono rotate-45 sm:rotate-0 mt-1 whitespace-nowrap">
                    {date.slice(5)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Grid 2 Columns: Person & Place Analysis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Person (Age & Gender) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <PieChartIcon className="w-4 h-4 text-blue-600" />
            <span>ลักษณะทางประชากร (Person Variables)</span>
          </h2>

          {/* Gender Ratio */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between text-xs">
            <span className="font-bold text-slate-700">สัดส่วนเพศ:</span>
            <div className="flex items-center gap-4">
              <span className="font-bold text-blue-600">ชาย: {maleCount} ราย ({Math.round((maleCount / (reports.length || 1)) * 100)}%)</span>
              <span className="font-bold text-rose-600">หญิง: {femaleCount} ราย ({Math.round((femaleCount / (reports.length || 1)) * 100)}%)</span>
            </div>
          </div>

          {/* Age Distribution Bars */}
          <div className="space-y-2 text-xs">
            <p className="font-bold text-slate-700">การกระจายตามกลุ่มอายุ:</p>
            {Object.entries(ageGroups).map(([ageLabel, count]) => {
              const pct = Math.round((count / (reports.length || 1)) * 100);
              return (
                <div key={ageLabel} className="space-y-1">
                  <div className="flex justify-between text-[11px] text-slate-600">
                    <span>{ageLabel}</span>
                    <span className="font-bold text-slate-800">{count} ราย ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      style={{ width: `${pct}%` }}
                      className="h-full bg-blue-600 rounded-full transition-all"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Place (Subdistrict Distribution) */}
        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span>การกระจายตามพื้นที่ (Place Variables - 5 ตำบล)</span>
          </h2>

          <div className="space-y-3 text-xs">
            {PHON_NA_KAEO_SUBDISTRICTS.map(sub => {
              const count = reports.filter(r => r.patient.subdistrict === sub.nameTh).length;
              const dengueCount = reports.filter(r => r.patient.subdistrict === sub.nameTh && r.disease === 'Dengue').length;
              const attackRate = ((count / sub.population) * 100000).toFixed(1);

              return (
                <div key={sub.id} className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800">{sub.nameTh} ({sub.healthCenter})</p>
                    <p className="text-[10px] text-slate-500">ปชก. {sub.population.toLocaleString()} คน • {sub.villagesCount} หมู่บ้าน</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-blue-600">{count} เคส <span className="text-[10px] text-rose-600 font-medium">(ไข้เลือดออก {dengueCount})</span></p>
                    <p className="text-[10px] text-slate-400">อัตราป่วย: {attackRate} ต่อแสน</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
};
