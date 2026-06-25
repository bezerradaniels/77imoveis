/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo SSR completo (Node.js na Hostinger): páginas montadas "ao vivo".
  // Imóveis novos aparecem no Google na hora, sem remontar o site.
  // (Para voltar ao modo estático, bastaria adicionar: output: 'export'.)
  reactStrictMode: true,
  images: {
    // Com Node, o Next otimiza as imagens automaticamente.
    remotePatterns: [{ protocol: 'https', hostname: '*.supabase.co' }],
  },
  eslint: { ignoreDuringBuilds: false },
};

module.exports = nextConfig;
