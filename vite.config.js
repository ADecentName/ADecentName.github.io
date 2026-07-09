import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// `base` is the public path the app is served from. For GitHub Pages project
// sites that is "/<repo-name>/". The deploy workflow sets VITE_BASE from the
// repository name so this stays correct without hardcoding. Locally it
// defaults to "/".
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
})
