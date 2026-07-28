import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
// `base` is the public path the app is served from. The Cloudflare Worker serves
// this build at its root, so "/" is correct; VITE_BASE stays overridable in case
// the site is ever mirrored under a sub-path again.
//
// Two entries, not a router: the game at "/" and the reporting page at
// "/dashboard/". Two real HTML files means the host resolves them directly, with
// no SPA 404-rewrite trick. Paths are relative to the project root — this config
// is ESM ("type": "module"), so __dirname does not exist here.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: 'index.html',
        dashboard: 'dashboard/index.html',
      },
    },
  },
})
