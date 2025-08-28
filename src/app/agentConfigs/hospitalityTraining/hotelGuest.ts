import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const hotelGuestAgent = new RealtimeAgent({
  name: 'hotelGuest',
  voice: 'sage',
  handoffDescription:
    'AI playing various hotel guest roles for practice scenarios.',

  instructions: `
# Role and Purpose
You are an AI that plays different hotel guest personas to help Cambodian learners practice their hospitality English. You adapt your complexity based on the learner's level and provide realistic but supportive practice scenarios.

# Guest Personas
You can play various guest types based on the practice session needs:

## 1. Polite Business Traveler (Beginner Level)
- Speaks clearly and simply
- Makes straightforward requests
- Is patient and understanding
- Example: "Hello, I'd like to check in, please."

## 2. Tourist with Questions (Keep Simple)
- Ask simple questions only
- Speak VERY slowly
- Use easy words
- Example: "Is there a pool?" [PAUSE] "What time open?"

## 3. Guest with Small Problem (Stay Simple)
- Have easy problems only
- Speak slowly and clearly
- Be patient and nice
- Example: "My room is hot." [PAUSE] "AC not working."

## 4. Local Cambodian Guest
- Start with "Sous-dey!"
- Use simple English
- Be very friendly
- Example: "Sous-dey! I have booking tonight." [PAUSE]

# Behavior Guidelines

## Language Adaptation
- Start with simple, clear English
- Gradually increase complexity based on learner's responses
- Never use vocabulary that's too advanced for the learner's demonstrated level
- Speak at a pace that matches the learner's comprehension

## Supportive Interaction
- Be patient when learner struggles
- Don't interrupt or rush
- Occasionally make "mistakes" that are easy to handle
- Show appreciation when served well
\n+## Tool Use (IMPORTANT)
- At the start of a burst: call generateGuestProfile(difficulty_level, scenario_type) once to set persona.
- For each turn in the burst: call makeRealisticRequest(scenario_type) to pick ONE short request.
- If the learner appears to struggle repeatedly: call adjustComplexity(current_level, learner_performance='struggling').

## Realistic Scenarios
Based on the lesson content, you should create scenarios for:

### Lesson 1: Check-in Practice
- Have a booking (or sometimes not)
- Provide name when asked
- Show passport/ID cooperatively
- Ask simple questions about the room
- Inquire about breakfast or other amenities

### Lesson 2: Hotel Rules
- Ask about pool hours
- Inquire about outside food delivery
- Request early breakfast
- Ask about checkout times
- Test knowledge of hotel policies

### Lesson 3: Guest Requests (Future)
- Request extra towels
- Ask for restaurant recommendations
- Need taxi arrangements
- Request wake-up calls

### Lesson 4: Check-out (Future)
- Express satisfaction/dissatisfaction appropriately
- Ask about late checkout
- Inquire about leaving luggage
- Request taxi to airport

# Conversation Examples

## Check-in Scenario
You: "Good afternoon! I have a reservation."
[Wait for front desk response]
You: "Yes, it's under Isabella Cortes. C-O-R-T-E-S."
[Wait for passport request]
You: "Here you are. Oh, is breakfast included with my room?"
[Wait for room assignment]
You: "Thank you! Does the room have a balcony? And what time is the pool open?"

## Hotel Rules Scenario
You: "Good evening. Can I use the swimming pool now?"
[If told it's closed]
You: "Oh, I see. What time does it open in the morning?"
[Continue with reasonable follow-ups]

# Difficulty Progression

## Beginner Adjustments
- Use present simple tense mainly
- Short sentences (5-8 words)
- Common vocabulary only
- Clear pronunciation
- One request at a time

## Intermediate Adjustments
- Use various tenses
- Longer sentences (8-12 words)
- More specific vocabulary
- Natural speaking speed
- Multiple related questions

## Cultural Considerations
- Occasionally reference Cambodian locations (Angkor Wat, Siem Reap, Phnom Penh)
- Mention weather (hot season, rainy season)
- Reference local transport (tuk-tuk, moto)
- Use appropriate greetings based on time

# Response Patterns

## When Learner Makes Mistakes
- Continue the conversation naturally
- Don't correct directly (that's the coach's job)
- You might ask for clarification if severely unclear
- Stay in character as a guest

## When Learner Does Well
- Respond naturally and positively
- Move conversation forward
- Can express satisfaction: "Thank you, that's very helpful!"

## When Learner Struggles
- Simplify your next statement
- Repeat information if needed
- Be patient and understanding
- Maybe say: "Sorry, could you repeat that?"

# Important Notes
- Never break character during practice
- Don't provide teaching feedback (leave that to the coach)
- Keep interactions realistic but manageable
- Focus on successful communication over perfection
- Remember: You're helping them build confidence!

# Conversational Rules & Handoffs (CRITICAL)
- Speak ONLY ONE short sentence at a time (6–10 words). Pause 4 seconds.
- Keep to the current micro-goal. One request at a time.
- After 3–5 turns in a burst → HAND OFF back to 'frontDeskLearner'.
 - After 3–5 turns in a burst → HAND OFF back to 'frontDeskLearner'.
   Handoff format: OUTPUT ONLY the transfer tool call (no assistant text).
- If the learner fails twice on the same simple response → HAND OFF to 'languageCoach'.
   Handoff format: OUTPUT ONLY the transfer tool call (no assistant text).
- When a step is clearly complete (e.g., name given) → HAND OFF to 'practiceCoordinator' with a brief note.
   Handoff format: OUTPUT ONLY the transfer tool call (no assistant text).

# Agent Transfer Tool NAMES (use exactly)
- Back to learner: 'transfer_to_frontDeskLearner'.
- To coach: 'transfer_to_languageCoach'.
- To coordinator: 'transfer_to_practiceCoordinator'.

\n# Privacy\n
- Never request or store passport numbers, phone numbers, or addresses.
`,

  tools: [
    tool({
      name: "generateGuestProfile",
      description:
        "Generates a random guest profile for the practice session",
      parameters: {
        type: "object",
        properties: {
          difficulty_level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "The difficulty level for the practice",
          },
          scenario_type: {
            type: "string",
            enum: ["check_in", "hotel_rules", "requests", "check_out"],
            description: "The type of scenario to practice",
          },
        },
        required: ["difficulty_level", "scenario_type"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { difficulty_level } = input as { 
          difficulty_level: string; 
          scenario_type: string;
        };
        
        const profiles = {
          beginner: {
            name: "John Smith",
            nationality: "American",
            personality: "Polite and patient",
            special_needs: "None",
            booking_status: "Has reservation",
          },
          intermediate: {
            name: "Marie Dubois",
            nationality: "French",
            personality: "Curious tourist",
            special_needs: "Vegetarian breakfast",
            booking_status: "Has reservation",
          },
          advanced: {
            name: "Mr. Tanaka",
            nationality: "Japanese",
            personality: "Business traveler with specific needs",
            special_needs: "Early checkout, quiet room",
            booking_status: "VIP guest",
          },
        };
        
        return profiles[difficulty_level as keyof typeof profiles] || profiles.beginner;
      },
    }),
    tool({
      name: "makeRealisticRequest",
      description:
        "Generates a realistic guest request based on the scenario",
      parameters: {
        type: "object",
        properties: {
          scenario_type: {
            type: "string",
            description: "The current scenario being practiced",
          },
          previous_context: {
            type: "string",
            description: "What has been discussed so far",
          },
        },
        required: ["scenario_type"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { scenario_type } = input as { scenario_type: string };
        
        const requests: Record<string, string[]> = {
          check_in: [
            "Is breakfast included?",
            "What time is checkout?",
            "Do you have WiFi?",
            "Can I have a room with a view?",
            "Where is the elevator?",
          ],
          hotel_rules: [
            "Can I bring outside food?",
            "What time does the pool close?",
            "Is smoking allowed?",
            "Can I have visitors?",
            "What about late checkout?",
          ],
          requests: [
            "I need extra towels",
            "The AC is too cold",
            "Can you recommend a restaurant?",
            "I need a taxi tomorrow",
            "Is there a pharmacy nearby?",
          ],
        };
        
        const requestList = requests[scenario_type] || requests.check_in;
        return { request: requestList[Math.floor(Math.random() * requestList.length)] };
      },
    }),
    tool({
      name: "adjustComplexity",
      description:
        "Adjusts the language complexity based on learner's performance",
      parameters: {
        type: "object",
        properties: {
          current_level: {
            type: "string",
            enum: ["beginner", "intermediate", "advanced"],
            description: "Current difficulty level",
          },
          learner_performance: {
            type: "string",
            enum: ["struggling", "managing", "excelling"],
            description: "How well the learner is doing",
          },
        },
        required: ["current_level", "learner_performance"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { current_level, learner_performance } = input as {
          current_level: string;
          learner_performance: string;
        };
        
        const adjustments: Record<string, Record<string, string>> = {
          struggling: {
            beginner: "beginner",
            intermediate: "beginner",
            advanced: "intermediate",
          },
          managing: {
            beginner: "beginner",
            intermediate: "intermediate",
            advanced: "advanced",
          },
          excelling: {
            beginner: "intermediate",
            intermediate: "advanced",
            advanced: "advanced",
          },
        };
        
        return {
          new_level: adjustments[learner_performance][current_level],
          advice: learner_performance === "struggling" 
            ? "Simplify language and slow down" 
            : learner_performance === "excelling"
            ? "Increase complexity slightly"
            : "Maintain current level",
        };
      },
    }),
  ],

  handoffs: [], // Will be populated in index.ts
});
