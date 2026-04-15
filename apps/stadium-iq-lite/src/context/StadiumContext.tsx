import React, { createContext, useContext, useState, useEffect } from 'react';

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
  gateList?: string[];
  foodZones?: string[];
  toiletNodes?: string[];
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
    gateList: ["North A", "South B", "East C", "West D"],
    foodZones: ["Alpha Grill", "Stadium Snacks", "Chai Hub", "Curry Corner"],
    toiletNodes: ["North T1", "South T2", "East T3", "West T4"]
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
    gateList: ["Gate 1", "Gate 5", "Club Entrance"],
    foodZones: ["Mishti Hub", "Kolkata Rolls", "Stadium Snacks"],
    toiletNodes: ["Level 1 East", "Level 2 West"]
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
    gateList: ["Marine Drive Gate", "Vinoo Mankad Gate"],
    foodZones: ["Vada Pav Express", "Mumbai Masala"],
    toiletNodes: ["North Stand T1", "Grandstand T2"]
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
    gateList: ["Gate 1", "Gate 3", "Gate 15"],
    foodZones: ["Dilli Chat", "Stadium Grill"],
    toiletNodes: ["T1 North", "T2 West"]
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
    gateList: ["Cubbon Park Gate", "Queen's Road Gate"],
    foodZones: ["Bisi Bele Bath Hub", "Stadium Snacks"],
    toiletNodes: ["P1 Stand T", "P2 Stand T"]
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
    gateList: ["Wallajah Road Gate", "Victoria Hostel Gate"],
    foodZones: ["Marina Seafood", "Chennai Curries"],
    toiletNodes: ["Level 1 East", "Level 1 West"]
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
    gateList: ["Gate 1 Main", "Gate 8 Players"],
    foodZones: ["Hyderabadi Biryani", "Deccan Snacks"],
    toiletNodes: ["North Stand T", "South Stand T"]
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
    gateList: ["Gahunje Gate", "West Gate"],
    foodZones: ["Puneri Misal", "Snack Center"],
    toiletNodes: ["Section A T", "Section C T"]
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
    gateList: ["Gate 1 North", "Gate 4 South"],
    foodZones: ["Amritsari Kulcha", "Lassi Bar"],
    toiletNodes: ["Level 0 T", "Level 1 T"]
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
    gateList: ["East Gate", "West Gate"],
    foodZones: ["Jaipur Sweets", "Rajasthan Rasoi"],
    toiletNodes: ["North End T", "South End T"]
  },
  {
    id: "in-ekana-lucknow",
    name: "BRSABV Ekana Cricket Stadium",
    city: "Lucknow",
    state: "Uttar Pradesh",
    capacity: 50000,
    coordinates: { lat: 26.8136, lng: 80.9398 },
    wikipediaSlug: "Ekana_Cricket_Stadium",
    gateList: ["Gate 1 Outer", "Gate 3 Inner"],
    foodZones: ["Lucknowi Kabab", "Awadhi Hub"],
    toiletNodes: ["Floor 1 East", "Floor 1 West"]
  },
  {
    id: "in-hpca-dharamshala",
    name: "HPCA Stadium",
    city: "Dharamshala",
    state: "Himachal Pradesh",
    capacity: 23000,
    coordinates: { lat: 32.1278, lng: 76.3538 },
    wikipediaSlug: "Himachal_Pradesh_Cricket_Association_Stadium",
    gateList: ["Lower Gate", "Upper Gate"],
    foodZones: ["Mountain Snacks", "Tibetan Kitchen"],
    toiletNodes: ["Stand A T", "Stand B T"]
  },
  {
    id: "in-vca-nagpur",
    name: "Vidarbha Cricket Association Stadium",
    city: "Nagpur",
    state: "Maharashtra",
    capacity: 45000,
    coordinates: { lat: 21.1492, lng: 79.0806 },
    wikipediaSlug: "Vidarbha_Cricket_Association_Stadium",
    gateList: ["Jamtha Gate 1", "Jamtha Gate 2"],
    foodZones: ["Nagpur Orange Bar", "Samosa Point"],
    toiletNodes: ["Level 1 T", "Level 2 T"]
  },
  {
    id: "in-jsca-ranchi",
    name: "JSCA International Stadium Complex",
    city: "Ranchi",
    state: "Jharkhand",
    capacity: 50000,
    coordinates: { lat: 23.27, lng: 85.27 },
    wikipediaSlug: "JSCA_International_Stadium_Complex",
    gateList: ["North Pavilion Gate", "South Pavilion Gate"],
    foodZones: ["Jharkhandi Flavors", "Snack Shack"],
    toiletNodes: ["West Block T", "East Block T"]
  },
  {
    id: "in-aca-vdca-vizag",
    name: "ACA-VDCA Cricket Stadium",
    city: "Visakhapatnam",
    state: "Andhra Pradesh",
    capacity: 25000,
    coordinates: { lat: 17.7981, lng: 83.3508 },
    wikipediaSlug: "Dr._Y._S._Rajasekhara_Reddy_ACA-VDCA_Cricket_Stadium",
    gateList: ["Gate 1 Main", "Gate 2 Side"],
    foodZones: ["Vizag Beach Snacks", "Andhra Spice"],
    toiletNodes: ["North T", "South T"]
  },
  {
    id: "in-sca-rajkot",
    name: "Saurashtra Cricket Association Stadium",
    city: "Rajkot",
    state: "Gujarat",
    capacity: 28000,
    coordinates: { lat: 22.36, lng: 70.71 },
    wikipediaSlug: "Saurashtra_Cricket_Association_Stadium",
    gateList: ["Hirasar Gate", "Section 1 Gate"],
    foodZones: ["Kathiyawadi Hub", "Gujarati Thali"],
    toiletNodes: ["Tier 1 T", "Tier 2 T"]
  },
  {
    id: "in-holkar-indore",
    name: "Holkar Cricket Stadium",
    city: "Indore",
    state: "Madhya Pradesh",
    capacity: 30000,
    coordinates: { lat: 22.7231, lng: 75.8767 },
    wikipediaSlug: "Holkar_Stadium",
    gateList: ["Usha Raje Gate", "South Gate"],
    foodZones: ["Indori Poha", "Sarafa Snacks"],
    toiletNodes: ["Level 1 T", "Level 2 T"]
  },
  {
    id: "in-greenfield-tvm",
    name: "Greenfield International Stadium",
    city: "Thiruvananthapuram",
    state: "Kerala",
    capacity: 50000,
    coordinates: { lat: 8.5671, lng: 76.8837 },
    wikipediaSlug: "Greenfield_International_Stadium",
    gateList: ["Karyavattom Gate", "West Gate"],
    foodZones: ["Kerala Seafood", "Coconut Hub"],
    toiletNodes: ["Zone A T", "Zone B T"]
  },
  {
    id: "in-barsapara-guwahati",
    name: "Barsapara Cricket Stadium",
    city: "Guwahati",
    state: "Assam",
    capacity: 40000,
    coordinates: { lat: 26.1432, lng: 91.7364 },
    wikipediaSlug: "Barsapara_Stadium",
    gateList: ["North Gate", "Sound Gate"],
    foodZones: ["Assamese Tea", "Stadium Snacks"],
    toiletNodes: ["Block A T", "Block C T"]
  },
  {
    id: "in-svns-raipur",
    name: "Shaheed Veer Narayan Singh Intl. Stadium",
    city: "Raipur",
    state: "Chhattisgarh",
    capacity: 65000,
    coordinates: { lat: 21.1925, lng: 81.7661 },
    wikipediaSlug: "Shaheed_Veer_Narayan_Singh_International_Cricket_Stadium",
    gateList: ["Gate 1 Main", "Gate 10 Side"],
    foodZones: ["Chhattisgarhi Tadka", "Snack Point"],
    toiletNodes: ["Sector 1 T", "Sector 5 T"]
  },
  {
    id: "in-barabati-cuttack",
    name: "Barabati Stadium",
    city: "Cuttack",
    state: "Odisha",
    capacity: 45000,
    coordinates: { lat: 20.4811, lng: 85.8675 },
    wikipediaSlug: "Barabati_Stadium",
    gateList: ["Gate 1 Main", "Gate 4 Players"],
    foodZones: ["Odia Flavors", "Cuttack Curries"],
    toiletNodes: ["North T", "South T"]
  },
  {
    id: "in-green-park-kanpur",
    name: "Green Park Stadium",
    city: "Kanpur",
    state: "Uttar Pradesh",
    capacity: 32000,
    coordinates: { lat: 26.4841, lng: 80.3501 },
    wikipediaSlug: "Green_Park_Stadium",
    gateList: ["Gate 1 East", "Gate 2 West"],
    foodZones: ["Kanpur Chat", "UP Snacks"],
    toiletNodes: ["Level 1 T", "Level 2 T"]
  },
  {
    id: "in-dy-patil-mumbai",
    name: "Dr. DY Patil Sports Academy",
    city: "Navi Mumbai",
    state: "Maharashtra",
    capacity: 55000,
    coordinates: { lat: 19.0436, lng: 73.0271 },
    wikipediaSlug: "DY_Patil_Stadium",
    gateList: ["Gate 1 Outer", "Gate 5 Club"],
    foodZones: ["Mumbai Street Food", "DY Grill"],
    toiletNodes: ["East T", "West T"]
  },
  {
    id: "in-brabourne-mumbai",
    name: "Brabourne Stadium",
    city: "Mumbai",
    state: "Maharashtra",
    capacity: 20000,
    coordinates: { lat: 18.9322, lng: 72.8244 },
    wikipediaSlug: "Brabourne_Stadium",
    gateList: ["CCI Gate", "North Gate"],
    foodZones: ["CCI Bistro", "Mumbai Snacks"],
    toiletNodes: ["Level 1 T", "Level 2 T"]
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
  const key = apiKey || (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string);
  const query = encodeURIComponent(buildStadiumSearchQuery(stadium));
  
  if (key) {
    return `https://www.google.com/maps/embed/v1/place?key=${encodeURIComponent(key)}&q=${query}`;
  }
  return `https://www.google.com/maps?q=${query}&output=embed`;
}

interface StadiumContextType {
  stadiumId: string;
  stadium: Stadium;
  setStadiumId: (id: string) => void;
}

const StadiumContext = createContext<StadiumContextType | undefined>(undefined);

export const StadiumProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stadiumId, setStadiumIdState] = useState<string>(() => {
    return localStorage.getItem('stadiumiq_stadium_id') || DEFAULT_STADIUM_ID;
  });

  const stadium = findStadiumById(stadiumId) || STADIUMS_INDIA[0];

  const setStadiumId = (id: string) => {
    setStadiumIdState(id);
    localStorage.setItem('stadiumiq_stadium_id', id);
  };

  return (
    <StadiumContext.Provider value={{ stadiumId, stadium, setStadiumId }}>
      {children}
    </StadiumContext.Provider>
  );
};

export const useStadium = () => {
  const context = useContext(StadiumContext);
  if (!context) throw new Error('useStadium must be used within a StadiumProvider');
  return context;
};
