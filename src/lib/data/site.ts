export const SITE = {
  name: "VOIDHAUS",
  url: "https://voidhaus.com",
  season: "SS 2026",
  tagline: "Dark luxury fashion. Twelve pieces. Four ateliers. One position.",
  email: {
    studio: "studio@voidhaus.com",
    press: "press@voidhaus.com",
  },
  address: ["Via della Spiga, 19", "20121 Milan, Italy"] as const,
  addressCountry: "IT",
  hours: "Mon – Fri, 10:00 – 18:00 CET",
  ateliers: [
    { city: "Milan", specialty: "Outerwear" },
    { city: "Antwerp", specialty: "Tailoring" },
    { city: "Florence", specialty: "Leather" },
    { city: "Tokyo", specialty: "Textiles" },
  ],
} as const;
