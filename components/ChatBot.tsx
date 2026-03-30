'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { ChatMessages } from './ChatMessages';
import { InitialForm } from './InitialForm';
import { ContactOptions } from './ContactOptions';
import { config } from '@/lib/config';

export function ChatBot() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [userInfo, setUserInfo] = useState<{ name: string; phone: string; email: string } | null>(
    null
  );
  const [showContact, setShowContact] = useState(false);

  const { messages, sendMessage, input, setInput, isLoading } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat',
    }),
  });

  const handleFormSubmit = (formData: { name: string; phone: string; email: string }) => {
    setUserInfo(formData);
    setFormSubmitted(true);

    const initialMessage = `Hola, me llamo ${formData.name}, mi teléfono es ${formData.phone} y mi email es ${formData.email}. Me gustaría encontrar una máquina de equipos pesados.`;
    sendMessage({ text: initialMessage });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      sendMessage({ text: input });
      setInput('');
    }
  };

  const checkIfShouldShowContact = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const text = lastMessage.parts?.[0]?.text || '';
      return (
        text.toLowerCase().includes('contactan') ||
        text.toLowerCase().includes('contacto') ||
        text.toLowerCase().includes('llamar') ||
        text.toLowerCase().includes('whatsapp') ||
        text.toLowerCase().includes('email')
      );
    }
    return false;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-dark via-dark to-dark">
      {/* Header */}
      <div className="bg-primary px-6 py-4 shadow-lg">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-light rounded-full flex items-center justify-center text-primary font-bold text-xl">
            C
          </div>
          <div>
            <h1 className="text-light text-2xl font-bold">{config.chatbotName}</h1>
            <p className="text-light/80 text-sm">{config.chatbotSubtitle}</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      {!formSubmitted ? (
        <div className="flex items-center justify-center flex-1 px-4">
          <InitialForm onSubmit={handleFormSubmit} />
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat Messages */}
          <ChatMessages messages={messages} isLoading={isLoading} />

          {/* Contact Options */}
          {checkIfShouldShowContact() && <ContactOptions />}

          {/* Input Area */}
          <div className="p-4 bg-dark border-t border-primary/30">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu pregunta..."
                className="flex-1 px-4 py-3 bg-dark border border-primary/40 rounded-lg text-light placeholder-light/40 focus:outline-none focus:border-primary transition"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-6 py-3 bg-primary hover:bg-orange-600 disabled:bg-primary/50 text-light font-semibold rounded-lg transition duration-200"
              >
                {isLoading ? 'Enviando...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
