import React, { useEffect, useRef } from 'react';
import { useTranscript } from '../contexts/TranscriptContext';

export default function PrestigeTranscript() {
  const { transcriptItems } = useTranscript();
  const items = transcriptItems || [];
  const endOfMessagesRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [items]);

  const getAgentDisplayInfo = (agentName?: string) => {
    switch (agentName) {
      case 'practiceCoordinator':
        return {
          label: '🎯 Training Coordinator',
          gradient: 'from-purple-500 to-pink-400',
          bubble: 'bg-gradient-to-r from-purple-500/10 to-pink-400/10 border-purple-500/20',
        };
      case 'frontDeskLearner':
        return {
          label: '👨‍💼 Front Desk (You)',
          gradient: 'from-green-500 to-emerald-400',
          bubble: 'bg-gradient-to-r from-green-500/10 to-emerald-400/10 border-green-500/20',
        };
      case 'hotelGuest':
        return {
          label: '🧳 Hotel Guest',
          gradient: 'from-amber-500 to-orange-400',
          bubble: 'bg-gradient-to-r from-amber-500/10 to-orange-400/10 border-amber-500/20',
        };
      case 'languageCoach':
        return {
          label: '📚 Language Coach',
          gradient: 'from-cyan-500 to-blue-400',
          bubble: 'bg-gradient-to-r from-cyan-500/10 to-blue-400/10 border-cyan-500/20',
        };
      default:
        return {
          label: '💬 Assistant',
          gradient: 'from-purple-500 to-pink-400',
          bubble: 'bg-gradient-to-r from-purple-500/10 to-pink-400/10 border-purple-500/20',
        };
    }
  };

  const getRoleInfo = (role?: string, agentName?: string) => {
    if (role === 'user') {
      return {
        label: 'You',
        gradient: 'from-blue-500 to-cyan-400',
        align: 'justify-end',
        bubble: 'bg-gradient-to-r from-blue-500/20 to-cyan-400/20 border-blue-500/30',
        text: 'text-blue-100'
      };
    } else if (role === 'assistant') {
      const agentInfo = getAgentDisplayInfo(agentName);
      return {
        label: agentInfo.label,
        gradient: agentInfo.gradient,
        align: 'justify-start',
        bubble: agentInfo.bubble,
        text: 'text-gray-100'
      };
    } else {
      return {
        label: 'System',
        gradient: 'from-gray-500 to-gray-400',
        align: 'justify-center',
        bubble: 'bg-gray-800/50 border-gray-700/50',
        text: 'text-gray-300'
      };
    }
  };

  return (
    <div className="absolute inset-x-0 top-24 bottom-32 mx-auto max-w-4xl px-8">
      <div 
        ref={containerRef}
        className="h-full overflow-y-auto hide-scrollbar"
      >
        <div className="space-y-6 pb-8">
          {/* Welcome message if no items */}
          {(!items || items.length === 0) && (
            <div className="flex justify-center">
              <div className="glass rounded-2xl px-8 py-6 max-w-md text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Welcome to LXLabs Training
                </h3>
                <p className="text-sm text-gray-400">
                  Start your session to begin practicing hospitality English with AI-powered coaching
                </p>
              </div>
            </div>
          )}

          {/* Conversation messages */}
          {items.map((item, index) => {
            // Skip hidden items
            if (item.isHidden) return null;
            
            const roleInfo = getRoleInfo(item.role, item.agentName);
            const isUser = item.role === 'user';
            const isBreadcrumb = item.type === 'BREADCRUMB';
            const isMessage = item.type === 'MESSAGE';

            if (isBreadcrumb) {
              return (
                <div key={item.itemId} className="flex justify-center my-4">
                  <div className="glass rounded-full px-4 py-2 text-xs text-gray-400 flex items-center space-x-2">
                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-pulse" />
                    <span>{item.title || 'Session Update'}</span>
                  </div>
                </div>
              );
            }

            if (!isMessage) return null;

            return (
              <div
                key={item.itemId}
                className={`flex ${roleInfo.align} animate-in fade-in slide-in-from-bottom-2 duration-500`}
                style={{ animationDelay: `${Math.min(index * 50, 500)}ms` }}
              >
                <div className={`max-w-2xl ${isUser ? 'order-2' : ''}`}>
                  {/* Speaker label */}
                  <div className={`flex items-center mb-2 ${isUser ? 'justify-end' : ''}`}>
                    <div className={`flex items-center space-x-2 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
                      <span className={`text-xs font-medium bg-gradient-to-r ${roleInfo.gradient} bg-clip-text text-transparent`}>
                        {roleInfo.label}
                      </span>
                      {item.status === 'IN_PROGRESS' && (
                        <div className="flex space-x-1">
                          <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" />
                          <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-1 h-1 bg-white/60 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Message bubble */}
                  <div className={`group relative ${isUser ? 'ml-auto' : ''}`}>
                    <div className={`
                      glass ${roleInfo.bubble} 
                      rounded-2xl px-6 py-4
                      border backdrop-blur-md
                      transition-all duration-300
                      hover:scale-[1.02] hover:shadow-2xl
                      ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}
                    `}>
                      <p className={`text-sm leading-relaxed ${roleInfo.text} whitespace-pre-wrap`}>
                        {item.title || ''}
                      </p>

                      {/* Pronunciation feedback */}
                      {item.data?.pronunciation && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-yellow-400/80">
                            💡 Pronunciation tip: {item.data.pronunciation}
                          </p>
                        </div>
                      )}

                      {/* Grammar correction */}
                      {item.data?.correction && (
                        <div className="mt-3 pt-3 border-t border-white/10">
                          <p className="text-xs text-green-400/80">
                            ✨ Better phrasing: &quot;{item.data.correction}&quot;
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Timestamp */}
                    <div className={`absolute -bottom-5 ${isUser ? 'right-0' : 'left-0'} opacity-0 group-hover:opacity-100 transition-opacity`}>
                      <span className="text-xs text-gray-500">
                        {item.timestamp || new Date(item.createdAtMs || Date.now()).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <div ref={endOfMessagesRef} />
        </div>
      </div>
    </div>
  );
}