'use client';

import { useChat } from '@ai-sdk/react';
import { useState, useEffect } from 'react';
import { ChatMessages } from './ChatMessages';
import { InitialForm } from './InitialForm';
import { ContactOptions } from './ContactOptions';
import { config } from '@/lib/config';

export function ChatBot() {
  // 1. Estados de control
  const [mounted, setMounted] = useState(false);
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string; email: string } | null>(null);
  
  // 2. Estado manual del input (Soluciona el bloqueo del teclado)
  const [textInput, setTextInput] = useState('');

  // Evitar errores de hidratación (SSR vs Client)
  useEffect(() => {
    setMounted(true);
  }, []);

  // 3. Hook de AI SDK
  const chat = useChat({
    api: '/api/chat',
  });

  // Alias ultra-seguros: Buscamos la función de enviar en todos los nombres posibles de la SDK
  const messages = chat.messages || [];
  const isLoading = chat.isLoading || false;
  
  // Esta línea busca la función de enviar en 'append', 'reload' o 'sendMessage'
  const sendFunction = chat.append || (chat as any).sendMessage || (chat as any).reload;

  // 4. Manejo del formulario inicial
  const handleFormSubmit = async (formData: { name: string; phone: string; email: string }) => {
    setUserInfo(formData);
    setFormSubmitted(true);

    const initialMessage = `Hola, me llamo ${formData.name}, mi teléfono es ${formData.phone} y mi email es ${formData.email}. Me gustaría obtener información sobre maquinaria pesada disponible.`;
    
    if (typeof sendFunction === 'function') {
      try {
        await sendFunction({
          role: 'user',
          content: initialMessage,
        });
      } catch (err) {
        console.error("Fallo al enviar mensaje inicial:", err);
      }
    }
  };

  // 5. Manejo del envío de mensajes manual
  const onSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (textInput.trim() && !isLoading) {
      if (typeof sendFunction === 'function') {
        const currentMessage = textInput;
        setTextInput(''); 
        
        try {
          await sendFunction({
            role: 'user',
            content: currentMessage,
          });
        } catch (err) {
          console.error("Error al enviar mensaje:", err);
          setTextInput(currentMessage); 
        }
      } else {
        // Si llegamos aquí, imprimimos el objeto chat en consola para ver qué tiene
        console.log("Estructura del objeto chat:", chat);
        alert("Error técnico: La función de envío no se encuentra. Revisa la consola (F12).");
      }
    }
  };

  // Función para detectar si mostrar opciones de contacto
  const shouldShowContact = () => {
    if (messages.length === 0) return false;
    const lastMsg = messages[messages.length - 1];
    if (lastMsg.role === 'assistant') {
      const content = lastMsg.content.toLowerCase();
      return /contacto|whatsapp|llamar|escríbenos|teléfono|email/i.test(content);
    }
    return false;
  };

  // No renderizar hasta que el cliente esté listo
  if (!mounted) return <div className="h-screen bg-dark" />;

  return (
    <div className="flex flex-col h-screen bg-dark text-light">
      {/* Header Fijo */}
      <header className="bg-primary px-6 py-4 shadow-xl shrink-0 z-10">
        <div className="flex items-center gap-4 max-w-5xl mx-auto">
          <div className="w-12 h-12 bg-light rounded-full flex items-center justify-center text-primary font-black text-2xl shadow-inner">
            C
          </div>
          <div>
            <h1 className="text-light text-2xl font-bold leading-tight">{config.chatbotName}</h1>
            <p className="text-light/80 text-sm font-medium">{config.chatbotSubtitle}</p>
          </div>
        </div>
      </header>

      {/* Cuerpo Principal */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {!formSubmitted ? (
          <div className="flex-1 flex items-center justify-center p-4 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-primary/10 to-dark">
            <InitialForm onSubmit={handleFormSubmit} />
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Mensajes con scroll */}
            <div className="flex-1 overflow-y-auto">
              <ChatMessages messages={messages} isLoading={isLoading} />
              {shouldShowContact() && (
                <div className="px-4 py-2">
                  <ContactOptions />
                </div>
              )}
            </div>

            {/* Barra de Input */}
            <div className="p-4 bg-dark/80 backdrop-blur-md border-t border-primary/20">
              <form onSubmit={onSendMessage} className="flex gap-3 max-w-5xl mx-auto w-full">
                <input
                  type="text"
                  value={textInput}
                  onChange={(e) => setTextInput(e.target.value)}
                  placeholder="¿En qué puedo ayudarte hoy?"
                  className="flex-1 px-5 py-4 bg-dark-lighter border border-primary/30 rounded-xl text-light placeholder-light/30 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
                <button
                  type="submit"
                  disabled={isLoading || !textInput.trim()}
                  className="px-8 py-4 bg-primary hover:bg-orange-600 disabled:bg-primary/40 disabled:cursor-not-allowed text-light font-bold rounded-xl shadow-lg transition-all active:scale-95"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-light/30 border-t-light rounded-full animate-spin" />
                      ...
                    </span>
                  ) : (
                    'Enviar'
                  )}
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}