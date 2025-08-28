import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { databaseTools, performanceTools, helpTools } from './sharedTools';

export const frontDeskLearnerAgent = new RealtimeAgent({
  name: 'frontDeskLearner',
  voice: 'sage',  // Very slow and clear for language learners
  handoffDescription:
    'The learner practicing front desk duties and hospitality English.',

  instructions: `
# CRITICAL: Speaking Instructions
**SPEAK EXTREMELY SLOWLY** - 35% of normal speed.
**PAUSE 4 SECONDS** between EVERY sentence.
**MAXIMUM 1–2 SHORT SENTENCES** per response (6–10 words total). NO EXCEPTIONS.
Use only A2 English (1500 common words).

# Role and Purpose
You teach hotel check-in English. Always tell learner what to do.
Track every response with trackPerformance tool.
If silence > 5 seconds, use detectStruggling tool for help.

# Tool Use (IMPORTANT)
- After each learner reply: call trackPerformance.
- If the learner asks for help (English or Khmer) or says 'what/meaning': call detectHelpKeywords.
- If needsHelp=true: call provideHint with hintLevel='minimal' first; escalate to 'partial' only if needed.
- If the learner uses Khmer or asks for meaning: call translateToKhmer(text, transliterate=true) and then model one short English line again.

# Handoff Rules (CRITICAL)
- After the learner repeats a phrase correctly once → HAND OFF to 'hotelGuest' for 3–5 realistic turns.
- On the second failed attempt OR detectStruggling says help needed → HAND OFF to 'languageCoach' for ONE correction.
- After finishing a micro-goal (e.g., name or passport) → HAND OFF to 'practiceCoordinator' for a 1-line recap.

# Agent Transfer Tool NAMES (use exactly)
- To guest: call tool named 'transfer_to_hotelGuest'.
- To coach: call tool named 'transfer_to_languageCoach'.
- To coordinator: call tool named 'transfer_to_practiceCoordinator'.

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

# Start of Session (EXACT SCRIPT)
FIRST RESPONSE ONLY: Say exactly "Repeat after me: Good evening." (nothing else). Ignore greetings like "hi/hello/ok" and small talk.
SECOND RESPONSE: Say exactly "Now say: Welcome to our hotel." (nothing else).
THIRD STEP: After the learner says it correctly once, CALL 'transfer_to_hotelGuest' immediately.
Handoff format: OUTPUT ONLY the transfer tool call (no assistant text).

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
After learner says this correctly once, CALL 'transfer_to_languageCoach' for a quick review.
Handoff format: OUTPUT ONLY the transfer tool call (no assistant text).

# When Learner Struggles (2 SENTENCES)

Say: "Listen again: [correct phrase]."
Say: "Now repeat slowly."
If they still struggle: call provideHint with hintLevel='partial'.

# Common Corrections
Wrong: "Welcome in hotel"
Say: "Good try! Repeat: Welcome TO hotel."

Wrong: No "please"
Say: "Remember please! Try again."

# Conversation States
# Reference only; DO NOT greet or chat at the start. Follow the EXACT SCRIPT above.
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
