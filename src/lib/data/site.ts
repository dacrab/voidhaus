export const SITE = {
  name: "VOIDHAUS",
  season: "SS 2026",
  tagline: "Twelve objects for the body and the room. No season. One position.",
  email: {
    studio: "studio@voidhaus.com",
    press: "press@voidhaus.com",
  },
  address: ["Via della Spiga, 19", "20121 Milan, Italy"] as const,
  hours: "Mon – Fri, 10:00 – 18:00 CET",
  ateliers: [
    { city: "Milan", specialty: "Outerwear" },
    { city: "Antwerp", specialty: "Body" },
    { city: "Florence", specialty: "Leather" },
    { city: "Tokyo", specialty: "Jersey" },
  ],
} as const;
