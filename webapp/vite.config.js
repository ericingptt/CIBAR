import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a GitHub Pages *project* page at https://ericingptt.github.io/CIBAR/,
// so all built asset URLs need this prefix.
export default defineConfig({
  base: '/CIBAR/',
  plugins: [react()],
  build: {
    // 'mind-ar-image-three' is intentionally not an npm dependency (see the
    // comment in index.html) - it's resolved at runtime via the native
    // import map, so Vite must not try to bundle it.
    rolldownOptions: {
      external: ['mind-ar-image-three'],
    },
  },
})
