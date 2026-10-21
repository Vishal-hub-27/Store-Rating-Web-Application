import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';


import './styles/style.css';
import './styles/rating.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/store.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
