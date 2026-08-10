'use client';

import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { useState } from 'react';
import { ChatMessages } from '@/components/ChatMessages';
import { InitialForm } from '@/components/InitialForm';
import { ContactOptions } from '@/components/ContactOptions';

export default function WidgetPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);
  const [localInput, setLocalInput] = useState('');

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/chat-django',
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  const handleFormSubmit = (formData: { name: string; phone: string; email: string }) => {
    setFormSubmitted(true);

    const initialMessage = `Hello, my name is ${formData.name}, my phone is ${formData.phone} and my email is ${formData.email}. I'd like to find heavy equipment.`;
    sendMessage({ text: initialMessage });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (localInput.trim()) {
      sendMessage({ text: localInput });
      setLocalInput('');
    }
  };

  const checkIfShouldShowContact = () => {
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.role === 'assistant') {
      const textParts = lastMessage.parts?.filter((p) => p.type === 'text') || [];
      const text = textParts.length > 0 ? textParts[0].text : '';
      return (
        text.toLowerCase().includes('contact') ||
        text.toLowerCase().includes('reach out') ||
        text.toLowerCase().includes('call') ||
        text.toLowerCase().includes('whatsapp') ||
        text.toLowerCase().includes('email')
      );
    }
    return false;
  };

  return (
    <div className="flex flex-col h-screen bg-gradient-to-b from-dark via-dark to-dark overflow-hidden">
      {/* Embedded version without header, optimized for widget */}
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
                value={localInput}
                onChange={(e) => setLocalInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 px-3 py-2 bg-dark border border-primary/40 rounded-lg text-light placeholder-light/40 focus:outline-none focus:border-primary transition text-sm"
              />
              <button
                type="submit"
                disabled={isLoading || !localInput.trim()}
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
