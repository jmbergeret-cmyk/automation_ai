export const site = {
  name: 'Saladbowl',
  tagline: 'Unite a la revolución saludable. Montevideo.',
  orderUrl: 'https://saladbowl.pidedirecto.uy/',
  // hola@ es un alias de gestion@ en Google Workspace (confirmado 29/09/2026).
  // TODO: WhatsApp del local (mientras sea null, el link no se muestra).
  email: 'hola@saladbowl.com.uy',
  phone: null,
  whatsapp: null,
};

/**
 * Video del hero. Mientras `video` sea null se muestra la foto (poster) sola.
 * Para el video final: mp4 (H.264) para Safari + webm (VP9) para el resto,
 * menos de 3 MB, sin audio, loop de 8 a 12 segundos.
 */
export const hero = {
  video: { webm: '/video/hero.webm', mp4: null },
  poster: '/img/hero.jpg',
  posterMobile: '/img/hero-mobile.jpg',
  alt: 'Bowl California de Saladbowl: pollo, halloumi, palta, choclo y aceitunas',
};

export const navLinks = [
  { label: 'Menú', href: '/menu' },
  { label: 'Locales', href: '/locales' },
  { label: 'Nosotros', href: '/nosotros' },
];

export const social = [
  { label: 'Instagram', href: 'https://instagram.com/saladbowluy' },
  // TODO: Facebook — falta el usuario real de la página; se agrega cuando Juan lo pase.
  // { label: 'Facebook', href: 'https://facebook.com/…' },
];

export const legal = [
  { label: 'Términos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
];
