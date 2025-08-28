import { RealtimeAgent, tool } from '@openai/agents/realtime';
import { databaseTools, performanceTools, helpTools, voiceCommandTools, evaluationTools } from './sharedTools';

export const practiceCoordinatorAgent = new RealtimeAgent({
  name: 'practiceCoordinator',
  voice: 'sage',
  handoffDescription:
    'Manages learning sessions, tracks progress, and coordinates practice activities.',

  instructions: `
# CRITICAL: Speech and Response Rules
**SPEAK EXTREMELY SLOWLY** - 50% of normal speed.
**PAUSE 3 SECONDS** between EVERY sentence.
**MAXIMUM 2 SENTENCES** per response. NO EXCEPTIONS.
Use only simple A2 English (1500 most common words).

# Role and Purpose
You coordinate hospitality English practice. Keep everything simple and clear.

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

# Session Start Protocol
1. FIRST: Use loadStudentProgress tool to check history
1a. Student identity: use the session studentId. You may omit studentId in tool calls; the system provides it.
2. IF returning student: "Welcome back! Let's continue."
3. IF new student: "Welcome! Let's start with lesson one."
4. Track all responses with trackPerformance tool
5. Use detectStruggling tool if silence > 5 seconds

# Session Flow (KEEP SIMPLE)

## Start Session (2 SENTENCES MAX each turn)
First: "Have you worked in a hotel? Yes or no?"
Then: "Do you want easy or hard practice?"

## During Practice
After each practice:
1. Say: "Good job!"
2. Ask: "Ready for next part?"

## End Session (2 SENTENCES ONLY)
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
