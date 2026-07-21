'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Loader2, BotMessageSquare, ChevronDown, CheckCircle2 } from 'lucide-react';
import { ChatMessages } from './ChatMessages';
import { InitialForm } from './InitialForm';
import { ContactOptions } from './ContactOptions';
import { config } from '@/lib/config';

interface MachineResult {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string;
  precio: number;
  estado: string;
  foto: string;
  url: string;
}

const TIPOS_BUSQUEDA = [
  'excavadora', 'excavator',
  'retroexcavadora', 'retroexcavator', 'backhoe',
  'bulldozer',
  'motoniveladora', 'motor grader', 'grader',
  'rodillo', 'roller', 'compactor',
  'cargador', 'loader', 'front loader',
  'mini cargador', 'mini loader', 'skid steer',
  'camión', 'camion articulado', 'truck', 'dump truck', 'articulated truck',
  'inventario', 'maquinaria', 'máquina', 'inventory', 'machinery', 'machine',
];

function detectarQuery(messages: any[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const msg = messages[i];
    if (msg.role !== 'user') continue;
    const texto = (msg.parts || [])
      .filter((p: any) => p.type === 'text')
      .map((p: any) => p.text)
      .join(' ')
      .toLowerCase();
    for (const tipo of TIPOS_BUSQUEDA) {
      if (texto.includes(tipo)) return tipo;
    }
  }
  return null;
}

export function ChatBot() {
  const [mounted, setMounted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [leadData, setLeadData] = useState<{name: string, phone: string, email: string} | null>(null);
  const [isSendingLead, setIsSendingLead] = useState(false);
  const [leadSent, setLeadSent] = useState(false);
  const [maquinasPorMsg, setMaquinasPorMsg] = useState<Record<string, MachineResult[]>>({});

  const chatMessagesRef = useRef<HTMLDivElement>(null);
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leadDataRef = useRef<typeof leadData>(null);
  const leadSentRef = useRef(false);
  const messagesRef = useRef<any[]>([]);

  const chat = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat-local' }),
    id: 'callidonsito-v1',
  });

  const { messages, status, sendMessage } = chat;
  const isLoading = status === 'streaming' || status === 'submitted';

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    leadDataRef.current = leadData;
  }, [leadData]);

  useEffect(() => {
    leadSentRef.current = leadSent;
  }, [leadSent]);

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const enviarLead = useCallback(async () => {
    const data = leadDataRef.current;
    if (!data || leadSentRef.current) return;

    setIsSendingLead(true);
    const msgs = messagesRef.current;
    const conversationText = msgs
      .map(m => {
        const text = (m.parts || [])
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join(' ');
        if (!text) return null;
        return `${m.role === 'user' ? 'Cliente' : 'Callidonsito'}: ${text}`;
      })
      .filter(Boolean)
      .join('\n\n');

    try {
      const response = await fetch(`${config.djangoApiUrl}/api/guardar-lead/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: data.name,
          phone: data.phone,
          mail: data.email,
          conversation: conversationText,
        }),
      });
      const res = await response.json();
      console.log('Django Response:', res);
      setLeadSent(true);
    } catch (error) {
      console.error("Error enviando lead:", error);
      try {
        await fetch('/api/send-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: data.name,
            phone: data.phone,
            mail: data.email,
            conversation: conversationText,
          }),
        });
        setLeadSent(true);
      } catch (fallbackErr) {
        console.error("Fallback error:", fallbackErr);
      }
    } finally {
      setIsSendingLead(false);
    }
  }, []);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (leadSentRef.current) return;
    inactivityTimerRef.current = setTimeout(() => {
      enviarLead();
    }, config.inactivityTimeoutMs);
  }, [clearInactivityTimer, enviarLead]);

  useEffect(() => {
    setMounted(true);
    return () => clearInactivityTimer();
  }, []);

  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role !== 'assistant') return;

    const key = String(messages.length - 1);
    if (maquinasPorMsg[key]) return;

    const query = detectarQuery(messages);
    if (!query) return;

    console.log('[ChatBot] Detectada consulta:', query, 'msg index:', key);
    fetch(`/api/chat-local?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        console.log('[ChatBot] Máquinas recibidas:', data.maquinas?.length);
        if (data.maquinas?.length > 0) {
          setMaquinasPorMsg(prev => ({ ...prev, [key]: data.maquinas }));
        }
      })
      .catch(err => console.error('[ChatBot] Error fetching machines:', err));
  }, [messages, isLoading]);

  useEffect(() => {
    if (formSubmitted && !leadSent) {
      resetInactivityTimer();
    }
  }, [messages, formSubmitted, leadSent, resetInactivityTimer]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  const handleFormSubmit = async (formData: { name: string; phone: string; email: string }) => {
    setLeadData(formData);
    setFormSubmitted(true);

    setTimeout(async () => {
      if (typeof sendMessage === 'function') {
        try {
          await sendMessage({
            text: `Hi, I'm ${formData.name}. I'm looking for heavy machinery advice. Contact: ${formData.email}, ${formData.phone}.`
          });
        } catch (err) {
          console.error("Error inicial:", err);
        }
      }
    }, 400);
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    const content = localInput.trim();
    if (!content || isLoading) return;

    if (typeof sendMessage === 'function') {
      try {
        setLocalInput('');
        await sendMessage({ text: content });
      } catch (err) {
        console.error("Error en envío:", err);
        setLocalInput(content);
      }
    }
  };

  if (!mounted) return <div className="h-screen bg-[#0f0f10]" />;

  return (
    <div className="flex flex-col h-screen bg-[#0f0f10] text-[#ECF0F1] selection:bg-[#F39C12]/30 overflow-hidden">

      {/* HEADER */}
      <header className="shrink-0 z-50 bg-[#0f0f10]/80 backdrop-blur-xl border-b border-white/5 px-6 py-4">
        <div className="flex items-center justify-between max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#F39C12] to-[#E67E22] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(243,156,18,0.2)] overflow-hidden p-1">
              <Image src="/icono.webp" alt="Logo" width={40} height={40} className="object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-black tracking-tighter uppercase">{config.chatbotName}</h1>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Online</p>
              </div>
            </div>
          </div>

          {formSubmitted && (
            <div className="flex items-center gap-4">
               {leadSent ? (
                 <span className="flex items-center gap-1 text-[10px] text-green-500 font-bold uppercase tracking-widest bg-green-500/10 px-3 py-2 rounded-full border border-green-500/20">
                    <CheckCircle2 size={14} /> Sent
                  </span>
                ) : (
                  <button
                    onClick={enviarLead}
                    disabled={isSendingLead}
                    className="text-[10px] font-bold uppercase tracking-widest bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white px-3 py-2 rounded-full border border-red-500/20 transition-all disabled:opacity-50"
                  >
                    {isSendingLead ? 'Sending...' : 'End Chat'}
                 </button>
               )}
            </div>
          )}
        </div>
      </header>

      <main className="flex-1 relative flex flex-col overflow-hidden">
        <AnimatePresence mode="wait">
          {!formSubmitted ? (
            <motion.div
              key="welcome"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_center,_#1c1c1f_0%,_#0f0f10_100%)]"
            >
              <div className="max-w-xl mx-auto py-12 px-6 flex flex-col items-center">

                <div className="relative w-full aspect-video mb-8 group">
                  <div className="absolute inset-0 bg-[#F39C12]/10 blur-3xl rounded-full transition-all group-hover:bg-[#F39C12]/20" />
                  <Image
                    src="/callidon-logo.png"
                    alt="Logo Callidon"
                    fill
                    className="object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>

                <div className="w-full bg-[#161618] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F39C12] text-dark px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Support
                  </div>
                  <InitialForm onSubmit={handleFormSubmit} />
                </div>

                <div className="mt-8 opacity-20 animate-bounce">
                  <ChevronDown size={24} />
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex-1 flex flex-col overflow-hidden">
              <div ref={chatMessagesRef} className="flex-1 overflow-y-auto custom-scrollbar p-6">
                <div className="max-w-4xl mx-auto space-y-6">
                  <ChatMessages messages={messages} isLoading={isLoading} maquinasPorMsg={maquinasPorMsg} />

                  {messages.length > 1 && !isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                      <ContactOptions />
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="p-6 bg-gradient-to-t from-[#0f0f10] to-transparent">
                <form
                  onSubmit={handleSendMessage}
                  className="max-w-4xl mx-auto flex gap-3 items-center bg-[#161618] p-2 rounded-2xl border border-white/5 shadow-2xl group focus-within:border-[#F39C12]/50 transition-all relative z-50"
                >
                  <div className="pl-4 text-[#F39C12]"><BotMessageSquare size={20} /></div>
                  <input
                    type="text"
                    value={localInput}
                    onChange={(e) => {
                      setLocalInput(e.target.value);
                      resetInactivityTimer();
                    }}
                    placeholder="Looking for an excavator, backhoe or roller?"
                    className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-600 font-medium"
                    autoComplete="off"
                    disabled={isLoading || leadSent}
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !localInput.trim() || leadSent}
                    className="bg-[#F39C12] hover:bg-[#E67E22] text-dark p-4 rounded-xl transition-all active:scale-95 disabled:opacity-20 shadow-lg shadow-orange-500/20"
                  >
                    {isLoading ? <Loader2 className="animate-spin" size={20} /> : <SendHorizonal size={20} strokeWidth={3} />}
                  </button>
                </form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
