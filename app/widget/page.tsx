'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { InitialForm } from '@/components/InitialForm';
import { ContactOptions } from '@/components/ContactOptions';

export default function WidgetPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  const { messages, sendMessage, input, setInput, isLoading } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat-django',
    }),
  });

  const handleFormSubmit = (formData: { name: string; phone: string; email: string }) => {
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
    <div className="flex flex-col h-screen bg-gradient-to-b from-dark via-dark to-dark overflow-hidden">
      {/* Versión embebida sin header, optimizada para widget */}
      {!formSubmitted ? (
        <div className="flex items-center justify-center flex-1 px-4">
          <div className="w-full max-w-sm">
            <InitialForm onSubmit={handleFormSubmit} />
          </div>
        </div>
      ) : (
        <div className="flex flex-col flex-1 overflow-hidden">
          {/* Chat Messages */}
          <ChatMessages messages={messages} isLoading={isLoading} />

          {/* Contact Options */}
          {checkIfShouldShowContact() && <ContactOptions />}

          {/* Input Area */}
          <div className="p-3 bg-dark border-t border-primary/30">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Pregunta..."
                className="flex-1 px-3 py-2 bg-dark border border-primary/40 rounded-lg text-light placeholder-light/40 focus:outline-none focus:border-primary transition text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="px-4 py-2 bg-primary hover:bg-orange-600 disabled:bg-primary/50 text-light font-semibold rounded-lg transition duration-200 text-sm"
              >
                {isLoading ? '...' : 'Enviar'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
