import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// --- Tự động chèn font chữ tiếng Việt vào trang web ---
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css2?family=Be+Vietnam+Pro:wght@400;500;600;700&family=Playfair+Display:wght@600;700&display=swap';
link.rel = 'stylesheet';
document.head.appendChild(link);

const root = createRoot(document.getElementById('app'));

root.render(
  <StrictMode>
    <App />
  </StrictMode>
);
