import React, { useState } from 'react';
import Image from 'next/image';
import PrestigeTranscript from './PrestigeTranscript';
import { getStepContent, StepContent } from '../data/lessonContent';

interface VoiceInterfaceProps {
  sessionStatus: string;
  isPTTActive: boolean;
  isPTTUserSpeaking: boolean;
  isAudioPlaybackEnabled: boolean;
  onToggleConnection: () => void;
  onTalkButtonDown: () => void;
  onTalkButtonUp: () => void;
  onToggleAudioPlayback: () => void;
  onTogglePTT: () => void;
  currentStep: string;
  completedSteps: string[];
  currentAgentName: string;
}

const STEPS = [
  { id: 'greeting', label: 'Welcome Guest', icon: '👋' },
  { id: 'booking', label: 'Check Booking', icon: '📋' },
  { id: 'name', label: 'Ask for Name', icon: '👤' },
  { id: 'passport', label: 'Request ID', icon: '🆔' },
  { id: 'room', label: 'Assign Room', icon: '🔑' },
  { id: 'info', label: 'Share Info', icon: 'ℹ️' },
];

export default function VoiceInterface({
  sessionStatus,
  isPTTActive,
  isPTTUserSpeaking,
  isAudioPlaybackEnabled,
  onToggleConnection,
  onTalkButtonDown,
  onTalkButtonUp,
  onToggleAudioPlayback,
  onTogglePTT,
  currentStep,
  completedSteps,
  currentAgentName,
}: VoiceInterfaceProps) {
  const isConnected = sessionStatus === 'CONNECTED';
  const isConnecting = sessionStatus === 'CONNECTING';
  const [selectedStep, setSelectedStep] = useState<StepContent | null>(null);


  return (
    <div className="h-screen flex flex-col bg-[#0F0F0F] text-white overflow-hidden">
      {/* Header */}
      <header className="flex justify-between items-center px-8 py-6 border-b border-gray-800">
        <div className="flex items-center space-x-6">
          <Image
            src="/Logos-06.png"
            alt="LXLabs"
            width={100}
            height={32}
            className="object-contain brightness-0 invert"
          />
          <div className="h-8 w-px bg-gray-700" />
          <div>
            <h1 className="text-lg font-medium">Hospitality English Training</h1>
            <p className="text-sm text-gray-400">Front Desk Professional</p>
          </div>
        </div>

        <button
          onClick={onToggleConnection}
          className={`px-6 py-2.5 rounded-xl font-medium transition-all ${
            isConnected || isConnecting
              ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30'
              : 'bg-[#3B9FE9] text-white hover:bg-[#2B7FC9]'
          }`}
        >
          {isConnected ? 'End Session' : isConnecting ? 'Connecting...' : 'Start Session'}
        </button>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 relative">
        {/* Prestigious Transcript Display */}
        <PrestigeTranscript />

        {/* Voice Interaction Area */}
        <div className="fixed bottom-12 left-1/2 transform -translate-x-1/2 z-20 flex flex-col items-center">
          {/* Current Agent Display */}
          {isConnected && currentAgentName && (
            <div className="mb-4 text-center">
              <div className="text-xs text-gray-400 mb-1">Currently speaking with:</div>
              <div className="text-sm font-medium text-white">
                {currentAgentName === 'practiceCoordinator' && '🎯 Training Coordinator'}
                {currentAgentName === 'frontDeskLearner' && '👨‍💼 Front Desk Role'}
                {currentAgentName === 'hotelGuest' && '🧳 Hotel Guest'}
                {currentAgentName === 'languageCoach' && '📚 Language Coach'}
              </div>
            </div>
          )}
          
          {/* Elegant Status Badge */}
          <div className="mb-8 glass rounded-full px-6 py-2 backdrop-blur-md">
            <div className="flex items-center space-x-3">
              <div className={`w-2 h-2 rounded-full ${
                !isConnected ? 'bg-gray-400' : 
                isPTTUserSpeaking ? 'bg-red-400 animate-pulse' : 
                'bg-green-400 animate-pulse'
              }`} />
              <span className="text-sm font-medium text-white/80">
                {!isConnected ? 'Ready to Start' : 
                 isPTTUserSpeaking ? 'Listening to you...' : 
                 'Speak when ready'}
              </span>
            </div>
          </div>

          {/* Visual Voice Indicator - Only show when connected and speaking */}
          {isConnected && isPTTActive && isPTTUserSpeaking && (
            <div className="mb-6">
              <div className="flex items-center space-x-2">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="w-1 h-12 bg-red-400 rounded-full voice-wave"
                    style={{ animationDelay: `${i * 0.1}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Voice Mode Toggle - Show Push to Talk button only when in PTT mode */}
          <div className="mt-8 flex items-center space-x-4">
            <button
              onClick={onTogglePTT}
              disabled={!isConnected}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                !isConnected
                  ? 'bg-gray-800 text-gray-600 cursor-not-allowed'
                  : isPTTActive
                    ? 'bg-blue-500/20 text-blue-400'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {isPTTActive ? '🎤 Push to Talk' : '🎙️ Always Listening'}
            </button>

            {/* Show PTT button only when in Push to Talk mode */}
            {isPTTActive && isConnected && (
              <button
                onMouseDown={onTalkButtonDown}
                onMouseUp={onTalkButtonUp}
                onTouchStart={onTalkButtonDown}
                onTouchEnd={onTalkButtonUp}
                className={`px-6 py-2 rounded-lg text-sm font-medium transition-all ${
                  isPTTUserSpeaking
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
                }`}
              >
                {isPTTUserSpeaking ? '🔴 Recording...' : '🎙️ Hold to Speak'}
              </button>
            )}

            <button
              onClick={onToggleAudioPlayback}
              className={`px-4 py-2 rounded-lg text-sm transition-all ${
                isAudioPlaybackEnabled
                  ? 'bg-green-500/20 text-green-400'
                  : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
              }`}
            >
              {isAudioPlaybackEnabled ? '🔊 Audio On' : '🔇 Audio Off'}
            </button>
          </div>
        </div>

        {/* Progress Steps (Top Right Corner) */}
        <div className="absolute top-24 right-8 glass rounded-xl px-4 py-3 backdrop-blur-md">
          <div className="flex items-center space-x-1">
            {STEPS.map((step) => (
              <div
                key={step.id}
                className="relative group"
              >
                <button
                  onClick={() => {
                    const content = getStepContent(step.id);
                    if (content) setSelectedStep(content);
                  }}
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer hover:scale-110 ${
                    completedSteps.includes(step.id)
                      ? 'bg-green-500/20 text-green-400 hover:bg-green-500/30'
                      : currentStep === step.id
                        ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50 hover:bg-blue-500/30'
                        : 'bg-gray-800/50 text-gray-500 hover:bg-gray-700/50'
                  }`}
                  title={`Click to see: ${step.label}`}
                >
                  {step.icon}
                </button>
                {/* Tooltip */}
                <div className="absolute top-10 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
                    {step.label}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Lesson Content Modal */}
      {selectedStep && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-blue-600 to-blue-500 p-6">
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-3xl mb-2">{selectedStep.icon}</div>
                  <h2 className="text-2xl font-bold text-white">{selectedStep.title}</h2>
                </div>
                <button
                  onClick={() => setSelectedStep(null)}
                  className="text-white/80 hover:text-white text-2xl leading-none"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-6 space-y-6">
              {/* Key Phrases */}
              <div>
                <h3 className="text-lg font-semibold text-blue-400 mb-3">📝 Key Phrases to Learn</h3>
                <div className="space-y-2">
                  {selectedStep.keyPhrases.map((phrase, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 text-white">
                      &quot;{phrase}&quot;
                    </div>
                  ))}
                </div>
              </div>

              {/* Common Mistakes */}
              <div>
                <h3 className="text-lg font-semibold text-yellow-400 mb-3">⚠️ Common Mistakes</h3>
                <div className="space-y-2">
                  {selectedStep.commonMistakes.map((mistake, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3 text-sm text-gray-300">
                      {mistake}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips */}
              <div>
                <h3 className="text-lg font-semibold text-green-400 mb-3">💡 Tips</h3>
                <ul className="space-y-2">
                  {selectedStep.tips.map((tip, i) => (
                    <li key={i} className="flex items-start">
                      <span className="text-green-400 mr-2">•</span>
                      <span className="text-gray-300">{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Vocabulary */}
              <div>
                <h3 className="text-lg font-semibold text-purple-400 mb-3">📚 Vocabulary</h3>
                <div className="grid grid-cols-2 gap-3">
                  {selectedStep.vocabulary.map((item, i) => (
                    <div key={i} className="bg-gray-800 rounded-lg p-3">
                      <div className="text-white font-medium">{item.word}</div>
                      <div className="text-gray-400 text-sm">{item.meaning}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example Dialogue */}
              <div>
                <h3 className="text-lg font-semibold text-cyan-400 mb-3">🗣️ Example Dialogue</h3>
                <div className="space-y-2">
                  {selectedStep.exampleDialogue.map((line, i) => (
                    <div key={i} className={`flex ${line.speaker === 'You' ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[70%] rounded-lg p-3 ${
                        line.speaker === 'You'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-700 text-gray-200'
                      }`}>
                        <div className="text-xs opacity-70 mb-1">{line.speaker}</div>
                        <div>{line.text}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}