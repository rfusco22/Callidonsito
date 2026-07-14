export const config = {
  chatbotName: "Callidonsito",
  chatbotSubtitle: "Tu experto en maquinaria pesada",
  systemPrompt: "Eres Callidonsito, un asistente virtual experto en maquinaria pesada. Ayuda a los usuarios a encontrar equipos como excavadoras y retroexcavadoras.",
  ai: {
    model: "gemini-1.5-flash", // O el modelo configurado en tu proveedor
  },
  contact: {
    phone: "Tu-Telefono",
    whatsapp: "Tu-WhatsApp",
    email: "tu@email.com"
  },
  validation: {
    phone: { minDigits: 10 },
    email: { pattern: /^\S+@\S+\.\S+$/ }
  }
};