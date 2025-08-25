import React from 'react';
import Image from 'next/image';

interface LearningHeaderProps {
  sessionStatus: string;
  currentLesson: string;
  onToggleConnection: () => void;
}

export default function LearningHeader({ 
  sessionStatus, 
  currentLesson,
  onToggleConnection 
}: LearningHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            <Image
              src="/Logos-06.png"
              alt="LXLabs"
              width={120}
              height={40}
              className="object-contain"
            />
            <div className="hidden sm:block">
              <h1 className="text-xl font-semibold text-gray-900">
                Hospitality English Training
              </h1>
              <p className="text-sm text-gray-500">
                Front Desk Professional Program
              </p>
            </div>
          </div>

          {/* Session Info */}
          <div className="flex items-center space-x-4">
            {/* Current Lesson Badge */}
            {currentLesson && (
              <div className="hidden sm:block">
                <span className="px-3 py-1 text-sm font-medium rounded-full bg-blue-100 text-blue-800">
                  {currentLesson}
                </span>
              </div>
            )}

            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${
                sessionStatus === 'CONNECTED' ? 'bg-green-500' : 
                sessionStatus === 'CONNECTING' ? 'bg-yellow-500 animate-pulse' : 
                'bg-gray-400'
              }`} />
              <span className="text-sm font-medium text-gray-700">
                {sessionStatus === 'CONNECTED' ? 'Ready to Practice' :
                 sessionStatus === 'CONNECTING' ? 'Connecting...' :
                 'Not Connected'}
              </span>
            </div>

            {/* Connect Button */}
            <button
              onClick={onToggleConnection}
              className={`px-4 py-2 rounded-lg font-medium text-white transition-all ${
                sessionStatus === 'CONNECTED' || sessionStatus === 'CONNECTING'
                  ? 'bg-red-500 hover:bg-red-600'
                  : 'bg-[#3B9FE9] hover:bg-[#2B7FC9] lx-shadow'
              }`}
            >
              {sessionStatus === 'CONNECTED' || sessionStatus === 'CONNECTING'
                ? 'End Session'
                : 'Start Practice'}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}