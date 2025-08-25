// Lesson content for each step in the check-in process
// Written in simple B1-B2 level English for Cambodian learners

export interface StepContent {
  id: string;
  title: string;
  icon: string;
  keyPhrases: string[];
  commonMistakes: string[];
  tips: string[];
  vocabulary: { word: string; meaning: string }[];
  exampleDialogue: { speaker: string; text: string }[];
}

export const checkInSteps: StepContent[] = [
  {
    id: 'greeting',
    title: 'Welcome Guest',
    icon: '👋',
    keyPhrases: [
      'Good evening. Welcome!',
      'How may I help you?',
      'Welcome to our hotel.',
      'Good afternoon, sir/madam.',
    ],
    commonMistakes: [
      '❌ "What you want?" → ✅ "How may I help you?"',
      '❌ "Hello" (too casual) → ✅ "Good evening"',
      '❌ No smile in voice → ✅ Smile when speaking',
    ],
    tips: [
      'Always smile - guests can hear it',
      'Make eye contact',
      'Stand up straight',
      'Speak slowly and clearly',
    ],
    vocabulary: [
      { word: 'Welcome', meaning: 'សូមស្វាគមន៍' },
      { word: 'Good evening', meaning: 'សួស្តីល្ងាច' },
      { word: 'Help', meaning: 'ជួយ' },
      { word: 'Guest', meaning: 'ភ្ញៀវ' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'Good evening. Welcome to Grand Hotel!' },
      { speaker: 'Guest', text: 'Hello, I have a booking.' },
      { speaker: 'You', text: 'Wonderful! How may I help you?' },
    ],
  },
  {
    id: 'booking',
    title: 'Check Booking',
    icon: '📋',
    keyPhrases: [
      'Do you have a booking?',
      'Have you made a reservation?',
      'May I check your booking?',
      'Let me find your reservation.',
    ],
    commonMistakes: [
      '❌ "You book?" → ✅ "Do you have a booking?"',
      '❌ "Give me name" → ✅ "May I have your name?"',
      '❌ Rush the guest → ✅ Be patient',
    ],
    tips: [
      'Use "booking" - it\'s simpler than "reservation"',
      'Always say "please"',
      'Look at computer while checking',
      'Say "One moment, please" if it takes time',
    ],
    vocabulary: [
      { word: 'Booking', meaning: 'ការកក់' },
      { word: 'Reservation', meaning: 'ការកក់ទុក' },
      { word: 'Check', meaning: 'ពិនិត្យ' },
      { word: 'Find', meaning: 'រក' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'Do you have a booking with us?' },
      { speaker: 'Guest', text: 'Yes, I booked online.' },
      { speaker: 'You', text: 'Perfect! Let me check that for you.' },
    ],
  },
  {
    id: 'name',
    title: 'Ask for Name',
    icon: '👤',
    keyPhrases: [
      'May I have your name, please?',
      'Your name, please?',
      'Could you tell me your name?',
      'Under what name is the booking?',
    ],
    commonMistakes: [
      '❌ "What name?" → ✅ "Your name, please?"',
      '❌ "Tell name" → ✅ "May I have your name?"',
      '❌ Not saying "please" → ✅ Always add "please"',
    ],
    tips: [
      'Always use "please" when asking',
      'If name is difficult, ask to spell it',
      'Say: "Could you spell that, please?"',
      'Write name carefully',
    ],
    vocabulary: [
      { word: 'Name', meaning: 'ឈ្មោះ' },
      { word: 'Please', meaning: 'សូម' },
      { word: 'Spell', meaning: 'ប្រកប' },
      { word: 'Under', meaning: 'ក្រោម' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'May I have your name, please?' },
      { speaker: 'Guest', text: 'John Smith.' },
      { speaker: 'You', text: 'Thank you, Mr. Smith. Let me check.' },
    ],
  },
  {
    id: 'passport',
    title: 'Request ID',
    icon: '🆔',
    keyPhrases: [
      'May I see your passport, please?',
      'Could I have your ID, please?',
      'Passport, please?',
      'I need to check your ID, please.',
    ],
    commonMistakes: [
      '❌ "Give passport" → ✅ "May I see your passport?"',
      '❌ "I want passport" → ✅ "Could I have your ID?"',
      '❌ Take without asking → ✅ Wait for guest to give',
    ],
    tips: [
      'Be very polite with documents',
      'Handle passport carefully',
      'Return passport quickly',
      'Say "Thank you" when receiving',
    ],
    vocabulary: [
      { word: 'Passport', meaning: 'លិខិតឆ្លងដែន' },
      { word: 'ID', meaning: 'អត្តសញ្ញាណប័ណ្ណ' },
      { word: 'Document', meaning: 'ឯកសារ' },
      { word: 'Check', meaning: 'ពិនិត្យ' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'May I see your passport, please?' },
      { speaker: 'Guest', text: 'Here you are.' },
      { speaker: 'You', text: 'Thank you. I\'ll return it in a moment.' },
    ],
  },
  {
    id: 'room',
    title: 'Assign Room',
    icon: '🔑',
    keyPhrases: [
      'Your room is 205.',
      'Here is your room key.',
      'Room 205 on the second floor.',
      'Take the elevator to floor 2.',
    ],
    commonMistakes: [
      '❌ "Go room 205" → ✅ "Your room is 205"',
      '❌ Forget to give key → ✅ "Here is your key"',
      '❌ No directions → ✅ Explain how to get there',
    ],
    tips: [
      'Speak room numbers clearly',
      'Give the key card with both hands',
      'Explain how to find the room',
      'Offer to help with luggage',
    ],
    vocabulary: [
      { word: 'Room', meaning: 'បន្ទប់' },
      { word: 'Key', meaning: 'សោ' },
      { word: 'Floor', meaning: 'ជាន់' },
      { word: 'Elevator', meaning: 'ជណ្តើរយន្ត' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'Your room is 205 on the second floor.' },
      { speaker: 'You', text: 'Here is your room key.' },
      { speaker: 'Guest', text: 'How do I get there?' },
      { speaker: 'You', text: 'Take the elevator to floor 2, turn right.' },
    ],
  },
  {
    id: 'info',
    title: 'Share Info',
    icon: 'ℹ️',
    keyPhrases: [
      'Breakfast is from 7 to 10.',
      'The pool is open until 9 PM.',
      'WiFi password is on your key card.',
      'Is there anything else?',
    ],
    commonMistakes: [
      '❌ Too much information → ✅ Share only important info',
      '❌ Speak too fast → ✅ Speak slowly',
      '❌ Forget to ask if they need help → ✅ "Anything else?"',
    ],
    tips: [
      'Share 3-4 important things only',
      'Breakfast time is most important',
      'Ask if they have questions',
      'Offer help with luggage',
    ],
    vocabulary: [
      { word: 'Breakfast', meaning: 'អាហារពេលព្រឹក' },
      { word: 'Pool', meaning: 'អាងហែលទឹក' },
      { word: 'WiFi', meaning: 'វ៉ាយហ្វាយ' },
      { word: 'Anything else', meaning: 'មានអ្វីទៀតទេ' },
    ],
    exampleDialogue: [
      { speaker: 'You', text: 'Breakfast is from 7 to 10 in the restaurant.' },
      { speaker: 'You', text: 'The pool closes at 9 PM.' },
      { speaker: 'You', text: 'Is there anything else I can help with?' },
      { speaker: 'Guest', text: 'No, thank you.' },
      { speaker: 'You', text: 'Enjoy your stay!' },
    ],
  },
];

// Helper function to get content for a specific step
export function getStepContent(stepId: string): StepContent | undefined {
  return checkInSteps.find(step => step.id === stepId);
}

// Helper function to get all key phrases for practice
export function getAllKeyPhrases(): string[] {
  return checkInSteps.flatMap(step => step.keyPhrases);
}

// Helper function to get vocabulary list
export function getVocabularyList(): { word: string; meaning: string }[] {
  const vocabMap = new Map<string, string>();
  checkInSteps.forEach(step => {
    step.vocabulary.forEach(item => {
      vocabMap.set(item.word.toLowerCase(), item.meaning);
    });
  });
  return Array.from(vocabMap.entries()).map(([word, meaning]) => ({
    word: word.charAt(0).toUpperCase() + word.slice(1),
    meaning,
  }));
}