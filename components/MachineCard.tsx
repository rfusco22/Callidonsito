'use client';

import { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';
import { config } from '@/lib/config';

interface MachineCardProps {
  nombre: string;
  tipo: string;
  descripcion: string;
  precio: number;
  estado: string;
  foto: string;
  url: string;
}

function MachineImage({ foto, nombre }: { foto: string; nombre: string }) {
  const [error, setError] = useState(false);
  const baseUrl = config.baseUrl;
  const src = foto.startsWith('http') ? foto : `${baseUrl}${foto}`;

  if (error) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#1c1c1f]">
        <ImageIcon size={40} className="text-slate-600" />
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={nombre}
      onError={() => setError(true)}
      className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
    />
  );
}

export function MachineCard({ nombre, tipo, descripcion, precio, estado, foto, url }: MachineCardProps) {
  const baseUrl = config.baseUrl;
  const isDisponible = estado === 'Disponible';
  const machineUrl = url.startsWith('http') ? url : `${baseUrl}${url}`;

  return (
    <div className="bg-[#161618] rounded-xl border border-white/5 overflow-hidden group hover:border-[#F39C12]/30 transition-all shadow-lg w-full max-w-xs">
      <div className="relative h-40 bg-[#1c1c1f] overflow-hidden">
        <MachineImage foto={foto} nombre={nombre} />
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-wider text-[#F39C12] bg-[#F39C12]/10 px-2 py-1 rounded-full">
            {tipo}
          </span>
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full ${
            isDisponible
              ? 'text-green-500 bg-green-500/10'
              : 'text-yellow-500 bg-yellow-500/10'
          }`}>
            {estado}
          </span>
        </div>
        <h3 className="text-sm font-black text-white leading-tight">{nombre}</h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{descripcion}</p>
        <div className="flex items-center justify-between pt-2">
          <span className="text-sm font-black text-[#F39C12]">
            ${precio.toLocaleString()}
          </span>
          <a
            href={machineUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[10px] font-bold uppercase tracking-widest bg-[#F39C12] hover:bg-[#E67E22] text-dark px-3 py-2 rounded-lg transition-all active:scale-95"
          >
            View Machine
          </a>
        </div>
      </div>
    </div>
  );
}
