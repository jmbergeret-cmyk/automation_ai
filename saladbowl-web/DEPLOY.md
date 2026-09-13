# Deploy — saladbowl.com.uy

Sitio estático (Astro). No hay servidor ni base de datos: el build genera
HTML e imágenes y se sirven desde un CDN.

## Hosting: Vercel

| Dato | Valor |
| --- | --- |
| Repo | `jmbergeret-cmyk/automation_ai` |
| **Root Directory** | `saladbowl-web` (el sitio NO está en la raíz del repo) |
| Framework | Astro (Vercel lo detecta solo) |
| Build command | `astro build` |
| Output directory | `dist` |
| Node | 20 o superior |

## Alta del proyecto

1. `vercel.com` → Sign up with GitHub.
2. Add New → Project → repo `automation_ai`.
3. **Root Directory: `saladbowl-web`.** El resto se autocompleta.
4. Deploy. Queda en una URL `*.vercel.app` para revisar antes del dominio.

## Dominio

En Vercel: Settings → Domains → agregar `saladbowl.com.uy` y `www.saladbowl.com.uy`.

Registros a cargar en el panel del dominio (nic.uy / ANTEL o el registrador):

```
A      @      76.76.21.21
CNAME  www    cname.vercel-dns.com
```

Vercel confirma los valores exactos en pantalla al agregar el dominio; usar
esos por si cambian.

**No tocar los registros MX**: son los del correo de la empresa.

El certificado HTTPS lo emite Vercel solo, gratis, una vez que el DNS resuelve.

## Después del deploy

Cada push a la rama de producción republica el sitio automáticamente.

Chequeos post-deploy:

- Las 4 páginas cargan: `/`, `/menu`, `/locales`, `/nosotros`.
- El botón "Hacé tu pedido" va al ecommerce.
- El estado en vivo de los locales coincide con el horario real
  (se calcula en el navegador del visitante, zona horaria de Montevideo).
- El video del hero carga en desktop y cae a foto en mobile.
- `https://saladbowl.com.uy/sitemap.xml` y `/robots.txt` responden.
- Compartir el link por WhatsApp muestra la miniatura (`/og.jpg`).

## Dónde se editan los datos

| Qué | Archivo |
| --- | --- |
| Nombre, tagline, link del ecommerce, mail, redes | `src/data/site.js` |
| Platos del menú | `src/data/menu.js` |
| Locales y horarios | `src/data/locations.js` |

Los horarios de `locations.js` alimentan el cartel de "abierto / cierra
pronto / cerrado" sin tocar código: se cambian las horas y listo.
