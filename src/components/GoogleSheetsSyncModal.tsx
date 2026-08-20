import React, { useState } from 'react';
import {
  X,
  FileSpreadsheet,
  Download,
  Copy,
  CheckCircle2,
  Database,
  Cloud,
  Code,
  ExternalLink
} from 'lucide-react';
import { DiseaseReport } from '../types';

interface GoogleSheetsSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DiseaseReport[];
}

export const GoogleSheetsSyncModal: React.FC<GoogleSheetsSyncModalProps> = ({
  isOpen,
  onClose,
  reports,
}) => {
  if (!isOpen) return null;

  const [copied, setCopied] = useState(false);

  const appsScriptCode = `// Google Apps Script สำหรับเชื่อมโยง Google Sheets กับระบบ PNK EPI (รพ.โพนนาแก้ว)
function doPost(e) {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Surveillance_506");
  if (!sheet) {
    sheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Surveillance_506");
    sheet.appendRow(["ID", "HN", "ชื่อ-นามสกุล", "อายุ", "เพศ", "เบอร์โทร", "ที่อยู่", "ตำบล", "โรค", "ICD10", "วันเริ่มป่วย", "วันตรวจ", "ผลแล็บ", "สถานะ", "เวลาบันทึก"]);
  }
  
  var data = JSON.parse(e.postData.contents);
  sheet.appendRow([
    data.id,
    data.patient.hn,
    data.patient.prefix + data.patient.firstName + " " + data.patient.lastName,
    data.patient.age,
    data.patient.gender,
    data.patient.phone,
    data.patient.address + " " + data.patient.villageName,
    data.patient.subdistrict,
    data.diseaseNameTh,
    data.icd10,
    data.onsetDate,
    data.visitDate,
    data.labResult ? data.labResult.result : "-",
    data.status,
    new Date()
  ]);
  
  return ContentService.createTextOutput(JSON.stringify({ status: "success" })).setMimeType(ContentService.MimeType.JSON);
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(appsScriptCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">Google Sheets & Drive Database Bridge</h2>
              <p className="text-xs text-slate-400">โครงสร้างชีตฐานข้อมูลและสคริปต์เชื่อมต่อคลาวด์สำหรับ รพ.โพนนาแก้ว</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          
          <div className="bg-emerald-950/40 border border-emerald-500/30 rounded-xl p-3.5 flex items-center gap-3">
            <Cloud className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <div>
              <p className="font-bold text-emerald-200 text-xs">โครงสร้างฐานข้อมูลรองรับ Google Workspace เต็มรูปแบบ</p>
              <p className="text-[11px] text-emerald-300/80 mt-0.5">
                สามารถเชื่อมโยงข้อมูลผู้ป่วย รง.506, การสอบสวนโรค, และผู้สัมผัสลง Google Sheets และบันทึกไฟล์ PDF แบบรายงานลง Google Drive ของโรงพยาบาลได้
              </p>
            </div>
          </div>

          {/* Database Tabs Guide */}
          <div className="bg-slate-800/60 p-4 rounded-xl border border-slate-700 space-y-2">
            <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
              <Database className="w-4 h-4 text-teal-400" />
              <span>โครงสร้าง 5 แท็บหลักใน Google Sheets (PNK_EPI_Database)</span>
            </h3>
            <ul className="space-y-1.5 text-slate-300 text-[11px]">
              <li>📊 <strong>1. Surveillance_506</strong>: ทะเบียนรับแจ้งผู้ป่วยโรคติดต่อและรหัส ICD-10</li>
              <li>🔎 <strong>2. Case_Investigation</strong>: บันทึกประวัติ, ไทม์ไลน์, ปัจจัยเสี่ยง, ดัชนี HI/CI และผลสอบสวน</li>
              <li>👥 <strong>3. Contact_Tracing</strong>: รายชื่อผู้สัมผัสและผลติดตามอาการ 14 วัน</li>
              <li>🛡️ <strong>4. Control_Measures</strong>: แผนปฏิบัติการ 3-3-1 และการพ่นสารเคมี</li>
              <li>🔥 <strong>5. Outbreak_Events</strong>: ทะเบียนเหตุการณ์ระบาดและอัตราป่วย Attack Rate</li>
            </ul>
          </div>

          {/* Google Apps Script Code Generator */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white text-xs flex items-center gap-1.5">
                <Code className="w-4 h-4 text-cyan-400" />
                <span>Google Apps Script Webhook Code (คัดลอกไปวางใน Apps Script):</span>
              </h3>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1 bg-slate-800 hover:bg-slate-700 text-teal-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
              >
                {copied ? <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'คัดลอกแล้ว!' : 'คัดลอกโค้ด'}</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-xl border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto max-h-48">
              {appsScriptCode}
            </pre>
          </div>

        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 bg-slate-950 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition"
          >
            ปิดหน้าต่าง
          </button>
        </div>

      </div>
    </div>
  );
};
