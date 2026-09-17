export const categories = [
  { slug: 'bowls', label: 'Bowls' },
  { slug: 'wraps', label: 'Wraps y sánguches' },
  { slug: 'bebidas', label: 'Bebidas' },
];

/**
 * Carta. `featured: true` marca lo que sale en la preview de la home.
 *
 * Los nombres son los reales. Las descripciones están armadas mirando las
 * fotos, así que hay que confirmarlas con la carta de verdad, y los precios
 * están pendientes: mientras `price` sea null, la card no muestra precio.
 */
export const items = [
  {
    slug: 'caesar-salad',
    name: 'Caesar Salad',
    description: 'Pollo grillado, parmesano, croutons, cherry y hojas verdes.',
    price: null,
    category: 'bowls',
    image: '/img/bowl-cesar.jpg',
    featured: true,
  },
  {
    slug: 'garbanzo-chips-salad',
    name: 'Garbanzo Chips Salad',
    description: 'Garbanzos crocantes, boniato asado, quinoa roja, palta, cherry y castañas.',
    price: null,
    category: 'bowls',
    image: '/img/bowl-garbanzo.jpg',
    featured: true,
  },
  {
    slug: 'california-salad',
    name: 'California Salad',
    description: 'Pollo, halloumi, palta, choclo, aceitunas, cherry y almendras.',
    price: null,
    category: 'bowls',
    image: '/img/bowl-california.jpg',
    featured: true,
  },
  {
    slug: 'sweet-chicken',
    name: 'Sweet Chicken',
    description: 'Pollo, boniato asado, hummus, quinoa roja, cherry y castañas.',
    price: null,
    category: 'bowls',
    image: '/img/bowl-sweet-chicken.jpg',
  },
  {
    // TODO: confirmar el nombre real de este wrap (el de la foto de las dos
    // mitades). "Chicken Wrap" es tentativo.
    slug: 'chicken-wrap',
    name: 'Chicken Wrap',
    description: 'Pollo, quinoa roja, palta, morrón y queso, en tortilla tostada.',
    price: null,
    category: 'wraps',
    image: '/img/wrap-pollo.jpg',
  },
  {
    slug: 'hot-veggie-wrap',
    name: 'Hot Veggie Wrap',
    description: 'Vegetales salteados, quinoa, choclo, morrón y queso, tostado a la plancha.',
    price: null,
    category: 'wraps',
    image: '/img/wrap-veggie.jpg',
    featured: true,
  },
  {
    slug: 'chicken-avocado-sandwich',
    name: 'Chicken Avocado Sandwich',
    description: 'Pollo, palta, cebolla caramelizada y queso crema, en pan artesanal.',
    price: null,
    category: 'wraps',
    image: '/img/sanguche-pollo.jpg',
    featured: true,
  },
  {
    slug: 'exprimido-naranja',
    name: 'Exprimido de naranja',
    description: 'Naranja exprimida en el día, sin azúcar agregada. Botella de 500 ml.',
    price: null,
    category: 'bebidas',
    image: '/img/bebida-jugo.jpg',
    featured: true,
  },
];

/** Lo que se muestra en la home. */
export const featured = items.filter((item) => item.featured);

export const formatPrice = (value) => `$ ${value}`;
