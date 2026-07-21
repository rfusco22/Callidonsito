'use client';

import { config } from '@/lib/config';

export function ContactOptions({ userName = '' }: { userName?: string }) {
  return (
    <div className="bg-primary/10 border-t border-primary/30 px-4 py-4">
      <p className="text-light text-sm font-semibold mb-3">Get in touch:</p>
      <div className="grid grid-cols-3 gap-2">
        {/* Call Button */}
        <a
          href={`tel:${config.contact.phone}`}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-orange-600 text-light rounded-lg font-semibold text-sm transition"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773c.418 1.265 1.215 2.807 2.368 3.996.983.99 2.306 1.93 3.834 2.602l.772-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
          </svg>
          Call
        </a>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${config.contact.whatsapp.replace(/\D/g, '')}?text=${encodeURIComponent(`Hi, I'm ${userName || 'a customer'}, I come from Callidonsito, I'm looking for more information`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 px-3 py-2 bg-primary hover:bg-orange-600 text-light rounded-lg font-semibold text-sm transition"
        >
          <img src="/WhatsApp_icon.png" alt="WhatsApp" className="w-4 h-4" />
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
