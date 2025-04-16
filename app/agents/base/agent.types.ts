import { AgentMemory, AgentResponse, Interaction, KnowledgeBase  } from "./base.types";

export interface AgentState {
    message: string;
    context: {
      sourceCulture: string;
      targetCulture: string;
      sourceGender: string;
      targetGender: string;
      previousInteractions: Interaction[];
    };
    goals: string[];
    knowledge: KnowledgeBase;
  }
  
  export interface BaseAgent {
    id: string;
    goals: string[];
    memory: AgentMemory;
    observe: (input: any) => Promise<AgentState>;
    think: (state: AgentState) => Promise<any>;
    act: (plan: any) => Promise<AgentResponse>;
    learn: (result: AgentResponse) => Promise<void>;
  }