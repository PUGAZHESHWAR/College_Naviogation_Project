import { buildings, Building } from '../data/buildings';

export const findBestMatch = (query: string): { key: string; building: Building; confidence: number } | null => {
  const normalizedQuery = query.toLowerCase().trim();
  let bestMatch: { key: string; building: Building; confidence: number } | null = null;

  Object.entries(buildings).forEach(([key, building]) => {
    let confidence = 0;
    
    // Check exact name match
    if (building.name.toLowerCase() === normalizedQuery) {
      confidence = 1;
    }
    // Check if query contains the building name
    else if (normalizedQuery.includes(building.name.toLowerCase())) {
      confidence = 0.8;
    }
    // Check keywords
    else if (building.keywords) {
      for (const keyword of building.keywords) {
        if (normalizedQuery.includes(keyword.toLowerCase())) {
          confidence = Math.max(confidence, 0.7);
        }
        // Partial keyword match
        const words = keyword.toLowerCase().split(' ');
        for (const word of words) {
          if (normalizedQuery.includes(word) && word.length > 2) {
            confidence = Math.max(confidence, 0.5);
          }
        }
      }
    }
    
    // Check partial name match
    const nameWords = building.name.toLowerCase().split(' ');
    for (const word of nameWords) {
      if (normalizedQuery.includes(word) && word.length > 2) {
        confidence = Math.max(confidence, 0.4);
      }
    }

    if (confidence > 0 && (!bestMatch || confidence > bestMatch.confidence)) {
      bestMatch = { key, building, confidence };
    }
  });

  return bestMatch && bestMatch.confidence > 0.3 ? bestMatch : null;
};

// Alias for findBestMatch to maintain compatibility
export const findDestinationByText = findBestMatch;

export const extractNavigationCommand = (transcript: string): string | null => {
  const normalized = transcript.toLowerCase();
  
  // Remove common navigation prefixes in English and Tamil
  const prefixes = [
    // English prefixes
    'navigate to',
    'go to',
    'take me to',
    'show me',
    'find',
    'where is',
    'direction to',
    'route to',
    // Tamil prefixes
    'செல்லுங்கள்',
    'போங்கள்',
    'காட்டுங்கள்',
    'எங்கே',
    'வழி',
    'திசை'
  ];
  
  let cleanedTranscript = normalized;
  for (const prefix of prefixes) {
    if (cleanedTranscript.startsWith(prefix)) {
      cleanedTranscript = cleanedTranscript.substring(prefix.length).trim();
      break;
    }
  }
  
  return cleanedTranscript || null;
};

// Function to get quick action suggestions
export const getQuickActionSuggestions = () => {
  return [
    { text: "Navigate to Canteen", action: "Navigate to Canteen" },
    { text: "Go to CSE Block", action: "Go to CSE Block" },
    { text: "Take me to Library", action: "Take me to Library" },
    { text: "Show me the Auditorium", action: "Show me the Auditorium" },
    { text: "Find the Hostel", action: "Find the Hostel" },
    { text: "Where is the Temple", action: "Where is the Temple" }
  ];
};