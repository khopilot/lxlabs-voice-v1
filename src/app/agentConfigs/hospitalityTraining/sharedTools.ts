import { tool } from '@openai/agents/realtime';
import { loadProgress as loadProgressStore, saveProgress as saveProgressStore, loadMetrics as loadMetricsStore, saveMetrics as saveMetricsStore } from '@/app/lib/studentStore';

// Student progress tracking interface
interface StudentProgress {
  studentId: string;
  studentName?: string;
  currentLesson: string;
  completedSteps: string[];
  vocabularyLearned: string[];
  errorPatterns: ErrorPattern[];
  totalPracticeTime: number;
  lastSessionDate: string;
  confidenceScore: number;
  speechSpeed: 'very_slow' | 'slow' | 'normal';
}

interface ErrorPattern {
  type: 'pronunciation' | 'grammar' | 'vocabulary' | 'fluency';
  phrase: string;
  errorCount: number;
  lastOccurred: string;
}

interface PerformanceMetrics {
  responseTime: number; // milliseconds
  hesitationCount: number;
  attemptCount: number;
  correctResponses: number;
  totalResponses: number;
  silenceDuration: number;
}

// In-memory storage for demo (replace with real database in production)
const studentDatabase = new Map<string, StudentProgress>();
const sessionMetrics = new Map<string, PerformanceMetrics>();

// Database integration tools
export const databaseTools = [
  tool({
    name: "saveStudentProgress",
    description: "Save student learning progress to database",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "string" },
        studentName: { type: "string" },
        lesson: { type: "string" },
        completedStep: { type: "string" },
        newVocabulary: { 
          type: "array",
          items: { type: "string" }
        },
        errors: {
          type: "array",
          items: {
            type: "object",
            properties: {
              type: { type: "string" },
              phrase: { type: "string" }
            }
          }
        },
        practiceTime: { type: "number" }
      },
      // studentId can be inferred from session context if omitted
      required: [],
      additionalProperties: false
    },
    execute: async (input, details) => {
      const ctxStudentId = (details as any)?.context?.studentId;
      const { studentId = ctxStudentId, studentName, lesson, completedStep, newVocabulary = [], errors = [], practiceTime = 0 } = input as any;
      if (!studentId) {
        throw new Error('studentId is required (missing in input and context)');
      }
      
      // Get or create student record (hydrate from localStorage if present)
      const hydrated = studentDatabase.get(studentId) || loadProgressStore<StudentProgress>(studentId);
      const progress: StudentProgress = hydrated || {
        studentId,
        currentLesson: lesson || "check_in",
        completedSteps: [] as string[],
        vocabularyLearned: [] as string[],
        errorPatterns: [] as ErrorPattern[],
        totalPracticeTime: 0,
        lastSessionDate: new Date().toISOString(),
        confidenceScore: 50,
        speechSpeed: 'very_slow' as const
      };
      
      // Update progress
      if (studentName) progress.studentName = studentName;
      if (lesson) progress.currentLesson = lesson;
      if (completedStep && !progress.completedSteps.includes(completedStep)) {
        progress.completedSteps.push(completedStep);
      }
      
      // Add new vocabulary
      newVocabulary.forEach((word: string) => {
        if (!progress.vocabularyLearned.includes(word)) {
          progress.vocabularyLearned.push(word);
        }
      });
      
      // Track errors
      errors.forEach((error: any) => {
        const existing = progress.errorPatterns.find(
          e => e.type === error.type && e.phrase === error.phrase
        );
        if (existing) {
          existing.errorCount++;
          existing.lastOccurred = new Date().toISOString();
        } else {
          progress.errorPatterns.push({
            type: error.type,
            phrase: error.phrase,
            errorCount: 1,
            lastOccurred: new Date().toISOString()
          });
        }
      });
      
      progress.totalPracticeTime += practiceTime;
      progress.lastSessionDate = new Date().toISOString();
      studentDatabase.set(studentId, progress);
      saveProgressStore(studentId, progress);
      
      return {
        success: true,
        message: "Progress saved successfully",
        totalVocabulary: progress.vocabularyLearned.length,
        completedSteps: progress.completedSteps.length
      };
    }
  }),
  
  tool({
    name: "loadStudentProgress",
    description: "Load student's previous learning progress",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "string" }
      },
      // studentId can be inferred from session context if omitted
      required: [],
      additionalProperties: false
    },
    execute: async (input, details) => {
      const ctxStudentId = (details as any)?.context?.studentId;
      const { studentId = ctxStudentId } = input as { studentId?: string };
      if (!studentId) {
        throw new Error('studentId is required (missing in input and context)');
      }
      
      let progress = studentDatabase.get(studentId);
      if (!progress) {
        const hydrated = loadProgressStore<StudentProgress>(studentId);
        if (hydrated) {
          studentDatabase.set(studentId, hydrated);
          progress = hydrated;
        }
      }
      
      if (!progress) {
        return {
          found: false,
          message: "New student - starting fresh",
          suggestedLesson: "check_in",
          speechSpeed: "very_slow"
        };
      }
      
      // Calculate suggested next content
      const daysSinceLastSession = Math.floor(
        (Date.now() - new Date(progress.lastSessionDate).getTime()) / (1000 * 60 * 60 * 24)
      );
      
      // Determine speech speed based on confidence
      let speechSpeed: string = 'very_slow';
      if (progress.confidenceScore > 70) {
        speechSpeed = 'normal';
      } else if (progress.confidenceScore > 50) {
        speechSpeed = 'slow';
      }
      
      return {
        found: true,
        currentLesson: progress.currentLesson,
        completedSteps: progress.completedSteps,
        vocabularyCount: progress.vocabularyLearned.length,
        totalPracticeTime: progress.totalPracticeTime,
        daysSinceLastSession,
        confidenceScore: progress.confidenceScore,
        speechSpeed,
        frequentErrors: progress.errorPatterns
          .sort((a, b) => b.errorCount - a.errorCount)
          .slice(0, 3),
        suggestedFocus: progress.errorPatterns.length > 0 
          ? `Review: ${progress.errorPatterns[0].phrase}`
          : "Continue with new content"
      };
    }
  })
];

// Performance tracking tools
export const performanceTools = [
  tool({
    name: "trackPerformance",
    description: "Track real-time performance metrics",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "string" },
        responseTime: { type: "number" },
        wasCorrect: { type: "boolean" },
        hesitationDetected: { type: "boolean" },
        attemptNumber: { type: "number" },
        silenceDuration: { type: "number" }
      },
      // studentId can be inferred from session context if omitted
      required: [],
      additionalProperties: false
    },
    execute: async (input, details) => {
      const ctxStudentId = (details as any)?.context?.studentId;
      const { 
        studentId = ctxStudentId, 
        responseTime = 0, 
        wasCorrect = false,
        hesitationDetected = false,
        attemptNumber = 1,
        silenceDuration = 0
      } = input as any;
      if (!studentId) {
        throw new Error('studentId is required (missing in input and context)');
      }
      
      // Get or create metrics (hydrate from localStorage if present)
      const hydrated = sessionMetrics.get(studentId) || loadMetricsStore<PerformanceMetrics>(studentId);
      const metrics = hydrated || {
        responseTime: 0,
        hesitationCount: 0,
        attemptCount: 0,
        correctResponses: 0,
        totalResponses: 0,
        silenceDuration: 0
      };
      
      // Update metrics
      metrics.responseTime = (metrics.responseTime + responseTime) / 2; // Running average
      if (hesitationDetected) metrics.hesitationCount++;
      metrics.attemptCount = Math.max(metrics.attemptCount, attemptNumber);
      if (wasCorrect) metrics.correctResponses++;
      metrics.totalResponses++;
      metrics.silenceDuration = Math.max(metrics.silenceDuration, silenceDuration);
      
      sessionMetrics.set(studentId, metrics);
      saveMetricsStore(studentId, metrics);
      
      // Calculate performance indicators
      const accuracy = metrics.totalResponses > 0 
        ? metrics.correctResponses / metrics.totalResponses 
        : 0;
      
      const confidenceLevel = 
        metrics.hesitationCount < 3 && accuracy > 0.7 ? 'confident' :
        metrics.hesitationCount < 5 && accuracy > 0.5 ? 'developing' :
        'needs_support';
      
      // Provide adaptive recommendations
      let recommendation = "";
      if (silenceDuration > 5000) {
        recommendation = "Student needs help. Provide hint.";
      } else if (attemptNumber > 3) {
        recommendation = "Too many attempts. Give the answer and move on.";
      } else if (accuracy < 0.5) {
        recommendation = "Simplify language and slow down.";
      } else if (accuracy > 0.8 && metrics.hesitationCount < 2) {
        recommendation = "Student ready for slightly harder content.";
      }
      
      return {
        accuracy: Math.round(accuracy * 100),
        confidenceLevel,
        recommendation,
        shouldProvideHelp: silenceDuration > 5000 || attemptNumber > 3
      };
    }
  }),
  
  tool({
    name: "adjustDifficulty",
    description: "Dynamically adjust teaching difficulty based on performance",
    parameters: {
      type: "object",
      properties: {
        studentId: { type: "string" },
        currentDifficulty: {
          type: "string",
          enum: ["very_easy", "easy", "normal", "challenging"]
        }
      },
      // studentId can be inferred from session context if omitted
      required: ["currentDifficulty"],
      additionalProperties: false
    },
    execute: async (input, details) => {
      const ctxStudentId = (details as any)?.context?.studentId;
      const { studentId = ctxStudentId, currentDifficulty } = input as any;
      if (!studentId) {
        throw new Error('studentId is required (missing in input and context)');
      }
      
      const metrics = sessionMetrics.get(studentId);
      if (!metrics) {
        return {
          newDifficulty: "very_easy",
          instructions: "Start with very simple phrases. Maximum 5 words. Speak at 40% speed."
        };
      }
      
      const accuracy = metrics.correctResponses / Math.max(1, metrics.totalResponses);
      
      // Difficulty adjustment logic
      let newDifficulty = currentDifficulty;
      let instructions = "";
      
      if (accuracy < 0.4) {
        // Too hard - decrease difficulty
        newDifficulty = currentDifficulty === "challenging" ? "normal" :
                       currentDifficulty === "normal" ? "easy" : 
                       currentDifficulty === "easy" ? "very_easy" : "very_easy";
        
        instructions = "SIMPLIFY: Use only common 500 words. Speak at 40% speed. Give more hints.";
        
      } else if (accuracy > 0.8 && metrics.hesitationCount < 2) {
        // Too easy - increase difficulty  
        newDifficulty = currentDifficulty === "very_easy" ? "easy" :
                       currentDifficulty === "easy" ? "normal" :
                       currentDifficulty === "normal" ? "challenging" : "challenging";
        
        instructions = "ADVANCE: Can use longer sentences. Speak at 60% speed. Less repetition.";
        
      } else {
        // Maintain current level
        instructions = "MAINTAIN: Current difficulty is appropriate. Continue current approach.";
      }
      
      // Update student's confidence score in database
      const progress = studentDatabase.get(studentId) || loadProgressStore<StudentProgress>(studentId) || undefined;
      if (progress) {
        progress.confidenceScore = Math.round(accuracy * 100);
        progress.speechSpeed = 
          newDifficulty === "very_easy" ? "very_slow" :
          newDifficulty === "easy" ? "slow" : "normal";
        studentDatabase.set(studentId, progress);
        saveProgressStore(studentId, progress);
      }
      
      return {
        newDifficulty,
        instructions,
        speechSpeed: newDifficulty === "very_easy" ? "40%" : 
                    newDifficulty === "easy" ? "50%" :
                    newDifficulty === "normal" ? "60%" : "70%",
        sentenceLength: newDifficulty === "very_easy" ? "max 5 words" :
                       newDifficulty === "easy" ? "max 8 words" :
                       newDifficulty === "normal" ? "max 10 words" : "natural length"
      };
    }
  })
];

// Help system tools  
export const helpTools = [
  tool({
    name: "detectStruggling",
    description: "Detect when student is struggling and needs help",
    parameters: {
      type: "object",
      properties: {
        silenceDuration: { type: "number" },
        attemptCount: { type: "number" },
        lastResponse: { type: "string" },
        expectedResponse: { type: "string" }
      },
      required: ["silenceDuration", "attemptCount"],
      additionalProperties: false
    },
    execute: async (input) => {
      const { silenceDuration, attemptCount, lastResponse = "", expectedResponse = "" } = input as any;
      
      let helpType: string;
      let helpAction: string;
      
      if (silenceDuration > 10000) {
        // Very long silence - student frozen
        helpType = "ENCOURAGE";
        helpAction = "Say: 'It's okay! Let me help. Listen and repeat: [first 3 words]'";
        
      } else if (silenceDuration > 5000) {
        // Long silence - needs hint
        helpType = "HINT";
        helpAction = `Say: 'Start with: ${expectedResponse.split(' ').slice(0, 2).join(' ')}...'`;
        
      } else if (attemptCount > 3) {
        // Too many failed attempts
        helpType = "DEMONSTRATE";
        helpAction = `Say: 'Listen carefully: ${expectedResponse}' Then: 'Now you try slowly.'`;
        
      } else if (attemptCount === 2 && lastResponse) {
        // Second attempt - provide targeted help
        const missing = expectedResponse.split(' ')
          .filter((word: string) => !lastResponse.toLowerCase().includes(word.toLowerCase()));
        
        if (missing.length > 0) {
          helpType = "CORRECT";
          helpAction = `Say: 'Good try! You missed: ${missing[0]}. Try again.'`;
        } else {
          helpType = "ENCOURAGE";
          helpAction = "Say: 'Almost perfect! Try once more.'";
        }
        
      } else {
        helpType = "WAIT";
        helpAction = "Give student more time to respond.";
      }
      
      return {
        shouldHelp: helpType !== "WAIT",
        helpType,
        helpAction,
        encouragement: attemptCount > 2 ? "Remember: Mistakes help us learn!" : ""
      };
    }
  }),
  
  tool({
    name: "provideHint",
    description: "Provide appropriate hint based on context",
    parameters: {
      type: "object",
      properties: {
        targetPhrase: { type: "string" },
        hintLevel: {
          type: "string",
          enum: ["minimal", "partial", "full"]
        }
      },
      required: ["targetPhrase", "hintLevel"],
      additionalProperties: false
    },
    execute: async (input) => {
      const { targetPhrase, hintLevel } = input as { targetPhrase: string; hintLevel: string };
      
      const words: string[] = targetPhrase.split(' ');
      
      let hint: string;
      let instruction: string;
      
      switch (hintLevel) {
        case "minimal":
          hint = words[0] + "...";
          instruction = `Say slowly: 'It starts with: ${words[0]}...'`;
          break;
          
        case "partial":
          hint = words.slice(0, Math.ceil(words.length / 2)).join(' ') + "...";
          instruction = `Say: 'The first part is: ${hint}'`;
          break;
          
        case "full":
          hint = targetPhrase;
          instruction = `Say: 'Listen and repeat: ${targetPhrase}' [pause 3 seconds] 'Now you try.'`;
          break;
          
        default:
          hint = words[0] + "...";
          instruction = `Say: 'Start with: ${words[0]}...'`;
      }
      
      return {
        hint,
        instruction,
        followUp: "After student attempts, say: 'Good job trying!'"
      };
    }
  })
  ,
  tool({
    name: 'translateToKhmer',
    description: 'Translates a short English phrase to Khmer for ESL scaffolding. Keep it simple and polite.',
    parameters: {
      type: 'object',
      properties: {
        text: { type: 'string' },
        transliterate: { type: 'boolean', description: 'If true, provide phonetic Khmer (Latin) as well' }
      },
      required: ['text'],
      additionalProperties: false,
    },
    execute: async (input) => {
      const { text, transliterate = false } = input as any;
      const body = {
        model: 'gpt-4o-mini',
        input: [
          { type: 'message', role: 'system', content: 'You translate short ESL phrases to Khmer for hospitality learners. Keep it natural, short, and polite.' },
          { type: 'message', role: 'user', content: `Translate to Khmer: "${text}"${transliterate ? ' and provide a Latin phonetic guide.' : ''}` },
        ],
      };
      try {
        const res = await fetch('/api/responses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) return { error: 'translation_failed', status: res.status };
        const data = await res.json();
        const out = (data.output_text || '').toString().trim();
        return { khmer: out };
      } catch (e: any) {
        return { error: 'translation_error', message: e?.message };
      }
    }
  })
];

// Voice command handler tools
export const voiceCommandTools = [
  tool({
    name: "handleVoiceCommand",
    description: "Process voice commands like 'help', 'repeat', 'skip'",
    parameters: {
      type: "object",
      properties: {
        command: {
          type: "string",
          description: "The voice command detected"
        },
        context: {
          type: "object",
          properties: {
            currentPhrase: { type: "string" },
            attemptCount: { type: "number" },
            currentLesson: { type: "string" }
          }
        }
      },
      required: ["command"],
      additionalProperties: false
    },
    execute: async (input) => {
      const { command, context = {} } = input as any;
      
      const normalizedCommand = command.toLowerCase().trim();
      
      let response: string;
      let action: string;
      
      // Khmer keywords supported alongside English
      const khmer = {
        help: ['ជួយ', 'ជួយផង', 'សូមជួយ'],
        repeat: ['ម្តងទៀត', 'ព្យាយាមម្ដងទៀត'],
        slower: ['យឺតៗ', 'និយាយយឺតៗ'],
        next: ['បន្ទាប់', 'បន្ត'],
        pause: ['បញ្ឈប់', 'សម្រាក'],
        explain: ['ពន្យល់', 'សូមពន្យល់'],
      };

      const includesAny = (text: string, arr: string[]) => arr.some(k => text.includes(k));

      // Handle different commands (English + Khmer)
      if (normalizedCommand.includes('help') || includesAny(command, khmer.help)) {
        response = "I'll help you! Listen carefully.";
        action = `HELP: Provide hint for '${context.currentPhrase || 'current phrase'}'`;
        
      } else if (normalizedCommand.includes('repeat') || includesAny(command, khmer.repeat)) {
        response = "Let me say that again slowly.";
        action = `REPEAT: Say '${context.currentPhrase}' at 40% speed`;
        
      } else if (normalizedCommand.includes('skip') || normalizedCommand.includes('next') || includesAny(command, khmer.next)) {
        response = "Okay, let's try something else.";
        action = "SKIP: Move to next practice item";
        
      } else if (normalizedCommand.includes('slower') || normalizedCommand.includes('slow') || includesAny(command, khmer.slower)) {
        response = "I'll speak more slowly.";
        action = "ADJUST: Reduce speech speed to 40%";
        
      } else if (normalizedCommand.includes('example')) {
        response = "Here's how to say it.";
        action = `DEMONSTRATE: Model pronunciation of '${context.currentPhrase}'`;
        
      } else if (normalizedCommand.includes('meaning') || normalizedCommand.includes('what') || includesAny(command, khmer.explain)) {
        response = "Let me explain.";
        action = "EXPLAIN: Provide simple definition";
        
      } else if (normalizedCommand.includes('break') || normalizedCommand.includes('pause') || includesAny(command, khmer.pause)) {
        response = "Take your time. Say 'ready' when you want to continue.";
        action = "PAUSE: Wait for student readiness";
        
      } else {
        response = "Say 'help' if you need assistance.";
        action = "CONTINUE: Proceed with current task";
      }
      
      return {
        response,
        action,
        supportLevel: (normalizedCommand.includes('help') || includesAny(command, khmer.help)) ? 'high' : 'normal'
      };
    }
  }),
  
  tool({
    name: "detectHelpKeywords", 
    description: "Detect if student response contains help requests",
    parameters: {
      type: "object",
      properties: {
        studentResponse: { type: "string" }
      },
      required: ["studentResponse"],
      additionalProperties: false
    },
    execute: async (input) => {
      const { studentResponse } = input as { studentResponse: string };
      
      const helpKeywords = [
        'help', 'don\'t know', 'confused', 'difficult', 'hard',
        'can\'t', 'unable', 'forget', 'what', 'how', 'repeat',
        'again', 'slower', 'skip', 'next', 'stop',
        // Khmer variants
        'ជួយ', 'សូមជួយ', 'មិនដឹង', 'ពិបាក', 'លំបាក',
        'ម្តងទៀត', 'យឺតៗ', 'បន្ទាប់', 'បន្ត', 'បញ្ឈប់', 'សូមពន្យល់'
      ];
      
      const lowerResponse = studentResponse.toLowerCase();
      const detectedKeywords = helpKeywords.filter((keyword: string) => lowerResponse.includes(keyword));
      
      if (detectedKeywords.length > 0) {
        return {
          needsHelp: true,
          helpType: detectedKeywords[0],
          confidence: detectedKeywords.length > 2 ? 'very_low' : 'low',
          suggestion: "Student appears to need assistance"
        };
      }
      
      return {
        needsHelp: false,
        confidence: 'normal',
        suggestion: "Continue with current practice"
      };
    }
  })
];

// Export all tools together
export const evaluationTools = [
  tool({
    name: "evaluateSoftSkills",
    description: "Rates the student's soft skills for hospitality (1-5) and suggests next prompt.",
    parameters: {
      type: "object",
      properties: {
        studentUtterance: { type: "string" },
        context: { type: "string" },
        guestType: { type: "string" },
      },
      required: ["studentUtterance"],
      additionalProperties: false,
    },
    execute: async (input) => {
      const { studentUtterance, context = "", guestType = "" } = input as any;
      try {
        const schema = {
          type: 'object',
          properties: {
            warmth: { type: 'integer', minimum: 1, maximum: 5 },
            politeness: { type: 'integer', minimum: 1, maximum: 5 },
            clarity: { type: 'integer', minimum: 1, maximum: 5 },
            empathy: { type: 'integer', minimum: 1, maximum: 5 },
            active_listening: { type: 'integer', minimum: 1, maximum: 5 },
            cultural_fit: { type: 'integer', minimum: 1, maximum: 5 },
            summary: { type: 'string' },
            one_tip: { type: 'string' },
            next_prompt: { type: 'string' },
            recommended_difficulty: { type: 'string', enum: ['very_easy', 'easy', 'normal', 'challenging'] },
          },
          required: ['warmth','politeness','clarity','empathy','active_listening','cultural_fit','one_tip','next_prompt','recommended_difficulty'],
          additionalProperties: false,
        } as const;

        const body = {
          model: 'gpt-4o-mini',
          temperature: 0.1,
          input: [
            { type: 'message', role: 'system', content: `You are a hospitality soft-skills evaluator for Cambodian ESL learners. Score each category from 1 (needs work) to 5 (excellent). Be culturally sensitive and reward politeness, warmth, and clarity. Keep tips concise.` },
            { type: 'message', role: 'user', content: `Utterance: ${studentUtterance}\nContext: ${context}\nGuest type: ${guestType}` },
          ],
          text: {
            format: {
              type: 'json_schema',
              json_schema: { name: 'SoftSkillsRubric', schema, strict: true },
            },
          },
        };

        const res = await fetch('/api/responses', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
        if (!res.ok) {
          // Provide a graceful default rubric so the coach can still give one useful tip
          return {
            warmth: 3, politeness: 3, clarity: 3, empathy: 3, active_listening: 3, cultural_fit: 3,
            one_tip: 'Keep sentences short and speak slowly.',
            next_prompt: 'Good evening. Welcome to our hotel.',
            recommended_difficulty: 'easy'
          };
        }
        const data = await res.json();
        return data.output_parsed || data.output_text || data.output || {
          warmth: 3, politeness: 3, clarity: 3, empathy: 3, active_listening: 3, cultural_fit: 3,
          one_tip: 'Keep sentences short and speak slowly.',
          next_prompt: 'Good evening. Welcome to our hotel.',
          recommended_difficulty: 'easy'
        };
      } catch {
        return {
          warmth: 3, politeness: 3, clarity: 3, empathy: 3, active_listening: 3, cultural_fit: 3,
          one_tip: 'Keep sentences short and speak slowly.',
          next_prompt: 'Good evening. Welcome to our hotel.',
          recommended_difficulty: 'easy'
        };
      }
    }
  })
];

// Export all tools together
export const allSharedTools = [
  ...databaseTools,
  ...performanceTools,
  ...helpTools,
  ...voiceCommandTools,
  ...evaluationTools,
];
