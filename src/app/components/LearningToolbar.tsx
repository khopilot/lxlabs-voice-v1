import React, { useState } from 'react';
import { 
  ChatBubbleIcon,
  PaperPlaneIcon,
  SpeakerLoudIcon,
  SpeakerOffIcon,
  ReloadIcon,
  ReaderIcon,
  QuestionMarkCircledIcon
} from '@radix-ui/react-icons';

interface LearningToolbarProps {
  sessionStatus: string;
  isPTTActive: boolean;
  isPTTUserSpeaking: boolean;
  isAudioPlaybackEnabled: boolean;
  userText: string;
  onUserTextChange: (text: string) => void;
  onSendTextMessage: () => void;
  onTalkButtonDown: () => void;
  onTalkButtonUp: () => void;
  onToggleAudioPlayback: () => void;
  onTogglePTT: () => void;
  onInterrupt: () => void;
}

export default function LearningToolbar({
  sessionStatus,
  isPTTActive,
  isPTTUserSpeaking,
  isAudioPlaybackEnabled,
  userText,
  onUserTextChange,
  onSendTextMessage,
  onTalkButtonDown,
  onTalkButtonUp,
  onToggleAudioPlayback,
  onTogglePTT,
  onInterrupt,
}: LearningToolbarProps) {
  const [showHelp, setShowHelp] = useState(false);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSendTextMessage();
    }
  };

  const isConnected = sessionStatus === 'CONNECTED';

  return (
    <>
      {/* Help Overlay */}
      {showHelp && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Quick Help</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🎤</span>
                <div>
                  <p className="font-medium">Voice Practice</p>
                  <p className="text-gray-600">Hold the microphone button to speak, or toggle Push-to-Talk mode</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-medium">Text Practice</p>
                  <p className="text-gray-600">Type your response and press Enter to send</p>
                </div>
              </div>
              <div className="flex items-start space-x-3">
                <span className="text-2xl">🔊</span>
                <div>
                  <p className="font-medium">Audio Control</p>
                  <p className="text-gray-600">Toggle speaker to hear your practice partner</p>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full px-4 py-2 bg-[#3B9FE9] text-white rounded-lg hover:bg-[#2B7FC9]"
            >
              Got it!
            </button>
          </div>
        </div>
      )}

      {/* Main Toolbar */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 gap-4">
            {/* Left: Mode Controls */}
            <div className="flex items-center space-x-2">
              {/* PTT Toggle */}
              <button
                onClick={onTogglePTT}
                disabled={!isConnected}
                className={`px-3 py-2 rounded-lg text-sm font-medium flex items-center space-x-2 transition-all ${
                  isPTTActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <ChatBubbleIcon className="w-4 h-4" />
                <span className="hidden sm:inline">
                  {isPTTActive ? 'PTT On' : 'Auto'}
                </span>
              </button>

              {/* Audio Toggle */}
              <button
                onClick={onToggleAudioPlayback}
                className={`p-2 rounded-lg transition-all ${
                  isAudioPlaybackEnabled
                    ? 'bg-green-100 text-green-700 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {isAudioPlaybackEnabled ? (
                  <SpeakerLoudIcon className="w-5 h-5" />
                ) : (
                  <SpeakerOffIcon className="w-5 h-5" />
                )}
              </button>

              {/* Interrupt */}
              <button
                onClick={onInterrupt}
                disabled={!isConnected}
                className={`p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all ${
                  !isConnected ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                <ReloadIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Center: Input Area */}
            <div className="flex-1 max-w-2xl">
              <div className="relative flex items-center">
                {/* Text Input */}
                <input
                  type="text"
                  value={userText}
                  onChange={(e) => onUserTextChange(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={!isConnected}
                  placeholder={
                    isConnected 
                      ? "Type your response or hold the mic button to speak..." 
                      : "Connect to start practicing..."
                  }
                  className="flex-1 px-4 py-3 pr-24 bg-gray-50 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#3B9FE9] focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                />

                {/* Action Buttons */}
                <div className="absolute right-2 flex items-center space-x-2">
                  {/* Send Text */}
                  {userText.trim() && (
                    <button
                      onClick={onSendTextMessage}
                      disabled={!isConnected}
                      className="p-2 bg-[#3B9FE9] text-white rounded-lg hover:bg-[#2B7FC9] transition-all"
                    >
                      <PaperPlaneIcon className="w-4 h-4" />
                    </button>
                  )}

                  {/* Voice Button (PTT) */}
                  {isPTTActive && (
                    <button
                      onMouseDown={onTalkButtonDown}
                      onMouseUp={onTalkButtonUp}
                      onTouchStart={onTalkButtonDown}
                      onTouchEnd={onTalkButtonUp}
                      disabled={!isConnected}
                      className={`p-2 rounded-lg transition-all ${
                        isPTTUserSpeaking
                          ? 'bg-red-500 text-white animate-pulse'
                          : 'bg-[#3B9FE9] text-white hover:bg-[#2B7FC9]'
                      } ${!isConnected ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <ChatBubbleIcon className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Voice Indicator */}
              {isPTTUserSpeaking && (
                <div className="mt-2 text-center">
                  <span className="text-sm text-red-600 font-medium animate-pulse">
                    🎤 Recording... Release to send
                  </span>
                </div>
              )}
            </div>

            {/* Right: Help & Resources */}
            <div className="flex items-center space-x-2">
              {/* Lesson Guide */}
              <button
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                title="Lesson Guide"
              >
                <ReaderIcon className="w-5 h-5" />
              </button>

              {/* Help */}
              <button
                onClick={() => setShowHelp(true)}
                className="p-2 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all"
                title="Help"
              >
                <QuestionMarkCircledIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}