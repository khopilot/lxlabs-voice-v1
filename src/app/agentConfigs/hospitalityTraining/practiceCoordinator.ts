import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { databaseTools, performanceTools, helpTools, voiceCommandTools, evaluationTools } from './sharedTools';

export const practiceCoordinatorAgent = new RealtimeAgent({
  name: 'practiceCoordinator',
  voice: 'sage',
  handoffDescription:
    'Manages learning sessions, tracks progress, and coordinates practice activities.',

  instructions: `
# CRITICAL: Speech and Response Rules
**SPEAK EXTREMELY SLOWLY** - 35% of normal speed.
**PAUSE 4 SECONDS** between EVERY sentence.
**MAXIMUM 1–2 SHORT SENTENCES** per response (6–10 words total). NO EXCEPTIONS.
Use only simple A2 English (1500 most common words).

# Role and Purpose
You coordinate hospitality English practice. Keep everything simple and clear.

# Language Handling
- If the user replies in another language (Khmer, Russian, French, etc.), kindly say one short sentence: "Let's practice in English together." If they need meaning, say: "Say 'help' or 'ជួយ' for a quick tip."

# Core Responsibilities

## 1. Session Management
- Welcome learners simply
- Ask their level
- Choose right lesson
- Guide between agents
- Give short summary

## 2. Progress Tracking
- Check lesson completion
- Count new words learned
- Note improvements
- Find weak areas
- Say "Good job!"

## 3. Learning Path
Available lessons:
- Lesson 1: Check-in Practice
- Lesson 2: Hotel Rules

## 4. Motivation
- Say "Good!" often
- Be patient
- Make it easy
- Build confidence

# Session Start Protocol (INTRODUCE LXLabs, GET NAME)
1. FIRST: Call loadStudentProgress (studentId is in session context).
2. INTRO (2 SHORT SENTENCES MAX): "Hello, I am your LXLabs training coordinator. I help you practice hospitality English."
3. If a name already exists in progress, greet with it and SKIP asking again. Otherwise ask: "What is your name?"
4. If unclear or not in Latin letters, say: "Please spell your name, letter by letter." Then confirm: "Did I get it right, [NAME]?" Save the confirmed name.
5. Save: call saveStudentProgress with { studentName }.
6. Ask level briefly: "Have you worked at a hotel before?" (yes/no). Keep it short.
7. Then HAND OFF to frontDeskLearner to start speaking practice.
   IMPORTANT: OUTPUT ONLY the transfer tool call 'transfer_to_frontDeskLearner' with no assistant text.
8. Track responses with trackPerformance. Use detectStruggling if silence > 5 seconds.

# Burst Orchestration (CRITICAL)
- After a burst of 3–5 guest turns or a completed micro-goal, give ONE short recap sentence and decide next step.
- Use decideNextAgent with { currentStep, accuracy, confidenceLevel }.
- If next is 'hotelGuest', optionally call generateGuestProfile then HAND OFF.
- If remediation is needed, HAND OFF to 'languageCoach' for exactly one correction turn, then back to 'frontDeskLearner'.


# Tool Use (IMPORTANT)
- At session start: call loadStudentProgress; if none, set lesson='check_in'.
- On each micro-goal completion: call saveStudentProgress with completedStep and any new vocabulary; keep message to 1 sentence.
- After guest burst: call trackPerformance summary or calculateFluencyScore if needed, then decideNextAgent.
\n# Agent Transfer Tool NAMES (use exactly)
- To learner: 'transfer_to_frontDeskLearner'
- To guest: 'transfer_to_hotelGuest'
- To coach: 'transfer_to_languageCoach'

# Session Flow (ROUTING ONLY)

- DO NOT teach phrases yourself. Your job is to coordinate and route.
- After INTRO + name + level, call 'transfer_to_frontDeskLearner' immediately.
- After a guest burst completes or a micro‑goal is finished, give ONE recap sentence and route to the next agent using the transfer tools.
- If the learner requests easy/hard, call adjustDifficulty or keep a brief note in your recap, then route to the learner/guest accordingly.

# Handoff Formatting (CRITICAL)
- When handing off, OUTPUT ONLY the transfer tool call (e.g., 'transfer_to_frontDeskLearner') and NO additional assistant text.

# End Session (2 SENTENCES ONLY)
"You practiced [topic] today. Great work!"

# Difficulty Levels

## Easy Practice
- Very slow speech
- One step at a time
- Repeat many times
- Help with every word

## Hard Practice
- Normal slow speech
- Multiple steps
- Less repetition
- Some independence

# Building Confidence
- Start very easy
- Say "Good!" often
- Never say "Wrong"
- Help immediately

# Lesson Choice

## New Learners
Always start with Lesson 1.
It has clear steps.

## Returning Learners  
Ask: "Which lesson today?"
Let them choose.

# Homework (2 SENTENCES MAX)
"Practice saying 'Welcome' ten times. Try with a friend."

# Important Rules
- Keep it simple
- Maximum 2 sentences
- Pause 3 seconds
- Say "Good!" often
- Never criticize
- Help quickly

# Privacy

- Never request or store passport numbers, phone numbers, or addresses.
- If a guest offers PII, politely avoid saving it and continue the lesson.

# Teaching Restrictions (CRITICAL)
- DO NOT teach phrases, run role-play, or provide language models yourself.
- Your job is to introduce, capture the name and level, summarize briefly, and TRANSFER to the right agent.
- If you accidentally start to teach, STOP and immediately transfer to 'frontDeskLearner'.
`,

  tools: [
    tool({
      name: "selectNextLesson",
      description:
        "Selects the most appropriate lesson based on learner's progress and needs",
      parameters: {
        type: "object",
        properties: {
          completed_lessons: {
            type: "array",
            items: { type: "string" },
            description: "List of lessons already completed",
          },
          performance_level: {
            type: "string",
            enum: ["struggling", "progressing", "confident"],
            description: "How well the learner is performing",
          },
          learner_preference: {
            type: "string",
            description: "What the learner wants to practice",
          },
        },
        required: ["performance_level"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { completed_lessons = [], performance_level, learner_preference } = input as {
          completed_lessons?: string[];
          performance_level: string;
          learner_preference?: string;
        };
        
        if (learner_preference) {
          return { 
            selected_lesson: learner_preference,
            reason: "Following learner's choice",
          };
        }
        
        if (performance_level === "struggling") {
          return {
            selected_lesson: "check_in_practice",
            reason: "Reinforcing fundamentals with easier practice",
          };
        }
        
        if (!completed_lessons.includes("check_in_practice")) {
          return {
            selected_lesson: "check_in_practice",
            reason: "Starting with essential check-in skills",
          };
        }
        
        if (!completed_lessons.includes("hotel_rules")) {
          return {
            selected_lesson: "hotel_rules",
            reason: "Moving to policy explanations",
          };
        }
        
        return {
          selected_lesson: "check_in_practice",
          reason: "Additional practice for mastery",
        };
      },
    }),
    tool({
      name: "generateProgressReport",
      description:
        "Creates a progress summary for the learner",
      parameters: {
        type: "object",
        properties: {
          session_data: {
            type: "object",
            properties: {
              lessons_completed: { type: "number" },
              practice_time_minutes: { type: "number" },
              vocabulary_learned: { type: "array", items: { type: "string" } },
              areas_improved: { type: "array", items: { type: "string" } },
            },
            description: "Data from the practice session",
          },
        },
        required: ["session_data"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { session_data } = input as { session_data: any };
        
        const encouragements = [
          "Great progress today!",
          "You're improving steadily!",
          "Excellent effort!",
          "Keep up the good work!",
        ];
        
        return {
          summary: `You practiced for ${session_data.practice_time_minutes || 20} minutes today`,
          vocabulary_count: (session_data.vocabulary_learned || []).length,
          achievement: encouragements[Math.floor(Math.random() * encouragements.length)],
          next_step: "Practice the same lesson with a different guest type tomorrow",
        };
      },
    }),
    tool({
      name: "decideNextAgent",
      description: "Recommends the next agent to handoff to based on progress and current step.",
      parameters: {
        type: 'object',
        properties: {
          currentStep: { type: 'string' },
          accuracy: { type: 'number' },
          confidenceLevel: { type: 'string' },
        },
        required: ['currentStep'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { currentStep = 'greeting', accuracy = 70, confidenceLevel = 'developing' } = input as any;
        // Simple policy: handoff to hotelGuest for practice, languageCoach when accuracy < 60 or confidence low.
        const needsCoach = accuracy < 60 || ['needs_support'].includes(confidenceLevel);
        const next = needsCoach ? 'languageCoach' : (currentStep === 'info' ? 'practiceCoordinator' : 'hotelGuest');
        const reason = needsCoach ? 'Provide quick correction and encouragement' : 'Continue role-play practice';
        return { nextAgent: next, reason };
      }
    }),
    tool({
      name: "calculateFluencyScore",
      description:
        "Calculates a fluency score based on various metrics",
      parameters: {
        type: "object",
        properties: {
          words_per_minute: {
            type: "number",
            description: "Speaking rate",
          },
          hesitation_count: {
            type: "number",
            description: "Number of long pauses or fillers",
          },
          successful_exchanges: {
            type: "number",
            description: "Number of successful back-and-forth exchanges",
          },
          grammar_accuracy: {
            type: "number",
            description: "Percentage of grammatically correct sentences",
          },
        },
        required: ["successful_exchanges"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { 
          words_per_minute = 80,
          hesitation_count = 5,
          successful_exchanges = 0,
          grammar_accuracy = 70,
        } = input as any;
        
        // Simple scoring algorithm
        let score = 0;
        
        // Words per minute (optimal is 100-120 for this level)
        if (words_per_minute >= 100) score += 25;
        else if (words_per_minute >= 80) score += 20;
        else if (words_per_minute >= 60) score += 15;
        else score += 10;
        
        // Hesitations (fewer is better)
        if (hesitation_count <= 3) score += 25;
        else if (hesitation_count <= 5) score += 20;
        else if (hesitation_count <= 8) score += 15;
        else score += 10;
        
        // Successful exchanges (more is better)
        score += Math.min(successful_exchanges * 5, 25);
        
        // Grammar accuracy
        score += Math.floor(grammar_accuracy / 4);
        
        return {
          fluency_score: Math.min(score, 100),
          level: score >= 80 ? "Good" : score >= 60 ? "Developing" : "Beginning",
          feedback: score >= 80 
            ? "Your fluency is improving well!" 
            : score >= 60 
            ? "You're making good progress. Keep practicing!"
            : "Take your time and focus on one phrase at a time.",
        };
      },
    }),
    tool({
      name: "trackVocabularyProgress",
      description:
        "Tracks vocabulary learning and retention",
      parameters: {
        type: "object",
        properties: {
          new_words: {
            type: "array",
            items: { type: "string" },
            description: "New words introduced in this session",
          },
          correctly_used: {
            type: "array",
            items: { type: "string" },
            description: "Words used correctly",
          },
          needs_review: {
            type: "array",
            items: { type: "string" },
            description: "Words that need more practice",
          },
        },
        required: ["new_words"],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { new_words = [], correctly_used = [], needs_review = [] } = input as any;
        
        const mastery_rate = correctly_used.length / (new_words.length || 1);
        
        return {
          total_words_learned: new_words.length,
          mastery_percentage: Math.floor(mastery_rate * 100),
          focus_next_session: needs_review.slice(0, 3),
          milestone: new_words.length >= 10 ? "Vocabulary milestone reached!" : null,
        };
      },
    }),
    // Add shared tools for persistence and performance tracking
    ...databaseTools,
    ...performanceTools,
    ...helpTools,
    ...voiceCommandTools,
    ...evaluationTools,
  ],

  handoffs: [], // Will be populated in index.ts
});
