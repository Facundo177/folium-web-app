import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  const isDev = command === 'serve' && mode !== 'production'
  const env = loadEnv(mode, process.cwd(), '')

  let backendOrigin = env.VITE_PREVIEW_BACKEND_URL || env.BACKEND_HOST || 'http://localhost:8080'
  if (isDev) {
    backendOrigin = 'http://localhost:8080'
    try {
      backendOrigin = new URL(env.VITE_API_BASE_URL).origin
    } catch {
      // VITE_API_BASE_URL ausente o inválida: se usa localhost:8080
    }
  }

  const proxy = {
    '/api': {
      target: backendOrigin,
      changeOrigin: true,
    },
    '/media': {
      target: backendOrigin,
      changeOrigin: true,
    },
  }

  return {
    plugins: [react(), tailwindcss()],
    server: { proxy },
    preview: { proxy },
  }
})
