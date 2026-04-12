export type Stadium = {
  id: string;
  name: string;
  city: string;
  state: string;
  capacity?: number;
  coordinates?: { lat: number; lng: number };
  officialWebsite?: string;
  wikipediaSlug?: string;
  notes?: string;
};

export const STADIUMS_INDIA: Stadium[] = [
  {
    id: "in-narendra-modi",
    name: "Narendra Modi Stadium",
    city: "Ahmedabad",
    state: "Gujarat",
    capacity: 132000,
    coordinates: { lat: 23.0917, lng: 72.5979 },
    officialWebsite: "https://www.gujaratcricketassociation.com",
    wikipediaSlug: "Narendra_Modi_Stadium",
  },
  {
    id: "in-eden-gardens",
    name: "Eden Gardens",
    city: "Kolkata",
    state: "West Bengal",
    capacity: 68000,
    coordinates: { lat: 22.5646, lng: 88.3433 },
    officialWebsite: "https://www.cricketassociationofbengal.com",
    wikipediaSlug: "Eden_Gardens",
  },
  {
    id: "in-wankhede",
    name: "Wankhede Stadium",
    city: "Mumbai",
    state: "Maharashtra",
    capacity: 33108,
    coordinates: { lat: 18.9389, lng: 72.8258 },
    officialWebsite: "https://www.mumbaicricket.com",
    wikipediaSlug: "Wankhede_Stadium",
  },
  {
    id: "in-arun-jaitley",
    name: "Arun Jaitley Stadium",
    city: "New Delhi",
    state: "Delhi",
    capacity: 41820,
    coordinates: { lat: 28.6379, lng: 77.243 },
    officialWebsite: "https://ddca.in",
    wikipediaSlug: "Arun_Jaitley_Stadium",
  },
  {
    id: "in-m-chinnaswamy",
    name: "M. Chinnaswamy Stadium",
    city: "Bengaluru",
    state: "Karnataka",
    capacity: 40000,
    coordinates: { lat: 12.9788, lng: 77.5996 },
    officialWebsite: "https://ksca.cricket",
    wikipediaSlug: "M._Chinnaswamy_Stadium",
  },
  {
    id: "in-chepauk",
    name: "M. A. Chidambaram Stadium (Chepauk)",
    city: "Chennai",
    state: "Tamil Nadu",
    capacity: 50000,
    coordinates: { lat: 13.062, lng: 80.2796 },
    officialWebsite: "https://www.tnca.in",
    wikipediaSlug: "M._A._Chidambaram_Stadium",
  },
  {
    id: "in-hyderabad-uppal",
    name: "Rajiv Gandhi Intl. Stadium (Uppal)",
    city: "Hyderabad",
    state: "Telangana",
    capacity: 55000,
    coordinates: { lat: 17.4065, lng: 78.5506 },
    officialWebsite: "https://www.hycricket.org",
    wikipediaSlug: "Rajiv_Gandhi_International_Cricket_Stadium",
  },
  {
    id: "in-mca-pune",
    name: "Maharashtra Cricket Association Stadium",
    city: "Pune",
    state: "Maharashtra",
    capacity: 37000,
    coordinates: { lat: 18.6745, lng: 73.706 },
    officialWebsite: "https://maharashtracricketassociation.com",
    wikipediaSlug: "Maharashtra_Cricket_Association_Stadium",
  },
  {
    id: "in-pca-mohali",
    name: "Punjab Cricket Association IS Bindra Stadium",
    city: "Mohali",
    state: "Punjab",
    capacity: 26800,
    coordinates: { lat: 30.6901, lng: 76.7375 },
    officialWebsite: "https://www.punjabcricket.org",
    wikipediaSlug: "Punjab_Cricket_Association_Stadium",
  },
  {
    id: "in-sawai-mansingh",
    name: "Sawai Mansingh Stadium",
    city: "Jaipur",
    state: "Rajasthan",
    capacity: 30000,
    coordinates: { lat: 26.8941, lng: 75.8018 },
    officialWebsite: "https://www.rsca.in",
    wikipediaSlug: "Sawai_Mansingh_Stadium",
  },
  {
    id: "in-green-park",
    name: "Green Park Stadium",
    city: "Kanpur",
    state: "Uttar Pradesh",
    capacity: 32000,
    coordinates: { lat: 26.4768, lng: 80.3546 },
    wikipediaSlug: "Green_Park_Stadium",
  },
  {
    id: "in-ekana-lucknow",
    name: "BRSABV Ekana Cricket Stadium",
    city: "Lucknow",
    state: "Uttar Pradesh",
    capacity: 50000,
    coordinates: { lat: 26.8136, lng: 80.9398 },
    wikipediaSlug: "Ekana_Cricket_Stadium",
  },
  {
    id: "in-hpca-dharamshala",
    name: "HPCA Stadium",
    city: "Dharamshala",
    state: "Himachal Pradesh",
    capacity: 23000,
    coordinates: { lat: 32.1278, lng: 76.3538 },
    wikipediaSlug: "Himachal_Pradesh_Cricket_Association_Stadium",
  },
  {
    id: "in-holkar",
    name: "Holkar Stadium",
    city: "Indore",
    state: "Madhya Pradesh",
    capacity: 30000,
    coordinates: { lat: 22.7196, lng: 75.8577 },
    wikipediaSlug: "Holkar_Cricket_Stadium",
  },
  {
    id: "in-barsapara",
    name: "Barsapara Cricket Stadium",
    city: "Guwahati",
    state: "Assam",
    capacity: 40000,
    coordinates: { lat: 26.1113, lng: 91.7476 },
    wikipediaSlug: "Barsapara_Cricket_Stadium",
  },
  {
    id: "in-barabati",
    name: "Barabati Stadium",
    city: "Cuttack",
    state: "Odisha",
    capacity: 45000,
    coordinates: { lat: 20.4625, lng: 85.8828 },
    wikipediaSlug: "Barabati_Stadium",
  },
  {
    id: "in-jsca-ranchi",
    name: "JSCA Intl. Stadium Complex",
    city: "Ranchi",
    state: "Jharkhand",
    capacity: 50000,
    coordinates: { lat: 23.3441, lng: 85.3075 },
    wikipediaSlug: "JSCA_International_Stadium_Complex",
  },
  {
    id: "in-vidarbha-nagpur",
    name: "Vidarbha Cricket Association Stadium",
    city: "Nagpur",
    state: "Maharashtra",
    capacity: 45000,
    coordinates: { lat: 21.1458, lng: 79.0882 },
    wikipediaSlug: "Vidarbha_Cricket_Association_Stadium",
  },
  {
    id: "in-nehru-stadium-kochi",
    name: "Jawaharlal Nehru Stadium",
    city: "Kochi",
    state: "Kerala",
    capacity: 80000,
    coordinates: { lat: 9.9867, lng: 76.2996 },
    wikipediaSlug: "Jawaharlal_Nehru_Stadium,_Kochi",
  },
  {
    id: "in-saltlake",
    name: "Salt Lake Stadium",
    city: "Kolkata",
    state: "West Bengal",
    capacity: 85000,
    coordinates: { lat: 22.5659, lng: 88.4133 },
    wikipediaSlug: "Salt_Lake_Stadium",
  },
  {
    id: "in-kanteerava",
    name: "Sree Kanteerava Stadium",
    city: "Bengaluru",
    state: "Karnataka",
    capacity: 25000,
    coordinates: { lat: 12.9681, lng: 77.5964 },
    wikipediaSlug: "Sree_Kanteerava_Stadium",
  },
  {
    id: "in-jln-delhi",
    name: "Jawaharlal Nehru Stadium",
    city: "New Delhi",
    state: "Delhi",
    capacity: 60000,
    coordinates: { lat: 28.5826, lng: 77.2331 },
    wikipediaSlug: "Jawaharlal_Nehru_Stadium_(Delhi)",
  },
  {
    id: "in-marine-drive-mumbai",
    name: "Mumbai Football Arena",
    city: "Mumbai",
    state: "Maharashtra",
    capacity: 6688,
    coordinates: { lat: 19.0439, lng: 72.8258 },
    wikipediaSlug: "Mumbai_Football_Arena",
  },
  {
    id: "in-gmc-balewadi",
    name: "Shree Shiv Chhatrapati Sports Complex",
    city: "Pune",
    state: "Maharashtra",
    capacity: 20000,
    coordinates: { lat: 18.5729, lng: 73.7737 },
    wikipediaSlug: "Shree_Shiv_Chhatrapati_Sports_Complex",
  },
];

export const DEFAULT_STADIUM_ID = STADIUMS_INDIA[0]?.id ?? "in-narendra-modi";

export function findStadiumById(id: string): Stadium | undefined {
  return STADIUMS_INDIA.find((s) => s.id === id);
}

export function buildStadiumSearchQuery(stadium: Stadium): string {
  return `${stadium.name}, ${stadium.city}, ${stadium.state}, India`;
}

export function buildGoogleMapsLink(stadium: Stadium): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(buildStadiumSearchQuery(stadium))}`;
}

export function buildGoogleMapsEmbedUrl(stadium: Stadium, apiKey?: string): string {
  const query = encodeURIComponent(buildStadiumSearchQuery(stadium));
  if (apiKey) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(apiKey)}&q=${query}`;
  }
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

export function buildWikipediaSummaryUrl(stadium: Stadium): string | null {
  if (!stadium.wikipediaSlug) return null;
  return `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(stadium.wikipediaSlug)}`;
}

