export const site = {
  name: 'Saladbowl',
  tagline: 'Bowls frescos, hechos al momento. Montevideo.',
  // TODO: reemplazar por el link real del ecommerce.
  orderUrl: 'https://pedidos.saladbowl.uy',
  email: 'hola@saladbowl.uy',
  phone: '+598 99 123 456',
  whatsapp: 'https://wa.me/59899123456',
};

/**
 * Video del hero. Mientras `video` sea null se muestra la foto (poster) sola.
 * Para el video final: mp4 (H.264) para Safari + webm (VP9) para el resto,
 * menos de 3 MB, sin audio, loop de 8 a 12 segundos.
 */
export const hero = {
  video: { webm: '/video/hero.webm', mp4: null },
  poster: '/img/hero.svg',
  alt: 'Armado de un bowl en la barra: hojas, palta y aderezo',
};

export const navLinks = [
  { label: 'Menú', href: '/menu' },
  { label: 'Locales', href: '/locales' },
  { label: 'Nosotros', href: '/nosotros' },
];

export const social = [
  { label: 'Instagram', href: 'https://instagram.com/saladbowl.uy' },
  { label: 'TikTok', href: 'https://tiktok.com/@saladbowl.uy' },
  { label: 'LinkedIn', href: 'https://linkedin.com/company/saladbowl' },
];

export const legal = [
  { label: 'Términos', href: '/terminos' },
  { label: 'Privacidad', href: '/privacidad' },
];
