import { Assignment, Participant } from './types';

const colorPalette = {
  // Generation 3 colors (Grandparent) - Royal purple theme
  grandparent: {
    bg: '#663399',
    text: '#ffffff'
  },
  // Generation 2 colors (Parents) - Deep blues and teals
  parent: [
    { bg: '#2c5282', text: '#ffffff' }, // Deep blue
    { bg: '#285e61', text: '#ffffff' }, // Deep teal
    { bg: '#2a4365', text: '#ffffff' }, // Navy blue
    { bg: '#046c4e', text: '#ffffff' }, // Forest green
    { bg: '#4a5568', text: '#ffffff' }  // Cool gray
  ],
  // Generation 1 colors (Children) - Vibrant but professional
  child: [
    { bg: '#4299e1', text: '#ffffff' }, // Blue
    { bg: '#48bb78', text: '#000000' }, // Green
    { bg: '#ed8936', text: '#000000' }, // Orange
    { bg: '#667eea', text: '#ffffff' }, // Indigo
    { bg: '#38b2ac', text: '#000000' }, // Teal
    { bg: '#9f7aea', text: '#ffffff' }, // Purple
    { bg: '#f56565', text: '#ffffff' }  // Red
  ]
};

export function getParticipantColor(participant: Participant): { bg: string; text: string } {
  if (participant.generation === 3) {
    return colorPalette.grandparent;
  }
  
  const palette = participant.generation === 2 ? colorPalette.parent : colorPalette.child;
  const colorIndex = (participant.family * 3 + participant.name.length) % palette.length;
  return palette[colorIndex];
}

export function assignGifts(participants: Participant[], seed: number): {
  assignments: Assignment[];
  seed: number;
} {
  const assignments: Assignment[] = [];
  
  // Create a map to track gifts given and received
  const giftsGiven: Record<string, string[]> = {};
  const giftsReceived: Record<string, string[]> = {};
  
  participants.forEach(p => {
    giftsGiven[p.name] = [];
    giftsReceived[p.name] = [];
  });

  // Helper function to check if an assignment is valid
  const isValidAssignment = (giver: Participant, receiver: Participant): boolean => {
    if (giver.family === receiver.family) return false;
    if (giftsGiven[giver.name].includes(receiver.name)) return false;
    if (giftsReceived[receiver.name].length >= 2) return false;
    if (giftsGiven[giver.name].length >= 2) return false;
    
    // Prefer same generation assignments
    if (Math.abs(giver.generation - receiver.generation) > 1) {
      // Allow only if no other options are available
      const sameGenAvailable = participants.some(p => 
        p.name !== receiver.name &&
        p.family !== giver.family &&
        Math.abs(p.generation - giver.generation) <= 1 &&
        !giftsGiven[giver.name].includes(p.name) &&
        giftsReceived[p.name].length < 2
      );
      if (sameGenAvailable) return false;
    }
    
    return true;
  };

  // Seed the random number generator
  const random = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  // Try to assign gifts
  let attempts = 0;
  const maxAttempts = 1000;

  while (attempts < maxAttempts) {
    attempts++;
    let success = true;

    // Reset assignments
    assignments.length = 0;
    participants.forEach(p => {
      giftsGiven[p.name] = [];
      giftsReceived[p.name] = [];
    });

    // Shuffle participants using seeded random
    const shuffled = [...participants]
      .map(value => ({ value, sort: random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);

    // First pass - try to assign within generation where possible
    for (const giver of shuffled) {
      if (giftsGiven[giver.name].length >= 2) continue;

      // First try same generation
      const sameGenReceivers = shuffled.filter(p => 
        p.generation === giver.generation && 
        isValidAssignment(giver, p)
      );

      // Then try adjacent generations
      const adjacentReceivers = shuffled.filter(p => 
        Math.abs(p.generation - giver.generation) === 1 && 
        isValidAssignment(giver, p)
      );

      // Finally, try any valid receiver
      const otherReceivers = shuffled.filter(p => 
        !sameGenReceivers.includes(p) &&
        !adjacentReceivers.includes(p) &&
        isValidAssignment(giver, p)
      );

      const possibleReceivers = [...sameGenReceivers, ...adjacentReceivers, ...otherReceivers];

      while (giftsGiven[giver.name].length < 2 && possibleReceivers.length > 0) {
        const randomIndex = Math.floor(random() * possibleReceivers.length);
        const receiver = possibleReceivers[randomIndex];
        
        if (isValidAssignment(giver, receiver)) {
          assignments.push({ giver: giver.name, receiver: receiver.name });
          giftsGiven[giver.name].push(receiver.name);
          giftsReceived[receiver.name].push(giver.name);
          possibleReceivers.splice(randomIndex, 1);
        } else {
          possibleReceivers.splice(randomIndex, 1);
        }
      }

      if (giftsGiven[giver.name].length < 2) {
        success = false;
        break;
      }
    }

    if (success && participants.every(p => 
      giftsGiven[p.name].length === 2 && 
      giftsReceived[p.name].length === 2
    )) {
      return { assignments, seed };
    }
  }

  throw new Error('Could not generate valid assignments after maximum attempts');
}