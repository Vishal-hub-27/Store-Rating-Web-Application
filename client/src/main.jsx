import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

// Order matters (it matches the old layout.php): the project's own CSS first, then Bootstrap,
// then store.css (new styles) last so they can override Bootstrap where needed.
import './styles/style.css';
import './styles/rating.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/store.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
