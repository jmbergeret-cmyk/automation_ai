export const bowls = [
  {
    slug: 'verde-bravo',
    name: 'Verde Bravo',
    description: 'Rúcula, palta, pepino, edamame y aderezo de limón con jengibre.',
    price: 420,
    image: '/img/bowl-verde-bravo.svg',
  },
  {
    slug: 'pollo-quinoa',
    name: 'Pollo & Quinoa',
    description: 'Pollo grillado, quinoa, zanahoria asada y yogur con ciboulette.',
    price: 480,
    image: '/img/bowl-pollo-quinoa.svg',
  },
  {
    slug: 'cesar-del-barrio',
    name: 'César del Barrio',
    description: 'Cogollo, parmesano, croutons de masa madre y césar hecha acá.',
    price: 450,
    image: '/img/bowl-cesar.svg',
  },
  {
    slug: 'falafel-de-casa',
    name: 'Falafel de Casa',
    description: 'Falafel horneado, hummus, tomate cherry, menta y tahini.',
    price: 440,
    image: '/img/bowl-falafel.svg',
  },
  {
    slug: 'salmon-sesamo',
    name: 'Salmón & Sésamo',
    description: 'Salmón, arroz yamaní, palta, alga nori y sésamo tostado.',
    price: 590,
    image: '/img/bowl-salmon.svg',
  },
  {
    slug: 'mediterraneo',
    name: 'Mediterráneo',
    description: 'Garbanzos, feta, aceitunas, pepino y oliva con orégano fresco.',
    price: 460,
    image: '/img/bowl-mediterraneo.svg',
  },
];

export const formatPrice = (value) => `$ ${value}`;
