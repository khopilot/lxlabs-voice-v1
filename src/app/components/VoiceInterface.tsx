import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import PrestigeTranscript from './PrestigeTranscript';

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
  const [time, setTime] = useState(new Date());
  const isConnected = sessionStatus === 'CONNECTED';
  const isConnecting = sessionStatus === 'CONNECTING';

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

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
            {STEPS.map((step, index) => (
              <div
                key={step.id}
                className="relative group"
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all cursor-pointer ${
                    completedSteps.includes(step.id)
                      ? 'bg-green-500/20 text-green-400'
                      : currentStep === step.id
                        ? 'bg-blue-500/20 text-blue-400 ring-1 ring-blue-500/50'
                        : 'bg-gray-800/50 text-gray-500'
                  }`}
                  title={step.label}
                >
                  {step.icon}
                </div>
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
    </div>
  );
}