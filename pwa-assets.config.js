import { defineConfig } from '@vite-pwa/assets-generator/config'

export default defineConfig({
  preset: {
    transparent: {
      sizes: [64, 192, 512],
      favicons: [[48, 'favicon.ico']],
    },
    maskable: {
      sizes: [512],
      resizeOptions: {
        background: '#080F2C',
      },
    },
    apple: {
      sizes: [180],
      padding: 0,
      resizeOptions: {
        background: '#080F2C',
      },
    },
  },
  images: ['public/favicon.png'],
})
