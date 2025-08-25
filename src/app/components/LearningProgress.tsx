import React from 'react';
import { CheckCircleIcon } from '@radix-ui/react-icons';

interface LearningProgressProps {
  completedSteps: string[];
  currentStep: string;
  vocabularyCount: number;
  practiceTime: number;
}

const LESSON_STEPS = [
  { id: 'greeting', label: 'Welcome Guest', icon: '👋' },
  { id: 'booking', label: 'Check Booking', icon: '📋' },
  { id: 'name', label: 'Ask for Name', icon: '👤' },
  { id: 'passport', label: 'Request ID', icon: '🆔' },
  { id: 'room', label: 'Assign Room', icon: '🔑' },
  { id: 'info', label: 'Share Info', icon: 'ℹ️' },
];

export default function LearningProgress({
  completedSteps,
  currentStep,
  vocabularyCount,
  practiceTime
}: LearningProgressProps) {
  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">
        Your Progress
      </h2>

      {/* Statistics */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-[#3B9FE9]">
            {vocabularyCount}
          </div>
          <div className="text-xs text-gray-600">Words Learned</div>
        </div>
        <div className="bg-green-50 rounded-lg p-3">
          <div className="text-2xl font-bold text-green-600">
            {formatTime(practiceTime)}
          </div>
          <div className="text-xs text-gray-600">Practice Time</div>
        </div>
      </div>

      {/* Lesson Steps Progress */}
      <div className="space-y-1">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Check-in Process Steps
        </h3>
        {LESSON_STEPS.map((step) => {
          const isCompleted = completedSteps.includes(step.id);
          const isCurrent = currentStep === step.id;

          return (
            <div
              key={step.id}
              className={`flex items-center space-x-3 p-2 rounded-lg transition-all ${
                isCurrent ? 'bg-blue-50 border border-blue-200' :
                isCompleted ? 'bg-green-50' :
                'bg-gray-50'
              }`}
            >
              <span className="text-lg">{step.icon}</span>
              <div className="flex-1">
                <div className={`text-sm font-medium ${
                  isCurrent ? 'text-blue-700' :
                  isCompleted ? 'text-green-700' :
                  'text-gray-500'
                }`}>
                  {step.label}
                </div>
              </div>
              {isCompleted && (
                <CheckCircleIcon className="w-5 h-5 text-green-600" />
              )}
              {isCurrent && (
                <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse" />
              )}
            </div>
          );
        })}
      </div>

      {/* Motivation Message */}
      <div className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
        <p className="text-sm text-blue-800 font-medium">
          💪 Keep going! You&apos;re making great progress!
        </p>
      </div>

      {/* Quick Tips */}
      <div className="mt-6">
        <h3 className="text-sm font-medium text-gray-700 mb-2">
          Quick Tips
        </h3>
        <ul className="space-y-2 text-xs text-gray-600">
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Remember to speak slowly and clearly
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Use &quot;please&quot; and &quot;thank you&quot; often
          </li>
          <li className="flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            Smile - guests can hear it in your voice!
          </li>
        </ul>
      </div>
    </div>
  );
}