export interface AnalysisResult {
    culturalAnalysis: CulturalAnalysis;
    cultural_considerations: CulturalConsideration[];
    genderAnalysis: GenderAnalysis;
    suggestions: Suggestion[];
    confidence: number;
  }
  
  export interface CulturalConsideration {
    id: number;
    title: string;
    description: string;
  }
  
  export interface CulturalNuance {
    title: string;
    description: string;
  }

  export interface GenderAnalysis {
    genderConsiderations: string;
    communicationStyle: {
      style: string;
      explanation: string;
    };
    emotionalExpression: {
      level: EmotionalExpression;
      explanation: string;
    };
    recommendations: Array<{
      focus: string;
      suggestion: string;
      reasoning: string;
    }>;
    suggestedAdjustments: Suggestion[];
    confidence: number;
  }
  
  
  export interface KeyInsight {
    id: number;
    title: string;
    description: string;
    category: 'communication_style' | 'hierarchy' | 'values' | 'gender_dynamics';
  }

  export interface CulturalAnalysis {
    contextLevel: 'high' | 'low';
    implicitMeanings: string[];
    culturalNuances: CulturalNuance[];
    adaptationNeeded: boolean;
    confidence: number;
    adaptationSuggestions: Suggestion[];
    genderConsiderations: string;
    culturalConsiderations: {
      id: number;
      category: string;
      content: string;
    }[];
    keyInsights: KeyInsight[]; // Using the KeyInsight interface
  }
  
  
  export interface CulturalPattern {
    contextLevel: 'high' | 'low';
    characteristics: string[];
    commonPhrases: string[];
    tabooTopics: string[];
  }
  
  export interface GenderPattern {
    communicationStyle: CommunicationStyle;
    typicalPatterns: string[];
    commonMisunderstandings: string[];
  }
  
  export interface Suggestion {
    type: 'cultural' | 'gender' | 'general';
    content: string;
    priority: number;
    reasoning: string;
  }
  
  
  export type CommunicationStyle = 'direct' | 'indirect' | 'emotional' | 'factual';
  export type EmotionalExpression = 'high' | 'moderate' | 'low';