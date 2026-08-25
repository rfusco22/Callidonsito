'use client';

import { UIMessage } from 'ai';
import { MachineCard } from './MachineCard';

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

function MachineCardList({ maquinas }: { maquinas: MachineResult[] }) {
  if (!maquinas || maquinas.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-3 my-2 w-full max-w-xl">
      {maquinas.map((m) => (
        <MachineCard key={m.id} {...m} />
      ))}
    </div>
  );
}

interface ChatMessagesProps {
  messages: UIMessage[];
  isLoading: boolean;
  maquinasPorMsg?: Record<string, MachineResult[]>;
}

export function ChatMessages({ messages, isLoading, maquinasPorMsg = {} }: ChatMessagesProps) {
  return (
    <div className="flex-1 overflow-y-auto space-y-4">
      {messages.map((message, index) => {
        if (!message.parts || message.parts.length === 0) {
          return (
            <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-light' : 'bg-dark border border-primary/30 text-light'}`}>
                <p className="text-sm">Cargando...</p>
              </div>
            </div>
          );
        }

        const textParts = message.parts.filter((p) => p.type === 'text');
        const toolParts = message.parts.filter((p) => p.type === 'tool-invocation');
        const maquinas = maquinasPorMsg[String(index)];

        return (
          <div key={index} className="space-y-2">
            {textParts.length > 0 && (
              <div className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-xs lg:max-w-md px-4 py-3 rounded-lg ${message.role === 'user' ? 'bg-primary text-light' : 'bg-dark border border-primary/30 text-light'}`}>
                  {textParts.map((part, i) => {
                    const text = (part as any).text || '';
                    const lines = text.split('\n').filter((l: string) => l.trim());
                    return lines.map((line: string, j: number) => (
                      <p key={`${i}-${j}`} className="text-sm leading-relaxed">
                        {line}
                      </p>
                    ));
                  })}
                </div>
              </div>
            )}

            {message.role === 'assistant' &&
              toolParts.map((part, i) => {
                const ti = (part as any).toolInvocation;
                if (
                  ti &&
                  ti.state === 'result' &&
                  ti.result &&
                  ti.result.maquinas &&
                  ti.result.maquinas.length > 0
                ) {
                  return <MachineCardList key={`tool-${i}`} maquinas={ti.result.maquinas} />;
                }
                return null;
              })}

            {message.role === 'assistant' && maquinas && maquinas.length > 0 && (
              <div className="flex justify-start">
                <div className="w-full">
                  <MachineCardList maquinas={maquinas} />
                </div>
              </div>
            )}

            {message.role === 'assistant' && textParts.length === 0 && toolParts.length === 0 && !maquinas && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-lg bg-dark border border-primary/30 text-light">
                  <p className="text-sm leading-relaxed">Cargando...</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

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
