export const SITE = {
  name: 'VOIDHAUS',
  season: 'SS 2026',
  tagline: 'Dark luxury fashion. Twelve pieces. Four ateliers. One position.',
  email: {
    studio:  'studio@voidhaus.com',
    press:   'press@voidhaus.com',
    enquiry: 'vkavouras@proton.me',
  },
  address: ['Via della Spiga, 19', '20121 Milan, Italy'],
  hours: 'Mon – Fri, 10:00 – 18:00 CET',
  ateliers: [
    { city: 'Milan',    role: 'Outerwear' },
    { city: 'Antwerp',  role: 'Tailoring' },
    { city: 'Florence', role: 'Leather'   },
    { city: 'Tokyo',    role: 'Textiles'  },
  ],
} as const;
