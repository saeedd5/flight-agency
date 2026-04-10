import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import viteCompression from 'vite-plugin-compression'

export default defineConfig({
  plugins: [
    react(),
    // Gzip compression
    viteCompression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 10240, // Only compress files larger than 10KB
      deleteOriginFile: false
    }),
    // Brotli compression (better than gzip)
    viteCompression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 10240,
      deleteOriginFile: false
    }),
    // Bundle analyzer
    visualizer({
      filename: './dist/stats.html',
      open: false,
      gzipSize: true,
      brotliSize: true,
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3001,
    // hmr: {
    //   protocol: 'ws',
    //   host: '46.249.99.187',
    //   port: 3000
    // },
    proxy: {
      '/api': {
        target: 'http://187.77.219.229:5000', 
        changeOrigin: true,
        secure: false,
        ws: true
      },
      '/sabre-api': {
        target: 'https://api-crt.cert.havail.sabre.com',
        changeOrigin: true,
        secure: true,
        rewrite: (path) => path.replace(/^\/sabre-api/, '')
      }
    }
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Split Ant Design into smaller chunks
            if (id.includes('antd')) {
              if (id.includes('antd/es/locale')) {
                return 'antd-locale';
              }
              if (id.includes('antd/es/style')) {
                return 'antd-style';
              }
              return 'antd-vendor';
            }
            if (id.includes('@ant-design/icons')) {
              return 'antd-icons';
            }
            // React core
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor';
            }
            if (id.includes('react-router')) {
              return 'react-router';
            }
            // Date libraries
            if (id.includes('dayjs')) {
              return 'date-vendor';
            }
            // Charts (only used in admin)
            if (id.includes('recharts')) {
              return 'charts-vendor';
            }
            // Other vendors
            if (id.includes('axios')) {
              return 'axios-vendor';
            }
            return 'vendor';
          }
          // Admin pages in separate chunk
          if (id.includes('/admin/')) {
            return 'admin';
          }
        }
      }
    },
    chunkSizeWarningLimit: 500,
    // Enable minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.log in production
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug']
      }
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'antd',
      'antd/es/locale/en_US',
      'antd/es/locale/ar_EG',
      'antd/es/button',
      'antd/es/input',
      'antd/es/select',
      'antd/es/date-picker',
      'antd/es/modal',
      'antd/es/form',
      'antd/es/table',
      'antd/es/card',
      'antd/es/layout',
      'antd/es/menu',
      'antd/es/spin',
      'antd/es/alert',
      'antd/es/message',
      'antd/es/tag',
      'antd/es/radio',
      'antd/es/slider',
      'antd/es/space',
      'antd/es/typography',
      'antd/es/divider',
      'antd/es/popover',
      'antd/es/empty',
      'antd/es/pagination',
      'antd/es/statistic',
      'antd/es/descriptions',
      'antd/es/switch',
      'antd/es/popconfirm',
      'antd/es/dropdown',
      'antd/es/avatar',
      'antd/es/config-provider',
      'antd/es/app',
      '@ant-design/icons',
      'dayjs',
      'axios'
    ],
    force: false,
    esbuildOptions: {
      target: 'es2020'
    }
  },
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' }
  }
})

