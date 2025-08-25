import { frontDeskLearnerAgent } from './frontDeskLearner';
import { hotelGuestAgent } from './hotelGuest';
import { languageCoachAgent } from './languageCoach';
import { practiceCoordinatorAgent } from './practiceCoordinator';

// Set up bidirectional handoffs between all agents
// This allows flexible transitions based on learning needs
(frontDeskLearnerAgent.handoffs as any).push(
  hotelGuestAgent, 
  languageCoachAgent, 
  practiceCoordinatorAgent
);

(hotelGuestAgent.handoffs as any).push(
  frontDeskLearnerAgent, 
  languageCoachAgent, 
  practiceCoordinatorAgent
);

(languageCoachAgent.handoffs as any).push(
  frontDeskLearnerAgent, 
  hotelGuestAgent, 
  practiceCoordinatorAgent
);

(practiceCoordinatorAgent.handoffs as any).push(
  frontDeskLearnerAgent, 
  hotelGuestAgent, 
  languageCoachAgent
);

// Export the scenario with practiceCoordinator as the entry point
export const hospitalityTrainingScenario = [
  practiceCoordinatorAgent,  // Main coordinator - starts the session
  frontDeskLearnerAgent,      // The learner practicing front desk
  hotelGuestAgent,            // AI playing guest roles
  languageCoachAgent,         // Language support and feedback
];

// Name of the hotel used in training scenarios
export const hospitalityTrainingCompanyName = 'Regalis Hotel Cambodia';