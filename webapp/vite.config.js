import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Deployed as a GitHub Pages *project* page at https://ericingptt.github.io/CIBAR/,
// so all built asset URLs need this prefix.
export default defineConfig({
  base: '/CIBAR/',
  plugins: [react()],
})
