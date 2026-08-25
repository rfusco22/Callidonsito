'use client';

import { UIMessage } from 'ai';
import Image from 'next/image';

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

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  maquinasPorMsg?: Record<string, MachineResult[]>;
}

export function ChatMessages({ messages, isLoading, maquinasPorMsg = {} }: ChatMessagesProps) {
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
                    <p key={i} className="text-sm leading-relaxed whitespace-pre-wrap">
                      {part.text}
                    </p>
                  );
                }
                return null;
              })
            ) : (
              <p className="text-sm">Loading...</p>
            )}

            {message.role === 'assistant' && maquinasPorMsg[String(index)] && (
              <div className="mt-3 grid grid-cols-1 gap-2">
                {maquinasPorMsg[String(index)].map((m) => (
                  <a
                    key={m.id}
                    href={m.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex gap-3 bg-[#1c1c1f] border border-primary/20 rounded-lg overflow-hidden hover:border-primary transition"
                  >
                    {m.foto && (
                      <div className="relative w-20 h-20 shrink-0">
                        <Image src={m.foto} alt={m.nombre} fill className="object-cover" />
                      </div>
                    )}
                    <div className="flex-1 p-2 min-w-0">
                      <p className="text-xs font-bold text-[#F39C12] truncate">{m.nombre}</p>
                      <p className="text-[10px] text-light/70 line-clamp-2">{m.descripcion}</p>
                      <p className="text-[10px] text-green-400 font-bold mt-1">${m.precio?.toLocaleString()}</p>
                    </div>
                  </a>
                ))}
              </div>
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