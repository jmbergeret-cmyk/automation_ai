// Sitemap generado en el build a partir de las páginas reales de src/pages.
const paths = Object.keys(import.meta.glob('./**/*.astro'))
  .map((file) => file.replace(/^\.\/|\.astro$/g, '').replace(/index$/, ''))
  .map((route) => (route === '' ? '/' : `/${route}/`))
  .sort();

export function GET({ site }) {
  const urls = paths
    .map(
      (path) => `  <url>
    <loc>${new URL(path, site).href}</loc>
    <changefreq>monthly</changefreq>
    <priority>${path === '/' ? '1.0' : '0.8'}</priority>
  </url>`,
    )
    .join('\n');

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`,
    { headers: { 'Content-Type': 'application/xml; charset=utf-8' } },
  );
}
