type Store = {
  city: string;
  name: string;
  address: string;
  country: string;
};

export type Region = {
  region: string;
  stores: Store[];
};

export const STOCKISTS: Region[] = [
  {
    region: "Europe",
    stores: [
      { city: "Milan", name: "Antonia", address: "Via Cusani 5, 20121", country: "Italy" },
      { city: "Milan", name: "10 Corso Como", address: "Corso Como 10, 20154", country: "Italy" },
      { city: "Paris", name: "Colette", address: "213 Rue Saint-Honoré, 75001", country: "France" },
      { city: "Paris", name: "L'Eclaireur", address: "3 Rue des Rosiers, 75004", country: "France" },
      { city: "London", name: "Dover Street Market", address: "18-22 Haymarket, SW1Y 4DG", country: "UK" },
      { city: "Antwerp", name: "Louis", address: "Lombardenvest 2, 2000", country: "Belgium" },
      { city: "Berlin", name: "Voo Store", address: "Oranienstr. 24, 10999", country: "Germany" },
    ],
  },
  {
    region: "Americas",
    stores: [
      { city: "New York", name: "Opening Ceremony", address: "35 Howard Street, NY 10013", country: "USA" },
      { city: "New York", name: "Barneys New York", address: "660 Madison Ave, NY 10065", country: "USA" },
      { city: "Los Angeles", name: "H.Lorenzo", address: "8660 Sunset Blvd, CA 90069", country: "USA" },
      { city: "Toronto", name: "Ssense", address: "90 St Paul St W, H2Y 1Z1", country: "Canada" },
    ],
  },
  {
    region: "Asia Pacific",
    stores: [
      { city: "Tokyo", name: "United Arrows", address: "3-28-1 Jingumae, Shibuya", country: "Japan" },
      { city: "Tokyo", name: "Isetan", address: "3-14-1 Shinjuku, 160-0022", country: "Japan" },
      { city: "Seoul", name: "Boon The Shop", address: "2F, 86 Cheongdam-dong", country: "Korea" },
      { city: "Hong Kong", name: "Lane Crawford", address: "IFC Mall, 8 Finance Street", country: "HK" },
      { city: "Sydney", name: "Incu", address: "76 Oxford Street, Paddington", country: "Australia" },
    ],
  },
];
