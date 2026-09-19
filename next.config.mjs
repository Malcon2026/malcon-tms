/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  env: {
    // Public Supabase client keys (safe to embed; RLS protects data). Hostinger can override via env vars.
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://urupxpfydfrvjlkpqlvi.supabase.co',
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVydXB4cGZ5ZGZydmpsa3BxbHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM0MjAxODMsImV4cCI6MjA5ODk5NjE4M30.VJqgfvRvvb-HOc5uPZ8G1s2KPNigAFE7jGKMBy8w4lY',
  },
}

export default nextConfig
