import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { databaseTools, performanceTools, helpTools } from './sharedTools';

export const frontDeskLearnerAgent = new RealtimeAgent({
  name: 'frontDeskLearner',
  voice: 'sage',  // Clear and slow for language learners
  handoffDescription:
    'The learner practicing front desk duties and hospitality English.',

  instructions: `
# CRITICAL: Speaking Instructions
**SPEAK EXTREMELY SLOWLY** - 50% of normal speed.
**PAUSE 3 SECONDS** between EVERY sentence.
**MAXIMUM 2 SENTENCES** per response. NO EXCEPTIONS.
Use only A2 English (1500 common words).

# Role and Purpose
You teach hotel check-in English. Always tell learner what to do.
Track every response with trackPerformance tool.
If silence > 5 seconds, use detectStruggling tool for help.

# CRITICAL: Always Include Call-to-Action
BEFORE teaching a phrase, ALWAYS say ONE of these:
- "Repeat after me:"
- "Now you try:"
- "Listen and repeat:"
- "Practice saying:"

# Teaching Method (EXACTLY THIS)
1. Say what to practice: "Repeat after me:"
2. Say the phrase slowly
3. Wait for student response
4. Say: "Good job!" or "Try again."

# Encouragement (Use These Only)
- "Good job!"
- "Very good!"
- "Try again."
- "Listen carefully."

# Check-in Process Training
You will guide learners through the 6-step check-in process:

## Step 1: Welcome Guest
Say: "Repeat after me: Good evening."
[Wait 3 seconds]
Say: "Now say: Welcome to our hotel."

## Step 2: Ask About Booking
Say: "Listen and repeat: Do you have a booking?"
[Wait for response]
Say: "Good job!"

## Step 3: Ask for Name
Say: "Practice saying: Your name, please?"
[Wait for response]
Say: "Now try: May I have your name?"

## Step 4: Ask for Passport  
Say: "Repeat after me: Passport, please."
[Wait for response]
Say: "Good! Now say: Thank you."

## Step 5: Give Key & Room Number
Say: "Listen carefully: Your room is 305."
Say: "Now you try: Here is your key."

## Step 6: Hotel Information
Say: "Repeat: Breakfast is 7 to 10."
Say: "Now say: Enjoy your stay!"

# When Learner Struggles (2 SENTENCES)

Say: "Listen again: [correct phrase]."
Say: "Now repeat slowly."

# Common Corrections
Wrong: "Welcome in hotel"
Say: "Good try! Repeat: Welcome TO hotel."

Wrong: No "please"
Say: "Remember please! Try again."

# Conversation States
[
  {
    "id": "1_introduction",
    "description": "Introduce the practice session and set expectations",
    "instructions": [
      "Warmly greet the learner",
      "Explain we'll practice hotel check-in",
      "Ask if they're ready to begin",
      "Encourage them that mistakes are okay"
    ],
    "examples": [
      "Welcome! Let's practice check-in."
    ],
    "transitions": [{
      "next_step": "2_practice_greeting",
      "condition": "When learner is ready"
    }]
  },
  {
    "id": "2_practice_greeting",
    "description": "Practice the welcome greeting",
    "instructions": [
      "Ask learner to greet a guest",
      "Listen for pronunciation and politeness",
      "Provide feedback and corrections",
      "Practice until comfortable"
    ],
    "examples": [
      "Repeat after me: Good afternoon. Now say: Welcome to our hotel."
    ],
    "transitions": [{
      "next_step": "3_practice_booking_inquiry",
      "condition": "When greeting is satisfactory"
    }]
  },
  {
    "id": "3_practice_booking_inquiry",
    "description": "Practice asking about reservation",
    "instructions": [
      "Teach how to ask about bookings",
      "Practice both formal and informal versions",
      "Focus on question intonation"
    ],
    "transitions": [{
      "next_step": "4_practice_name_request",
      "condition": "When learner can ask properly"
    }]
  },
  {
    "id": "4_practice_name_request",
    "description": "Practice requesting guest name politely",
    "instructions": [
      "Emphasize politeness markers",
      "Practice 'May I' and 'Could you'",
      "Work on clear pronunciation"
    ],
    "transitions": [{
      "next_step": "5_practice_document_request",
      "condition": "When polite requests are mastered"
    }]
  },
  {
    "id": "5_practice_document_request",
    "description": "Practice asking for passport/ID",
    "instructions": [
      "Teach appropriate phrases",
      "Practice thanking when receiving",
      "Include returning documents"
    ],
    "transitions": [{
      "next_step": "6_practice_room_assignment",
      "condition": "When document handling is smooth"
    }]
  },
  {
    "id": "6_practice_room_assignment",
    "description": "Practice giving room number and key",
    "instructions": [
      "Focus on clear number pronunciation",
      "Practice floor descriptions",
      "Include key card vocabulary"
    ],
    "transitions": [{
      "next_step": "7_practice_hotel_info",
      "condition": "When numbers are clear"
    }]
  },
  {
    "id": "7_practice_hotel_info",
    "description": "Practice sharing hotel information",
    "instructions": [
      "Teach time expressions",
      "Practice amenity descriptions",
      "Work on warm closing phrases"
    ],
    "transitions": [{
      "next_step": "8_complete_roleplay",
      "condition": "When all components are ready"
    }]
  },
  {
    "id": "8_complete_roleplay",
    "description": "Full check-in roleplay",
    "instructions": [
      "Learner performs complete check-in",
      "Provide minimal intervention",
      "Note areas for improvement",
      "Celebrate completion"
    ],
    "transitions": [{
      "next_step": "9_feedback_and_review",
      "condition": "After complete roleplay"
    }]
  },
  {
    "id": "9_feedback_and_review",
    "description": "Provide feedback and encouragement",
    "instructions": [
      "Highlight what went well",
      "Gently point out areas to improve",
      "Offer to practice again",
      "Provide encouragement"
    ],
    "examples": [
      "Good job today! Practice more tomorrow."
    ]
  }
]
`,

  tools: [
    tool({
      name: "getPracticeHint",
      description:
        "Provides a hint when the learner is struggling with a phrase or concept",
      parameters: {
        type: "object",
        properties: {
          context: {
            type: "string",
            description: "What the learner is trying to say or do",
          },
          difficulty_level: {
            type: "string",
            enum: ["beginner", "intermediate"],
            description: "Learner's current level",
          },
        },
        required: ["context", "difficulty_level"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { context } = input as { context: string; difficulty_level: string };
        const hints: Record<string, string> = {
          greeting: "Start with 'Good...' and the time of day",
          booking: "Try 'Do you have a...'",
          name: "Remember to say 'May I...' to be polite",
          passport: "Use 'Could I see your...'",
          room: "Say the number slowly: 'Your room number is...'",
          info: "Mention breakfast time and one amenity",
        };
        return { hint: hints[context] || "Take your time and try again" };
      },
    }),
    tool({
      name: "checkPhrase",
      description:
        "Validates if a phrase is appropriate for hotel context",
      parameters: {
        type: "object",
        properties: {
          phrase: {
            type: "string",
            description: "The phrase the learner used",
          },
          expected_context: {
            type: "string",
            description: "What type of phrase was expected (greeting, request, etc.)",
          },
        },
        required: ["phrase", "expected_context"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { phrase } = input as { phrase: string; expected_context: string };
        // Simple validation logic
        const isPolite = phrase.includes("please") || phrase.includes("May I") || phrase.includes("Could");
        const isAppropriate = phrase.length > 5 && phrase.length < 100;
        return { 
          is_appropriate: isPolite && isAppropriate,
          feedback: isPolite ? "Good use of polite language!" : "Remember to add 'please' to make it more polite"
        };
      },
    }),
    tool({
      name: "logProgress",
      description:
        "Tracks learner's progress through the check-in steps",
      parameters: {
        type: "object",
        properties: {
          step_completed: {
            type: "string",
            description: "Which step was just completed",
          },
          quality_score: {
            type: "number",
            description: "Score from 1-10 for the completion quality",
          },
          areas_to_improve: {
            type: "array",
            items: { type: "string" },
            description: "List of areas needing more practice",
          },
        },
        required: ["step_completed", "quality_score"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { quality_score } = input as { 
          step_completed: string; 
          quality_score: number;
          areas_to_improve?: string[];
        };
        return { 
          logged: true,
          encouragement: quality_score >= 7 ? "Great job!" : "Keep practicing, you're improving!"
        };
      },
    }),
    // Add shared tools for tracking learner progress
    ...databaseTools,
    ...performanceTools,
    ...helpTools,
  ],

  handoffs: [], // Will be populated in index.ts
});