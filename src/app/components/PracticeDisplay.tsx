import React, { useEffect, useState } from 'react';
import { ReloadIcon } from '@radix-ui/react-icons';

interface PracticeDisplayProps {
  currentPhrase: string;
  studentResponse?: string;
  isListening: boolean;
  attemptCount: number;
  showHint: boolean;
  difficulty: 'very_easy' | 'easy' | 'normal' | 'challenging';
  silenceTimer: number;
  currentAgent?: string;
}

export default function PracticeDisplay({
  currentPhrase,
  studentResponse,
  isListening,
  attemptCount,
  showHint,
  difficulty,
  silenceTimer,
  currentAgent = 'practiceCoordinator'
}: PracticeDisplayProps) {
  const [highlightedWord, setHighlightedWord] = useState<number>(-1);
  const [showEncouragement, setShowEncouragement] = useState(false);

  // Animate word highlighting for practice phrase
  useEffect(() => {
    if (currentPhrase && isListening) {
      const words = currentPhrase.split(' ');
      let wordIndex = 0;
      
      const interval = setInterval(() => {
        if (wordIndex < words.length) {
          setHighlightedWord(wordIndex);
          wordIndex++;
        } else {
          setHighlightedWord(-1);
        }
      }, 500); // Highlight each word for 500ms
      
      return () => clearInterval(interval);
    }
  }, [currentPhrase, isListening]);

  // Show encouragement after multiple attempts
  useEffect(() => {
    if (attemptCount > 2) {
      setShowEncouragement(true);
      const timer = setTimeout(() => setShowEncouragement(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [attemptCount]);

  const getDifficultyColor = () => {
    switch(difficulty) {
      case 'very_easy': return 'bg-green-100 text-green-800';
      case 'easy': return 'bg-blue-100 text-blue-800';
      case 'normal': return 'bg-yellow-100 text-yellow-800';
      case 'challenging': return 'bg-red-100 text-red-800';
    }
  };

  const getAgentLabel = () => {
    switch(currentAgent) {
      case 'practiceCoordinator': return '📚 Coordinator';
      case 'frontDeskLearner': return '🎓 Teacher';
      case 'hotelGuest': return '👤 Guest';
      case 'languageCoach': return '💬 Coach';
      default: return '🤖 Assistant';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
      {/* Header with current agent and difficulty */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{getAgentLabel()}</span>
          <span className="text-sm text-gray-600">Speaking with you</span>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor()}`}>
          {difficulty.replace('_', ' ').toUpperCase()}
        </div>
      </div>

      {/* Main practice area */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-8 mb-6">
        <div className="text-center">
          {/* Instruction */}
          <div className="text-sm text-gray-600 mb-4">
            {isListening ? '🎤 Listen and repeat:' : '👂 Listening...'}
          </div>
          
          {/* Current phrase to practice */}
          <div className="text-3xl font-bold mb-6 min-h-[80px] flex items-center justify-center">
            {currentPhrase ? (
              <div className="flex flex-wrap justify-center gap-2">
                {currentPhrase.split(' ').map((word, index) => (
                  <span
                    key={index}
                    className={`transition-all duration-300 ${
                      index === highlightedWord 
                        ? 'text-blue-600 scale-110 underline' 
                        : 'text-gray-800'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-gray-400 italic">Waiting for phrase...</span>
            )}
          </div>

          {/* Student's response */}
          {studentResponse && (
            <div className="mt-4 p-4 bg-white rounded-lg shadow-inner">
              <div className="text-sm text-gray-500 mb-1">You said:</div>
              <div className="text-xl font-semibold text-gray-700">
                &ldquo;{studentResponse}&rdquo;
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Hint section */}
      {showHint && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-2">
            <span className="text-yellow-600">💡</span>
            <div>
              <div className="font-semibold text-yellow-800">Hint:</div>
              <div className="text-yellow-700">
                Start with: &ldquo;{currentPhrase.split(' ').slice(0, 2).join(' ')}...&rdquo;
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Attempt counter and timer */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-4">
          {/* Attempt counter */}
          <div className="flex items-center gap-2">
            <ReloadIcon className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">
              Attempt {attemptCount}
            </span>
          </div>

          {/* Silence timer */}
          {silenceTimer > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
              <span className="text-sm text-orange-600">
                Silent for {Math.floor(silenceTimer / 1000)}s
              </span>
            </div>
          )}
        </div>

        {/* Status indicator */}
        <div className="flex items-center gap-2">
          {isListening ? (
            <>
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-600">Listening</span>
            </>
          ) : (
            <>
              <div className="w-3 h-3 bg-gray-400 rounded-full" />
              <span className="text-sm text-gray-500">Waiting</span>
            </>
          )}
        </div>
      </div>

      {/* Encouragement message */}
      {showEncouragement && (
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 animate-fade-in">
          <p className="text-center text-purple-800 font-medium">
            💪 Keep trying! You&apos;re doing great! Mistakes help us learn!
          </p>
        </div>
      )}

      {/* Quick tips */}
      <div className="border-t pt-4 mt-4">
        <div className="text-xs text-gray-500 space-y-1">
          <div>💡 Tip: Speak slowly and clearly</div>
          <div>🎯 Focus on one word at a time</div>
          <div>🔊 Say &ldquo;Help&rdquo; if you need assistance</div>
        </div>
      </div>

      {/* Keyboard shortcuts */}
      <div className="mt-4 flex justify-center gap-4 text-xs text-gray-400">
        <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded">H</kbd> for help</div>
        <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded">R</kbd> to repeat</div>
        <div>Press <kbd className="px-2 py-1 bg-gray-100 rounded">S</kbd> to skip</div>
      </div>
    </div>
  );
}