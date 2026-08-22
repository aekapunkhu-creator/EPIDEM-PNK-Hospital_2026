import { DiseaseCategory } from '../types';

export interface DiseaseItem {
  value: string;
  nameTh: string;
  icd10: string;
  group: string;
  defaultLab?: string;
  defaultChiefComplaint?: string;
  color?: string;
}

export interface DiseaseGroup {
  groupName: string;
  diseases: DiseaseItem[];
}

export const DISEASE_GROUPS: DiseaseGroup[] = [
  {
    groupName: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
    diseases: [
      {
        value: 'PLAGUE',
        nameTh: 'กาฬโรค',
        icd10: 'A20',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Yersinia pestis Culture / PCR / Serology',
        defaultChiefComplaint: 'ไข้สูง หนาวสั่น ต่อมน้ำเหลืองโตและเจ็บมาก (Buboes) หรือมีอาการปอดอักเสบรุนแรง',
        color: '#dc2626'
      },
      {
        value: 'SMALLPOX',
        nameTh: 'ไข้ทรพิษ',
        icd10: 'B03',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Variola virus PCR / Electron Microscopy',
        defaultChiefComplaint: 'ไข้สูง ปวดเมื่อยตามตัว มีผื่นตุ่มนูนแดงกลายเป็นตุ่มหนองกระจายตามใบหน้าและแขนขา',
        color: '#dc2626'
      },
      {
        value: 'CCHF',
        nameTh: 'ไข้เลือดออกไครเมียนคองโก',
        icd10: 'A98.0',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'CCHF RT-PCR / ELISA IgM',
        defaultChiefComplaint: 'ไข้สูง ปวดศีรษะ ปวดกล้ามเนื้อ มีจุดเลือดออกรุนแรงและภาวะเลือดออกง่าย',
        color: '#dc2626'
      },
      {
        value: 'WEST_NILE',
        nameTh: 'ไข้เวสต์ไนล์',
        icd10: 'A92.3',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'West Nile virus IgM (CSF/Serum) / RT-PCR',
        defaultChiefComplaint: 'ไข้ ปวดศีรษะ ผื่น อ่อนแรง หรือมีอาการทางระบบประสาท/สมองอักเสบ',
        color: '#dc2626'
      },
      {
        value: 'YELLOW_FEVER',
        nameTh: 'ไข้เหลือง',
        icd10: 'A95',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Yellow Fever RT-PCR / IgM ELISA',
        defaultChiefComplaint: 'ไข้สูง ตัวเหลืองตาเหลือง ปวดหลัง ปัสสาวะออกน้อย มีเลือดออก',
        color: '#dc2626'
      },
      {
        value: 'LASSA_FEVER',
        nameTh: 'โรคไข้ลาสซา',
        icd10: 'A96.2',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Lassa virus RT-PCR / ELISA IgM',
        defaultChiefComplaint: 'ไข้สูง คออักเสบ ปวดกล้ามเนื้อ บวมบริเวณใบหน้าและคอ มีเลือดออก',
        color: '#dc2626'
      },
      {
        value: 'NIPAH',
        nameTh: 'โรคติดเชื้อไวรัสนิปาห์',
        icd10: 'B97.8',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Nipah virus RT-PCR / IgM ELISA',
        defaultChiefComplaint: 'ไข้สูง ปวดศีรษะรุนแรง ซึม สับสน ชัก หรือมีอาการทางเดินหายใจเฉียบพลัน',
        color: '#dc2626'
      },
      {
        value: 'MARBURG',
        nameTh: 'โรคติดเชื้อไวรัสมาร์บวร์ก',
        icd10: 'A98.3',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Marburg virus RT-PCR / Antigen Detection',
        defaultChiefComplaint: 'ไข้สูงเฉียบพลัน ปวดศีรษะรุนแรง ถ่ายเหลวเป็นน้ำ และมีเลือดออกตามอวัยวะต่างๆ',
        color: '#dc2626'
      },
      {
        value: 'EBOLA',
        nameTh: 'โรคติดเชื้อไวรัสอีโบลา',
        icd10: 'A98.4',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Ebola virus RT-PCR / Antigen Detection',
        defaultChiefComplaint: 'ไข้สูง หนาวสั่น ปวดเมื่อย อ่อนเพลียรุนแรง ท้องเสีย อาเจียน เลือดออกหลายระบบ',
        color: '#dc2626'
      },
      {
        value: 'HENDRA',
        nameTh: 'โรคติดเชื้อไวรัสเฮนดรา',
        icd10: 'B97.8',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Hendra virus RT-PCR / Serology',
        defaultChiefComplaint: 'ไข้ อาการทางเดินหายใจเฉียบพลันรุนแรง หรือสมองอักเสบ',
        color: '#dc2626'
      },
      {
        value: 'SARS',
        nameTh: 'โรคทางเดินหายใจเฉียบพลันรุนแรง (SARS)',
        icd10: 'U04.9',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'SARS-CoV RT-PCR',
        defaultChiefComplaint: 'ไข้สูง > 38°C ไอ หอบเหนื่อย หายใจลำบาก ปอดอักเสบรุนแรง',
        color: '#dc2626'
      },
      {
        value: 'MERS',
        nameTh: 'โรคทางเดินหายใจตะวันออกกลาง (MERS)',
        icd10: 'U04.0',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'MERS-CoV RT-PCR',
        defaultChiefComplaint: 'ไข้ ไอ หอบเหนื่อย ปอดบวมรุนแรง ประวัติเดินทางกลับจากตะวันออกกลาง',
        color: '#dc2626'
      },
      {
        value: 'XDR_TB',
        nameTh: 'วัณโรคดื้อยาหลายขนานชนิดรุนแรงมาก (XDR-TB)',
        icd10: 'U84.3',
        group: 'กลุ่มที่ 1: โรคติดต่ออันตราย',
        defaultLab: 'Sputum GeneXpert / Drug Susceptibility Testing (DST)',
        defaultChiefComplaint: 'ไอเรื้อรังเกิน 2 สัปดาห์ ไอเป็นเลือด ไข้ต่ำๆ ตอนเย็น น้ำหนักลด ดื้อยาขนานที่ 1 และ 2',
        color: '#dc2626'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
    diseases: [
      {
        value: 'CHOLERA',
        nameTh: 'อหิวาตกโรค',
        icd10: 'A00',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Stool Culture for Vibrio cholerae / Rapid Dipstick',
        defaultChiefComplaint: 'ถ่ายอุจจาระเหลวเป็นน้ำซาวข้าวปริมาณมาก อาเจียน ขาดน้ำรุนแรง',
        color: '#0284c7'
      },
      {
        value: 'FOOD_POISONING',
        nameTh: 'อาหารเป็นพิษ',
        icd10: 'A05.9',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Stool Exam / Culture / Food Specimen Testing',
        defaultChiefComplaint: 'คลื่นไส้ อาเจียน ปวดท้อง ถ่ายเหลวหลังรับประทานอาหารร่วมกัน',
        color: '#0284c7'
      },
      {
        value: 'SHIGELLOSIS',
        nameTh: 'โรคบิดจากเชื้อชิเกลลา',
        icd10: 'A03',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Stool Culture for Shigella spp.',
        defaultChiefComplaint: 'ไข้ ปวดเบ่ง ถ่ายอุจจาระเป็นมูกเลือด ปวดเกร็งหน้าท้อง',
        color: '#0284c7'
      },
      {
        value: 'AMOEBIASIS',
        nameTh: 'โรคบิดมีตัวหรือโรคบิดจากเชื้ออะมีบา',
        icd10: 'A06',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Stool Direct Examination / E. histolytica Antigen',
        defaultChiefComplaint: 'ถ่ายอุจจาระเป็นมูกเลือดกลิ่นเหม็นเน่า ปวดท้อง ท้องอืดเรื้อรัง',
        color: '#0284c7'
      },
      {
        value: 'TYPHOID',
        nameTh: 'ไข้ไทฟอยด์หรือไข้รากสาดน้อย',
        icd10: 'A01.0',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Hemoculture / Widal Test / Stool Culture for Salmonella Typhi',
        defaultChiefComplaint: 'ไข้สูงลอย ปวดศีรษะ ปวดท้อง ท้องผูกหรือถ่ายเหลว ตับม้ามโต',
        color: '#0284c7'
      },
      {
        value: 'PARATYPHOID',
        nameTh: 'ไข้พาราไทฟอยด์หรือไข้รากสาดเทียม',
        icd10: 'A01.4',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Hemoculture / Salmonella Paratyphi Culture',
        defaultChiefComplaint: 'ไข้ ปวดศีรษะ ท้องเสียหรือแน่นท้อง คล้ายไทฟอยด์แต่มักรุนแรงน้อยกว่า',
        color: '#0284c7'
      },
      {
        value: 'LIVER_FLUKE',
        nameTh: 'โรคพยาธิใบไม้ตับ',
        icd10: 'B66.0',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Stool Concentration Technique (Opisthorchis viverrini ova)',
        defaultChiefComplaint: 'แน่นท้อง จุกเสียดใต้ชายโครงขวา ประวัติรับประทานปลาน้ำจืดดิบ/ก้อยปลา',
        color: '#0284c7'
      },
      {
        value: 'BOTULISM',
        nameTh: 'โรคโบทูลิซึม',
        icd10: 'A05.1',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Clostridium botulinum Toxin Assay',
        defaultChiefComplaint: 'หนังตาตก มองเห็นภาพซ้อน กลืนลำบาก พูดไม่ชัด กล้ามเนื้ออ่อนแรง ประวัติกินหน่อไม้ปี๊บ/อาหารหมักดอง',
        color: '#0284c7'
      },
      {
        value: 'MUSHROOM_POISONING',
        nameTh: 'โรคอาหารเป็นพิษจากเห็ด',
        icd10: 'T62.0',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Clinical Diagnosis / Liver & Renal Function Panel',
        defaultChiefComplaint: 'คลื่นไส้ อาเจียน ปวดท้องรุนแรง ถ่ายเหลว ตับวาย ประวัติกินเห็ดป่า',
        color: '#0284c7'
      },
      {
        value: 'HEP_A',
        nameTh: 'โรคไวรัสตับอักเสบเฉียบพลัน ชนิด เอ',
        icd10: 'B15',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Anti-HAV IgM',
        defaultChiefComplaint: 'ไข้ต่ำๆ เบื่ออาหาร คลื่นไส้ อ่อนเพลีย ตัวเหลืองตาเหลือง ปัสสาวะสีเข้ม',
        color: '#0284c7'
      },
      {
        value: 'HEP_E',
        nameTh: 'โรคไวรัสตับอักเสบเฉียบพลัน ชนิด อี',
        icd10: 'B17.2',
        group: 'กลุ่มที่ 2.1: ระบบทางเดินอาหารและน้ำ',
        defaultLab: 'Anti-HEV IgM / HEV RNA RT-PCR',
        defaultChiefComplaint: 'ตัวเหลืองตาเหลือง อ่อนเพลีย คลื่นไส้ ประวัติบริโภคน้ำหรืออาหารปนเปื้อน',
        color: '#0284c7'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.2: ระบบทางเดินหายใจ',
    diseases: [
      {
        value: 'INFLUENZA',
        nameTh: 'ไข้หวัดใหญ่',
        icd10: 'J10.1',
        group: 'กลุ่มที่ 2.2: ระบบทางเดินหายใจ',
        defaultLab: 'Influenza A/B Rapid Antigen / RT-PCR',
        defaultChiefComplaint: 'ไข้สูงลอย ปวดเมื่อยตามตัวรุนแรง ไอ เจ็บคอ มีน้ำมูก อ่อนเพลีย',
        color: '#2563eb'
      },
      {
        value: 'PNEUMONIA',
        nameTh: 'โรคปอดอักเสบหรือโรคปอดบวม',
        icd10: 'J18.9',
        group: 'กลุ่มที่ 2.2: ระบบทางเดินหายใจ',
        defaultLab: 'Chest X-Ray / Sputum Gram stain & Culture / Hemoculture',
        defaultChiefComplaint: 'ไข้สูง ไอมีเสมหะข้น หายใจหอบเหนื่อย เจ็บหน้าอกเวลาหายใจเข้า',
        color: '#2563eb'
      },
      {
        value: 'COVID-19',
        nameTh: 'โรคติดเชื้อไวรัสโคโรนา (COVID-19)',
        icd10: 'U07.1',
        group: 'กลุ่มที่ 2.2: ระบบทางเดินหายใจ',
        defaultLab: 'SARS-CoV-2 Antigen Rapid Test (ATK) / RT-PCR',
        defaultChiefComplaint: 'ไข้ ไอ เจ็บคอ มีน้ำมูก อ่อนเพลีย จมูกไม่ได้กลิ่น ลิ้นไม่รับรส',
        color: '#2563eb'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
    diseases: [
      {
        value: 'RUBELLA',
        nameTh: 'ไข้หัดเยอรมัน',
        icd10: 'B06.9',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Rubella IgM / RT-PCR',
        defaultChiefComplaint: 'ไข้ต่ำๆ ผื่นแดงเริ่มที่ใบหน้า ต่อมน้ำเหลืองหลังหูและท้ายทอยโต',
        color: '#8b5cf6'
      },
      {
        value: 'RUBELLA_COMPLICATED',
        nameTh: 'ไข้หัดเยอรมันที่มีโรคแทรกซ้อน',
        icd10: 'B06.8',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Rubella IgM / CSF Study / Platelet Count',
        defaultChiefComplaint: 'หัดเยอรมันร่วมกับภาวะแทรกซ้อน เช่น ปวดข้อรุนแรง เกล็ดเลือดต่ำ หรือสมองอักเสบ',
        color: '#8b5cf6'
      },
      {
        value: 'VARICELLA',
        nameTh: 'โรคสุกใสหรือโรคอีสุกอีใส',
        icd10: 'B01.9',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Clinical Diagnosis / VZV PCR / Tzanck Smear',
        defaultChiefComplaint: 'มีไข้ ตุ่มแดงคันเปลี่ยนเป็นตุ่มน้ำใสคล้ายหยดน้ำบนกลีบกุหลาบ กระจายทั่วตัว',
        color: '#8b5cf6'
      },
      {
        value: 'POLIO',
        nameTh: 'โรคโปลิโอ',
        icd10: 'A80',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Stool Specimen for Poliovirus Isolation (2 samples 24-48h apart)',
        defaultChiefComplaint: 'แขนหรือขาอ่อนแรงเฉียบพลัน ปวกเปียก (Acute Flaccid Paralysis) ไม่มีไข้',
        color: '#8b5cf6'
      },
      {
        value: 'MEASLES',
        nameTh: 'ไข้หัดที่ไม่มีโรคแทรกซ้อน',
        icd10: 'B05.9',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Measles IgM / Throat Swab RT-PCR',
        defaultChiefComplaint: 'ไข้สูง ตาแดง น้ำมูกไหล ไอ (3Cs) มีจุด Koplik spots ในกระพุ้งแก้ม ผื่นแดงขึ้นจากใบหน้าลงมาตามตัว',
        color: '#8b5cf6'
      },
      {
        value: 'MEASLES_COMPLICATED',
        nameTh: 'ไข้หัดที่มีโรคแทรกซ้อน',
        icd10: 'B05.8',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Measles IgM / Chest X-Ray / Sputum Culture',
        defaultChiefComplaint: 'ไข้หัดร่วมกับภาวะปอดอักเสบ ท้องเสียรุนแรง หรือสมองอักเสบ',
        color: '#8b5cf6'
      },
      {
        value: 'DIPHTHERIA',
        nameTh: 'โรคคอตีบ',
        icd10: 'A36',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Throat Swab Culture for Corynebacterium diphtheriae / Toxigenicity Test',
        defaultChiefComplaint: 'เจ็บคอ มีแผ่นเยื่อสีขาวเทาติดแน่นที่ทอนซิล/เพดานปาก คอบวมคล้ายคอวัว (Bull neck)',
        color: '#8b5cf6'
      },
      {
        value: 'PERTUSSIS',
        nameTh: 'โรคไอกรน',
        icd10: 'A37',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Nasopharyngeal Swab PCR for Bordetella pertussis',
        defaultChiefComplaint: 'ไอเป็นชุดๆ ติดต่อกัน หายใจเข้ามีเสียงวู๊ป (Whoop) ไอจนอาเจียนหรือหน้าเขียว',
        color: '#8b5cf6'
      },
      {
        value: 'TETANUS',
        nameTh: 'โรคบาดทะยัก',
        icd10: 'A35',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Clinical Diagnosis / Wound Culture',
        defaultChiefComplaint: 'กล้ามเนื้อขากรรไกรเกร็ง อ้าปากไม่ขึ้น (Trismus) หน้ายิ้มแสยะ หลังแอ่น ชักเกร็งเมื่อถูกกระตุ้น',
        color: '#8b5cf6'
      },
      {
        value: 'JAPANESE_ENCEPHALITIS',
        nameTh: 'ไข้สมองอักเสบเจแปนนิส',
        icd10: 'A83.0',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'JE IgM in CSF / Serum ELISA',
        defaultChiefComplaint: 'ไข้สูง ปวดศีรษะรุนแรง ซึม สับสน ชัก อัมพาต ประวัติถูกยุงรำคาญกัด',
        color: '#8b5cf6'
      },
      {
        value: 'MUMPS',
        nameTh: 'โรคคางทูม',
        icd10: 'B26',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Mumps IgM / Buccal Swab RT-PCR / Amylase',
        defaultChiefComplaint: 'ไข้ เจ็บบริเวณกราม ต่อมน้ำลายหน้าหู (Parotid) บวมโตข้างเดียวหรือสองข้าง',
        color: '#8b5cf6'
      },
      {
        value: 'NEONATAL_TETANUS',
        nameTh: 'บาดทะยักในเด็กแรกเกิด',
        icd10: 'A33',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Clinical Diagnosis',
        defaultChiefComplaint: 'ทารกแรกเกิดอายุ 3-28 วัน ดูดนมได้ตามปกติในตอนแรก ต่อมาไม่ดูดนม ร้องกวน เกร็งและหลังแอ่น',
        color: '#8b5cf6'
      },
      {
        value: 'CONGENITAL_RUBELLA',
        nameTh: 'ไข้หัดเยอรมันแต่กำเนิด',
        icd10: 'P35.0',
        group: 'กลุ่มที่ 2.3: ป้องกันได้ด้วยวัคซีน',
        defaultLab: 'Rubella IgM in Newborn / RT-PCR',
        defaultChiefComplaint: 'ทารกแรกเกิดมีต้อกระจก โรคหัวใจพิการแต่กำเนิด หูหนวก หรือตับม้ามโต',
        color: '#8b5cf6'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.5: ระบบประสาทส่วนกลาง',
    diseases: [
      {
        value: 'MENINGOCOCCAL_MENINGITIS',
        nameTh: 'ไข้กาฬหลังแอ่น',
        icd10: 'A39.0',
        group: 'กลุ่มที่ 2.5: ระบบประสาทส่วนกลาง',
        defaultLab: 'CSF Gram stain & Culture / Neisseria meningitidis PCR / Hemoculture',
        defaultChiefComplaint: 'ไข้สูงเฉียบพลัน ปวดศีรษะรุนแรง คอแข็ง (Stiff neck) ผื่นจุดเลือดออก/ผื่นม่วงคล้ำ',
        color: '#d97706'
      },
      {
        value: 'ENCEPHALITIS',
        nameTh: 'ไข้สมองอักเสบ',
        icd10: 'G04.9',
        group: 'กลุ่มที่ 2.5: ระบบประสาทส่วนกลาง',
        defaultLab: 'CSF Analysis / Viral PCR / MRI Brain',
        defaultChiefComplaint: 'ไข้ ปวดศีรษะ ซึม สับสน พฤติกรรมเปลี่ยนแปลง ชัก อ่อนแรงครึ่งซีก',
        color: '#d97706'
      },
      {
        value: 'MENINGITIS_UNSPECIFIED',
        nameTh: 'เยื่อหุ้มสมองอักเสบที่มิได้ระบุรายละเอียด',
        icd10: 'G03.9',
        group: 'กลุ่มที่ 2.5: ระบบประสาทส่วนกลาง',
        defaultLab: 'Lumbar Puncture (CSF Profile, Culture, Gram stain)',
        defaultChiefComplaint: 'ไข้ ปวดศีรษะ คลื่นไส้อาเจียน คอแข็ง สู้แสงไม่ได้ (Photophobia)',
        color: '#d97706'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.6: นำโดยแมลง',
    diseases: [
      {
        value: 'DENGUE_FEVER',
        nameTh: 'ไข้เลือดออก',
        icd10: 'A91',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Dengue NS1 Ag / Dengue IgM/IgG / CBC (Hct, Plt)',
        defaultChiefComplaint: 'ไข้สูงลอย 3-7 วัน ปวดศีรษะ ปวดกระบอกตา ปวดเมื่อย จุดเลือดออกตามผิวหนัง',
        color: '#f43f5e'
      },
      {
        value: 'DENGUE_SHOCK',
        nameTh: 'ไข้เลือดออกช็อก',
        icd10: 'A91.0',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'CBC (Hct hemoconcentration, Thrombocytopenia) / Dengue Serology',
        defaultChiefComplaint: 'ไข้ลดลงเฉียบพลันแต่กระสับกระส่าย มือเท้าเย็น ชีพจรเบาเร็ว ความดันตก (DSS)',
        color: '#f43f5e'
      },
      {
        value: 'MALARIA',
        nameTh: 'ไข้มาลาเรีย',
        icd10: 'B54',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Thick & Thin Blood Film for Malaria / Malaria Rapid Diagnostic Test (RDT)',
        defaultChiefComplaint: 'ไข้จับสั่น หนาวสั่น ไข้ขึ้นเป็นเวลา เหงื่อออกมาก ประวัติเข้าป่าหรือพื้นที่แพร่เชื้อ',
        color: '#f43f5e'
      },
      {
        value: 'SCRUB_TYPHUS',
        nameTh: 'โรคสครับไทฟัส',
        icd10: 'A75.3',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Scrub Typhus IgM Rapid Test / IFA',
        defaultChiefComplaint: 'ไข้สูง หนาวสั่น ปวดศีรษะ ตาแดง ตรวจพบบาดแผลคล้ายรอยบุหรี่จี้ (Eschar) ต่อมน้ำเหลืองโต',
        color: '#f43f5e'
      },
      {
        value: 'DENGUE',
        nameTh: 'ไข้เด็งกี',
        icd10: 'A90',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Dengue NS1 Ag / Dengue Duo Rapid',
        defaultChiefComplaint: 'ไข้สูงเฉียบพลัน ปวดกระบอกตา ปวดเมื่อยตามตัว มีผื่นแดงตามผิวหนัง',
        color: '#f43f5e'
      },
      {
        value: 'CHIKUNGUNYA',
        nameTh: 'ไข้ปวดข้อยุงลาย (ชิคุนกุนยา)',
        icd10: 'A92.0',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Chikungunya IgM / RT-PCR',
        defaultChiefComplaint: 'ไข้สูงเฉียบพลัน ปวดข้อรุนแรงหลายข้อพร้อมกัน มีผื่นแดง ตาแดง',
        color: '#f43f5e'
      },
      {
        value: 'ZIKA',
        nameTh: 'โรคติดเชื้อไวรัสซิกา',
        icd10: 'A92.8',
        group: 'กลุ่มที่ 2.6: นำโดยแมลง',
        defaultLab: 'Zika virus RT-PCR (Urine/Serum) / IgM',
        defaultChiefComplaint: 'มีไข้ต่ำๆ ผื่นแดง ตาแดง ปวดข้อ ปวดกล้ามเนื้อ (เฝ้าระวังหญิงตั้งครรภ์)',
        color: '#f43f5e'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
    diseases: [
      {
        value: 'SYPHILIS',
        nameTh: 'โรคซิฟิลิส',
        icd10: 'A53.9',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'VDRL / RPR / TPHA / FTA-ABS',
        defaultChiefComplaint: 'แผลริมแข็งที่อวัยวะเพศไม่เจ็บ (Chancre) หรือมีผื่นแดงที่ฝ่ามือฝ่าเท้า',
        color: '#ec4899'
      },
      {
        value: 'CONGENITAL_SYPHILIS',
        nameTh: 'โรคซิฟิลิสแต่กำเนิด',
        icd10: 'A50',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Serum RPR / TPHA in infant & mother',
        defaultChiefComplaint: 'ทารกแรกเกิดมีผื่นลอกที่ฝ่ามือฝ่าเท้า น้ำมูกปนเลือด ดั้งจมูกยุบ ตับม้ามโต',
        color: '#ec4899'
      },
      {
        value: 'GONORRHEA',
        nameTh: 'โรคหนองใน',
        icd10: 'A54',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Gram stain of urethral discharge / N. gonorrhoeae Culture / PCR',
        defaultChiefComplaint: 'ปัสสาวะแสบขัด มีหนองข้นสีเหลืองหรือเขียวไหลจากท่อปัสสาวะ',
        color: '#ec4899'
      },
      {
        value: 'NGU',
        nameTh: 'โรคหนองในเทียม',
        icd10: 'A56.0',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Chlamydia trachomatis PCR / Urethral Swab',
        defaultChiefComplaint: 'ปัสสาวะแสบขัด มีมูกใสหรือมูกขุ่นซึมจากท่อปัสสาวะ คันในท่อปัสสาวะ',
        color: '#ec4899'
      },
      {
        value: 'CHANCROID',
        nameTh: 'โรคแผลริมอ่อน',
        icd10: 'A57',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Haemophilus ducreyi Culture / Gram stain',
        defaultChiefComplaint: 'มีแผลเจ็บที่อวัยวะเพศ ก้นแผลสกปรก เลือดออกง่าย ต่อมน้ำเหลืองที่ขาหนีบอักเสบเป็นหนอง',
        color: '#ec4899'
      },
      {
        value: 'LGV',
        nameTh: 'กามโรคของต่อมและท่อน้ำเหลือง',
        icd10: 'A55',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Chlamydia trachomatis serovars L1-L3 PCR',
        defaultChiefComplaint: 'ต่อมน้ำเหลืองที่ขาหนีบโตเจ็บมาก แตกเป็นรูหนอง (Bubo) มีร่องแบ่ง (Groove sign)',
        color: '#ec4899'
      },
      {
        value: 'GENITAL_HERPES',
        nameTh: 'โรคเริมของอวัยวะสืบพันธุ์และทวารหนัก',
        icd10: 'A60',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'HSV-1/2 PCR / Tzanck Smear',
        defaultChiefComplaint: 'ตุ่มน้ำใสรวมกันเป็นกลุ่ม เจ็บแสบ แตกเป็นแผลตื้นๆ บริเวณอวัยวะเพศหรือทวารหนัก',
        color: '#ec4899'
      },
      {
        value: 'GENITAL_WARTS',
        nameTh: 'โรคหูดอวัยวะเพศและทวารหนัก',
        icd10: 'A63.0',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Clinical Diagnosis / HPV Typing',
        defaultChiefComplaint: 'มีติ่งเนื้อหรือตุ่มนูนคล้ายดอกกะหล่ำบริเวณอวัยวะเพศหรือรอบทวารหนัก ไม่เจ็บ',
        color: '#ec4899'
      },
      {
        value: 'HEP_B_ACUTE',
        nameTh: 'โรคไวรัสตับอักเสบเฉียบพลัน ชนิด บี',
        icd10: 'B16',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'HBsAg, Anti-HBc IgM',
        defaultChiefComplaint: 'อ่อนเพลีย เบื่ออาหาร ตัวเหลืองตาเหลือง ปัสสาวะเข้ม ปวดแน่นใต้ชายโครงขวา',
        color: '#ec4899'
      },
      {
        value: 'HEP_C_ACUTE',
        nameTh: 'โรคไวรัสตับอักเสบเฉียบพลัน ชนิด ซี',
        icd10: 'B17.1',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Anti-HCV / HCV RNA RT-PCR',
        defaultChiefComplaint: 'อ่อนเพลีย คลื่นไส้ ตับอักเสบ ตัวเหลืองตาเหลือง ประวัติสัมผัสเลือดหรือเพศสัมพันธ์',
        color: '#ec4899'
      },
      {
        value: 'HEP_D_ACUTE',
        nameTh: 'โรคไวรัสตับอักเสบเฉียบพลัน ชนิด ดี',
        icd10: 'B17.0',
        group: 'กลุ่มที่ 2.7: ทางเพศสัมพันธ์',
        defaultLab: 'Anti-HDV IgM / HDV RNA',
        defaultChiefComplaint: 'ตับอักเสบรุนแรงร่วมกับการติดเชื้อไวรัสตับอักเสบบี (Co-infection / Superinfection)',
        color: '#ec4899'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.8: จากการสัมผัส',
    diseases: [
      {
        value: 'HFMD',
        nameTh: 'โรคมือเท้าปาก',
        icd10: 'B08.4',
        group: 'กลุ่มที่ 2.8: จากการสัมผัส',
        defaultLab: 'Enterovirus / Coxsackievirus RT-PCR / EV71 Rapid',
        defaultChiefComplaint: 'มีแผลในปาก เจ็บคอ มีตุ่มน้ำใสที่ฝ่ามือ ฝ่าเท้า ก้น มีไข้ต่ำๆ',
        color: '#f59e0b'
      },
      {
        value: 'MELIOIDOSIS',
        nameTh: 'โรคเมลิออยโดสิส',
        icd10: 'A24.1',
        group: 'กลุ่มที่ 2.8: จากการสัมผัส',
        defaultLab: 'Hemoculture / Sputum & Pus Culture for Burkholderia pseudomallei / IFA',
        defaultChiefComplaint: 'ไข้สูงเรื้อรัง หอบเหนื่อย ปอดอักเสบ ฝีหนองในอวัยวะ ประวัติสัมผัสดินโคลนหรือน้ำขัง',
        color: '#f59e0b'
      },
      {
        value: 'ENTEROVIRUS_FEVER',
        nameTh: 'ไข้เอนเทอโรไวรัส',
        icd10: 'B34.1',
        group: 'กลุ่มที่ 2.8: จากการสัมผัส',
        defaultLab: 'Enterovirus PCR / Throat Swab',
        defaultChiefComplaint: 'ไข้เฉียบพลัน เจ็บคอ ปวดกล้ามเนื้อ หรือมีผื่นแดงตามตัว',
        color: '#f59e0b'
      },
      {
        value: 'MPOX',
        nameTh: 'ไข้ฝีดาษวานร (Mpox)',
        icd10: 'B04',
        group: 'กลุ่มที่ 2.8: จากการสัมผัส',
        defaultLab: 'Monkeypox virus Real-time PCR (Lesion swab / crust)',
        defaultChiefComplaint: 'มีไข้ ปวดศีรษะ ต่อมน้ำเหลืองโต มีตุ่มหนอง แผลตกสะเก็ดตามใบหน้า ลำตัว และอวัยวะเพศ',
        color: '#f59e0b'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
    diseases: [
      {
        value: 'RABIES',
        nameTh: 'โรคพิษสุนัขบ้าหรือโรคกลัวน้ำ',
        icd10: 'A82',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Rabies RT-PCR / DFA / Post-Mortem Brain Specimen',
        defaultChiefComplaint: 'กระวนกระวาย กลัวน้ำ กลัวลม กลืนลำบาก กล้ามเนื้อเกร็ง ชัก ประวัติถูกสุนัข/แมวกัด',
        color: '#10b981'
      },
      {
        value: 'LEPTOSPIROSIS',
        nameTh: 'โรคเลปโตสไปโรสิส',
        icd10: 'A27.9',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Leptospira IgM Rapid Test / MAT / Hemoculture',
        defaultChiefComplaint: 'ไข้สูง หนาวสั่น ปวดกล้ามเนื้อน่องรุนแรง ตาแดงก่ำ ปัสสาวะออกน้อย ประวัติย่ำน้ำขัง/แปลงนา',
        color: '#10b981'
      },
      {
        value: 'ANTHRAX',
        nameTh: 'โรคแอนแทรกซ์',
        icd10: 'A22',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Bacillus anthracis Smear & Culture / PCR',
        defaultChiefComplaint: 'ตุ่มแผลสีดำไม่เจ็บ (Black Eschar) หรือไข้ ปอดอักเสบ ประวัติสัมผัสซากสัตว์ตายผิดปกติ',
        color: '#10b981'
      },
      {
        value: 'TRICHINOSIS',
        nameTh: 'โรคทริคิโนสิส',
        icd10: 'B75',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Trichinella Serology / Muscle Biopsy / CBC (Eosinophilia)',
        defaultChiefComplaint: 'ไข้ ปวดกล้ามเนื้อรุนแรง หนังตาบวม หน้าบวม ประวัติรับประทานหมูป่าหรือเนื้อสัตว์ดิบ',
        color: '#10b981'
      },
      {
        value: 'STREP_SUIS',
        nameTh: 'โรคติดเชื้อสเตร็พโตคอคคัสซูอิส',
        icd10: 'A49.1',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Streptococcus suis Hemoculture / CSF Culture',
        defaultChiefComplaint: 'ไข้สูง หนาวสั่น ปวดศีรษะ เยื่อหุ้มสมองอักเสบ สูญเสียการได้ยิน (หูดับ) ประวัติกินหมูดิบ/เลือดหมูดิบ',
        color: '#10b981'
      },
      {
        value: 'BRUCELLOSIS',
        nameTh: 'โรคบรูเซลโลสิส',
        icd10: 'A23',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Brucella Serology (Serum Agglutination Test) / Hemoculture',
        defaultChiefComplaint: 'ไข้เป็นๆ หายๆ (Undulant fever) เหงื่อออกตอนกลางคืน ปวดข้อ ปวดหลัง ประวัติสัมผัสแพะแกะวัว',
        color: '#10b981'
      },
      {
        value: 'AVIAN_INFLUENZA',
        nameTh: 'ไข้หวัดนก',
        icd10: 'J09',
        group: 'กลุ่มที่ 2.9: จากสัตว์สู่คน',
        defaultLab: 'Avian Influenza A (H5N1/H7N9) RT-PCR',
        defaultChiefComplaint: 'ไข้สูง ไอ หอบเหนื่อย หายใจลำบาก ปอดอักเสบรุนแรง ประวัติสัมผัสสัตว์ปีกป่วยหรือตาย',
        color: '#10b981'
      }
    ]
  },
  {
    groupName: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
    diseases: [
      {
        value: 'ACUTE_DIARRHEA',
        nameTh: 'โรคอุจจาระร่วงเฉียบพลัน',
        icd10: 'A09',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'Stool Examination / Hanging Drop / Stool Culture',
        defaultChiefComplaint: 'ถ่ายอุจจาระเหลวเป็นน้ำตั้งแต่ 3 ครั้งขึ้นไป หรือถ่ายเป็นมูกเลือด 1 ครั้งใน 24 ชั่วโมง',
        color: '#6366f1'
      },
      {
        value: 'VIRAL_CONJUNCTIVITIS',
        nameTh: 'โรคตาแดงจากไวรัส',
        icd10: 'B30',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'Clinical Diagnosis / Conjunctival Swab PCR',
        defaultChiefComplaint: 'ตาแดง เคืองตา น้ำตาไหล เปลือกตาบวม มีขี้ตาใสหรือเป็นเมือก ระบาดเป็นกลุ่มก้อน',
        color: '#6366f1'
      },
      {
        value: 'AFP',
        nameTh: 'โรคอัมพาตกล้ามเนื้ออ่อนปวกเปียกเฉียบพลัน (AFP)',
        icd10: 'G82.0',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'Stool for Poliovirus Isolation (2 specimens within 14 days of onset)',
        defaultChiefComplaint: 'เด็กอายุต่ำกว่า 15 ปี มีแขนขาอ่อนแรงปวกเปียกเฉียบพลันภายในระยะเวลาไม่เกิน 14 วัน',
        color: '#6366f1'
      },
      {
        value: 'AEFI',
        nameTh: 'เหตุการณ์ไม่พึงประสงค์ภายหลังได้รับการสร้างเสริมภูมิคุ้มกันโรค (AEFI)',
        icd10: 'T88.1',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'AEFI Expert Investigation & Laboratory Panel',
        defaultChiefComplaint: 'มีอาการผิดปกติ เช่น ไข้สูง ชัก ผื่นแพ้รุนแรง ช็อก อ่อนแรง หลังได้รับวัคซีน',
        color: '#6366f1'
      },
      {
        value: 'FEVER_UNKNOWN',
        nameTh: 'ไข้ไม่ทราบสาเหตุ',
        icd10: 'R50.9',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'CBC, Hemoculture, Malaria film, Dengue serology, Urinalysis',
        defaultChiefComplaint: 'มีไข้สูงเกิน 38°C ต่อเนื่องหลายวันโดยยังไม่พบสาเหตุที่ชัดเจนจากการตรวจเบื้องต้น',
        color: '#6366f1'
      },
      {
        value: 'VIRAL_RASH',
        nameTh: 'ไข้ออกผื่นจากการติดเชื้อไวรัส',
        icd10: 'B09',
        group: 'กลุ่มที่ 3: เฝ้าระวังกลุ่มอาการ',
        defaultLab: 'Measles/Rubella IgM / Viral PCR',
        defaultChiefComplaint: 'มีไข้ร่วมกับผื่นแดงขึ้นตามผิวหนัง กระจายตามใบหน้า ลำตัว หรือแขนขา',
        color: '#6366f1'
      }
    ]
  },
  {
    groupName: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
    diseases: [
      {
        value: 'TB',
        nameTh: 'วัณโรคปอด (Tuberculosis)',
        icd10: 'A15.0',
        group: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
        defaultLab: 'Sputum AFB / GeneXpert MTB/RIF',
        defaultChiefComplaint: 'ไอเรื้อรังเกิน 2 สัปดาห์ ไข้ต่ำๆ ตอนเย็น น้ำหนักลด เหงื่อออกตอนกลางคืน',
        color: '#ea580c'
      },
      {
        value: 'Rabies_Exposure',
        nameTh: 'สัมผัสสัตว์สงสัยโรคพิษสุนัขบ้า (Rabies Exposure)',
        icd10: 'Z20.3',
        group: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
        defaultLab: 'Rabies Post-Exposure Assessment (RIG + Vaccine)',
        defaultChiefComplaint: 'ถูกสุนัข/แมวกัดหรือข่วน มีแผลเลือดออก (WHO Category III)',
        color: '#10b981'
      },
      {
        value: 'RTI_DEAD',
        nameTh: 'อุบัติเหตุจราจรเสียชีวิต (RTI Dead)',
        icd10: 'V89.2',
        group: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
        defaultLab: 'Post-Mortem / Forensic Examination',
        defaultChiefComplaint: 'อุบัติเหตุจราจรทางบก นำส่ง รพ. เสียชีวิตในที่เกิดเหตุหรือที่ รพ.',
        color: '#475569'
      },
      {
        value: 'DROWNING',
        nameTh: 'อุบัติเหตุบาดเจ็บ หรือ จมน้ำเสียชีวิต',
        icd10: 'W65',
        group: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
        defaultLab: 'Emergency Resuscitation / Chest X-Ray',
        defaultChiefComplaint: 'อุบัติเหตุจมน้ำ บาดเจ็บหรือเสียชีวิตในแหล่งน้ำชุมชน',
        color: '#475569'
      },
      {
        value: 'Other',
        nameTh: 'โรคติดต่ออื่นๆ ที่ต้องเฝ้าระวัง',
        icd10: 'Z00',
        group: 'กลุ่มอื่นๆ & อุบัติเหตุเฝ้าระวัง',
        defaultLab: 'General Lab Investigation',
        defaultChiefComplaint: 'อาการเข้าได้กับโรคติดต่อเฝ้าระวังทางระบาดวิทยา',
        color: '#64748b'
      }
    ]
  }
];

// Flat list of all diseases
export const ALL_DISEASES: DiseaseItem[] = DISEASE_GROUPS.flatMap(g => g.diseases);

// Map for quick O(1) lookup
export const DISEASE_LOOKUP: Record<string, DiseaseItem> = ALL_DISEASES.reduce((acc, d) => {
  acc[d.value] = d;
  return acc;
}, {} as Record<string, DiseaseItem>);

// Legacy aliases mapping for backward compatibility
const LEGACY_ALIASES: Record<string, string> = {
  'Dengue': 'DENGUE_FEVER',
  'HFMD': 'HFMD',
  'Influenza': 'INFLUENZA',
  'Diarrhea': 'ACUTE_DIARRHEA',
  'Leptospirosis': 'LEPTOSPIROSIS',
  'Melioidosis': 'MELIOIDOSIS',
  'Chickenpox': 'VARICELLA',
  'Tetanus': 'TETANUS',
  'COVID19': 'COVID-19',
};

export function getDiseaseInfo(codeOrValue: string): DiseaseItem | undefined {
  if (!codeOrValue) return undefined;
  if (DISEASE_LOOKUP[codeOrValue]) {
    return DISEASE_LOOKUP[codeOrValue];
  }
  const mapped = LEGACY_ALIASES[codeOrValue];
  if (mapped && DISEASE_LOOKUP[mapped]) {
    return DISEASE_LOOKUP[mapped];
  }
  // Case-insensitive match fallback
  const found = ALL_DISEASES.find(d => 
    d.value.toLowerCase() === codeOrValue.toLowerCase() ||
    d.nameTh.toLowerCase().includes(codeOrValue.toLowerCase())
  );
  return found;
}

export function getDiseaseNameTh(codeOrValue: string): string {
  const info = getDiseaseInfo(codeOrValue);
  return info?.nameTh || codeOrValue;
}

export function getDiseaseColor(codeOrValue: string): { main: string; border: string; bg: string } {
  const info = getDiseaseInfo(codeOrValue);
  const color = info?.color || '#3b82f6';
  return {
    main: color,
    border: color,
    bg: `${color}15`,
  };
}
