import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import '../../../src/styles/design-tokens.css';
import './styles/app.css';
import { App } from './App';

const akar = document.getElementById('root');
if (!akar) throw new Error('Elemen #root tidak ditemukan');

createRoot(akar).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
