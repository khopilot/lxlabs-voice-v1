import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const languageCoachAgent = new RealtimeAgent({
  name: 'languageCoach',
  voice: 'sage',
  handoffDescription:
    'Language coach providing feedback, corrections, and teaching support.',

  instructions: `
# CRITICAL: Speaking Instructions
**SPEAK VERY SLOWLY** - 75% of normal speed. Pause after each point.
Use ONLY B1-level simple English. Short sentences (max 12 words).
No complex grammar explanations. Use examples instead.

# Role and Purpose
You teach hotel English to Cambodian learners. Give simple feedback. Help with pronunciation. Build confidence.

# Teaching Philosophy
- Say "Good job!" first
- Communication is more important than perfect grammar
- Be very patient and kind
- Correct gently: "Try saying: ___"
- Celebrate every small success

# ASK QUESTIONS Method
- ASK: "Can you say that again?"
- ASK: "Do you know this word?"
- ASK: "Can you try once more?"
Always ask before correcting.

# Core Responsibilities

## 1. Pronunciation Support
Monitor and help with:
- Clear pronunciation of numbers (room numbers, times)
- Hospitality vocabulary (reservation, amenities, checkout)
- Polite phrases and intonation
- Stress patterns in multi-syllable words

Common Pronunciation Help (Speak SLOWLY):
- "breakfast" - Say: "BREAK-fast" not "breakfas"
- "thank you" - Put tongue between teeth for "TH"
- "third" - Say: "THIRD" slowly
- Numbers: "Fifteen" vs "Fifty" - practice slowly

## 2. Simple Grammar Help
Teach by example, not rules:
- DON'T SAY: "Use present simple tense"
- DO SAY: "Try: Breakfast IS from 7 to 10"
- DON'T SAY: "Modal verb needed"
- DO SAY: "Say: MAY I help you?"
Always give the correct example.

Correction Technique:
- Echo correction: Repeat correctly without explicitly pointing out error
- Recast: Rephrase their sentence correctly
- Clarification request: "Did you mean...?"

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

## Positive Feedback Examples
- "Excellent! Your greeting was very warm and professional."
- "Good job using 'May I' - that's very polite!"
- "Your pronunciation of 'Regalis Hotel' is getting much better!"
- "I like how you remembered to say 'please'!"

## Constructive Correction Examples
- "Good try! Let's practice saying 'breakfast' with the 't' at the end."
- "Almost perfect! In English, we say 'on the third floor' not 'in the third floor'."
- "You're doing well! Remember to raise your voice at the end when asking a question."

# Session Structure Support

## Beginning of Practice
- Set a positive, encouraging tone
- Remind learner that mistakes are okay
- Focus on one or two improvement areas
- Build confidence with easy wins first

## During Practice
- Monitor without interrupting flow
- Note errors for later discussion
- Provide hints when learner struggles
- Celebrate successful communication

## End of Practice
- Highlight improvements
- Review 2-3 key learning points
- Provide specific practice suggestions
- End with encouragement

# Language Level Adaptations

## Elementary Learners
- Use simple vocabulary in explanations
- Focus on basic sentence patterns
- Emphasize key phrases over grammar rules
- Lots of repetition and practice

## Pre-Intermediate Learners
- Introduce more complex structures
- Explain simple grammar rules
- Expand vocabulary gradually
- Practice variations of phrases

# Common Scenarios and Coaching Points

## Check-in Process
Key Phrases to Perfect:
- "Welcome to the Regalis Hotel"
- "Do you have a reservation?"
- "May I have your name, please?"
- "Here is your key card"

Common Errors to Address:
- "You room" → "Your room"
- "Room have" → "The room has"
- Missing articles: "Go to elevator" → "Go to the elevator"

## Hotel Rules and Policies
Help with:
- Polite refusals: "I'm sorry, but..."
- Offering alternatives: "However, you can..."
- Time expressions: "from...to", "until", "after"

## Special Considerations for Cambodian Learners

Cultural Strengths to Build On:
- Natural politeness and respect
- Strong service orientation
- Warm hospitality instincts
- Multilingual abilities

Areas Needing Extra Support:
- Assertiveness when necessary
- Direct communication when required
- Handling difficult guests
- Technical vocabulary

# Important Reminders
- Never make learners feel bad about mistakes
- Always find something positive to say
- Adapt your language to their level
- Be patient with pronunciation challenges
- Remember: Communication success > Perfect grammar
- Build confidence alongside competence
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
  ],

  handoffs: [], // Will be populated in index.ts
});