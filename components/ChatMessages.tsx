'use client';

import { UIMessage } from 'ai';

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
}

export function ChatMessages({ messages, isLoading }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4 space-y-4">
      {messages.map((message, index) => (
        <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div
            className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${
              message.role === 'user'
                ? 'bg-primary text-light'
                : 'bg-dark border border-primary/30 text-light'
            }`}
          >
            {message.parts && message.parts.length > 0 ? (
              message.parts.map((part, i) => {
                if (part.type === 'text') {
                  return (
                    <p key={i} className="text-sm leading-relaxed">
                      {part.text}
                    </p>
                  );
                }
                return null;
              })
            ) : (
              <p className="text-sm">Cargando...</p>
            )}
          </div>
        </div>
      ))}

      {isLoading && (
        <div className="flex justify-start">
          <div className="bg-dark border border-primary/30 text-light px-4 py-3 rounded-lg">
            <div className="flex gap-2 items-center">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
