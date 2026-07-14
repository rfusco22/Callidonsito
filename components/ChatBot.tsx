'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { SendHorizonal, Loader2, BotMessageSquare, Headphones, ChevronDown } from 'lucide-react';
import { ChatMessages } from './ChatMessages';
import { InitialForm } from './InitialForm';
import { ContactOptions } from './ContactOptions';
import { config } from '@/lib/config';

export function ChatBot() {
  const [mounted, setMounted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const chatMessagesRef = useRef<HTMLDivElement>(null);

  // Inicializamos useChat. 
  // Nota: Si cambiaste a OpenAI en el route.ts, esto funcionará igual.
  const chat = useChat({ 
    api: '/api/chat',
    id: 'callidonsito-v1',
  });

  const { messages, status, sendMessage } = chat;
  const isLoading = chat.isLoading || status === 'streaming' || status === 'submitted';

  useEffect(() => {
    setMounted(true);
  }, []);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleFormSubmit = async (formData: { name: string; phone: string; email: string }) => {
    setFormSubmitted(true);
    
    setTimeout(async () => {
      if (typeof sendMessage === 'function') {
        try {
          // Usamos el formato de objeto { text } que requiere tu versión de la SDK
          await sendMessage({ 
            text: `Hola, soy ${formData.name}. Busco asesoría en maquinaria pesada. Contacto: ${formData.email}, ${formData.phone}.` 
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
      
      {/* HEADER TÉCNICO PREMIUM */}
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
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">Soporte en Vivo</p>
              </div>
            </div>
          </div>
          <div className="hidden sm:flex items-center gap-4 opacity-50">
             <Headphones size={18} />
             <div className="h-4 w-[1px] bg-white/10" />
             <span className="text-[10px] font-bold uppercase tracking-widest">Callidon Equipment Inc.</span>
          </div>
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
                
                {/* HERO VISUAL */}
                <div className="relative w-full aspect-video mb-8 group">
                  <div className="absolute inset-0 bg-[#F39C12]/10 blur-3xl rounded-full transition-all group-hover:bg-[#F39C12]/20" />
                  <Image 
                    src="/callidon-logo.png" 
                    alt="Retroexcavadora" 
                    fill 
                    className="object-contain relative z-10 drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                    priority
                  />
                </div>

                {/* FORMULARIO */}
                <div className="w-full bg-[#161618] p-8 rounded-[2rem] border border-white/5 shadow-2xl relative">
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[#F39C12] text-dark px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg">
                    Registro de Asesoría
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
                  <ChatMessages messages={messages} isLoading={isLoading} />
                  
                  {/* Solo mostrar contacto cuando la IA ya respondió algo */}
                  {messages.length > 1 && !isLoading && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="pt-4">
                      <ContactOptions />
                    </motion.div>
                  )}
                </div>
              </div>

              {/* INPUT BAR PROFESIONAL */}
              <div className="p-6 bg-gradient-to-t from-[#0f0f10] to-transparent">
                <form 
                  onSubmit={handleSendMessage} 
                  className="max-w-4xl mx-auto flex gap-3 items-center bg-[#161618] p-2 rounded-2xl border border-white/5 shadow-2xl group focus-within:border-[#F39C12]/50 transition-all relative z-50"
                >
                  <div className="pl-4 text-[#F39C12]"><BotMessageSquare size={20} /></div>
                  <input
                    type="text"
                    value={localInput}
                    onChange={(e) => setLocalInput(e.target.value)}
                    placeholder="¿Buscas una excavadora, retro o rodillo?"
                    className="flex-1 bg-transparent py-4 text-sm outline-none placeholder:text-slate-600 font-medium"
                    autoComplete="off"
                    disabled={isLoading}
                  />
                  <button 
                    type="submit"
                    disabled={isLoading || !localInput.trim()}
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