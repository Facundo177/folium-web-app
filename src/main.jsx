import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { AuthProvider } from './auth/AuthProvider.jsx';


// IMPORTACIÓN SÍNCRONA:
// Importamos el mock directamente para que intercepte todo desde el milisegundo cero.
// (Recuerda borrar esta línea cuando tu backend esté listo)
import './mock/mockApi.js';


createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
    </AuthProvider>
  </StrictMode>,
)
