export default defineNuxtConfig({
       runtimeConfig: {
         public: {
           supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL,
           supabaseAnonKey: process.env.NUXT_PUBLIC_SUPABASE_ANON_KEY
         }
       },
       compatibilityDate: '2025-07-15',
       devtools: { enabled: true }
     })