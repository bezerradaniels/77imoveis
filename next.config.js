/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo SSR completo (Node.js na Hostinger): páginas montadas "ao vivo".
  // Imóveis novos aparecem no Google na hora, sem remontar o site.
  // (Para voltar ao modo estático, bastaria adicionar: output: 'export'.)
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Com Node, o Next otimiza as imagens automaticamente.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
    // URLs do Supabase são estáveis → cache longo das imagens otimizadas
    // reduz reprocessamento de CPU no servidor (Hostinger).
    minimumCacheTTL: 2678400, // 31 dias
  },
  // Garante tree-shaking de ícones: importa só o que é usado de lucide-react.
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
