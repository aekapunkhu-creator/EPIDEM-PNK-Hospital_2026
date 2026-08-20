import React, { useState } from 'react';
import {
  X,
  Bot,
  Sparkles,
  Send,
  User,
  CheckCircle2,
  HelpCircle,
  ShieldCheck,
  Flame,
  Hospital
} from 'lucide-react';
import { DiseaseReport, OutbreakEvent } from '../types';

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  reports: DiseaseReport[];
  outbreaks: OutbreakEvent[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  time: string;
}

export const AiAssistantModal: React.FC<AiAssistantModalProps> = ({
  isOpen,
  onClose,
  reports,
  outbreaks,
}) => {
  if (!isOpen) return null;

  const [inputMessage, setInputMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_1',
      sender: 'ai',
      text: `สวัสดีครับ ผมคือ **หมอระบาดวิทยา AI ประจำโรงพยาบาลโพนนาแก้ว** 🏥
ผมสามารถช่วยท่าน:
• แนะนำขั้นตอนการสอบสวนโรคและเกณฑ์ Case Definition
• วิเคราะห์ความเสี่ยงคลัสเตอร์ไข้เลือดออก และคำนวณมาตรการ 3-3-1
• ให้แนวทางควบคุมโรคมือเท้าปากในศูนย์เด็กเล็ก / โรคไข้ฉี่หนูในแปลงนา
• ร่างข้อเสนอแนะเชิงมาตรการเพื่อนำเสนอผู้บริหาร/นายแพทย์ สสอ.

มีประเด็นใดที่ต้องการให้ผมช่วยวิเคราะห์ไหมครับ?`,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (customPrompt?: string) => {
    const textToSend = customPrompt || inputMessage;
    if (!textToSend.trim()) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'user',
      text: textToSend,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    if (!customPrompt) setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini/chat-assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: textToSend,
          contextData: {
            hospital: 'โรงพยาบาลโพนนาแก้ว สกลนคร',
            totalReports: reports.length,
            activeOutbreaks: outbreaks.filter(o => o.status === 'active'),
            dengueCases: reports.filter(r => r.disease === 'Dengue').length,
            hfmdCases: reports.filter(r => r.disease === 'HFMD').length,
            leptospirosisCases: reports.filter(r => r.disease === 'Leptospirosis').length,
          }
        })
      });

      const data = await response.json();
      const aiMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: data.reply || 'ขอบคุณสำหรับคำถาม ระบบกำลังประมวลผลข้อมูลระบาดวิทยาครับ',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
      const errorMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'ai',
        text: 'ขออภัยครับ ไม่สามารถติดต่อเซิร์ฟเวอร์ AI ได้ในขณะนี้ โปรดตรวจสอบการเชื่อมต่ออินเทอร์เน็ต',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const quickQuestions = [
    'แนวทางควบคุมไข้เลือดออก 3-3-1 ในหมู่ 1 ต.นาแก้ว',
    'เกณฑ์การสั่งปิดศูนย์พัฒนาเด็กเล็กกรณีพบโรคมือเท้าปาก (HFMD)',
    'ข้อบ่งชี้การให้ Doxycycline ป้องกันโรคไข้ฉี่หนูแก่เกษตรกร',
    'วิธีการคำนวณ House Index (HI) และ Breteau Index (BI)'
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm">
      <div className="bg-slate-900 border border-purple-500/40 rounded-2xl w-full max-w-3xl h-[88vh] flex flex-col shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 border-b border-purple-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/40 flex items-center justify-center font-bold">
              <Sparkles className="w-4 h-4 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-white">ผู้ช่วย AI ระบาดวิทยา (Gemini Field Epi Advisor)</h2>
                <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-purple-900/80 text-purple-200 border border-purple-400/40">
                  รพ.โพนนาแก้ว
                </span>
              </div>
              <p className="text-[11px] text-slate-400">ระบบปัญญาประดิษฐ์ให้คำปรึกษางานควบคุมโรคและการสอบสวนโรค</p>
            </div>
          </div>

          <button onClick={onClose} className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat History Container */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-300">
          {messages.map(msg => {
            const isAi = msg.sender === 'ai';
            return (
              <div key={msg.id} className={`flex gap-3 ${isAi ? 'items-start' : 'items-end justify-end'}`}>
                {isAi && (
                  <div className="w-7 h-7 rounded-lg bg-purple-900/80 text-amber-300 border border-purple-500/40 flex items-center justify-center font-bold flex-shrink-0 mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                
                <div className={`p-3.5 rounded-2xl max-w-[85%] leading-relaxed ${
                  isAi
                    ? 'bg-slate-800/90 text-slate-200 border border-slate-700/80 shadow'
                    : 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-br-none shadow-md'
                }`}>
                  <div className="whitespace-pre-wrap font-sans text-xs">{msg.text}</div>
                  <div className={`text-[10px] mt-1.5 ${isAi ? 'text-slate-500' : 'text-teal-200'} text-right`}>
                    {msg.time}
                  </div>
                </div>

                {!isAi && (
                  <div className="w-7 h-7 rounded-lg bg-teal-900/80 text-teal-300 border border-teal-500/40 flex items-center justify-center font-bold flex-shrink-0">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-300 bg-purple-950/40 p-3 rounded-xl border border-purple-500/30 w-fit">
              <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
              <span>หมอระบาดวิทยา AI กำลังวิเคราะห์ข้อมูลและแนวทางปฏิบัติ...</span>
            </div>
          )}
        </div>

        {/* Quick Question Prompts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center gap-2 overflow-x-auto">
          <span className="text-[10px] text-slate-500 whitespace-nowrap">ตัวอย่างคำถาม:</span>
          {quickQuestions.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 bg-slate-800 hover:bg-purple-900/50 hover:border-purple-500/40 border border-slate-700 rounded-lg text-[11px] text-slate-300 hover:text-purple-200 whitespace-nowrap transition"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2">
          <input
            type="text"
            placeholder="พิมพ์คำถามระบาดวิทยา เช่น ขอแนวทางการสอบสวนโรคเมลิออยโดสิส..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputMessage.trim() || isLoading}
            className="p-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 text-white rounded-xl shadow transition"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
};
