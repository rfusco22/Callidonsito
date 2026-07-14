/**
 * Callidonsito Widget Flotante
 * Script para incrustar en Django
 * 
 * Uso en Django:
 * 1. Agregar en tu template base (base.html):
 *    <script src="https://tu-dominio-nextjs.com/callidonsito-widget.js"></script>
 * 
 * 2. El widget se cargará automáticamente en todas las páginas
 */

(function() {
  'use strict';

  // Configuración
  const CONFIG = {
    apiUrl: 'https://tu-dominio-nextjs.com/api/chat-django',
    chatbotName: 'Callidonsito',
    chatbotSubtitle: 'Asistente de Equipos Pesados',
    position: 'bottom-right', // bottom-right, bottom-left, top-right, top-left
    primaryColor: '#FF8C00', // Naranja
    darkColor: '#1a1a1a',    // Negro
    lightColor: '#FFFFFF',   // Blanco
  };

  // Crear elemento flotante
  function createFloatingWidget() {
    // Contenedor principal
    const container = document.createElement('div');
    container.id = 'callidonsito-widget-container';
    container.style.cssText = `
      position: fixed;
      ${CONFIG.position === 'bottom-right' ? 'bottom: 20px; right: 20px;' : ''}
      ${CONFIG.position === 'bottom-left' ? 'bottom: 20px; left: 20px;' : ''}
      ${CONFIG.position === 'top-right' ? 'top: 20px; right: 20px;' : ''}
      ${CONFIG.position === 'top-left' ? 'top: 20px; left: 20px;' : ''}
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
    `;

    // Botón flotante
    const button = document.createElement('button');
    button.id = 'callidonsito-widget-button';
    button.innerHTML = `
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2"/>
        <path d="M8 12h8M12 8v8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>Preguntar</span>
    `;
    button.style.cssText = `
      background-color: ${CONFIG.primaryColor};
      color: ${CONFIG.lightColor};
      border: none;
      border-radius: 50px;
      padding: 12px 20px;
      font-size: 14px;
      font-weight: 600;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
      hover: {
        transform: scale(1.05);
        box-shadow: 0 6px 16px rgba(0,0,0,0.2);
      }
    `;

    button.onmouseover = () => {
      button.style.transform = 'scale(1.05)';
      button.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)';
    };
    button.onmouseout = () => {
      button.style.transform = 'scale(1)';
      button.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    };

    // Ventana del chat
    const chatWindow = document.createElement('div');
    chatWindow.id = 'callidonsito-widget-chat';
    chatWindow.style.cssText = `
      position: absolute;
      ${CONFIG.position === 'bottom-right' ? 'bottom: 80px; right: 0;' : ''}
      ${CONFIG.position === 'bottom-left' ? 'bottom: 80px; left: 0;' : ''}
      ${CONFIG.position === 'top-right' ? 'top: 80px; right: 0;' : ''}
      ${CONFIG.position === 'top-left' ? 'top: 80px; left: 0;' : ''}
      width: 380px;
      height: 600px;
      background-color: ${CONFIG.darkColor};
      border-radius: 12px;
      box-shadow: 0 5px 40px rgba(0,0,0,0.16);
      display: none;
      flex-direction: column;
      overflow: hidden;
      z-index: 1000000;
    `;

    // Header del chat
    const header = document.createElement('div');
    header.style.cssText = `
      background-color: ${CONFIG.primaryColor};
      color: ${CONFIG.lightColor};
      padding: 16px;
      font-weight: 600;
      display: flex;
      justify-content: space-between;
      align-items: center;
    `;
    header.innerHTML = `
      <div>
        <div style="font-size: 14px; font-weight: 600;">${CONFIG.chatbotName}</div>
        <div style="font-size: 12px; opacity: 0.9;">${CONFIG.chatbotSubtitle}</div>
      </div>
      <button id="callidonsito-close-btn" style="
        background: none;
        border: none;
        color: ${CONFIG.lightColor};
        cursor: pointer;
        font-size: 20px;
        padding: 0;
      ">×</button>
    `;

    // Iframe para cargar el chatbot
    const iframe = document.createElement('iframe');
    iframe.id = 'callidonsito-iframe';
    iframe.style.cssText = `
      flex: 1;
      border: none;
      width: 100%;
      height: 100%;
    `;
    iframe.src = `https://tu-dominio-nextjs.com/widget?mode=embedded`;

    // Contenedor del chat (excluyendo header)
    const chatContent = document.createElement('div');
    chatContent.style.cssText = `
      display: flex;
      flex-direction: column;
      flex: 1;
      overflow: hidden;
    `;
    chatContent.appendChild(iframe);

    chatWindow.appendChild(header);
    chatWindow.appendChild(chatContent);

    // Event listeners
    button.addEventListener('click', () => {
      const isVisible = chatWindow.style.display !== 'none';
      chatWindow.style.display = isVisible ? 'none' : 'flex';
      button.style.opacity = isVisible ? '1' : '0.7';
    });

    const closeBtn = header.querySelector('#callidonsito-close-btn');
    closeBtn.addEventListener('click', () => {
      chatWindow.style.display = 'none';
      button.style.opacity = '1';
    });

    // Agregar elementos al contenedor
    container.appendChild(button);
    container.appendChild(chatWindow);

    // Agregar contenedor al body
    document.body.appendChild(container);
  }

  // Crear página embebida para el widget
  function createEmbeddedPage() {
    if (window.location.pathname.includes('/widget')) {
      // Aquí se carga la aplicación React embebida
      // Esta página será servida desde Next.js en /app/widget/page.tsx
    }
  }

  // Inicializar cuando el DOM está listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', createFloatingWidget);
  } else {
    createFloatingWidget();
  }
})();
