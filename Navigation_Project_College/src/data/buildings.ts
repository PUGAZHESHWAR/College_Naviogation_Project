export interface Building {
  name: string;
  lat: number;
  lng: number;
  keywords?: string[];
}

export const buildings: Record<string, Building> = {
  gate: { 
    name: "Gate", 
    lat: 12.193100, 
    lng: 79.084515,
    keywords: ["gate", "entrance", "main gate"]
  },
  center: { 
    name: "Arunai Center", 
    lat: 12.192708, 
    lng: 79.083666,
    keywords: ["center", "arunai center", "main building"]
  },
  gateway: { 
    name: "Arunai Gateway", 
    lat: 12.192430, 
    lng: 79.083276,
    keywords: ["gateway", "arunai gateway"]
  },
  acaudi: { 
    name: "AC Auditorium", 
    lat: 12.192780, 
    lng: 79.083910,
    keywords: ["ac auditorium", "auditorium", "ac audi", "hall"]
  },
  canteen: { 
    name: "Arunai Canteen", 
    lat: 12.192400, 
    lng: 79.084100,
    keywords: ["canteen", "food", "dining", "cafeteria"]
  },
  hostel1: { 
    name: "Mother Theresa Hostel", 
    lat: 12.192100, 
    lng: 79.083300,
    keywords: ["mother theresa hostel", "hostel", "girls hostel", "ladies hostel"]
  },
  temple: { 
    name: "Arunai Temple", 
    lat: 12.192500, 
    lng: 79.083800,
    keywords: ["temple", "arunai temple", "prayer"]
  },
  guest: { 
    name: "Guest House", 
    lat: 12.193500, 
    lng: 79.083600,
    keywords: ["guest house", "guest", "accommodation"]
  },
  mens: { 
    name: "Mens Hostel", 
    lat: 12.192000, 
    lng: 79.083000,
    keywords: ["mens hostel", "boys hostel", "men hostel"]
  },
  openaudi: { 
    name: "Open Auditorium", 
    lat: 12.192850, 
    lng: 79.084000,
    keywords: ["open auditorium", "outdoor auditorium", "open air"]
  },
  mess: { 
    name: "Boys Mess", 
    lat: 12.192750, 
    lng: 79.083500,
    keywords: ["boys mess", "mess", "dining hall"]
  },
  mech: { 
    name: "Mechanical Dept", 
    lat: 12.193180, 
    lng: 79.084460,
    keywords: ["mechanical", "mech", "mechanical department", "mechanical block"]
  },
  civil: { 
    name: "Civil Block", 
    lat: 12.193200, 
    lng: 79.084200,
    keywords: ["civil", "civil block", "civil engineering"]
  },
  it: { 
    name: "IT Block", 
    lat: 12.193100, 
    lng: 79.083850,
    keywords: ["it", "it block", "information technology"]
  },
  biotech: { 
    name: "Biotech Block", 
    lat: 12.193817, 
    lng: 79.082816,
    keywords: ["biotech", "biotechnology", "biotech block"]
  },
  wrestroom: { 
    name: "Womens Restroom", 
    lat: 12.193818, 
    lng: 79.083408,
    keywords: ["womens restroom", "ladies restroom", "women toilet"]
  },
  brestroom1: { 
    name: "Boys Restroom 1", 
    lat: 12.192795, 
    lng: 79.082949,
    keywords: ["boys restroom", "mens restroom", "toilet"]
  },
  ece: { 
    name: "ECE Block", 
    lat: 12.192571, 
    lng: 79.082783,
    keywords: ["ece", "ece block", "electronics", "communication"]
  },
  eee: { 
    name: "EEE Block", 
    lat: 12.193138, 
    lng: 79.083092,
    keywords: ["eee", "eee block", "electrical", "electronics"]
  },
  cse: { 
    name: "CSE Block", 
    lat: 12.192838, 
    lng: 79.083230,
    keywords: ["cse", "cse block", "computer science", "computer"]
  },
  has: { 
    name: "H A S Block", 
    lat: 12.193401, 
    lng: 79.083641,
    keywords: ["has", "has block", "humanities"]
  },
  store: { 
    name: "Store", 
    lat: 12.192168, 
    lng: 79.084514,
    keywords: ["store", "shop", "supplies"]
  },
  parking: { 
    name: "Parking Area", 
    lat: 12.192153, 
    lng: 79.084343,
    keywords: ["parking", "parking area", "car park"]
  },
  security: { 
    name: "Security Block", 
    lat: 12.193018, 
    lng: 79.084381,
    keywords: ["security", "security block", "guard"]
  }
};

export const buildingsList = Object.entries(buildings).map(([key, building]) => ({
  key,
  ...building
}));