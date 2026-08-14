export const config = {
  chatbotName: "Callidon",
  chatbotSubtitle: "Your heavy equipment expert",
  systemPrompt: "You are Callidon, a virtual assistant expert in heavy equipment from Callidon Equipment Inc. Help users find equipment like excavators, backhoes, and loaders.",
  ai: {
    model: "gpt-4o-mini",
  },
  contact: {
    phone: "Your-Phone",
    whatsapp: "Your-WhatsApp",
    email: "your@email.com"
  },
  validation: {
    phone: { minDigits: 10 },
    email: { pattern: /^\S+@\S+\.\S+$/ }
  }
};
