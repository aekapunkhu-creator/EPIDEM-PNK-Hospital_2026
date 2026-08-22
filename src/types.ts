export type RoleType = 
  | 'admin' // ผู้ดูแลระบบ (Full permissions & Delete)
  | 'head_epi' // หัวหน้างานระบาดวิทยา
  | 'srrt_officer' // เจ้าหน้าที่ SRRT / ระบาดวิทยา
  | 'pcu_nakaeo' // รพ.สต.นาแก้ว (ตำบลนาแก้ว)
  | 'pcu_natong' // รพ.สต.นาตงวัฒนา (ตำบลนาตงวัฒนา)
  | 'pcu_banpaen' // รพ.สต.บ้านแป้น (ตำบลบ้านแป้น)
  | 'pcu_banphon' // รพ.สต.บ้านโพน (ตำบลบ้านโพน)
  | 'pcu_chiang_sue' // รพ.สต.เชียงสือ (ตำบลเชียงสือ)
  | 'pcu_bankaeng' // รพ.สต.บ้านแก้ง
  | 'pcu_natom' // รพ.สต.นาทม
  | 'er_opd' // แผนก ER / OPD
  | 'ipd' // หอผู้ป่วยใน
  | 'lab' // ห้องปฏิบัติการ
  | 'executive'; // ผู้บริหาร

export type DiseaseCategory = 
  // กลุ่มที่ 1: โรคติดต่ออันตราย
  | 'PLAGUE'
  | 'SMALLPOX'
  | 'CCHF'
  | 'WEST_NILE'
  | 'YELLOW_FEVER'
  | 'LASSA_FEVER'
  | 'NIPAH'
  | 'MARBURG'
  | 'EBOLA'
  | 'HENDRA'
  | 'SARS'
  | 'MERS'
  | 'XDR_TB'
  // กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ
  | 'CHOLERA'
  | 'FOOD_POISONING'
  | 'SHIGELLOSIS'
  | 'AMOEBIASIS'
  | 'TYPHOID'
  | 'PARATYPHOID'
  | 'LIVER_FLUKE'
  | 'BOTULISM'
  | 'MUSHROOM_POISONING'
  | 'HEP_A'
  | 'HEP_E'
  // กลุ่มที่ 2.2: ระบบทางเดินหายใจ
  | 'INFLUENZA'
  | 'PNEUMONIA'
  | 'COVID-19'
  | 'COVID19'
  // กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน
  | 'RUBELLA'
  | 'RUBELLA_COMPLICATED'
  | 'VARICELLA'
  | 'POLIO'
  | 'MEASLES'
  | 'MEASLES_COMPLICATED'
  | 'DIPHTHERIA'
  | 'PERTUSSIS'
  | 'TETANUS'
  | 'JAPANESE_ENCEPHALITIS'
  | 'MUMPS'
  | 'NEONATAL_TETANUS'
  | 'CONGENITAL_RUBELLA'
  // กลุ่มที่ 2.5: ระบบประสาทส่วนกลาง
  | 'MENINGOCOCCAL_MENINGITIS'
  | 'ENCEPHALITIS'
  | 'MENINGITIS_UNSPECIFIED'
  // กลุ่มที่ 2.6: นำโดยแมลง
  | 'DENGUE_FEVER'
  | 'DENGUE_SHOCK'
  | 'MALARIA'
  | 'SCRUB_TYPHUS'
  | 'DENGUE'
  | 'CHIKUNGUNYA'
  | 'ZIKA'
  // กลุ่มที่ 2.7: ทางเพศสัมพันธ์
  | 'SYPHILIS'
  | 'CONGENITAL_SYPHILIS'
  | 'GONORRHEA'
  | 'NGU'
  | 'CHANCROID'
  | 'LGV'
  | 'GENITAL_HERPES'
  | 'GENITAL_WARTS'
  | 'HEP_B_ACUTE'
  | 'HEP_C_ACUTE'
  | 'HEP_D_ACUTE'
  // กลุ่มที่ 2.8: จากการสัมผัส
  | 'HFMD'
  | 'MELIOIDOSIS'
  | 'ENTEROVIRUS_FEVER'
  | 'MPOX'
  // กลุ่มที่ 2.9: จากสัตว์สู่คน
  | 'RABIES'
  | 'LEPTOSPIROSIS'
  | 'ANTHRAX'
  | 'TRICHINOSIS'
  | 'STREP_SUIS'
  | 'BRUCELLOSIS'
  | 'AVIAN_INFLUENZA'
  // กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ
  | 'ACUTE_DIARRHEA'
  | 'VIRAL_CONJUNCTIVITIS'
  | 'AFP'
  | 'AEFI'
  | 'FEVER_UNKNOWN'
  | 'VIRAL_RASH'
  // Legacy / Other
  | 'Dengue'
  | 'Influenza'
  | 'Diarrhea'
  | 'TB'
  | 'Leptospirosis'
  | 'Melioidosis'
  | 'Rabies_Exposure'
  | 'Chickenpox'
  | 'Tetanus'
  | 'RTI_DEAD'
  | 'DROWNING'
  | 'Other'
  | (string & {});

export type CaseType = 'Suspected' | 'Probable' | 'Confirmed';

export type CaseStatus = 
  | 'reported' // รับแจ้ง
  | 'pending_investigation' // รอสอบสวน
  | 'investigating' // กำลังสอบสวน
  | 'investigated' // สอบสวนแล้ว
  | 'in_control' // กำลังควบคุมโรค
  | 'closed'; // ปิดเหตุการณ์/สิ้นสุดการติดตาม

export type ExposureRiskLevel = 'High' | 'Medium' | 'Low';

export type ContactStatus = 
  | 'asymptomatic' // ยังไม่มีอาการ
  | 'under_monitoring' // เฝ้าระวัง
  | 'symptomatic' // มีอาการ (ส่งตรวจ)
  | 'tested' // ตรวจ Lab แล้ว
  | 'converted_case'; // พบเป็นผู้ป่วย

export type OutbreakStatus = 'active' | 'under_control' | 'contained' | 'closed';

export interface SubdistrictInfo {
  id: string;
  nameTh: string;
  nameEn: string;
  villagesCount: number;
  healthCenter: string; // รพ.สต.
  population: number;
  centerLat: number;
  centerLng: number;
}

export interface VillageInfo {
  id: string;
  subdistrictId: string;
  moo: number;
  name: string;
  lat: number;
  lng: number;
  households: number;
  population: number;
}

export interface Patient {
  id: string;
  hn: string;
  cid?: string; // เลขบัตรประชาชน
  prefix: string;
  firstName: string;
  lastName: string;
  age: number;
  gender: 'male' | 'female';
  phone: string;
  occupation: string;
  workplaceOrSchool?: string;
  address: string;
  moo: number; // หมู่ที่
  villageName: string; // ชื่อหมู่บ้าน
  subdistrict: string; // ตำบล
  district: string; // อำเภอ (โพนนาแก้ว)
  province: string; // จังหวัด (สกลนคร)
  underlyingDiseases?: string[];
  lat: number;
  lng: number;
  // Mobile GPS tracking details
  gpsAccuracy?: number; // In meters
  gpsTimestamp?: string;
  gpsRecordedBy?: string;
  gpsDeviceType?: 'Android' | 'iOS' | 'Web';
  gpsPhotoUrl?: string;
}

export interface DiseaseReport {
  id: string;
  patientId: string;
  patient: Patient;
  disease: DiseaseCategory;
  diseaseNameTh: string;
  icd10: string;
  caseType: CaseType;
  onsetDate: string; // วันเริ่มป่วย (YYYY-MM-DD)
  visitDate: string; // วันที่มารับบริการ
  reportDate: string; // วันที่รายงาน
  reportingUnit: string; // ER, OPD, IPD, Lab, รพ.สต.นาแก้ว ฯลฯ
  reporterName: string;
  reporterRole: string;
  chiefComplaint: string;
  symptoms: string[];
  isAdmitted: boolean;
  admissionWard?: string;
  labResult: {
    testName: string;
    result: string; // Positive, Negative, Pending, etc.
    testedDate?: string;
    specimenType?: string;
  };
  status: CaseStatus;
  investigationId?: string;
  outbreakId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TimelineEvent {
  id: string;
  date: string;
  time?: string;
  activityOrLocation: string;
  description: string;
  type: 'onset' | 'travel' | 'contact' | 'hospital' | 'lab' | 'control';
}

export interface RiskAssessment {
  travelHistory: boolean;
  travelDetails?: string;
  sharedMeal: boolean;
  sharedMealDetails?: string;
  animalContact: boolean;
  animalContactDetails?: string;
  waterSourceExposure: boolean;
  waterSourceDetails?: string;
  schoolOrCrowdedPlace: boolean;
  schoolDetails?: string;
  similarCasesInFamilyOrNeighborhood: boolean;
  clusterDetails?: string;
  mosquitoBreedingIndex?: {
    hi?: number; // House Index
    ci?: number; // Container Index
    bi?: number; // Breteau Index
  };
  otherRisks?: string;
}

export interface Investigation {
  id: string;
  reportId: string;
  patientId: string;
  investigatorName: string;
  investigatorTeam: string; // ทีม SRRT รพ.โพนนาแก้ว
  investigationDate: string;
  clinicalSummary: string;
  timeline: TimelineEvent[];
  risks: RiskAssessment;
  probableSourceOfInfection: string;
  epidemiologicalLink?: string;
  contactsIdentifiedCount: number;
  actionTaken: string[];
  recommendations: string[];
  aiAnalysisSummary?: string;
  status: 'draft' | 'completed' | 'reviewed';
  reviewedBy?: string;
  completedAt?: string;
}

export interface DailyFollowUpLog {
  day: number;
  date: string;
  temperature?: number;
  hasSymptoms: boolean;
  symptomsDetails?: string;
  monitoredBy: string;
  notes?: string;
}

export interface ContactPerson {
  id: string;
  reportId: string; // เชื่อมโยงกับผู้ป่วยหลัก
  caseHn: string;
  caseName: string;
  caseDisease: DiseaseCategory;
  name: string;
  age: number;
  gender: 'male' | 'female';
  relationship: string; // คนในครอบครัว, เพื่อนร่วมห้อง, เพื่อนร่วมงาน ฯลฯ
  phone: string;
  address: string;
  subdistrict: string;
  villageName: string;
  exposureDate: string; // วันที่สัมผัส
  exposureType: string; // สัมผัสใกล้ชิด, รับประทานอาหารร่วมกัน, ห้องเรียนเดียวกัน
  riskLevel: ExposureRiskLevel;
  status: ContactStatus;
  monitoringDays: number; // e.g. 14 or 21 days
  startDate: string;
  endDate: string;
  dailyLogs: DailyFollowUpLog[];
  prophylaxisGiven?: string; // ยา/วัคซีนป้องกันที่ให้
  labResult?: string;
  convertedCaseId?: string; // ถ้ากลายเป็นเคสจริง
  notes?: string;
}

export interface ControlActivity {
  id: string;
  title: string;
  category: 
    | 'isolation' // แยกผู้ป่วย
    | 'active_case_finding' // ค้นหาผู้สัมผัส/ผู้ป่วยเชิงรุก
    | 'chemical_spray' // พ่นหมอกควัน/สารเคมี ULV
    | 'larval_destruction' // ทำลายแหล่งเพาะพันธุ์ลูกน้ำยุงลาย
    | 'health_education' // สุขศึกษา/ประชาสัมพันธ์
    | 'disinfection' // ทำความสะอาด/ฆ่าเชื้อ
    | 'community_liaison' // ประสาน อสม. / รพ.สต. / ท้องถิ่น
    | 'specimen_collection' // เก็บตัวอย่างส่งตรวจ
    | 'reporting_ssj'; // รายงาน สสอ. / สสจ.
  targetLocation: string;
  subdistrict: string;
  villageName: string;
  relatedDisease: DiseaseCategory;
  relatedReportId?: string;
  relatedOutbreakId?: string;
  assignedTo: string;
  dueDate: string;
  completedDate?: string;
  isCompleted: boolean;
  outcomeSummary?: string;
  hiAfter?: number; // House Index หลังควบคุม
  ciAfter?: number; // Container Index หลังควบคุม
  gpsLat?: number;
  gpsLng?: number;
  gpsPhotoUrl?: string;
  attachments?: string[];
  createdAt: string;
}

export interface EocDirective {
  id: string;
  commandText: string;
  assignedSection: 'Operations' | 'Planning' | 'Logistics' | 'Finance' | 'RiskComm';
  assignedTo: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed';
  createdAt: string;
  completedAt?: string;
}

export interface OutbreakEvent {
  id: string;
  title: string;
  disease: DiseaseCategory;
  diseaseNameTh: string;
  subdistrict: string;
  villageName: string;
  specificLocation: string; // e.g. โรงเรียนบ้านนาแก้ว, ศูนย์เด็กเล็กบ้านแป้น
  startDate: string;
  reportedDate: string;
  status: OutbreakStatus;
  indexCaseHn?: string;
  indexCaseName?: string;
  caseIds: string[];
  totalCases: number;
  confirmedCases: number;
  contactsCount: number;
  populationAtRisk: number;
  attackRatePercent: number;
  secondaryAttackRatePercent?: number;
  caseFatalityRatePercent?: number;
  leadInvestigator: string;
  centerLat: number;
  centerLng: number;
  summary: string;
  controlMeasuresExecuted: string[];
  resolvedDate?: string;
  // EOC Structure & Operations
  eocLevel?: 'Level 1' | 'Level 2' | 'Level 3' | 'Standby' | 'Closed';
  eocActivatedAt?: string;
  eocCommander?: string; // ผู้บัญชาการเหตุการณ์ (Incident Commander)
  eocOperationsLead?: string; // ฝ่ายปฏิบัติการ
  eocPlanningLead?: string; // ฝ่ายตระหนักรู้สถานการณ์ & แผน
  eocLogisticsLead?: string; // ฝ่ายส่งกำลังบำรุง
  eocRiskCommLead?: string; // ฝ่ายสื่อสารความเสี่ยง
  eocDirectives?: EocDirective[]; // ข้อสั่งการ EOC
  outbreakType?: 'Point Source' | 'Common Source' | 'Propagated (Person-to-Person)' | 'Vector-Borne';
  estimatedIncubationPeriod?: string;
}

export interface EpiAlert {
  id: string;
  type: 'cluster_detected' | 'overdue_investigation' | 'symptomatic_contact' | 'threshold_exceeded' | 'dengue_red_alert' | 'new_case_subdistrict_alert';
  severity: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  subdistrict?: string;
  villageName?: string;
  relatedDisease?: DiseaseCategory;
  relatedId?: string;
  outbreakId?: string;
  isRead: boolean;
  createdAt: string;
  actionRequired: string;
  targetSubdistrict?: string;
  targetPcuName?: string;
  targetRole?: RoleType;
  isFieldSurveyPending?: boolean;
}

export interface UserSession {
  userId: string;
  name: string;
  role: RoleType;
  department: string;
  hospital: string;
  district?: string;
  province?: string;
  assignedSubdistrict?: string; // สำหรับ รพ.สต.
  pcuName?: string;
  username?: string;
}

export type UserStatus = 'active' | 'pending' | 'suspended';

export interface UserAccount {
  id: string;
  username: string;
  password: string;
  name: string;
  role: RoleType;
  department: string;
  hospital: string;
  assignedSubdistrict?: string; // e.g. 'ตำบลนาแก้ว'
  pcuName?: string; // e.g. 'รพ.สต.นาแก้ว'
  phone?: string;
  canDelete: boolean; // Only Admin is true
  status?: UserStatus; // 'active' | 'pending' | 'suspended'
  createdAt?: string;
  approvedAt?: string;
  approvedBy?: string;
}
