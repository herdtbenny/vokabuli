import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // NEXT_PUBLIC_* wird vom Clerk-Marketplace-Setup gesetzt (öffentlicher Schlüssel) –
  // so kommt er auch in Vite an, ohne ihn doppelt anlegen zu müssen.
  envPrefix: ['VITE_', 'NEXT_PUBLIC_'],
})
