import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { databaseTools, performanceTools, helpTools } from './sharedTools';

export const languageCoachAgent = new RealtimeAgent({
  name: 'languageCoach',
  voice: 'sage',
  handoffDescription:
    'Language coach providing feedback, corrections, and teaching support.',

  instructions: `
# CRITICAL: Speaking Instructions
**SPEAK EXTREMELY SLOWLY** - 50% of normal speed.
**PAUSE 3 SECONDS** between EVERY sentence.
**MAXIMUM 2 SENTENCES** per response. NO EXCEPTIONS.
Use only A2 English (1500 common words only).

# Role and Purpose
You teach hotel English. Give simple feedback.
ALWAYS use trackPerformance tool to monitor student.
Use detectStruggling tool if student is silent > 5 seconds.

# Teaching Method
- ALWAYS say "Good try!" first
- Then say: "Repeat after me:"
- Say the correct version slowly
- Maximum 2 sentences only

# Correction Pattern (EXACTLY THIS)
1. "Good try!"
2. "Repeat after me: [correct phrase]"

# Core Responsibilities

## 1. Pronunciation Help

When student says wrong:
1. "Good try!"
2. "Listen: [correct word]. Now you say."

Common fixes:
- "breakfast" → "Say: BREAK-fast"
- "thank you" → "Say: THANK you"
- Numbers → Say each number slowly

## 2. Grammar Help (SIMPLE)

NEVER explain grammar.
Just give correct example:

"Good try! Say: 'May I help you?'"

## 3. Vocabulary Building
Essential Hospitality Vocabulary:
- Greetings: Good morning/afternoon/evening
- Requests: May I, Could you, Would you mind
- Amenities: pool, gym, restaurant, spa, WiFi
- Room types: single, double, suite, deluxe
- Services: housekeeping, room service, concierge
- Payment: cash, credit card, deposit, receipt

Teaching Method:
- Introduce words in context
- Provide simple definitions
- Give example sentences
- Practice in role-play

## 4. Cultural Communication
Teach appropriate levels of:
- Formality with guests
- Politeness markers
- Small talk topics
- Professional boundaries
- Cultural sensitivity

Cambodian Context:
- Respect for hierarchy and age
- Importance of face-saving
- Indirect communication style
- Warm hospitality traditions

# Feedback Strategies

## Immediate vs. Delayed Correction
Immediate Correction for:
- Critical errors that block communication
- Safety-related mistakes
- Repeated errors

Delayed Correction for:
- Minor pronunciation issues
- Small grammar mistakes
- Vocabulary choices that work but could be better

## Feedback (2 SENTENCES MAX)

Good feedback:
"Good job! Very clear."

Correction:
"Good try! Repeat after me: [correct phrase]."

# Session Support

## Start
Say: "Let's practice. Mistakes are okay!"

## During Practice  
When they struggle:
"Good try! Repeat after me: [correct phrase]."

## End
Say: "Good work today! Practice more tomorrow."

# Key Phrases to Teach

## Check-in Phrases (TEACH SLOWLY)
1. "Welcome to our hotel."
2. "Do you have a booking?"
3. "Your name, please?"
4. "Here is your key."

## Common Corrections (2 SENTENCES)
Wrong: "You room"
Say: "Good try! Repeat: YOUR room."

Wrong: "What you want?"
Say: "Good try! Repeat: How can I help?"

# REMEMBER
- Maximum 2 sentences always
- Say "Good try!" first
- Then "Repeat after me:"
- Pause 3 seconds between sentences
- Never explain why
- Just give correct example
`,

  tools: [
    tool({
      name: "assessPronunciation",
      description:
        "Evaluates pronunciation and provides specific feedback",
      parameters: {
        type: "object",
        properties: {
          word_or_phrase: {
            type: "string",
            description: "The word or phrase being assessed",
          },
          learner_attempt: {
            type: "string",
            description: "How the learner pronounced it (phonetic description)",
          },
          context: {
            type: "string",
            description: "The sentence or situation where it was used",
          },
        },
        required: ["word_or_phrase", "learner_attempt"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { word_or_phrase } = input as { word_or_phrase: string; learner_attempt: string };
        
        const feedback: Record<string, string> = {
          "breakfast": "Remember to pronounce the 't' at the end: 'break-fast'",
          "third": "The 'th' sound - put your tongue between your teeth",
          "amenities": "Stress on the second syllable: a-MEN-i-ties",
          "reservation": "Four syllables: res-er-VA-tion",
          "available": "Three syllables: a-VAIL-able",
        };
        
        return {
          feedback: feedback[word_or_phrase.toLowerCase()] || "Good attempt! Keep practicing this word.",
          practice_tip: "Repeat slowly, breaking it into syllables",
        };
      },
    }),
    tool({
      name: "correctGrammar",
      description:
        "Provides grammar correction with explanation",
      parameters: {
        type: "object",
        properties: {
          incorrect_sentence: {
            type: "string",
            description: "The sentence with grammar error",
          },
          error_type: {
            type: "string",
            enum: ["article", "verb_tense", "preposition", "word_order", "modal_verb", "other"],
            description: "Type of grammar error",
          },
        },
        required: ["incorrect_sentence", "error_type"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { error_type } = input as {
          incorrect_sentence: string;
          error_type: string;
        };
        
        const corrections: Record<string, { rule: string; example: string }> = {
          article: {
            rule: "Use 'the' for specific things, 'a/an' for general things",
            example: "The room has a beautiful view",
          },
          verb_tense: {
            rule: "Use present simple for hotel services and schedules",
            example: "Breakfast is served from 7 to 10",
          },
          preposition: {
            rule: "Use 'on' for floors, 'at' for times, 'in' for rooms",
            example: "Your room is on the third floor",
          },
          modal_verb: {
            rule: "Use 'May I' or 'Could I' to be polite",
            example: "May I have your passport, please?",
          },
        };
        
        const correction = corrections[error_type] || corrections.article;
        return {
          rule: correction.rule,
          correct_example: correction.example,
          encouragement: "You're improving! This is a common mistake that gets easier with practice.",
        };
      },
    }),
    tool({
      name: "suggestBetterPhrase",
      description:
        "Suggests more professional or appropriate alternatives",
      parameters: {
        type: "object",
        properties: {
          current_phrase: {
            type: "string",
            description: "What the learner currently said",
          },
          context: {
            type: "string",
            description: "The situation where it's being used",
          },
          formality_needed: {
            type: "string",
            enum: ["casual", "professional", "very_formal"],
            description: "Required level of formality",
          },
        },
        required: ["current_phrase", "context"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { current_phrase } = input as {
          current_phrase: string;
          context: string;
          formality_needed?: string;
        };
        
        const suggestions: Record<string, string> = {
          "What you want?": "How may I help you?",
          "Give me passport": "May I see your passport, please?",
          "Room finish": "Here is your room key",
          "You cannot": "I'm sorry, but that's not possible",
          "No have": "We don't have that available",
          "Wait": "Please wait a moment",
        };
        
        return {
          better_phrase: suggestions[current_phrase] || "That works! You could also say it more formally.",
          explanation: "This sounds more professional and polite",
          practice: "Let's practice saying this together",
        };
      },
    }),
    tool({
      name: "explainCulturalContext",
      description:
        "Explains cultural aspects of hospitality communication",
      parameters: {
        type: "object",
        properties: {
          situation: {
            type: "string",
            description: "The cultural situation to explain",
          },
          guest_culture: {
            type: "string",
            description: "The guest's cultural background if relevant",
          },
        },
        required: ["situation"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { situation } = input as { situation: string; guest_culture?: string };
        
        const explanations: Record<string, string> = {
          "greeting": "In international hotels, maintain eye contact and smile while greeting. This shows professionalism and warmth.",
          "names": "Western guests usually prefer 'Mr./Ms. + Last Name'. Asian guests might appreciate more formal titles.",
          "complaints": "Stay calm and apologetic even if it's not your fault. This maintains harmony and shows respect.",
          "personal_space": "Keep an arm's length distance. Some cultures prefer more space than Cambodians typically use.",
          "small_talk": "Weather and travel are safe topics. Avoid personal questions about age, salary, or family status.",
        };
        
        return {
          explanation: explanations[situation] || "Remember to be respectful and professional with all guests.",
          tip: "Observe the guest's behavior and mirror their formality level",
        };
      },
    }),
    // Add shared tools for tracking and adaptive feedback
    ...databaseTools,
    ...performanceTools,
    ...helpTools,
  ],

  handoffs: [], // Will be populated in index.ts
});