# Destination Matching Implementation

## Overview
This implementation allows users to type natural language messages in the text input box, and the system will automatically detect destination names and start navigation when a valid destination is found.

## How It Works

### 1. Text Input Processing
When a user types a message in the text input box (like "I want to go to Canteen"), the system:

1. **Captures the input**: The message is sent to the `handleSendMessage` function in `App.tsx`
2. **Searches for destinations**: Uses `findDestinationByText()` to search for destination names in the message
3. **Matches against building data**: Compares the text against all building names and keywords in `buildings.ts`
4. **Calculates confidence**: Assigns a confidence score based on how well the text matches

### 2. Destination Matching Algorithm
The `findDestinationByText()` function (alias for `findBestMatch()`) uses multiple matching strategies:

- **Exact name match**: Highest confidence (100%)
- **Contains building name**: High confidence (80%)
- **Keyword match**: Good confidence (70%)
- **Partial keyword match**: Medium confidence (50%)
- **Partial name match**: Lower confidence (40%)

### 3. Confidence Threshold
Only destinations with confidence > 30% are considered valid matches.

## Example Usage

### Valid Inputs:
- "I want to go to Canteen" → Matches "Arunai Canteen"
- "Navigate to CSE Block" → Matches "CSE Block"
- "Take me to the Temple" → Matches "Arunai Temple"
- "Show me the Auditorium" → Matches "AC Auditorium"
- "Where is the Hostel" → Matches "Mother Theresa Hostel"

### Invalid Inputs:
- "Hello, how are you?" → No destination found
- "Random text" → No destination found

## Implementation Details

### Files Modified:

1. **`src/utils/voiceCommands.ts`**:
   - Added `findDestinationByText` function (alias for `findBestMatch`)
   - Added `getQuickActionSuggestions` function

2. **`src/App.tsx`**:
   - Updated `handleSendMessage` to use destination matching
   - Updated `handleQuickResponse` to use destination matching
   - Added import for `findDestinationByText`

### Key Features:

1. **Natural Language Processing**: Users can type natural sentences
2. **Fuzzy Matching**: Handles partial matches and typos
3. **Multiple Keywords**: Each building has multiple keywords for better matching
4. **Confidence Scoring**: Provides feedback on match quality
5. **Fallback Responses**: Helpful messages when no destination is found

## Building Data Structure

Each building in `buildings.ts` has:
- `name`: Official building name
- `keywords`: Array of alternative names/terms
- `lat/lng`: Coordinates for navigation

Example:
```typescript
canteen: { 
  name: "Arunai Canteen", 
  lat: 12.192030, 
  lng: 79.083649,
  keywords: ["canteen", "food", "dining", "cafeteria"]
}
```

## User Experience

1. **Type a message** in the text input box
2. **System analyzes** the text for destination names
3. **If found**: Navigation starts automatically with confirmation message
4. **If not found**: Helpful suggestion message is shown
5. **Chat history** is updated with both user message and bot response

This implementation provides a seamless, natural language interface for campus navigation! 