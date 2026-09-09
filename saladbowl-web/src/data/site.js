export const site = {
  name: 'Saladbowl',
  tagline: 'Unite a la revolución saludable. Montevideo.',
  orderUrl: 'https://saladbowl.pidedirecto.uy/',
  // TODO: sin confirmar — casilla de mail (sería @saladbowl.com.uy) y el
  // WhatsApp del local.
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

// TODO: confirmar los usuarios reales de cada red.
export const social = [
  { label: 'Instagram', href: 'https://instagram.com/saladbowl.uy' },
  { label: 'Facebook', href: 'https://facebook.com/saladbowl.uy' },
];

export const legal = [
  { label: 'Términos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
];
