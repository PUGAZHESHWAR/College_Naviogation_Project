// Simple test to verify destination matching functionality
import { findDestinationByText } from './src/utils/voiceCommands.js';

// Test cases
const testCases = [
  "I want to go to Canteen",
  "Navigate to CSE Block", 
  "Take me to the Temple",
  "Show me the Auditorium",
  "Where is the Hostel",
  "Go to the Library",
  "Find the Parking Area",
  "I need to go to the Store",
  "Hello, how are you?",
  "Random text that doesn't match any destination"
];

console.log("Testing destination matching functionality...\n");

testCases.forEach((testCase, index) => {
  console.log(`Test ${index + 1}: "${testCase}"`);
  const result = findDestinationByText(testCase);
  
  if (result) {
    console.log(`✓ Found: ${result.building.name} (Confidence: ${Math.round(result.confidence * 100)}%)`);
  } else {
    console.log("✗ No destination found");
  }
  console.log("");
});

console.log("Test completed!"); 