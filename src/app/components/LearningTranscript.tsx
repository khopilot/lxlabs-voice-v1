import React, { useEffect, useRef } from 'react';
import { useTranscript } from '../contexts/TranscriptContext';

export default function LearningTranscript() {
  const { transcriptItems: items = [] } = useTranscript();
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  const formatMessage = (text: string) => {
    // Add some basic formatting for better readability
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </span>
    ));
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'user':
        return { label: 'You', color: 'bg-blue-100 text-blue-800' };
      case 'assistant':
        return { label: 'Practice Partner', color: 'bg-green-100 text-green-800' };
      default:
        return { label: 'System', color: 'bg-gray-100 text-gray-800' };
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 h-full flex flex-col">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">
          Practice Conversation
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          Your practice session transcript
        </p>
      </div>

      {/* Transcript */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 hide-scrollbar">
        {!items || items.length === 0 ? (
          <div className="text-center py-12">
            <div className="mb-4">
              <span className="text-6xl">🎯</span>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Ready to Practice?
            </h3>
            <p className="text-sm text-gray-500 max-w-sm mx-auto">
              Click &quot;Start Practice&quot; above to begin your hospitality English training session.
            </p>
          </div>
        ) : (
          <>
            {items
              .filter(item => item.type === 'MESSAGE' && !item.isHidden)
              .map((item) => {
                const roleInfo = getRoleLabel(item.role);
                const isUser = item.role === 'user';
                
                return (
                  <div
                    key={item.itemId}
                    className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isUser ? 'order-2' : ''}`}>
                      {/* Role Badge */}
                      <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : ''}`}>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${roleInfo.color}`}>
                          {roleInfo.label}
                        </span>
                      </div>
                      
                      {/* Message Bubble */}
                      <div className={`rounded-2xl px-4 py-3 ${
                        isUser 
                          ? 'bg-[#3B9FE9] text-white' 
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        <div className={`text-sm ${isUser ? 'text-white' : 'text-gray-900'}`}>
                          {formatMessage(item.data?.text || '')}
                        </div>
                        
                        {/* Status Indicator */}
                        {item.status === 'IN_PROGRESS' && (
                          <div className="flex items-center mt-2 space-x-1">
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" />
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                            <div className="w-1 h-1 bg-current rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                          </div>
                        )}
                      </div>

                      {/* Feedback (for corrections) */}
                      {item.data?.correction && (
                        <div className="mt-2 px-3 py-2 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <p className="text-xs text-yellow-800">
                            <span className="font-medium">Tip:</span> {item.data.correction}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            <div ref={endOfMessagesRef} />
          </>
        )}
      </div>

      {/* Breadcrumbs for lesson context */}
      <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-2 text-xs text-gray-600">
          {items
            .filter(item => item.type === 'BREADCRUMB')
            .slice(-3)
            .map((item, index) => (
              <React.Fragment key={item.itemId}>
                {index > 0 && <span>→</span>}
                <span className="font-medium">{item.title}</span>
              </React.Fragment>
            ))}
        </div>
      </div>
    </div>
  );
}