import React from 'react';
import {
  X,
  Bell,
  AlertTriangle,
  AlertOctagon,
  Flame,
  CheckCircle2,
  Calendar,
  MapPin,
  ArrowRight,
  Smartphone,
  Share2,
  Clock,
  ShieldCheck,
  Check
} from 'lucide-react';
import { EpiAlert, UserSession } from '../types';

interface AlertsNotificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: EpiAlert[];
  currentUser?: UserSession;
  onMarkAsRead: (id: string) => void;
  onNavigateToAlert: (alert: EpiAlert) => void;
  onOpenMobileSurveyForAlert?: (alert: EpiAlert) => void;
}

export const AlertsNotificationModal: React.FC<AlertsNotificationModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentUser,
  onMarkAsRead,
  onNavigateToAlert,
  onOpenMobileSurveyForAlert,
}) => {
  if (!isOpen) return null;

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl max-h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-blue-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bell className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">ศูนย์แจ้งเตือนระบาดวิทยา & งาน รพ.สต. (Epi Alerts)</h2>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-400 text-slate-900 rounded-full">
                    {unreadCount} ใหม่
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-100 mt-0.5">
                แจ้งเตือนรับแจ้งโรครายพื้นที่ รพ.สต. และตรวจจับสัญญาณการระบาดอัตโนมัติ
              </p>
            </div>
          </div>

          <button 
            onClick={onClose} 
            className="text-white/70 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current User Area Ribbon */}
        {currentUser?.assignedSubdistrict && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center justify-between text-xs text-amber-900">
            <span className="flex items-center gap-1.5 font-bold">
              <span>📍 เขตพื้นที่รับผิดชอบของคุณ:</span>
              <span className="px-2 py-0.5 bg-amber-200/80 rounded-md">{currentUser.assignedSubdistrict} ({currentUser.pcuName})</span>
            </span>
            <span className="text-[11px] text-amber-700 font-medium">มาตรการควบคุมโรค 3-3-1 ภายใน 24 ชม.</span>
          </div>
        )}

        {/* Alerts List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 text-xs bg-slate-50">
          {alerts.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 stroke-1" />
              <p className="font-bold text-slate-700 text-sm">ไม่มีการแจ้งเตือนในขณะนี้</p>
              <p className="text-xs">สถานการณ์ควบคุมโรคในอำเภอโพนนาแก้วปกติ</p>
            </div>
          ) : (
            alerts.map(alert => {
              const isTargetedToUser = currentUser?.assignedSubdistrict && alert.targetSubdistrict === currentUser.assignedSubdistrict;

              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border transition flex flex-col gap-2.5 shadow-xs ${
                    alert.severity === 'high'
                      ? 'bg-rose-50/80 border-rose-200 text-rose-950'
                      : alert.severity === 'medium'
                      ? 'bg-amber-50/80 border-amber-200 text-amber-950'
                      : 'bg-white border-slate-200 text-slate-800'
                  } ${!alert.isRead ? 'ring-2 ring-blue-500/20' : 'opacity-85'}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2 font-bold text-xs">
                      {alert.severity === 'high' ? (
                        <AlertOctagon className="w-4 h-4 text-rose-600 shrink-0 animate-bounce" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                      )}
                      <span className="text-slate-900 font-bold">{alert.title}</span>
                      {isTargetedToUser && (
                        <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                          พื้นที่ของคุณ
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-slate-400 shrink-0">
                      {alert.createdAt ? new Date(alert.createdAt).toLocaleString('th-TH') : alert.createdAt}
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed bg-white/60 p-2.5 rounded-xl border border-slate-100">
                    {alert.description}
                  </p>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2 text-[11px] text-slate-500">
                      {alert.targetSubdistrict && (
                        <span className="font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
                          📍 {alert.targetSubdistrict}
                        </span>
                      )}
                      {alert.targetPcuName && (
                        <span className="text-slate-500">
                          {alert.targetPcuName}
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {!alert.isRead && (
                        <button
                          onClick={() => onMarkAsRead(alert.id)}
                          className="px-2.5 py-1 text-[11px] text-slate-500 hover:text-slate-800 rounded-lg hover:bg-slate-100 transition"
                        >
                          อ่านแล้ว
                        </button>
                      )}

                      {/* Direct Mobile GPS Action if linked to a report */}
                      {onOpenMobileSurveyForAlert && alert.relatedId && (
                        <button
                          onClick={() => {
                            onOpenMobileSurveyForAlert(alert);
                            onClose();
                          }}
                          className="flex items-center gap-1 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                        >
                          <Smartphone className="w-3 h-3" />
                          <span>ยิงพิกัด GPS</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          onNavigateToAlert(alert);
                          onClose();
                        }}
                        className="flex items-center gap-1 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition shadow-xs"
                      >
                        <span>เปิดเคส</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-white border-t border-slate-200 flex items-center justify-between text-xs text-slate-500">
          <span>ระบบเชื่อมโยง 5 รพ.สต. ใน อ.โพนนาแก้ว</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition"
          >
            ปิด
          </button>
        </div>

      </div>
    </div>
  );
};
