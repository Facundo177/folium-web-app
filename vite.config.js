import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv } from 'vite'

const AWS_BACKEND = 'http://54.160.130.29'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // `npm run dev` (serve) -> localhost; `npm run build` / `vite preview` -> AWS
  const isDev = command === 'serve' && mode !== 'production'

  let backendOrigin = AWS_BACKEND
  if (isDev) {
    const env = loadEnv(mode, process.cwd(), '')
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
