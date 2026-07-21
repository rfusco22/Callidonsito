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
      newErrors.name = 'Name is required';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone is required';
    } else if (!/^\d{10,}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = `Phone must have at least ${config.validation.phone.minDigits} digits`;
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!config.validation.email.pattern.test(formData.email)) {
      newErrors.email = 'Invalid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Ejecutamos la función de validación que ya creaste arriba
    // Si faltan datos o el correo está mal escrito, detiene el envío y muestra los errores rojos
    if (!validateForm()) {
      return;
    }

    // Le pasamos los datos exactos que coinciden con tu estado (name, phone, email)
    onSubmit({
      name: formData.name,
      phone: formData.phone,
      email: formData.email
    });
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
        
        <h2 className="text-1xl font-black tracking-tighter mb-4 uppercase">Welcome to <span className="text-[#F39C12]">{config.chatbotName}</span></h2>

      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-dark border border-primary/30 rounded-lg p-6">
        {/* Name Input */}
        <div>
          <label htmlFor="name" className="block text-light text-sm font-semibold mb-2">
            Full Name
          </label>
          <input
            id="name"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Your full name"
            className={`w-full px-4 py-2 bg-dark border rounded-lg text-light placeholder-light/40 focus:outline-none transition ${
              errors.name ? 'border-red-500 focus:border-red-500' : 'border-primary/40 focus:border-primary'
            }`}
          />
          {errors.name && <p className="text-red-400 text-xs mt-1">{errors.name}</p>}
        </div>

        {/* Phone Input */}
        <div>
          <label htmlFor="phone" className="block text-light text-sm font-semibold mb-2">
            Phone
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
            Mail
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@email.com"
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
          Start Searching
        </button>
      </form>

      {/* Footer */}
      <p className="text-center text-light/50 text-xs mt-6">
        Your data will be used to provide you with the best assistance.
      </p>
    </div>
  );
}
