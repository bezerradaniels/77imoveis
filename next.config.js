/** @type {import('next').NextConfig} */
const nextConfig = {
  // Modo SSR completo (Node.js na Hostinger): páginas montadas "ao vivo".
  // Imóveis novos aparecem no Google na hora, sem remontar o site.
  // (Para voltar ao modo estático, bastaria adicionar: output: 'export'.)
  //
  // 'standalone': o build gera um servidor Node autocontido em
  // `.next/standalone` (só com as dependências usadas). O deploy passa a ser
  // "buildar no GitHub Actions e enviar o pronto" — a Hostinger não reconstrói
  // mais a cada push, então acaba a janela de 503 do deploy.
  output: 'standalone',
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
  async headers() {
    // CSP só em produção: o dev server do Next usa eval/inline para o
    // hot-reload, que exigiria afrouxar a política e perderia o sentido.
    const csp = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com https://challenges.cloudflare.com",
      "style-src 'self' 'unsafe-inline'",
      "font-src 'self'",
      "img-src 'self' data: blob: https://*.supabase.co https://www.googletagmanager.com https://www.google-analytics.com",
      "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://www.google-analytics.com https://www.googletagmanager.com https://challenges.cloudflare.com",
      "frame-src https://challenges.cloudflare.com https://www.googletagmanager.com",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join('; ');

    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Content-Security-Policy', value: csp }] : []),
    ];

    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

module.exports = nextConfig;
