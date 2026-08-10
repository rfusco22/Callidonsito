'use client';

import { config } from '@/lib/config';

export function ContactOptions() {
  return (
    <div className="bg-primary/10 border-t border-primary/30 px-4 py-4">
      <p className="text-light text-sm font-semibold mb-3">Ponerse en contacto:</p>
      <div className="grid grid-cols-3 gap-2">
        {/* Call Button */}
        <a
          href={`tel:${config.contact.phone}`}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-orange-600 text-light rounded-lg font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.418 1.265 1.215 2.807 2.368 3.996.983.99 2.306 1.93 3.834 2.602l.772-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Llamar
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${config.contact.whatsapp.replace(/\D/g, '')}?text=Hola%20${config.chatbotName}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-orange-600 text-light rounded-lg font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-4.945 1.347l-.355.187-.368-.01c-3.24 0-5.974 2.663-5.974 5.95 0 1.294.33 2.55.995 3.665L1.07 23.5l3.898-1.288c1.09.594 2.283.922 3.516.922h.004c3.902 0 7.968-3.018 7.968-6.727 0-1.8-.775-3.489-2.114-4.731a6.716 6.716 0 00-4.77-1.974" />
          </svg>
          WhatsApp
        </a>

        {/* Email Button */}
        <a
          href={`mailto:${config.contact.email}`}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-orange-600 text-light rounded-lg font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Email
        </a>
      </div>
    </div>
  );
}
