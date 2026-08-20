import React from 'react';
import { X, Printer, Download, CheckCircle2, Hospital } from 'lucide-react';
import { Investigation, DiseaseReport } from '../types';

interface InvestigationPrintReportProps {
  isOpen: boolean;
  onClose: () => void;
  investigation: Investigation;
  report: DiseaseReport;
}

export const InvestigationPrintReport: React.FC<InvestigationPrintReportProps> = ({
  isOpen,
  onClose,
  investigation,
  report,
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-white text-slate-900 rounded-2xl w-full max-w-4xl max-h-[95vh] flex flex-col shadow-2xl overflow-hidden print:max-h-none print:shadow-none print:rounded-none">
        
        {/* Top Action Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Hospital className="w-5 h-5 text-teal-400" />
            <div>
              <p className="font-bold text-sm">แบบรายงานการสอบสวนโรคทางระบาดวิทยา (ฉบับพิมพ์)</p>
              <p className="text-[11px] text-slate-400">โรงพยาบาลโพนนาแก้ว อำเภอโพนนาแก้ว จังหวัดสกลนคร</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white font-bold rounded-xl text-xs shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>พิมพ์ / บันทึกเป็น PDF</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Paper Canvas */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 space-y-6 text-sm bg-white font-serif leading-relaxed print:p-6 print:overflow-visible">
          
          {/* Official Document Header */}
          <div className="text-center space-y-1 border-b-2 border-slate-900 pb-4">
            <p className="text-xs uppercase tracking-widest text-slate-500 font-sans font-semibold">แบบรายงานมาตรฐาน กรมควบคุมโรค กระทรวงสาธารณสุข</p>
            <h1 className="text-xl font-bold text-slate-900 font-sans">แบบรายงานการสอบสวนโรคทางระบาดวิทยาเฉพาะราย</h1>
            <h2 className="text-base font-semibold text-slate-800">
              {report.diseaseNameTh} (รหัส ICD-10: {report.icd10})
            </h2>
            <p className="text-xs text-slate-600 font-sans">
              ทีมเฝ้าระวังสอบสวนโรคเคลื่อนที่เร็ว (SRRT) โรงพยาบาลโพนนาแก้ว ร่วมกับ สำนักงานสาธารณสุขอำเภอโพนนาแก้ว จังหวัดสกลนคร
            </p>
          </div>

          {/* Document Meta Information */}
          <div className="grid grid-cols-2 gap-4 text-xs font-sans bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <p><strong>ผู้สอบสวนโรค:</strong> {investigation.investigatorName}</p>
              <p><strong>หน่วยงาน:</strong> {investigation.investigatorTeam}</p>
            </div>
            <div>
              <p><strong>วันที่สอบสวน:</strong> {investigation.investigationDate}</p>
              <p><strong>สถานะรายงาน:</strong> {investigation.status === 'completed' ? 'สอบสวนสมบูรณ์ (Completed)' : 'ฉบับร่าง'}</p>
            </div>
          </div>

          {/* Section 1: Patient Demographics */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              1. ข้อมูลทั่วไปของผู้ป่วย (Patient Demographics)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <p><strong>ชื่อ-นามสกุล:</strong> {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}</p>
              <p><strong>HN:</strong> {report.patient.hn} | <strong>เลข ปชช:</strong> {report.patient.cid || '-'}</p>
              <p><strong>เพศ:</strong> {report.patient.gender === 'male' ? 'ชาย' : 'หญิง'} | <strong>อายุ:</strong> {report.patient.age} ปี</p>
              <p><strong>อาชีพ:</strong> {report.patient.occupation}</p>
              <p><strong>สถานที่ทำงาน/สถานศึกษา:</strong> {report.patient.workplaceOrSchool || '-'}</p>
              <p><strong>โทรศัพท์:</strong> {report.patient.phone || '-'}</p>
              <p className="col-span-2">
                <strong>ที่อยู่ขณะป่วย:</strong> บ้านเลขที่ {report.patient.address} {report.patient.villageName} หมู่ที่ {report.patient.moo} {report.patient.subdistrict} อำเภอโพนนาแก้ว จังหวัดสกลนคร (พิกัด GPS: {report.patient.lat?.toFixed(4)}, {report.patient.lng?.toFixed(4)})
              </p>
            </div>
          </div>

          {/* Section 2: Clinical & Onset */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              2. ประวัติการป่วยและการวินิจฉัย (Clinical History & Diagnosis)
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs font-sans">
              <p><strong>วันที่เริ่มป่วย (Onset):</strong> {report.onsetDate}</p>
              <p><strong>วันที่มารับการรักษา:</strong> {report.visitDate} ({report.reportingUnit})</p>
              <p><strong>อาการสำคัญ:</strong> {report.chiefComplaint}</p>
              <p><strong>การรับไว้รักษาใน รพ.:</strong> {report.isAdmitted ? `Admit (${report.admissionWard || 'IPD'})` : 'OPD ผู้ป่วยนอก'}</p>
              <p className="col-span-2"><strong>ผลการตรวจทางห้องปฏิบัติการ:</strong> {report.labResult.testName} = <strong>{report.labResult.result}</strong> (วันที่ตรวจ {report.labResult.testedDate})</p>
            </div>
          </div>

          {/* Section 3: Timeline */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              3. ลำดับเหตุการณ์และกิจกรรม (Timeline of Events)
            </h3>
            <table className="w-full text-left text-xs font-sans border border-slate-300">
              <thead className="bg-slate-100 border-b border-slate-300 font-bold">
                <tr>
                  <th className="p-2 border-r border-slate-300 w-28">วันที่ / เวลา</th>
                  <th className="p-2 border-r border-slate-300 w-44">สถานที่ / กิจกรรม</th>
                  <th className="p-2">รายละเอียดเหตุการณ์</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {investigation.timeline?.map((t, idx) => (
                  <tr key={t.id || idx}>
                    <td className="p-2 border-r border-slate-200 font-mono">{t.date} {t.time || ''}</td>
                    <td className="p-2 border-r border-slate-200 font-medium">{t.activityOrLocation}</td>
                    <td className="p-2">{t.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Section 4: Risk Factors & Entomology */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              4. ปัจจัยเสี่ยง แหล่งแพร่เชื้อ และการสำรวจสิ่งแวดล้อม
            </h3>
            <div className="text-xs font-sans space-y-1">
              <p>• <strong>ประวัติเดินทาง:</strong> {investigation.risks.travelHistory ? `มี (${investigation.risks.travelDetails})` : 'ไม่มีประวัติเดินทางออกนอกพื้นที่'}</p>
              <p>• <strong>ประวัติอาหาร/น้ำ:</strong> {investigation.risks.sharedMeal ? `มี (${investigation.risks.sharedMealDetails})` : 'ไม่มีประวัติร่วมงานเลี้ยงผิดปกติ'}</p>
              <p>• <strong>ประวัติสัมผัสสัตว์/โคลน:</strong> {investigation.risks.animalContact ? `มี (${investigation.risks.animalContactDetails})` : 'ไม่มี'}</p>
              <p>• <strong>สถานที่ชุมชน/โรงเรียน:</strong> {investigation.risks.schoolOrCrowdedPlace ? `มี (${investigation.risks.schoolDetails})` : 'ไม่มี'}</p>
              
              {investigation.risks.mosquitoBreedingIndex && (
                <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded">
                  <p className="font-bold">ดัชนีลูกน้ำยุงลายในพื้นที่ (Entomological Survey):</p>
                  <p className="font-mono">
                    HI = {investigation.risks.mosquitoBreedingIndex.hi || 0}% | CI = {investigation.risks.mosquitoBreedingIndex.ci || 0}% | BI = {investigation.risks.mosquitoBreedingIndex.bi || 0}
                  </p>
                </div>
              )}

              <p className="pt-2"><strong>แหล่งแพร่โรคที่น่าจะเป็น:</strong> {investigation.probableSourceOfInfection}</p>
              <p><strong>ความเชื่อมโยงทางระบาดวิทยา:</strong> {investigation.epidemiologicalLink}</p>
            </div>
          </div>

          {/* Section 5: Control Measures & Recommendations */}
          <div className="space-y-2">
            <h3 className="font-sans font-bold text-sm text-slate-900 border-b border-slate-300 pb-1">
              5. มาตรการควบคุมโรคและข้อเสนอแนะ
            </h3>
            <div className="text-xs font-sans space-y-2">
              <div>
                <p className="font-bold">การดำเนินงานควบคุมโรคที่ผ่านมา:</p>
                {investigation.actionTaken?.map((act, i) => (
                  <p key={i} className="pl-3">• {act}</p>
                ))}
              </div>

              <div>
                <p className="font-bold">ข้อเสนอแนะในการป้องกันและเฝ้าระวัง:</p>
                {investigation.recommendations?.map((rec, i) => (
                  <p key={i} className="pl-3">• {rec}</p>
                ))}
              </div>
            </div>
          </div>

          {/* Signatures */}
          <div className="pt-8 grid grid-cols-2 gap-8 text-center text-xs font-sans">
            <div className="space-y-12">
              <p>ลงชื่อ........................................................</p>
              <p>({investigation.investigatorName})<br />ผู้สอบสวนโรค ทีม SRRT รพ.โพนนาแก้ว</p>
            </div>
            <div className="space-y-12">
              <p>ลงชื่อ........................................................</p>
              <p>(นายแพทย์/หัวหน้ากลุ่มงานบริการปฐมภูมิ)<br />ผู้ตรวจทานรายงาน โรงพยาบาลโพนนาแก้ว</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
