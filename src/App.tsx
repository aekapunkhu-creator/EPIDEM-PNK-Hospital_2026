import React, { useState, useEffect } from 'react';
import {
  Header
} from './components/Header';
import {
  Sidebar,
  NavTab
} from './components/Sidebar';
import {
  DashboardView
} from './components/DashboardView';
import {
  DiseaseRegistryView
} from './components/DiseaseRegistryView';
import {
  ReportDiseaseModal
} from './components/ReportDiseaseModal';
import {
  InvestigationView
} from './components/InvestigationView';
import {
  InvestigationModal
} from './components/InvestigationModal';
import {
  InvestigationPrintReport
} from './components/InvestigationPrintReport';
import {
  ContactTracingView
} from './components/ContactTracingView';
import {
  ControlMeasuresView
} from './components/ControlMeasuresView';
import {
  OutbreakView
} from './components/OutbreakView';
import {
  EpiMapView
} from './components/EpiMapView';
import {
  AnalyticsView
} from './components/AnalyticsView';
import {
  ReportsView
} from './components/ReportsView';
import {
  AiAssistantModal
} from './components/AiAssistantModal';
import {
  AlertsNotificationModal
} from './components/AlertsNotificationModal';
import {
  GoogleSheetsSyncModal
} from './components/GoogleSheetsSyncModal';
import {
  LoginModal
} from './components/LoginModal';
import {
  AdminDeleteConfirmModal
} from './components/AdminDeleteConfirmModal';
import {
  GpsShareModal
} from './components/GpsShareModal';
import {
  MobileGpsSurveyView
} from './components/MobileGpsSurveyView';
import {
  UserManagementView
} from './components/UserManagementView';
import {
  LoginScreen
} from './components/LoginScreen';

import {
  DiseaseReport,
  Investigation,
  ContactPerson,
  ControlActivity,
  OutbreakEvent,
  EpiAlert,
  UserSession,
  RoleType
} from './types';

import {
  storageService
} from './services/storageService';
import {
  authService
} from './services/authService';

import {
  MapPin,
  Smartphone,
  Bell,
  ArrowRight,
  ShieldCheck,
  Flame,
  AlertTriangle
} from 'lucide-react';

export function App() {
  // Global Data States
  const [reports, setReports] = useState<DiseaseReport[]>([]);
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [contacts, setContacts] = useState<ContactPerson[]>([]);
  const [controlActivities, setControlActivities] = useState<ControlActivity[]>([]);
  const [outbreaks, setOutbreaks] = useState<OutbreakEvent[]>([]);
  const [alerts, setAlerts] = useState<EpiAlert[]>([]);

  // Navigation & User Session State - Default requires login every time unless active session exists
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [user, setUser] = useState<UserSession | null>(() => authService.getCurrentUser());

  // Modal States
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<DiseaseReport | null>(null);

  const [isInvestigationModalOpen, setIsInvestigationModalOpen] = useState(false);
  const [selectedReportForInvestigation, setSelectedReportForInvestigation] = useState<DiseaseReport | null>(null);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);

  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [printInvData, setPrintInvData] = useState<{ inv: Investigation; report: DiseaseReport } | null>(null);

  const [isAiAssistantOpen, setIsAiAssistantOpen] = useState(false);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);

  // GPS Share & Field Survey Modals
  const [isGpsShareModalOpen, setIsGpsShareModalOpen] = useState(false);
  const [selectedReportForGpsShare, setSelectedReportForGpsShare] = useState<DiseaseReport | null>(null);
  const [isMobileSurveyOpen, setIsMobileSurveyOpen] = useState(false);
  const [selectedReportForSurvey, setSelectedReportForSurvey] = useState<DiseaseReport | null>(null);

  // Admin Delete Confirmation Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteItemInfo, setDeleteItemInfo] = useState<{
    id: string;
    description: string;
    action: () => void;
  } | null>(null);

  // Global Search Filter
  const [searchTerm, setSearchTerm] = useState('');

  // Load initial data and check for URL params (Android & iOS direct links)
  useEffect(() => {
    loadAllData();

    // Check for direct GPS survey URL parameter (?gps_case_id=xxx)
    const urlParams = new URLSearchParams(window.location.search);
    const directGpsId = urlParams.get('gps_case_id');
    if (directGpsId) {
      const allReps = storageService.getReports();
      const targetCase = allReps.find(r => r.id === directGpsId);
      if (targetCase) {
        setSelectedReportForSurvey(targetCase);
        setIsMobileSurveyOpen(true);
      }
    }
  }, []);

  const loadAllData = () => {
    setReports(storageService.getReports());
    setInvestigations(storageService.getInvestigations());
    setContacts(storageService.getContacts());
    setControlActivities(storageService.getControlActivities());
    setOutbreaks(storageService.getOutbreaks());
    setAlerts(storageService.getAlerts());
  };

  // Handlers for Disease Reports
  const handleSaveReport = (report: DiseaseReport) => {
    storageService.saveReport(report);
    setReports(storageService.getReports());
    setAlerts(storageService.getAlerts());
    setEditingReport(null);
  };

  // Admin-protected delete request for Reports
  const handleDeleteReportRequest = (id: string, description: string) => {
    setDeleteItemInfo({
      id,
      description: description || `รายงานโรค ID: ${id}`,
      action: () => {
        storageService.deleteReport(id);
        setReports(storageService.getReports());
        setIsDeleteModalOpen(false);
      }
    });
    setIsDeleteModalOpen(true);
  };

  // Handlers for Investigations
  const handleOpenCreateInvestigation = (report: DiseaseReport) => {
    setSelectedReportForInvestigation(report);
    const existing = investigations.find(i => i.reportId === report.id);
    setSelectedInvestigation(existing || null);
    setIsInvestigationModalOpen(true);
  };

  const handleSaveInvestigation = (inv: Investigation) => {
    storageService.saveInvestigation(inv);
    setInvestigations(storageService.getInvestigations());
    // Also update linked report's status to investigated/in_control
    if (selectedReportForInvestigation) {
      const updatedReport: DiseaseReport = {
        ...selectedReportForInvestigation,
        investigationId: inv.id,
        status: inv.status === 'completed' ? 'investigated' : 'investigating'
      };
      storageService.saveReport(updatedReport);
      setReports(storageService.getReports());
    }
  };

  const handleDeleteInvestigationRequest = (id: string) => {
    setDeleteItemInfo({
      id,
      description: `การสอบสวนโรค ID: ${id}`,
      action: () => {
        storageService.deleteInvestigation(id);
        setInvestigations(storageService.getInvestigations());
        setIsDeleteModalOpen(false);
      }
    });
    setIsDeleteModalOpen(true);
  };

  const handlePrintPreview = (inv: Investigation, report: DiseaseReport) => {
    setPrintInvData({ inv, report });
    setIsPrintModalOpen(true);
  };

  // Handlers for Contacts
  const handleSaveContact = (contact: ContactPerson) => {
    storageService.saveContact(contact);
    setContacts(storageService.getContacts());
  };

  const handleDeleteContactRequest = (id: string) => {
    setDeleteItemInfo({
      id,
      description: `ผู้สัมผัสโรค ID: ${id}`,
      action: () => {
        storageService.deleteContact(id);
        setContacts(storageService.getContacts());
        setIsDeleteModalOpen(false);
      }
    });
    setIsDeleteModalOpen(true);
  };

  const handleConvertContactToCase = (contact: ContactPerson) => {
    const nameParts = contact.name.split(' ');
    const firstName = nameParts[0] || 'ผู้สัมผัส';
    const lastName = nameParts.slice(1).join(' ') || '';

    const newReport: DiseaseReport = {
      id: `rep_${Date.now()}`,
      patientId: `pt_${Date.now()}`,
      patient: {
        id: `pt_${Date.now()}`,
        hn: `67${Math.floor(100000 + Math.random() * 900000)}`,
        prefix: '',
        firstName: firstName,
        lastName: lastName,
        age: contact.age,
        gender: contact.gender,
        phone: contact.phone,
        occupation: 'สัมผัสผู้ป่วย',
        address: contact.address || 'อำเภอโพนนาแก้ว',
        moo: 1,
        villageName: contact.villageName || 'บ้านนาแก้ว',
        subdistrict: contact.subdistrict || 'ตำบลนาแก้ว',
        district: 'โพนนาแก้ว',
        province: 'สกลนคร',
        lat: 17.1850,
        lng: 104.3820,
      },
      disease: contact.caseDisease || 'Dengue',
      diseaseNameTh: 'โรคติดต่อ (พบจากการติดตามผู้สัมผัส)',
      icd10: 'A91',
      caseType: 'Probable',
      onsetDate: new Date().toISOString().split('T')[0],
      visitDate: new Date().toISOString().split('T')[0],
      reportDate: new Date().toISOString().split('T')[0],
      reportingUnit: 'ทีม SRRT / ติดตามผู้สัมผัส',
      reporterName: user.name,
      reporterRole: user.role,
      chiefComplaint: 'มีไข้/อาการผิดปกติหลังสัมผัสผู้ป่วยยืนยัน',
      symptoms: ['ไข้', 'ปวดเมื่อยตามตัว'],
      isAdmitted: false,
      labResult: {
        testName: 'รอส่งตรวจยืนยัน',
        result: 'Pending',
        testedDate: new Date().toISOString().split('T')[0],
      },
      status: 'pending_investigation',
      notes: `แปลงมาจากผู้สัมผัสของเคสเดิม (${contact.relationship})`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveReport(newReport);
    setReports(storageService.getReports());

    // Update contact status
    const updatedContact: ContactPerson = {
      ...contact,
      status: 'symptomatic',
      notes: 'ตรวจพบอาการและแปลงเป็นเคสรับแจ้ง 506 แล้ว'
    };
    storageService.saveContact(updatedContact);
    setContacts(storageService.getContacts());

    alert(`แปลงผู้สัมผัส ${contact.name} เป็นผู้ป่วยรับแจ้ง 506 สำเร็จแล้ว!`);
    setActiveTab('reports');
  };

  // Handlers for Control Activities
  const handleToggleActivity = (id: string) => {
    storageService.toggleControlActivity(id);
    setControlActivities(storageService.getControlActivities());
  };

  const handleAddControlActivity = (act: ControlActivity) => {
    storageService.saveControlActivity(act);
    setControlActivities(storageService.getControlActivities());
  };

  // Handlers for Outbreaks
  const handleSaveOutbreak = (ob: OutbreakEvent) => {
    storageService.saveOutbreak(ob);
    setOutbreaks(storageService.getOutbreaks());
  };

  // Handlers for Alerts
  const handleMarkAlertRead = (id: string) => {
    storageService.markAlertAsRead(id);
    setAlerts(storageService.getAlerts());
  };

  // Reset Sample Data
  const handleResetData = () => {
    storageService.resetToDefault();
    loadAllData();
  };

  // Share GPS Link
  const handleShareGpsLink = (report: DiseaseReport) => {
    setSelectedReportForGpsShare(report);
    setIsGpsShareModalOpen(true);
  };

  // Open Mobile Survey
  const handleOpenMobileSurvey = (report: DiseaseReport) => {
    setSelectedReportForSurvey(report);
    setIsMobileSurveyOpen(true);
  };

  const handleLogout = () => {
    authService.logout();
    setUser(null);
  };

  // If user is not logged in, enforce the Login Screen authentication gate
  if (!user) {
    return (
      <LoginScreen
        onLoginSuccess={(loggedInUser) => {
          setUser(loggedInUser);
        }}
      />
    );
  }

  // Check if current user is from a subdistrict and has pending unread alerts for their area
  const userSubdistrictAlerts = alerts.filter(
    a => !a.isRead && user.assignedSubdistrict && a.targetSubdistrict === user.assignedSubdistrict
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      
      {/* Top Header */}
      <Header
        user={user}
        alerts={alerts}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenReportModal={() => {
          setEditingReport(null);
          setIsReportModalOpen(true);
        }}
        onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        onResetData={handleResetData}
        onNavigateToUsers={() => setActiveTab('users')}
        onLogout={handleLogout}
      />

      {/* PCU Subdistrict Real-time Push Notification Banner */}
      {user.assignedSubdistrict && userSubdistrictAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-500 to-rose-600 text-white px-4 sm:px-6 py-2.5 flex flex-wrap items-center justify-between gap-3 shadow-md z-20 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-2.5 text-xs font-bold">
            <span className="p-1 bg-white/20 rounded-lg animate-bounce">
              <Bell className="w-4 h-4 text-white" />
            </span>
            <span>
              [แจ้งเตือน {user.pcuName}] มีการรับแจ้งโรคใหม่ใน {user.assignedSubdistrict} ({userSubdistrictAlerts.length} รายการ)
            </span>
            <span className="hidden sm:inline text-amber-100 font-normal text-[11px]">
              • กรุณาลงพื้นที่ยิงพิกัด GPS และควบคุมโรค 3-3-1 ภายใน 24 ชม.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsAlertsOpen(true)}
              className="px-3 py-1 bg-white text-slate-900 font-bold rounded-xl text-xs shadow-xs hover:bg-amber-50 transition"
            >
              ดูรายการแจ้งเตือน
            </button>
          </div>
        </div>
      )}

      {/* Main Body Layout: Sidebar + Viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onTabChange={setActiveTab}
          reports={reports}
          investigations={investigations}
          contacts={contacts}
          outbreaks={outbreaks}
          pendingUsersCount={authService.getAccounts().filter(a => a.status === 'pending').length}
        />

        {/* Viewport Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50 min-w-0">
          
          {/* TAB 1: Central Dashboard */}
          {activeTab === 'dashboard' && (
            <DashboardView
              reports={reports}
              investigations={investigations}
              contacts={contacts}
              controlActivities={controlActivities}
              outbreaks={outbreaks}
              alerts={alerts}
              onNavigate={setActiveTab}
              onOpenReportModal={() => {
                setEditingReport(null);
                setIsReportModalOpen(true);
              }}
              onSelectReport={(rep) => handleOpenCreateInvestigation(rep)}
              onSelectOutbreak={() => setActiveTab('outbreaks')}
              onOpenAiAssistant={() => setIsAiAssistantOpen(true)}
            />
          )}

          {/* TAB 2: 506 Disease Registry */}
          {activeTab === 'reports' && (
            <DiseaseRegistryView
              reports={reports}
              currentUser={user}
              onOpenReportModal={() => {
                setEditingReport(null);
                setIsReportModalOpen(true);
              }}
              onEditReport={(rep) => {
                setEditingReport(rep);
                setIsReportModalOpen(true);
              }}
              onDeleteReport={handleDeleteReportRequest}
              onSelectReport={(rep) => handleOpenCreateInvestigation(rep)}
              onCreateInvestigation={handleOpenCreateInvestigation}
              onShareGpsLink={handleShareGpsLink}
              onOpenMobileSurvey={handleOpenMobileSurvey}
            />
          )}

          {/* TAB 3: Investigation Engine */}
          {activeTab === 'investigations' && (
            <InvestigationView
              investigations={investigations}
              reports={reports}
              onOpenInvestigationModal={(rep, inv) => {
                setSelectedReportForInvestigation(rep);
                setSelectedInvestigation(inv || null);
                setIsInvestigationModalOpen(true);
              }}
              onDeleteInvestigation={handleDeleteInvestigationRequest}
              onPrintInvestigation={handlePrintPreview}
            />
          )}

          {/* TAB 4: Contact Tracing */}
          {activeTab === 'contacts' && (
            <ContactTracingView
              contacts={contacts}
              reports={reports}
              onSaveContact={handleSaveContact}
              onDeleteContact={handleDeleteContactRequest}
              onConvertToCase={handleConvertContactToCase}
            />
          )}

          {/* TAB 5: Control Measures & 3-3-1 */}
          {activeTab === 'control' && (
            <ControlMeasuresView
              activities={controlActivities}
              reports={reports}
              onToggleActivity={handleToggleActivity}
              onAddActivity={handleAddControlActivity}
            />
          )}

          {/* TAB 6: Outbreak Events */}
          {activeTab === 'outbreaks' && (
            <OutbreakView
              outbreaks={outbreaks}
              reports={reports}
              contacts={contacts}
              onSelectOutbreak={() => {}}
              onSaveOutbreak={handleSaveOutbreak}
            />
          )}

          {/* TAB 7: GIS Spot Map (อำเภอ ตำบล หมู่บ้าน) */}
          {activeTab === 'map' && (
            <EpiMapView
              reports={reports}
              outbreaks={outbreaks}
              onSelectReport={handleOpenCreateInvestigation}
              onShareGpsLink={handleShareGpsLink}
              onOpenMobileSurvey={handleOpenMobileSurvey}
            />
          )}

          {/* TAB 8: Analytics & Curves */}
          {activeTab === 'analytics' && (
            <AnalyticsView reports={reports} />
          )}

          {/* TAB 9: Surveillance 506 Export */}
          {activeTab === 'export_reports' && (
            <ReportsView
              reports={reports}
              outbreaks={outbreaks}
              onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
            />
          )}

          {/* TAB 10: AI Advisor Full Page */}
          {activeTab === 'ai_advisor' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-800">ศูนย์คำปรึกษา AI ระบาดวิทยา (Gemini Field Epi)</h1>
                  <p className="text-xs text-slate-500 mt-0.5">ระบบปัญญาประดิษฐ์ช่วยวิเคราะห์โรคระบาดและออกแบบมาตรการ SRRT</p>
                </div>
                <button
                  onClick={() => setIsAiAssistantOpen(true)}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs shadow-md shadow-blue-600/20 transition"
                >
                  เปิดหน้าต่างแชท AI
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-blue-700 text-sm">🦟 มาตรการไข้เลือดออก 3-3-1</p>
                  <p className="text-slate-600 leading-relaxed">วิเคราะห์ดัชนีลูกน้ำยุงลาย HI/CI และแนะนำรอบการพ่นสารเคมีในชุมชน</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-amber-700 text-sm">👶 โรคมือเท้าปาก (HFMD)</p>
                  <p className="text-slate-600 leading-relaxed">แนวทางประเมินการปิดห้องเรียน/ศูนย์พัฒนาเด็กเล็กตามเกณฑ์กระทรวง สธ.</p>
                </div>
                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-2">
                  <p className="font-bold text-red-700 text-sm">🌾 ไข้ฉี่หนู & เมลิออยด์</p>
                  <p className="text-slate-600 leading-relaxed">แนวทางป้องกันและให้ยา Doxycycline Prophylaxis ในเกษตรกร</p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 11: Google Sheets Sync Guide */}
          {activeTab === 'sheets_sync' && (
            <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 text-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h1 className="text-lg font-bold text-slate-800">Google Workspace & Cloud Storage Integration</h1>
                  <p className="text-xs text-slate-500 mt-0.5">เชื่อมโยงระบบฐานข้อมูลและไฟล์รายงานเข้า Google Sheets & Google Drive</p>
                </div>
                <button
                  onClick={() => setIsSheetsModalOpen(true)}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md shadow-emerald-600/20 transition"
                >
                  เปิดดูโค้ด Webhook & ชีต
                </button>
              </div>

              <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs text-slate-700 space-y-2">
                <p className="font-bold text-blue-700">สถานะการเก็บข้อมูล:</p>
                <p>• ระบบจัดเก็บข้อมูลสำรองความเร็วสูงบนเบราว์เซอร์ พร้อมส่งออก CSV และ JSON ได้ทุกเมื่อ</p>
                <p>• โครงสร้างข้อมูลตรงตามมาตรฐานระบบ 506 กรมควบคุมโรค กระทรวงสาธารณสุข 100%</p>
              </div>
            </div>
          )}

          {/* TAB 12: Admin User Management */}
          {activeTab === 'users' && (
            <UserManagementView
              currentUser={user}
              onOpenLoginModal={() => setIsLoginModalOpen(true)}
            />
          )}

        </main>
      </div>

      {/* GLOBAL MODALS */}
      {/* 1. Login / User Authentication Modal */}
      {isLoginModalOpen && (
        <LoginModal
          isOpen={isLoginModalOpen}
          onClose={() => setIsLoginModalOpen(false)}
          currentUser={user}
          onLoginSuccess={(newUser) => setUser(newUser)}
        />
      )}

      {/* 2. Admin Protected Delete Confirm Modal */}
      {isDeleteModalOpen && deleteItemInfo && (
        <AdminDeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setDeleteItemInfo(null);
          }}
          title="ยืนยันการลบข้อมูล (Admin Only)"
          itemDescription={deleteItemInfo.description}
          currentUser={user}
          onConfirmDelete={deleteItemInfo.action}
        />
      )}

      {/* 3. Disease Intake / 506 Report Modal */}
      {isReportModalOpen && (
        <ReportDiseaseModal
          isOpen={isReportModalOpen}
          onClose={() => {
            setIsReportModalOpen(false);
            setEditingReport(null);
          }}
          onSave={handleSaveReport}
          user={user}
          initialData={editingReport}
        />
      )}

      {/* 4. Investigation Engine Modal */}
      {isInvestigationModalOpen && selectedReportForInvestigation && (
        <InvestigationModal
          isOpen={isInvestigationModalOpen}
          onClose={() => {
            setIsInvestigationModalOpen(false);
            setSelectedReportForInvestigation(null);
            setSelectedInvestigation(null);
          }}
          report={selectedReportForInvestigation}
          existingInvestigation={selectedInvestigation}
          onSave={handleSaveInvestigation}
          onPrintPreview={handlePrintPreview}
          user={user}
        />
      )}

      {/* 5. Official Printable Report Preview Modal */}
      {isPrintModalOpen && printInvData && (
        <InvestigationPrintReport
          isOpen={isPrintModalOpen}
          onClose={() => {
            setIsPrintModalOpen(false);
            setPrintInvData(null);
          }}
          investigation={printInvData.inv}
          report={printInvData.report}
        />
      )}

      {/* 6. Gemini AI Epidemiologist Assistant Modal */}
      {isAiAssistantOpen && (
        <AiAssistantModal
          isOpen={isAiAssistantOpen}
          onClose={() => setIsAiAssistantOpen(false)}
          reports={reports}
          outbreaks={outbreaks}
        />
      )}

      {/* 7. Real-time Outbreak Alerts Modal */}
      {isAlertsOpen && (
        <AlertsNotificationModal
          isOpen={isAlertsOpen}
          onClose={() => setIsAlertsOpen(false)}
          alerts={alerts}
          currentUser={user}
          onMarkAsRead={handleMarkAlertRead}
          onNavigateToAlert={(alert) => {
            if (alert.outbreakId) {
              setActiveTab('outbreaks');
            } else {
              setActiveTab('reports');
            }
          }}
          onOpenMobileSurveyForAlert={(alert) => {
            const linkedRep = reports.find(r => r.id === alert.relatedId);
            if (linkedRep) {
              handleOpenMobileSurvey(linkedRep);
            }
          }}
        />
      )}

      {/* 8. Universal GPS Link Share Modal (Android / iOS / Line / QR) */}
      {isGpsShareModalOpen && selectedReportForGpsShare && (
        <GpsShareModal
          isOpen={isGpsShareModalOpen}
          onClose={() => {
            setIsGpsShareModalOpen(false);
            setSelectedReportForGpsShare(null);
          }}
          report={selectedReportForGpsShare}
          onOpenMobileSurvey={(rep) => {
            setIsGpsShareModalOpen(false);
            handleOpenMobileSurvey(rep);
          }}
        />
      )}

      {/* 9. Mobile GPS Field Survey Modal / View */}
      {isMobileSurveyOpen && selectedReportForSurvey && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-xl max-h-[96vh] overflow-y-auto shadow-2xl">
            <MobileGpsSurveyView
              report={selectedReportForSurvey}
              user={user}
              onBack={() => {
                setIsMobileSurveyOpen(false);
                setSelectedReportForSurvey(null);
              }}
              onSaved={(updatedRep) => {
                storageService.saveReport(updatedRep);
                loadAllData();
                setIsMobileSurveyOpen(false);
                setSelectedReportForSurvey(null);
              }}
            />
          </div>
        </div>
      )}

      {/* 10. Google Sheets Sync Modal */}
      {isSheetsModalOpen && (
        <GoogleSheetsSyncModal
          isOpen={isSheetsModalOpen}
          onClose={() => setIsSheetsModalOpen(false)}
          reports={reports}
        />
      )}

    </div>
  );
}

export default App;
