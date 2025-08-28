"use client";

import React, { useState, useEffect, useRef } from "react";
import { v4 as uuidv4 } from "uuid";

// Components
import VoiceInterface from "./components/VoiceInterface";
import ErrorBoundary from "./components/ErrorBoundary";
import ConnectionBanner from "./components/ConnectionBanner";
import { useWebVitalsLogger } from "./hooks/useWebVitals";

// Types
import { SessionStatus } from "@/app/types";
import type { RealtimeAgent } from '@openai/agents/realtime';

// Context & Hooks
import { useTranscript } from "@/app/contexts/TranscriptContext";
import { useEvent } from "@/app/contexts/EventContext";
import { useRealtimeSession } from "./hooks/useRealtimeSession";
import { useHandleSessionHistory } from "./hooks/useHandleSessionHistory";

// Configs
import { allAgentSets } from "@/app/agentConfigs";
import { hospitalityTrainingScenario, hospitalityTrainingCompanyName } from "@/app/agentConfigs/hospitalityTraining";
import { createModerationGuardrail } from "@/app/agentConfigs/guardrails";


function App() {
  // Web Vitals in dev for quick UX checks
  useWebVitalsLogger(process.env.NODE_ENV !== 'production');
  const { addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  // Agent Management
  const [selectedAgentName, setSelectedAgentName] = useState<string>("");
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<RealtimeAgent[] | null>(null);
  
  // Session State
  const [sessionStatus, setSessionStatus] = useState<SessionStatus>("DISCONNECTED");
  const [isPTTActive, setIsPTTActive] = useState(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState(() => {
    if (typeof window === 'undefined') return true;
    const stored = localStorage.getItem('audioPlaybackEnabled');
    return stored ? stored === 'true' : true;
  });
  // Stable learner identity for tools and persistence
  const [studentId, setStudentId] = useState<string>("");
  
  // Learning Progress State
  const [completedSteps, setCompletedSteps] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState("greeting");
  const [, setPracticeTime] = useState(0);

  // Refs
  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  const handoffTriggeredRef = useRef(false);
  const practiceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Create audio element for SDK
  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  // Attach SDK audio element
  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  // Realtime Session Hook
  const { connect, disconnect, sendEvent, interrupt, mute } = useRealtimeSession({
    onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
    onAgentHandoff: (agentName: string) => {
      handoffTriggeredRef.current = true;
      setSelectedAgentName(agentName);
      
      // Update progress based on agent
      if (agentName === 'hotelGuest') {
        // Starting practice with guest
        setCurrentStep('booking');
      } else if (agentName === 'languageCoach') {
        // Getting feedback
        updateProgress();
      } else if (agentName === 'frontDeskLearner') {
        // Back to learner role
        setCurrentStep('greeting');
      }
    },
  });


  // Session history hook
  useHandleSessionHistory();

  // Helper function to update progress
  const updateProgress = () => {
    setCompletedSteps(prev => {
      if (!prev.includes(currentStep)) {
        return [...prev, currentStep];
      }
      return prev;
    });
    
    // Move to next step
    const steps = ['greeting', 'booking', 'name', 'passport', 'room', 'info'];
    const currentIndex = steps.indexOf(currentStep);
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1]);
    }
  };

  // Track practice time
  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      practiceTimerRef.current = setInterval(() => {
        setPracticeTime(prev => prev + 1);
      }, 60000); // Update every minute
    } else {
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
      }
    }
    return () => {
      if (practiceTimerRef.current) {
        clearInterval(practiceTimerRef.current);
      }
    };
  }, [sessionStatus]);

  // Initialize agent configuration - always use hospitalityTraining for LXLabs
  useEffect(() => {
    const agents = allAgentSets['hospitalityTraining'];
    const agentKeyToUse = agents[0]?.name || "";
    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, []);

  // Ensure a stable studentId exists
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storedId = localStorage.getItem('studentId');
    if (storedId) {
      setStudentId(storedId);
    } else {
      const newId = `student_${uuidv4().slice(0, 8)}`;
      localStorage.setItem('studentId', newId);
      setStudentId(newId);
    }
  }, []);

  // Update session when connected
  useEffect(() => {
    if (sessionStatus === "CONNECTED" && selectedAgentConfigSet && selectedAgentName) {
      const currentAgent = selectedAgentConfigSet.find((a) => a.name === selectedAgentName);
      addTranscriptBreadcrumb(`Starting Practice`, currentAgent);
      updateSession(!handoffTriggeredRef.current);
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  // Update session on PTT change
  useEffect(() => {
    if (sessionStatus === "CONNECTED") {
      updateSession();
    }
  }, [isPTTActive]);

  // Fetch ephemeral key
  const fetchEphemeralKey = async () => {
    logClientEvent({ url: "/session" }, "fetch_session_token_request");
    const tokenResponse = await fetch("/api/session");
    const data = await tokenResponse.json();
    // Avoid logging sensitive secrets; only log metadata
    logServerEvent({ ok: !!data?.client_secret?.value }, "fetch_session_token_response_sanitized");
    
    if (!data.client_secret?.value) {
      logClientEvent(data, "error.no_ephemeral_key");
      console.error("No ephemeral key provided by the server");
      setSessionStatus("DISCONNECTED");
      return null;
    }
    return data.client_secret.value;
  };

  // Connect to Realtime
  const connectToRealtime = async () => {
    if (sessionStatus !== "DISCONNECTED") return;
    setSessionStatus("CONNECTING");

    try {
      const EPHEMERAL_KEY = await fetchEphemeralKey();
      if (!EPHEMERAL_KEY) return;

      const reorderedAgents = [...hospitalityTrainingScenario];
      const idx = reorderedAgents.findIndex((a) => a.name === selectedAgentName);
      if (idx > 0) {
        const [agent] = reorderedAgents.splice(idx, 1);
        reorderedAgents.unshift(agent);
      }

      // Enable moderation guardrails tuned for hospitality
      const guardrail = createModerationGuardrail(hospitalityTrainingCompanyName);

      await connect({
        getEphemeralKey: async () => EPHEMERAL_KEY,
        initialAgents: reorderedAgents,
        audioElement: sdkAudioElement,
        outputGuardrails: [guardrail],
        extraContext: {
          addTranscriptBreadcrumb,
          studentId,
        },
      });

    } catch (err) {
      console.error("Error connecting via SDK:", err);
      setSessionStatus("DISCONNECTED");
    }
  };

  // Disconnect from Realtime
  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus("DISCONNECTED");
    setIsPTTUserSpeaking(false);
  };

  // Send simulated user message
  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, "user", text, true);
    
    sendClientEvent({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sendClientEvent({ type: 'response.create' }, '(simulated user text message)');
  };

  // Update session configuration
  const updateSession = (shouldTriggerResponse: boolean = false) => {
    const turnDetection = isPTTActive
      ? null
      : {
          type: 'server_vad',
          threshold: 0.9,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true,
        };

    sendEvent({
      type: 'session.update',
      session: {
        turn_detection: turnDetection,
        // Use default transcription model configured in session (gpt-4o-mini-transcribe)
      },
    });

    if (shouldTriggerResponse) {
      sendSimulatedUserMessage('Sous-dey! I want to practice hotel check-in');
    }
  };

  // Send client event
  const sendClientEvent = (eventObj: any, eventNameSuffix: string = "") => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
  };

  // Handle talk button
  const handleTalkButtonDown = () => {
    if (sessionStatus !== 'CONNECTED') return;
    interrupt();
    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: 'input_audio_buffer.clear' }, 'clear PTT buffer');
  };

  const handleTalkButtonUp = () => {
    if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking) return;
    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: 'input_audio_buffer.commit' }, 'commit PTT');
    sendClientEvent({ type: 'response.create' }, 'trigger response PTT');
  };

  // Toggle connection
  const onToggleConnection = () => {
    if (sessionStatus === "CONNECTED" || sessionStatus === "CONNECTING") {
      disconnectFromRealtime();
      setSessionStatus("DISCONNECTED");
    } else {
      connectToRealtime();
    }
  };

  // Audio playback control
  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        // Only attempt autoplay after user interaction to avoid console warnings
        if (sessionStatus === 'CONNECTED') {
          audioElementRef.current.play().catch(() => {
            // Silently handle autoplay blocking - this is expected browser behavior
          });
        }
      } else {
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }

    try {
      mute(!isAudioPlaybackEnabled);
    } catch (err) {
      console.warn('Failed to toggle SDK mute', err);
    }
  }, [isAudioPlaybackEnabled]);

  // Sync mute state after connection
  useEffect(() => {
    if (sessionStatus === 'CONNECTED') {
      try {
        mute(!isAudioPlaybackEnabled);
      } catch (err) {
        console.warn('mute sync after connect failed', err);
      }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);


  // Load preferences
  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem("pushToTalkUI");
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === "true");
    }
    const storedAudioPlaybackEnabled = localStorage.getItem("audioPlaybackEnabled");
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === "true");
    }
  }, []);

  // Save preferences
  useEffect(() => {
    localStorage.setItem("pushToTalkUI", isPTTActive.toString());
  }, [isPTTActive]);

  useEffect(() => {
    localStorage.setItem("audioPlaybackEnabled", isAudioPlaybackEnabled.toString());
  }, [isAudioPlaybackEnabled]);

  return (
    <>
      <ConnectionBanner status={sessionStatus} onRetry={connectToRealtime} />
      <ErrorBoundary>
        <VoiceInterface
          sessionStatus={sessionStatus}
          isPTTActive={isPTTActive}
          isPTTUserSpeaking={isPTTUserSpeaking}
          isAudioPlaybackEnabled={isAudioPlaybackEnabled}
          onToggleConnection={onToggleConnection}
          onTalkButtonDown={handleTalkButtonDown}
          onTalkButtonUp={handleTalkButtonUp}
          onToggleAudioPlayback={() => setIsAudioPlaybackEnabled(!isAudioPlaybackEnabled)}
          onTogglePTT={() => setIsPTTActive(!isPTTActive)}
          currentStep={currentStep}
          completedSteps={completedSteps}
          currentAgentName={selectedAgentName}
        />
      </ErrorBoundary>
    </>
  );
}

export default App;
