'use client';

import { useState } from 'react';
import { config } from '@/lib/config';

interface InitialFormProps {
  onSubmit: (data: { name: string; phone: string; email: string }) => void;
}

export function InitialForm({ onSubmit }: InitialFormProps) {
  const [formData, setFormData] = useState({ name: '', phone: '', email: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'El teléfono es requerido';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = `El teléfono debe tener al menos ${config.validation.phone.minDigits} dígitos`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!config.validation.email.pattern.test(formData.email)) {
      newErrors.email = 'El email no es válido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  return (
    <div className="w-full max-w-md">
      {/* Retroescavadora Image */}
      <div className="mb-8 text-center">
        <div className="relative w-full h-48 bg-primary/20 rounded-lg border-2 border-primary/40 flex items-center justify-center mb-4 overflow-hidden">
          <svg
            className="w-32 h-32 text-primary/50"
            viewBox="0 0 200 200"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Retroescavadora simple */}
            <circle cx="80" cy="140" r="20" stroke="currentColor" strokeWidth="2" />
            <circle cx="140" cy="140" r="20" stroke="currentColor" strokeWidth="2" />
            <rect x="60" y="110" width="100" height="30" stroke="currentColor" strokeWidth="2" />
            <path d="M 150 100 L 160 60 L 170 80 L 175 70" stroke="currentColor" strokeWidth="2" fill="none" />
            <rect x="100" y="50" width="40" height="20" stroke="currentColor" strokeWidth="2" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-primary mb-2">Bienvenido a {config.chatbotName}</h2>
        <p className="text-light/70">Tu asistente para encontrar equipos pesados</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-dark border border-primary/30 rounded-lg p-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-light text-sm font-semibold mb-2">
            Nombre
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Tu nombre completo"
            className={`w-full px-4 py-2 bg-dark border rounded-lg text-light placeholder-light/40 focus:outline-none transition ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-primary/40 focus:border-primary'
            }`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-light text-sm font-semibold mb-2">
            Teléfono
          </label>
          <input
            id="phone"
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder={config.contact.phone}
            className={`w-full px-4 py-2 bg-dark border rounded-lg text-light placeholder-light/40 focus:outline-none transition ${
              errors.phone ? 'border-red-500 focus:border-red-500' : 'border-primary/40 focus:border-primary'
            }`}
          />
          {errors.phone && <p className="text-red-400 text-xs mt-1">{errors.phone}</p>}
        </div>

        {/* Email Input */}
        <div>
          <label htmlFor="email" className="block text-light text-sm font-semibold mb-2">
            Email
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="tu@email.com"
            className={`w-full px-4 py-2 bg-dark border rounded-lg text-light placeholder-light/40 focus:outline-none transition ${
              errors.email ? 'border-red-500 focus:border-red-500' : 'border-primary/40 focus:border-primary'
            }`}
          />
          {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email}</p>}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          className="w-full py-3 bg-primary hover:bg-orange-600 text-light font-bold rounded-lg transition duration-200 mt-6"
        >
          Comenzar a Buscar
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-light/50 text-xs mt-6">
        Tus datos serán utilizados para ofrecerte la mejor asistencia
      </p>
    </div>
  );
}
