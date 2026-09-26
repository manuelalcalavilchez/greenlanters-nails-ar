import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    // HTTPS local recomendado para probar getUserMedia desde un móvil real
    // en la misma red (no localhost). Ver README para generar certificados
    // con mkcert y descomentar la sección `https` de abajo.
    host: true,
    port: 5173,
    // https: {
    //   key: fs.readFileSync('./certs/key.pem'),
    //   cert: fs.readFileSync('./certs/cert.pem'),
    // },
  },
});
