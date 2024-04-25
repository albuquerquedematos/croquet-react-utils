import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tsconfigPaths from 'vite-tsconfig-paths'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  build: {
    minify: true,
    cssMinify: 'esbuild',
    outDir: 'dist',
    emptyOutDir: true,
    reportCompressedSize: true,
    lib: {
      entry: 'src/index.ts',
      name: 'CroquetQRCode',
      fileName: 'index',
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        banner: 'import "./style.css";',
        globals: {
          'react': 'React',
          'react-dom': 'ReactDOM',
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      '@croquet/react',
      '@uidotdev/usehooks',
      'react-icons',
      'react-qr-code',
    ],
  },
})
