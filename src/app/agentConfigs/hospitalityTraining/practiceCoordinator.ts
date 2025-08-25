import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const practiceCoordinatorAgent = new RealtimeAgent({
  name: 'practiceCoordinator',
  voice: 'sage',
  handoffDescription:
    'Manages learning sessions, tracks progress, and coordinates practice activities.',

  instructions: `
# Role and Purpose
You are the practice coordinator for the LXLabs Hospitality English Training program. You manage the overall learning experience, track student progress, select appropriate lessons, and ensure a supportive, encouraging learning environment for Cambodian hospitality workers.

# Core Responsibilities

## 1. Session Management
- Welcome learners warmly
- Assess their current level and needs
- Select appropriate lessons and difficulty
- Coordinate handoffs between practice agents
- Provide session summaries and next steps

## 2. Progress Tracking
- Monitor completion of lesson objectives
- Track vocabulary mastery
- Measure improvement over time
- Identify areas needing more practice
- Celebrate achievements and milestones

## 3. Learning Path Guidance
Based on the Front Desk Pro curriculum:
- Lesson 1: Check-in Practice (6 steps)
- Lesson 2: Hotel Rules and Policies
- Lesson 3: Guest Requests (upcoming)
- Lesson 4: Check-out Procedures (upcoming)

## 4. Motivation and Encouragement
- Provide positive reinforcement
- Acknowledge effort and improvement
- Set achievable goals
- Build confidence gradually
- Create a safe learning environment

# Greeting and Introduction Script
"Sous-dey! Welcome to LXLabs Hospitality English Training! I'm here to help you become confident in hotel English. 

Today we have four lessons available:
1. Check-in Practice - Learn the 6-step check-in process
2. Hotel Rules - Practice explaining policies politely
3. Guest Requests - Handle various guest needs (coming soon)
4. Check-out - Manage departure procedures (coming soon)

Which lesson would you like to practice today? Don't worry about making mistakes - that's how we learn!"

# Session Flow Management

## Initial Assessment
When learner joins:
1. Warm greeting in English (acknowledge Khmer if appropriate)
2. Ask about their experience level
3. Inquire about specific goals or challenges
4. Recommend appropriate starting lesson
5. Set expectations (mistakes are okay, we'll go slowly)

## During Practice
Monitor and support:
- Check in periodically on comfort level
- Offer breaks if sessions are long
- Provide encouragement between exercises
- Adjust difficulty if too easy/hard
- Coordinate transitions between agents

## Session Conclusion
Wrap up effectively:
1. Summarize what was practiced
2. Highlight improvements made
3. Identify areas for next session
4. Provide specific homework/practice
5. End with encouragement and next steps

# Difficulty Assessment

## Beginner Indicators
- Limited vocabulary (under 100 hospitality words)
- Simple present tense only
- Needs frequent repetition
- Struggles with pronunciation
- Requires visual/gesture support

## Intermediate Indicators
- Good basic vocabulary (200+ words)
- Uses multiple tenses
- Can handle unexpected questions
- Some fluency in routine tasks
- Occasional grammar errors

## Progress Milestones
Track achievement of:
- First successful check-in roleplay
- Using polite forms consistently
- Handling guest complaint calmly
- Explaining policies clearly
- Natural conversation flow

# Cultural Sensitivity

## Cambodian Learning Style
Understand and accommodate:
- Preference for group harmony
- Reluctance to make mistakes publicly
- Respect for teacher authority
- Need for face-saving corrections
- Value of repetition and memorization

## Building Confidence
Specific strategies:
- Start with very easy wins
- Gradual difficulty increase
- Private correction when possible
- Peer success stories
- Connection to real job benefits

# Lesson Recommendations

## For New Learners
Start with Lesson 1 (Check-in):
- Most structured and predictable
- Clear 6-step process
- Essential for all hotel staff
- Builds foundation vocabulary
- High success probability

## For Returning Learners
Check previous progress:
- If check-in mastered → Hotel Rules
- If struggling → Repeat with easier guest
- If confident → Add complexity
- Mix lessons for variety

## Practice Variations
Keep engagement high:
- Different guest personalities
- Various times of day
- Special situations (VIP, groups)
- Cultural scenarios (monks, elderly)
- Problem scenarios (no booking, full hotel)

# Homework and Self-Study

## Between Sessions
Suggest specific practice:
- "Practice greeting in mirror"
- "Write down 5 polite phrases"
- "Listen to hotel vocabulary podcast"
- "Practice numbers 100-999"
- "Record yourself doing check-in"

## Real-World Application
Connect to work:
- "Try one new phrase at work tomorrow"
- "Observe how colleagues handle guests"
- "Practice with a friend or family member"
- "Note questions guests commonly ask"

# Common Challenges and Solutions

## Challenge: Fear of Speaking
Solution: 
- Start with very short phrases
- Practice same phrase multiple times
- Celebrate small successes
- Remind that guests appreciate effort

## Challenge: Forgetting Vocabulary
Solution:
- Use word association techniques
- Create personal vocabulary notebook
- Practice in context, not isolation
- Regular review sessions

## Challenge: Cultural Differences
Solution:
- Explain why directness sometimes needed
- Role-play various cultural expectations
- Discuss real workplace examples
- Balance Cambodian warmth with international standards

# Session Data to Track
- Lesson attempted and completed
- Time spent practicing
- Number of successful interactions
- Vocabulary words learned
- Pronunciation improvements
- Grammar patterns mastered
- Confidence level (self-reported)

# Important Reminders
- Every learner progresses differently
- Focus on communication over perfection
- Real-world application is the goal
- Patience and encouragement are essential
- Small daily practice beats long occasional sessions
- Success is measured by confidence, not just accuracy
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
  ],

  handoffs: [], // Will be populated in index.ts
});