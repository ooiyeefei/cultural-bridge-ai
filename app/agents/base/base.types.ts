import { AnalysisResult, CulturalPattern, GenderPattern, Suggestion } from "./analysis.types";

export interface Interaction {
    id: string;
    timestamp: Date;
    message: string;
    sourceCulture: string;
    targetCulture: string;
    sourceGender: string;
    targetGender: string;
    analysis: AnalysisResult;
  }
  
  export interface KnowledgeBase {
    culturalPatterns: Map<string, CulturalPattern>;
    genderPatterns: Map<string, GenderPattern>;
    interactions: Interaction[];
    lastUpdated: Date;
  }
  
  export interface AgentMemory {
    shortTerm: Map<string, any>;
    longTerm: KnowledgeBase;
    episodic: Interaction[];
    addMemory(memory: any): Promise<void>;
    recall(query: string): Promise<any>;
  }
  
  export interface UserMessage {
    text: string;
    sourceCulture: string;
    targetCulture: string;
    sourceGender: string;
    targetGender: string;
  }
  
  export interface AgentResponse {
    analysis: AnalysisResult;
    suggestions: Suggestion[];
    confidence: number;
  }

export type { AnalysisResult };
