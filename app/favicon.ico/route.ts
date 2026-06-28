const icon = `<svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g77favicon" x1="8" y1="8" x2="56" y2="56" gradientUnits="userSpaceOnUse">
      <stop stop-color="#ff385c"/>
      <stop offset="1" stop-color="#ff8aa0"/>
    </linearGradient>
  </defs>
  <rect x="6" y="6" width="52" height="52" rx="14" fill="url(#g77favicon)"/>
  <path d="M17 29L32 18L47 29" stroke="#0f172a" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <text x="32" y="49" text-anchor="middle" font-family="Arial, sans-serif" font-size="24" font-weight="800" fill="#0f172a">77</text>
</svg>`;

export function GET() {
  return new Response(icon, {
    headers: {
      'content-type': 'image/svg+xml; charset=utf-8',
      'cache-control': 'public, max-age=86400',
    },
  });
}
