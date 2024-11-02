import { defineNitroConfig } from 'nitropack/config'

export default defineNitroConfig({
  routeRules: {
    '/api/**': { cors: true }
  },

  compatibilityDate: '2024-11-02'
})