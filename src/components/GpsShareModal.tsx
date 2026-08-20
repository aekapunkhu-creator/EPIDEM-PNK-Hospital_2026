import React, { useState } from 'react';
import {
  Share2,
  Copy,
  Check,
  Smartphone,
  ExternalLink,
  MapPin,
  QrCode,
  X,
  Send,
  Sparkles,
  ShieldCheck,
  Layers
} from 'lucide-react';
import { DiseaseReport } from '../types';
import { QrCodeSvg } from './QrCodeSvg';

interface GpsShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: DiseaseReport;
  onOpenMobileSurvey: (report: DiseaseReport) => void;
}

export const GpsShareModal: React.FC<GpsShareModalProps> = ({
  isOpen,
  onClose,
  report,
  onOpenMobileSurvey,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the universal mobile link
  const currentOrigin = window.location.origin;
  const currentPath = window.location.pathname;
  const directLink = `${currentOrigin}${currentPath}?gps_case_id=${report.id}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(directLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const lineShareUrl = `https://line.me/R/msg/text/?${encodeURIComponent(
    `[งานระบาดวิทยา รพ.โพนนาแก้ว] 📍 ขอให้ลงพื้นที่ยิงพิกัด GPS และควบคุมโรค:\nเคส: ${report.patient.prefix}${report.patient.firstName} ${report.patient.lastName}\nโรค: ${report.diseaseNameTh}\nพื้นที่: ${report.patient.villageName} ${report.patient.subdistrict}\nเปิดลิงก์เพื่อยิงพิกัด (Android/iOS): ${directLink}`
  )}`;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-5 sm:p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Smartphone className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">ส่งลิงก์ยิงพิกัด GPS ภาคสนาม</h2>
                <span className="px-2 py-0.5 text-[10px] font-bold bg-white/20 rounded-md">
                  Android & iOS
                </span>
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                สำหรับเจ้าหน้าที่ รพ.สต. และ อสม. ลงพื้นที่สำรวจและควบคุมโรค
              </p>
            </div>
          </div>
        </div>

        {/* Case Info Ribbon */}
        <div className="bg-blue-50 border-b border-blue-100 px-6 py-3 flex items-center justify-between text-xs">
          <div>
            <span className="font-bold text-blue-900">ผู้ป่วย: {report.patient.prefix}{report.patient.firstName} {report.patient.lastName}</span>
            <span className="text-blue-700 ml-2">(HN: {report.patient.hn})</span>
          </div>
          <span className="px-2 py-0.5 rounded-md bg-blue-200/70 text-blue-800 font-bold text-[10px]">
            {report.diseaseNameTh}
          </span>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 text-xs">
          
          {/* QR Code & Scan Section */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
            <div className="shrink-0 flex flex-col items-center">
              <QrCodeSvg value={directLink} size={150} />
              <span className="text-[10px] text-slate-500 font-medium mt-1">สแกนด้วยกล้องมือถือ</span>
            </div>

            <div className="space-y-2 text-slate-700">
              <div className="flex items-center gap-1.5 font-bold text-slate-800">
                <QrCode className="w-4 h-4 text-blue-600" />
                <span>เปิดใช้งานได้ทั้ง 2 ระบบ:</span>
              </div>
              <ul className="space-y-1 text-[11px] text-slate-600">
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <strong>Android:</strong> เปิดใน Chrome / Browser / LINE ได้ทันที
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  <strong>iOS (iPhone/iPad):</strong> เปิดใน Safari หรือ LINE ได้ทันที
                </li>
              </ul>
              <p className="text-[10px] text-slate-500 pt-1">
                📍 พิกัด GPS ความแม่นยำสูง (High-Accuracy Geolocation) จะถูกดึงและบันทึกเข้าฐานข้อมูลกลางอัตโนมัติ
              </p>
            </div>
          </div>

          {/* Shareable URL Box */}
          <div className="space-y-1.5">
            <label className="block font-bold text-slate-700">
              ลิงก์สำหรับส่งต่อให้ รพ.สต. ในพื้นที่ (Universal Link):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={directLink}
                className="w-full bg-slate-100 border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 select-all"
              />
              <button
                onClick={handleCopyLink}
                className={`px-4 py-2 rounded-xl font-bold flex items-center gap-1.5 shrink-0 transition text-xs ${
                  copied
                    ? 'bg-emerald-600 text-white'
                    : 'bg-slate-800 hover:bg-slate-900 text-white'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>คัดลอกแล้ว</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>คัดลอกลิงก์</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <a
              href={lineShareUrl}
              target="_blank"
              rel="noreferrer"
              className="py-2.5 px-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-emerald-500/20 transition"
            >
              <Send className="w-4 h-4" />
              <span>ส่งเข้า LINE เจ้าหน้าที่</span>
            </a>

            <button
              onClick={() => {
                onClose();
                onOpenMobileSurvey(report);
              }}
              className="py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 shadow-md shadow-blue-600/20 transition"
            >
              <MapPin className="w-4 h-4" />
              <span>เปิดโหมดยิงพิกัดในเครื่องนี้</span>
            </button>
          </div>

          <div className="pt-1">
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${report.patient.lat || 17.2226},${report.patient.lng || 104.3094}`}
              target="_blank"
              rel="noreferrer"
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl flex items-center justify-center gap-1.5 transition text-xs border border-slate-200"
            >
              <ExternalLink className="w-3.5 h-3.5 text-blue-600" />
              <span>เปิดนำทางใน Google Maps ไปยังบ้านผู้ป่วย</span>
            </a>
          </div>

        </div>

      </div>
    </div>
  );
};
