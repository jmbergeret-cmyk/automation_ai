export const categories = [
  { slug: 'bowls', label: 'Bowls' },
  { slug: 'wraps', label: 'Wraps y sánguches' },
  { slug: 'bebidas', label: 'Bebidas' },
  { slug: 'postres', label: 'Postres' },
];

/**
 * Carta completa. `featured: true` marca lo que sale en la preview de la home.
 */
export const items = [
  {
    slug: 'verde-bravo',
    name: 'Verde Bravo',
    description: 'Rúcula, palta, pepino, edamame y aderezo de limón con jengibre.',
    price: 420,
    category: 'bowls',
    image: '/img/bowl-verde-bravo.svg',
  },
  {
    slug: 'pollo-quinoa',
    name: 'Pollo & Quinoa',
    description: 'Pollo grillado, quinoa, zanahoria asada y yogur con ciboulette.',
    price: 480,
    category: 'bowls',
    image: '/img/bowl-pollo-quinoa.svg',
  },
  {
    slug: 'cesar-del-barrio',
    name: 'César del Barrio',
    description: 'Cogollo, pollo grillado, parmesano, croutons y cherry.',
    price: 450,
    category: 'bowls',
    image: '/img/bowl-cesar.jpg', // foto real

    featured: true,
  },
  {
    slug: 'garbanzo-boniato',
    name: 'Garbanzo & Boniato',
    description: 'Garbanzos crocantes, boniato asado, quinoa roja, palta y castañas.',
    price: 440,
    category: 'bowls',
    image: '/img/bowl-garbanzo.jpg', // foto real

    featured: true,
  },
  {
    slug: 'salmon-sesamo',
    name: 'Salmón & Sésamo',
    description: 'Salmón, arroz yamaní, palta, alga nori y sésamo tostado.',
    price: 590,
    category: 'bowls',
    image: '/img/bowl-salmon.svg',
  },
  {
    slug: 'california',
    name: 'California',
    description: 'Pollo, halloumi, palta, choclo, aceitunas y almendras.',
    price: 460,
    category: 'bowls',
    image: '/img/bowl-california.jpg', // foto real

    featured: true,
  },
  {
    slug: 'wrap-cesar',
    name: 'Wrap César',
    description: 'Pollo, cogollo, parmesano y césar, en tortilla de trigo integral.',
    price: 390,
    category: 'wraps',
    image: '/img/wrap-cesar.svg',
    featured: true,
  },
  {
    slug: 'wrap-falafel',
    name: 'Wrap de Falafel',
    description: 'Falafel, hummus, repollo colorado y tahini con limón.',
    price: 380,
    category: 'wraps',
    image: '/img/wrap-falafel.svg',
  },
  {
    slug: 'wrap-pollo',
    name: 'Wrap de Pollo',
    description: 'Pollo, quinoa roja, palta, morrón y queso, en tortilla tostada.',
    price: 410,
    category: 'wraps',
    image: '/img/wrap-pollo.jpg', // foto real

    featured: true,
  },
  {
    slug: 'sanguche-pollo-palta',
    name: 'Sánguche de Pollo y Palta',
    description: 'Pollo, palta, cebolla caramelizada y queso crema, en pan de masa madre.',
    price: 430,
    category: 'wraps',
    image: '/img/sanguche-pollo.jpg', // foto real
    featured: true,
  },
  {
    slug: 'limonada',
    name: 'Limonada de menta',
    description: 'Exprimida en el día, con menta y jengibre.',
    price: 160,
    category: 'bebidas',
    image: '/img/bebida-limonada.svg',
  },
  {
    slug: 'jugo-natural',
    name: 'Jugo natural',
    description: 'Exprimido en el día, sin azúcar agregada. Botella de 500 ml.',
    price: 190,
    category: 'bebidas',
    image: '/img/bebida-jugo.jpg', // foto real

  },
  {
    slug: 'kombucha',
    name: 'Kombucha de casa',
    description: 'Fermentada acá, con pomelo y romero.',
    price: 210,
    category: 'bebidas',
    image: '/img/bebida-kombucha.svg',
  },
  {
    slug: 'agua-con-gas',
    name: 'Agua con gas',
    description: 'Fría, 500 ml.',
    price: 90,
    category: 'bebidas',
    image: '/img/bebida-agua.svg',
  },
  {
    slug: 'yogur-granola',
    name: 'Yogur con granola',
    description: 'Yogur natural, granola tostada y fruta de estación.',
    price: 190,
    category: 'postres',
    image: '/img/postre-yogur.svg',
  },
  {
    slug: 'budin-banana',
    name: 'Budín de banana',
    description: 'Con avena y nueces, sin azúcar agregada.',
    price: 170,
    category: 'postres',
    image: '/img/postre-budin.svg',
  },
  {
    slug: 'trufa-cacao',
    name: 'Trufa de cacao',
    description: 'Dátiles, cacao y almendras. Dos por porción.',
    price: 120,
    category: 'postres',
    image: '/img/postre-trufa.svg',
  },
];

/** Lo que se muestra en la home. */
export const featured = items.filter((item) => item.featured);

export const formatPrice = (value) => `$ ${value}`;
