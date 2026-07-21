'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState, useRef, useCallback, useEffect } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { InitialForm } from '@/components/InitialForm';
import { ContactOptions } from '@/components/ContactOptions';
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

export default function WidgetPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string; email: string } | null>(null);
  const [leadSent, setLeadSent] = useState(false);
  const [localInput, setLocalInput] = useState('');
  const [maquinasPorMsg, setMaquinasPorMsg] = useState<Record<string, MachineResult[]>>({});
  const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);
  const leadSentRef = useRef(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: '/api/chat-local' }),
    id: 'widget-chat',
  });
  const isLoading = status === 'streaming' || status === 'submitted';

  const clearInactivityTimer = useCallback(() => {
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
      inactivityTimerRef.current = null;
    }
  }, []);

  const enviarLeadWidget = useCallback(async () => {
    if (!userInfo || leadSentRef.current) return;
    const conversationText = messages
      .map(m => {
        const text = m.parts
          .filter((p: any) => p.type === 'text')
          .map((p: any) => p.text)
          .join(' ');
        if (!text) return null;
        return `${m.role === 'user' ? 'Cliente' : 'Callidonsito'}: ${text}`;
      })
      .filter(Boolean)
      .join('\n\n');

    try {
      await fetch(`${config.djangoApiUrl}/api/guardar-lead/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: userInfo.name,
          phone: userInfo.phone,
          mail: userInfo.email,
          conversation: conversationText,
        }),
      });
    } catch (err) {
      console.error('Error sending lead from widget:', err);
      try {
        await fetch('/api/send-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            fullName: userInfo.name,
            phone: userInfo.phone,
            mail: userInfo.email,
            conversation: conversationText,
          }),
        });
      } catch (fallbackErr) {
        console.error('Fallback error:', fallbackErr);
      }
    }
    leadSentRef.current = true;
    setLeadSent(true);
  }, [userInfo, messages]);

  const resetInactivityTimer = useCallback(() => {
    clearInactivityTimer();
    if (leadSentRef.current) return;
    inactivityTimerRef.current = setTimeout(() => {
      enviarLeadWidget();
    }, config.inactivityTimeoutMs);
  }, [clearInactivityTimer, enviarLeadWidget]);

  const [, forceUpdate] = useState(0);
  const resetTimer = useCallback(() => {
    resetInactivityTimer();
    forceUpdate(n => n + 1);
  }, [resetInactivityTimer]);

  const handleFormSubmit = (formData: { name: string; phone: string; email: string }) => {
    setUserInfo(formData);
    setFormSubmitted(true);

    const initialMessage = `Hi, I'm ${formData.name}. I'm looking for heavy machinery advice. Contact: ${formData.email}, ${formData.phone}.`;
    sendMessage({ text: initialMessage });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const content = localInput.trim();
    if (content) {
      sendMessage({ text: content });
      setLocalInput('');
    }
  };

  const checkIfShouldShowContact = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const text = lastMessage.parts
        .filter((p: any) => p.type === 'text')
        .map((p: any) => p.text)
        .join(' ');
      return (
        text.toLowerCase().includes('contact') ||
        text.toLowerCase().includes('call') ||
        text.toLowerCase().includes('whatsapp') ||
        text.toLowerCase().includes('email')
      );
    }
    return false;
  };

  useEffect(() => {
    if (isLoading || messages.length === 0) return;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg?.role !== 'assistant') return;

    const key = String(messages.length - 1);
    if (maquinasPorMsg[key]) return;

    const query = detectarQuery(messages);
    if (!query) return;

    fetch(`/api/chat-local?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        if (data.maquinas?.length > 0) {
          setMaquinasPorMsg(prev => ({ ...prev, [key]: data.maquinas }));
        }
      })
      .catch(() => {});
  }, [messages, isLoading]);

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-dark via-dark to-dark overflow-hidden">
      {!formSubmitted ? (
        <div className="flex items-center justify-center flex-1 px-4">
          <div className="w-full max-w-sm">
            <InitialForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          <div className="px-4 pt-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em]">{config.chatbotName} - Online</span>
              {leadSent && (
                <span className="ml-auto text-[10px] text-green-500 font-bold">✓ Sent</span>
              )}
            </div>
          </div>

          <ChatMessages
            messages={messages}
            isLoading={isLoading}
            maquinasPorMsg={maquinasPorMsg}
          />

          {checkIfShouldShowContact() && <ContactOptions />}

          <div className="p-3 bg-dark border-t border-primary/30">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={localInput}
                onChange={(e) => {
                  setLocalInput(e.target.value);
                  resetTimer();
                }}
                placeholder="Looking for an excavator, backhoe or roller?"
                className="flex-1 px-3 py-2 bg-dark border border-primary/40 rounded-lg text-light placeholder-light/40 focus:outline-none focus:border-primary transition text-sm"
                disabled={leadSent}
              />
              <button
                type="submit"
                disabled={isLoading || !localInput.trim() || leadSent}
                className="px-4 py-2 bg-primary hover:bg-orange-600 disabled:bg-primary/50 text-light font-semibold rounded-lg transition duration-200 text-sm"
              >
                {isLoading ? '...' : 'Send'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
