import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import { createServer as createViteServer } from 'vite';

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Lazy get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
}

// 1. Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    hospital: 'โรงพยาบาลโพนนาแก้ว',
    hasApiKey: Boolean(process.env.GEMINI_API_KEY),
    time: new Date().toISOString()
  });
});

// 2. AI Outbreak Curve & Risk Analysis
app.post('/api/gemini/analyze-outbreak', async (req, res) => {
  try {
    const { outbreak, cases, contacts, subdistrict } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      // Fallback rule-based analysis if key not set
      return res.json({
        analysis: `[การวิเคราะห์เบื้องต้นโดยระบบอัตโนมัติ]
• รูปแบบการระบาด: คลัสเตอร์ในพื้นที่ ${subdistrict || 'อ.โพนนาแก้ว'} มีผู้ป่วยสะสม ${cases?.length || 0} ราย
• ความเสี่ยง: แหล่งแพร่เชื้อน่าจะเป็นพาหะหรือการสัมผัสใกล้ชิดในกลุ่มคน
• มาตรการเร่งด่วน: ปฏิบัติตามมาตรการ 3-3-1 ตัดวงจรการแพร่เชื้อ และติดตามผู้สัมผัส ${contacts?.length || 0} ราย`,
        hypothesis: 'แหล่งแพร่โรคร่วมในสถานที่ชุมนุมหรือสภาพแวดล้อมที่มีพาหะนำโรค',
        recommendedActions: [
          'ควบคุมแหล่งเพาะพันธุ์/จุดสัมผัสร่วมทันที',
          'เฝ้าระวังผู้มีอาการสงสัยในรัศมี 100 เมตร ทุกวัน',
          'ประสานทีม SRRT ระดับอำเภอและ รพ.สต. เพื่อเปิด EOC'
        ]
      });
    }

    const prompt = `คุณคือผู้เชี่ยวชาญด้านระบาดวิทยาภาคสนาม (Field Epidemiologist) และแพทย์ผู้เชี่ยวชาญด้านการควบคุมโรคติดต่อ สังกัดกรมควบคุมโรค กระทรวงสาธารณสุข ประเทศไทย
กรุณาวิเคราะห์ข้อมูลเหตุการณ์ระบาด (Outbreak) ของโรงพยาบาลโพนนาแก้ว จังหวัดสกลนคร ต่อไปนี้:

ข้อมูลเหตุการณ์:
- ชื่อเหตุการณ์: ${outbreak?.title || 'การระบาดในพื้นที่'}
- โรค: ${outbreak?.diseaseNameTh || outbreak?.disease}
- พื้นที่: ${outbreak?.villageName} ${outbreak?.subdistrict} อ.โพนนาแก้ว จ.สกลนคร
- สถานที่เกิดโรค: ${outbreak?.specificLocation}
- จำนวนผู้ป่วย: ${cases?.length || outbreak?.totalCases || 0} ราย (ยืนยัน ${outbreak?.confirmedCases || 0} ราย)
- ผู้สัมผัส: ${contacts?.length || outbreak?.contactsCount || 0} ราย
- ประชากรกลุ่มเสี่ยง: ${outbreak?.populationAtRisk || 0} คน
- วันที่เริ่มป่วยรายแรก: ${outbreak?.startDate}
- ผู้ป่วยในเหตุการณ์: ${JSON.stringify(cases || [])}

กรุณาให้ผลลัพธ์เป็นภาษาไทยที่เป็นทางการ ถูกต้องตามหลักการระบาดวิทยา:
1. การแปลผล Epidemic Curve และลักษณะการระบาด (เช่น Common source, Propagated, หรือ Point source)
2. สมมติฐานสาเหตุ แหล่งแพร่โรค และกลไกการถ่ายทอดโรค (Hypothesis of transmission)
3. การประเมินความเสี่ยงและอัตราการเกิดโรค (Secondary Attack Rate analysis)
4. ข้อเสนอแนะมาตรการควบคุมโรคเฉพาะจุดตามมาตรฐาน สคร. และกรมควบคุมโรค`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({
      analysis: response.text,
      success: true
    });
  } catch (error: any) {
    console.error('Error analyzing outbreak:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze outbreak' });
  }
});

// 3. AI Investigation Report Generator
app.post('/api/gemini/generate-investigation-report', async (req, res) => {
  try {
    const { report, investigation, contacts } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reportText: `แบบรายงานการสอบสวนโรคเฉพาะราย (ฉบับย่อ)
โรงพยาบาลโพนนาแก้ว อำเภอโพนนาแก้ว จังหวัดสกลนคร
------------------------------------------------
1. ข้อมูลผู้ป่วย: ${report?.patient?.prefix}${report?.patient?.firstName} ${report?.patient?.lastName} อายุ ${report?.patient?.age} ปี
ที่อยู่: ${report?.patient?.address} ${report?.patient?.villageName} ${report?.patient?.subdistrict}
2. การวินิจฉัย: ${report?.diseaseNameTh} (${report?.icd10})
3. ประวัติการป่วย: เริ่มป่วยเมื่อ ${report?.onsetDate} ด้วยอาการ ${report?.chiefComplaint}
4. ผลการตรวจทางห้องปฏิบัติการ: ${report?.labResult?.result || '-'}
5. มาตรการควบคุมโรค: ดำเนินการควบคุมโรคในพื้นที่และติดตามผู้สัมผัส ${contacts?.length || 0} ราย`,
        success: true
      });
    }

    const prompt = `คุณคือนักวิชาการสาธารณสุข/แพทย์ระบาดวิทยา ทีม SRRT โรงพยาบาลโพนนาแก้ว จังหวัดสกลนคร
กรุณาร่าง "แบบรายงานการสอบสวนโรคทางระบาดวิทยาฉบับสมบูรณ์ (Epidemiological Investigation Report)" ตามแบบฟอร์มมาตรฐานของกรมควบคุมโรค กระทรวงสาธารณสุข จากข้อมูลจริงต่อไปนี้:

ข้อมูลผู้ป่วยและรายงานโรค:
${JSON.stringify(report, null, 2)}

ข้อมูลการสอบสวนโรคและ Timeline:
${JSON.stringify(investigation, null, 2)}

ข้อมูลผู้สัมผัสโรค:
${JSON.stringify(contacts, null, 2)}

กรุณาร่างรายงานอย่างละเอียด มีหัวข้อหลัก:
1. บทคัดย่อ/สรุปเหตุการณ์ (Executive Summary)
2. ความเป็นมาและวัตถุประสงค์ (Background & Objectives)
3. วิธีการสอบสวนโรค (Methodology - การทบทวนเวชระเบียน, การสัมภาษณ์, การลงพื้นที่สำรวจสิ่งแวดล้อม/ดัชนีลูกน้ำยุงลาย)
4. ผลการสอบสวนโรค (Results - ข้อมูลบุคคล เวลา สถานที่ Timeline อาการ ผล Lab)
5. การประเมินความเสี่ยงและแหล่งแพร่เชื้อ (Risk Assessment & Transmission)
6. การดำเนินมาตรการควบคุมและป้องกันโรค (Control Measures Taken & Follow-up)
7. ข้อเสนอแนะและบทเรียนที่ได้รับ (Recommendations & Lessons Learned)
8. คณะผู้สอบสวนโรค (ทีม SRRT รพ.โพนนาแก้ว และ สสอ.โพนนาแก้ว)`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({
      reportText: response.text,
      success: true
    });
  } catch (error: any) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: error.message || 'Failed to generate report' });
  }
});

// 4. AI Disease Control Recommendations
app.post('/api/gemini/control-recommendation', async (req, res) => {
  try {
    const { disease, subdistrict, villageName, locationType, caseCount } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        recommendations: [
          'ค้นหาผู้สัมผัสและผู้ป่วยเพิ่มเติมเชิงรุก (Active Case Finding)',
          'ทำลายแหล่งเพาะพันธุ์และพ่นสารเคมีควบคุมพาหะ',
          'ให้สุขศึกษาประชาสัมพันธ์ผ่านหอกระจายข่าวหมู่บ้าน',
          'เฝ้าระวังผู้มีอาการคล้ายกันในพื้นที่เป็นเวลา 2 เท่าของระยะฟักตัว'
        ]
      });
    }

    const prompt = `ในฐานะผู้เชี่ยวชาญด้านการควบคุมโรคติดต่อในระดับอำเภอ (โรงพยาบาลโพนนาแก้ว จังหวัดสกลนคร)
กรุณาแนะนำ Action Plan และ Checklist มาตรการควบคุมโรคเฉพาะทางสำหรับ:
- โรค: ${disease}
- พื้นที่: ${villageName} ${subdistrict} อ.โพนนาแก้ว จ.สกลนคร
- ประเภทสถานที่: ${locationType || 'ชุมชนทั่วไป / โรงเรียน'}
- จำนวนเคสที่พบ: ${caseCount || 1} ราย

ให้ออกมาเป็นรายการมาตรการที่ปฏิบัติได้จริงตามระเบียบ สธ. เช่น มาตรการ 3-3-1 (กรณีไข้เลือดออก), การทำลายเชื้อ, การกักกัน/แยกโรค, การให้ยา Prophylaxis, การตรวจ Lab และการประสาน อสม.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: prompt,
    });

    res.json({
      recommendationText: response.text,
      success: true
    });
  } catch (error: any) {
    console.error('Error getting control recommendations:', error);
    res.status(500).json({ error: error.message || 'Failed' });
  }
});

// 5. AI Epidemiologist Chat Assistant
app.post('/api/gemini/chat-assistant', async (req, res) => {
  try {
    const { message, contextData } = req.body;
    const ai = getGeminiClient();

    if (!ai) {
      return res.json({
        reply: `ยินดีต้อนรับสู่ระบบงานระบาดวิทยา รพ.โพนนาแก้ว ครับ
คำถามของคุณเกี่ยวกับ: "${message}"
คำแนะนำเบื้องต้น: สำหรับอำเภอโพนนาแก้ว โรคเฝ้าระวังสำคัญตามฤดูกาลได้แก่ ไข้เลือดออก (มาตรการ 3-3-1), โรคมือเท้าปากในศูนย์เด็กเล็ก, ไข้ฉี่หนูในเกษตรกร และอุจจาระร่วงเฉียบพลันจากงานเลี้ยง หากต้องการสอบสวนโรค กรุณาเปิดเมนู 'สอบสวนโรค' เพื่อบันทึก Timeline และประเมินความเสี่ยงครับ`
      });
    }

    const systemInstruction = `คุณคือ "หมอระบาดวิทยา AI ประจำโรงพยาบาลโพนนาแก้ว จังหวัดสกลนคร (PNK EPI AI Assistant)"
มีความเชี่ยวชาญด้าน:
1. การเฝ้าระวัง สอบสวน และควบคุมโรคติดต่อ (Surveillance, Investigation, Contact Tracing, Outbreak Response)
2. กฎหมายโรคติดต่อ พ.ศ. 2558 และแนวทางกรมควบคุมโรค กระทรวงสาธารณสุข
3. มาตรการเฉพาะโรค เช่น ไข้เลือดออก (3-3-1, ดัชนี HI/CI/BI), โรคมือเท้าปาก (EV71 vs CA16, การปิดสถานศึกษา), ไข้ฉี่หนู (Leptospirosis, Doxycycline prophylaxis), เมลิออยโดสิส, อาหารเป็นพิษ/อุจจาระร่วง
4. บริบทพื้นที่อำเภอโพนนาแก้ว จังหวัดสกลนคร (5 ตำบล: นาแก้ว, บ้านแป้น, บ้านแก้ง, นาทม, เชียงสือ)

ตอบอย่างสุภาพ กระชับ ถูกต้องตามหลักการแพทย์และสาธารณสุขไทย พร้อมคำแนะนำที่นำไปปฏิบัติได้จริงในงาน SRRT`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.7-flash',
      contents: `บริบทสถานการณ์ปัจจุบันในระบบ PNK EPI:
${JSON.stringify(contextData || {})}

คำถามจากเจ้าหน้าที่:
${message}`,
      config: {
        systemInstruction,
      }
    });

    res.json({
      reply: response.text,
      success: true
    });
  } catch (error: any) {
    console.error('Error in chat assistant:', error);
    res.status(500).json({ error: error.message || 'Failed' });
  }
});

// Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🏥 PNK EPI Server running on port ${PORT}`);
  });
}

startServer();
