import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  Calendar,
  X,
  UserCheck,
  Flame,
  ArrowRight,
  ShieldCheck
} from 'lucide-react';
import { ContactPerson, DiseaseReport, ExposureRiskLevel, ContactStatus } from '../types';

interface ContactTracingViewProps {
  contacts: ContactPerson[];
  reports: DiseaseReport[];
  onSaveContact: (contact: ContactPerson) => void;
  onDeleteContact: (id: string) => void;
  onConvertToCase: (contact: ContactPerson) => void;
}

export const ContactTracingView: React.FC<ContactTracingViewProps> = ({
  contacts,
  reports,
  onSaveContact,
  onDeleteContact,
  onConvertToCase,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRisk, setFilterRisk] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [selectedContactForLog, setSelectedContactForLog] = useState<ContactPerson | null>(null);

  // New Contact Modal state
  const [isAddingContact, setIsAddingContact] = useState(false);
  const [targetReportId, setTargetReportId] = useState(reports[0]?.id || '');
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState<number>(30);
  const [newGender, setNewGender] = useState<'male' | 'female'>('male');
  const [newPhone, setNewPhone] = useState('');
  const [newAddress, setNewAddress] = useState('หมู่ 1');
  const [newSubdistrict, setNewSubdistrict] = useState('ตำบลนาแก้ว');
  const [newVillageName, setNewVillageName] = useState('บ้านนาแก้ว');
  const [newRelationship, setNewRelationship] = useState('คนในบ้าน / สมาชิกครอบครัว');
  const [newRiskLevel, setNewRiskLevel] = useState<ExposureRiskLevel>('High');
  const [newExposureType, setNewExposureType] = useState('นอนร่วมห้อง / รับประทานอาหารร่วมกัน');
  const [newExposureDate, setNewExposureDate] = useState(new Date().toISOString().split('T')[0]);

  // Log modal state
  const [logDate, setLogDate] = useState(new Date().toISOString().split('T')[0]);
  const [logTemp, setLogTemp] = useState(36.8);
  const [logSymptoms, setLogSymptoms] = useState('ไม่มีอาการผิดปกติ');
  const [logOfficer, setLogOfficer] = useState('อสม. / เจ้าหน้าที่ รพ.สต.');

  // Filtered contacts
  const filteredContacts = contacts.filter(c => {
    if (filterRisk !== 'all' && c.riskLevel !== filterRisk) return false;
    if (filterStatus !== 'all' && c.status !== filterStatus) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const matchName = c.name.toLowerCase().includes(q);
      const matchRel = c.relationship.toLowerCase().includes(q);
      if (!matchName && !matchRel) return false;
    }
    return true;
  });

  const handleCreateContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) {
      alert('กรุณากรอกชื่อ-นามสกุลผู้สัมผัส');
      return;
    }

    const linkedReport = reports.find(r => r.id === targetReportId);

    const contact: ContactPerson = {
      id: `ct_${Date.now()}`,
      reportId: targetReportId,
      caseHn: linkedReport?.patient.hn || '67000000',
      caseName: linkedReport ? `${linkedReport.patient.prefix}${linkedReport.patient.firstName} ${linkedReport.patient.lastName}` : 'ผู้ป่วย',
      caseDisease: linkedReport?.disease || 'Dengue',
      name: newName,
      age: Number(newAge),
      gender: newGender,
      phone: newPhone,
      address: newAddress,
      subdistrict: newSubdistrict,
      villageName: newVillageName,
      relationship: newRelationship,
      exposureDate: newExposureDate,
      exposureType: newExposureType,
      riskLevel: newRiskLevel,
      monitoringDays: 14,
      startDate: newExposureDate,
      endDate: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      status: 'under_monitoring',
      dailyLogs: [
        {
          day: 1,
          date: newExposureDate,
          temperature: 36.6,
          hasSymptoms: false,
          symptomsDetails: 'ปกติ ไม่มีอาการ',
          monitoredBy: 'เจ้าหน้าที่ SRRT รพ.โพนนาแก้ว',
        }
      ],
      notes: `สัมผัสผู้ป่วย ${linkedReport ? `${linkedReport.patient.firstName} (${linkedReport.diseaseNameTh})` : ''}`,
    };

    onSaveContact(contact);
    setIsAddingContact(false);
    setNewName('');
  };

  const handleAddDailyLog = () => {
    if (!selectedContactForLog) return;
    const hasSymptoms = logTemp >= 37.5 || (logSymptoms !== 'ไม่มีอาการผิดปกติ' && logSymptoms.length > 0);
    const dayNumber = (selectedContactForLog.dailyLogs?.length || 0) + 1;

    const updatedLogs = [
      ...(selectedContactForLog.dailyLogs || []),
      {
        day: dayNumber,
        date: logDate,
        temperature: Number(logTemp),
        hasSymptoms,
        symptomsDetails: logSymptoms,
        monitoredBy: logOfficer,
      }
    ];

    const updatedContact: ContactPerson = {
      ...selectedContactForLog,
      dailyLogs: updatedLogs,
      status: hasSymptoms ? 'symptomatic' : selectedContactForLog.status,
    };

    onSaveContact(updatedContact);
    setSelectedContactForLog(updatedContact);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 sm:p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-6 bg-blue-600 rounded-full"></span>
            <h1 className="text-lg sm:text-xl font-bold text-slate-800 tracking-tight">
              การติดตามผู้สัมผัสโรค (Contact Tracing & 14-Day Monitoring)
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            บัญชีรายชื่อผู้สัมผัสเสี่ยงสูง/เสี่ยงต่ำ การติดตามอาการรายวัน และคัดกรองแปลงเป็นผู้ป่วย 506
          </p>
        </div>

        <button
          onClick={() => setIsAddingContact(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md shadow-blue-600/20 transition transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มผู้สัมผัสรายใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-3xl p-5 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อผู้สัมผัส หรือความสัมพันธ์..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">ทุกระดับความเสี่ยง</option>
            <option value="High">เสี่ยงสูง (High Risk)</option>
            <option value="Medium">เสี่ยงปานกลาง (Medium)</option>
            <option value="Low">เสี่ยงต่ำ (Low Risk)</option>
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="under_monitoring">กำลังเฝ้าระวัง</option>
            <option value="symptomatic">มีอาการผิดปกติ (Symptomatic)</option>
            <option value="asymptomatic">ไม่มีอาการ (Asymptomatic)</option>
            <option value="converted_case">ตรวจพบเป็นผู้ป่วย (Case)</option>
          </select>
        </div>
      </div>

      {/* Contacts Table List */}
      <div className="bg-white border border-slate-200 rounded-3xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200 uppercase text-[11px]">
              <tr>
                <th className="p-3.5">ผู้สัมผัส</th>
                <th className="p-3.5">เชื่อมโยงผู้ป่วย (Index Case)</th>
                <th className="p-3.5">ความสัมพันธ์ & การสัมผัส</th>
                <th className="p-3.5">ระดับความเสี่ยง</th>
                <th className="p-3.5">สถานะเฝ้าระวัง</th>
                <th className="p-3.5">ติดตามรายวัน</th>
                <th className="p-3.5 text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredContacts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    ไม่พบรายการผู้สัมผัสตามเงื่อนไข
                  </td>
                </tr>
              ) : (
                filteredContacts.map(c => {
                  const logCount = c.dailyLogs?.length || 0;
                  const latestLog = c.dailyLogs && c.dailyLogs.length > 0 ? c.dailyLogs[c.dailyLogs.length - 1] : null;

                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition">
                      <td className="p-3.5">
                        <p className="font-bold text-slate-800 text-xs">{c.name}</p>
                        <p className="text-[11px] text-slate-500">อายุ {c.age} ปี • 📞 {c.phone}</p>
                        <p className="text-[10px] text-slate-400">📍 {c.villageName} ({c.subdistrict})</p>
                      </td>

                      <td className="p-3.5">
                        <p className="font-bold text-blue-600">{c.caseName}</p>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
                          HN {c.caseHn} ({c.caseDisease})
                        </span>
                      </td>

                      <td className="p-3.5">
                        <p className="text-slate-800 font-semibold">{c.relationship}</p>
                        <p className="text-[10px] text-slate-500">{c.exposureType}</p>
                        <p className="text-[10px] text-slate-400">สัมผัส: {c.exposureDate}</p>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          c.riskLevel === 'High' ? 'bg-red-100 text-red-700' :
                          c.riskLevel === 'Medium' ? 'bg-amber-100 text-amber-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {c.riskLevel === 'High' ? 'เสี่ยงสูง (High)' : c.riskLevel === 'Medium' ? 'เสี่ยงปานกลาง' : 'เสี่ยงต่ำ'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md uppercase ${
                          c.status === 'symptomatic' ? 'bg-red-600 text-white animate-pulse' :
                          c.status === 'under_monitoring' ? 'bg-blue-100 text-blue-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {c.status === 'symptomatic' ? '⚠️ มีอาการผิดปกติ' :
                           c.status === 'under_monitoring' ? '⏳ เฝ้าระวัง' : '✓ ครบกำหนด'}
                        </span>
                      </td>

                      <td className="p-3.5">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedContactForLog(c)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-700 rounded-lg font-semibold transition"
                          >
                            บันทึกอาการ ({logCount}/14 วัน)
                          </button>
                        </div>
                        {latestLog && (
                          <p className="text-[10px] text-slate-500 mt-1">
                            ล่าสุด: {latestLog.temperature}°C ({latestLog.symptomsDetails})
                          </p>
                        )}
                      </td>

                      <td className="p-3.5 text-right space-x-2">
                        {c.status === 'symptomatic' && (
                          <button
                            onClick={() => onConvertToCase(c)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white text-[11px] font-bold rounded-lg shadow transition"
                            title="ตรวจพบอาการและแปลงเป็นเคสรับแจ้ง 506"
                          >
                            แปลงเป็นเคส 506
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm(`ต้องการลบรายชื่อผู้สัมผัส ${c.name}?`)) {
                              onDeleteContact(c.id);
                            }
                          }}
                          className="px-2 py-1 text-slate-400 hover:text-red-600 text-xs font-semibold"
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Symptoms Modal */}
      {selectedContactForLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-800">
                  บันทึกอาการรายวัน (14-Day Health Log)
                </h3>
                <p className="text-xs text-slate-500">
                  ผู้สัมผัส: <span className="font-semibold text-blue-600">{selectedContactForLog.name}</span> (เชื่อมโยง {selectedContactForLog.caseName})
                </p>
              </div>
              <button
                onClick={() => setSelectedContactForLog(null)}
                className="text-slate-400 hover:text-slate-600 text-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-500 text-[11px] mb-1">วันที่ตรวจวัด</label>
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-500 text-[11px] mb-1">อุณหภูมิกาย (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={logTemp}
                  onChange={(e) => setLogTemp(parseFloat(e.target.value))}
                  className={`w-full border rounded-xl p-2 text-xs font-bold ${
                    logTemp >= 37.5 ? 'bg-red-50 text-red-600 border-red-300' : 'bg-slate-50 text-slate-800 border-slate-200'
                  }`}
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-500 text-[11px] mb-1">อาการแสดงที่พบ</label>
                <input
                  type="text"
                  value={logSymptoms}
                  onChange={(e) => setLogSymptoms(e.target.value)}
                  placeholder="เช่น มีไข้, ปวดศีรษะ, ผื่นแดง, หรือ ปกติ ไม่มีอาการ"
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="col-span-2">
                <label className="block text-slate-500 text-[11px] mb-1">ผู้ติดตาม / บันทึกข้อมูล</label>
                <input
                  type="text"
                  value={logOfficer}
                  onChange={(e) => setLogOfficer(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>
            </div>

            {/* History Logs preview */}
            <div className="mt-3">
              <p className="text-xs font-bold text-slate-700 mb-2">ประวัติการติดตามย้อนหลัง</p>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-xs">
                {selectedContactForLog.dailyLogs?.map((log, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100 text-[11px]">
                    <span className="font-bold text-blue-600">วันที่ {log.day} ({log.date})</span>
                    <span className={`font-semibold ${log.temperature >= 37.5 ? 'text-red-600' : 'text-slate-700'}`}>{log.temperature}°C</span>
                    <span className="text-slate-500 truncate max-w-[150px]">{log.symptomsDetails}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedContactForLog(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
              >
                ปิด
              </button>
              <button
                type="button"
                onClick={handleAddDailyLog}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20"
              >
                บันทึกอาการ
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Contact Modal */}
      {isAddingContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl text-slate-800">
            <h2 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">
              เพิ่มรายชื่อผู้สัมผัสโรค (Add Contact Person)
            </h2>

            <form onSubmit={handleCreateContact} className="space-y-3 text-xs text-slate-700">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">เชื่อมโยงกับเคสผู้ป่วย *</label>
                <select
                  value={targetReportId}
                  onChange={(e) => setTargetReportId(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                >
                  {reports.map(r => (
                    <option key={r.id} value={r.id}>
                      {r.patient.firstName} {r.patient.lastName} — {r.diseaseNameTh} ({r.patient.villageName})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-500 mb-1">ชื่อ-นามสกุล ผู้สัมผัส *</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">อายุ (ปี)</label>
                  <input
                    type="number"
                    value={newAge}
                    onChange={(e) => setNewAge(Number(e.target.value))}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">เบอร์โทรศัพท์</label>
                  <input
                    type="tel"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">ระดับความเสี่ยง</label>
                  <select
                    value={newRiskLevel}
                    onChange={(e) => setNewRiskLevel(e.target.value as any)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                  >
                    <option value="High">เสี่ยงสูง (High Risk)</option>
                    <option value="Medium">เสี่ยงปานกลาง (Medium)</option>
                    <option value="Low">เสี่ยงต่ำ (Low Risk)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ความสัมพันธ์</label>
                <input
                  type="text"
                  value={newRelationship}
                  onChange={(e) => setNewRelationship(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">ลักษณะการสัมผัส</label>
                <input
                  type="text"
                  value={newExposureType}
                  onChange={(e) => setNewExposureType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2 text-xs text-slate-800 focus:bg-white focus:border-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingContact(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md shadow-blue-600/20"
                >
                  เพิ่มรายชื่อ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
