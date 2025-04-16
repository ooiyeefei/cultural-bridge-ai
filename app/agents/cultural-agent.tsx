import { AgentState } from "./base/agent.types";
import { AnalysisResult, CulturalAnalysis, Suggestion } from "./base/analysis.types";
import { AgentMemory, KnowledgeBase } from "./base/base.types";

export class CulturalAgent {
    private goals = ['understand_cultural_context', 'adapt_communication'];
    private memory: AgentMemory;

    constructor() {
        // Initialize memory with default values
        this.memory = {
            shortTerm: new Map<string, any>(),
            longTerm: {
                culturalPatterns: new Map(),
                genderPatterns: new Map(),
                interactions: [],
                lastUpdated: new Date()
            },
            episodic: [],
            addMemory: async (memory: any) => {
                this.memory.shortTerm.set(Date.now().toString(), memory);
                // Implement logic to move to long-term memory if needed
            },
            recall: async (query: string) => {
                // Implement memory recall logic
                return this.memory.shortTerm.get(query) || null;
            }
        };
    }

    private async assessCulturalFactors(state: AgentState, model: string) {
      try {
        // Use memory to enhance analysis
        const previousInteractions = await this.memory.recall(state.context.sourceCulture);
        const contextLevel = this.determineContextLevel(state.context.sourceCulture);
        const implicitMeanings = await this.analyzeImplicitMeanings(state.message, state, model);
        const rawNuances = await this.analyzeCulturalNuances(state, model);

        // Transform raw nuances into CulturalNuance objects
        const culturalNuances = rawNuances.map((nuance, index) => ({
            title: `Cultural Consideration ${index + 1}`,
            description: nuance
        }));
    
        // Store this analysis in memory
        await this.memory.addMemory({
            culture: state.context.sourceCulture,
            analysis: { contextLevel, implicitMeanings, culturalNuances }
        });
    
        return {
            contextLevel,
            implicitMeanings,
            culturalNuances,
            adaptationNeeded: true,
            confidence: 0.8
        };
      } catch (error) {
        console.error('Cultural Factors Assessment Failed:', error);
        throw error;
    }
  }

// Update the suggestAdaptations method to ensure correct typing
private async suggestAdaptations(analysis: any, state: AgentState, model: string): Promise<Suggestion[]>  {
  try {
      const apiEndpoint = model === 'openai' ? '/api/openai' : '/api/metaLlama';
      const payload = {
          type: "adaptations",
          state: {
            context: {
                sourceCulture: state.context.sourceCulture,
                targetCulture: state.context.targetCulture,
                sourceGender: state.context.sourceGender,
                targetGender: state.context.targetGender
            },
            message: state.message
        },
          analysis: analysis,
          model: model
      };

      const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
      });

      const data = await response.json();
      
      if (!response.ok) {
          return [{
              type: 'cultural' as const,
              content: `Unable to process adaptation suggestions using ${model}`,
              priority: 1,
              reasoning: "API request failed"
          }];
      }

      return data.content.split('\n')
          .filter((line: string) => line.trim().length > 0)
          .map((suggestion: string) => ({
              type: 'cultural' as const,
              content: suggestion,
              priority: 1,
              reasoning: `Generated from cultural analysis using ${model}`
          }));
  } catch (error) {
    console.error('Adaptations Failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        state,
        model,
        timestamp: new Date().toISOString()
    });
    throw error;
  }
}


    private async updateKnowledge(state: AgentState, analysis: any): Promise<void> {
        // Update memory with new knowledge
        await this.memory.addMemory({
            timestamp: new Date(),
            state,
            analysis,
            outcome: 'pending'
        });
    }

    private determineContextLevel(culture: string): 'high' | 'low' {
        // Check memory for previous determinations
        const highContextCultures = ['japanese', 'chinese', 'korean', 'arab'];
        return highContextCultures.includes(culture.toLowerCase()) ? 'high' : 'low';
    }

    private async handleAPIResponse(response: Response, context: string) {
      if (!response.ok) {
        let errorDetails;
        try {
          errorDetails = await response.json();
        } catch {
          errorDetails = await response.text();
        }
    
        console.error(`${context} Error:`, {
          status: response.status,
          statusText: response.statusText,
          details: errorDetails
        });
    
        throw new Error(`${context} failed: ${response.statusText}\nDetails: ${
          typeof errorDetails === 'string' ? errorDetails : JSON.stringify(errorDetails)
        }`);
      }
      return response;
    }
    

    private async makeAPIRequest(messages: any[], context: string, state: AgentState, model: string) {
      try {
        const apiEndpoint = model === 'openai' ? '/api/openai' : '/api/metaLlama';
        const payload = {
          type: "analysis",
          messages,
          state: {
              context: {
                  sourceCulture: state.context.sourceCulture,
                  targetCulture: state.context.targetCulture,
                  sourceGender: state.context.sourceGender,
                  targetGender: state.context.targetGender
              },
              message: state.message
          }
      };

        const response = await fetch(apiEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload)
        });

        const responseData = await response.json().catch(error => {
          console.error('JSON Parse Error:', {
            error: error.message,
            responseText: response.text(),
            status: response.status
          });
          throw new Error('Failed to parse response JSON');
        });
    
        if (!responseData || !responseData.content) {
          throw new Error('Empty response received from API');
        }

        if (!response.ok) {
          console.error('API Error Details:', {
            endpoint: apiEndpoint,
            status: response.status,
            statusText: response.statusText,
            error: responseData.error,
            message: responseData.message,
            retryAfter: responseData.retryAfter,
            requestPayload: payload,
            timestamp: new Date().toISOString()
          });
    
          if (response.status === 429) {
            throw new Error(`Service temporarily unavailable: Please try again in ${Math.ceil(responseData.retryAfter/60)} minutes`);
          }
    
          if (response.status === 500) {
            throw new Error(`Internal Server Error: ${responseData.error}\nMessage: ${responseData.message}`);
          }
    
          throw new Error(`API request failed (${response.status}): ${responseData.error || response.statusText}`);
        }
    
        return responseData;
      } catch (error) {
        console.error('API Request Failed:', {
            error: error instanceof Error ? error.message : 'Unknown error',
            context,
            messages
        });
        throw error;
    }
    }

    private createErrorAnalysis(): AnalysisResult {
      return {
        culturalAnalysis: {
          contextLevel: 'low',
          implicitMeanings: [],
          culturalNuances: [{
            title: "Analysis Unavailable",
            description: "Unable to perform cultural analysis at this time."
          }],
          adaptationNeeded: false,
          confidence: 0,
          adaptationSuggestions: [{
            type: 'cultural' as const,
            content: "Consider general cultural sensitivity",
            priority: 1,
            reasoning: "Error fallback"
          }],
          culturalConsiderations: [],
          keyInsights: [],
          genderConsiderations: "Unable to analyze gender considerations"
        },
        cultural_considerations: [],
        genderAnalysis: {
          genderConsiderations: "Unable to analyze gender considerations",
          communicationStyle: {
            style: 'direct',
            explanation: 'Default communication style due to error'
          },
          emotionalExpression: {
            level: 'moderate',
            explanation: 'Default emotional expression due to error'
          },
          recommendations: [{
            focus: 'general',
            suggestion: 'Consider general communication guidelines',
            reasoning: 'Error fallback'
          }],
          suggestedAdjustments: [{
            type: 'gender' as const,
            content: "Consider general gender-appropriate communication",
            priority: 1,
            reasoning: "Error fallback"
          }],
          confidence: 0
        },
        suggestions: [{
          type: 'general' as const,
          content: "System encountered an error during analysis",
          priority: 1,
          reasoning: "Error fallback"
        }],
        confidence: 0
      };
    }

    
    private async analyzeImplicitMeanings(message: string, state: AgentState, model: string): Promise<string[]> {
      const messages = [
        {
            role: "system",
            content: "You are an expert in cross-cultural communication analysis."
        },
        {
            role: "user",
            content: `Analyze the implicit meanings in this message: "${message}"`
        }
    ];
    
    const response = await this.makeAPIRequest(messages, "Implicit Meanings Analysis", state, model);
    return response.implicitMeanings || [];
  }

  private parseAnalysisResponse(response: string): AnalysisResult {
    try {
      const parsed = JSON.parse(response);
      
      // Extract cultural analysis from the nuances response
      const culturalAnalysis = {
        contextLevel: parsed.culturalAnalysis?.contextLevel || 'low',
        keyInsights: parsed.culturalAnalysis?.keyInsights || [],
        implicitMeanings: [],
        culturalNuances: parsed.culturalAnalysis?.culturalNuances || [],
        adaptationNeeded: true,
        confidence: 0.8,
        adaptationSuggestions: parsed.adaptations?.cultural?.[0]?.recommendations?.map((r: any) => ({
          type: 'cultural',
          content: r.point,
          priority: r.priority,
          reasoning: r.reasoning
        })) || [],
        culturalConsiderations: [],
        genderConsiderations: ''
      };
  
      // Extract gender analysis
      const genderAnalysis = {
        genderConsiderations: parsed.genderAnalysis?.communicationStyle?.explanation || '',
        communicationStyle: {
          style: parsed.genderAnalysis?.communicationStyle?.style || 'direct',
          explanation: parsed.genderAnalysis?.communicationStyle?.explanation || ''
        },
        emotionalExpression: {
          level: parsed.genderAnalysis?.emotionalExpression?.level || 'moderate',
          explanation: parsed.genderAnalysis?.emotionalExpression?.explanation || ''
        },
        recommendations: parsed.genderAnalysis?.recommendations || [],
        suggestedAdjustments: parsed.adaptations?.gender?.[0]?.recommendations?.map((r: any) => ({
          type: 'gender',
          content: r.point,
          priority: r.priority,
          reasoning: r.reasoning
        })) || [],
        confidence: 0.8
      };
  
      return {
        culturalAnalysis,
        cultural_considerations: parsed.cultural_considerations || [],
        genderAnalysis,
        suggestions: [...(culturalAnalysis.adaptationSuggestions || []), ...(genderAnalysis.suggestedAdjustments || [])],
        confidence: (culturalAnalysis.confidence + genderAnalysis.confidence) / 2
      };
    } catch (error) {
      console.error('Failed to parse analysis:', error);
      // Return fallback structure
      return this.createErrorAnalysis();
    }
  }
  
  private validateState(state: AgentState): void {
    if (!state.context?.sourceGender || !state.context?.targetGender) {
      throw new Error("Source and target gender are required");
    }
    if (!state.context?.sourceCulture || !state.context?.targetCulture) {
      throw new Error("Source and target culture are required");
    }
  }
  

  private async analyzeCulturalNuances(state: AgentState, model: string): Promise<string[]> {
    try {
      const apiEndpoint = model === 'openai' ? '/api/openai' : '/api/metaLlama';
      const payload = {
        type: "nuances",
        state: {
          context: {
            sourceCulture: state.context.sourceCulture,
            targetCulture: state.context.targetCulture,
            sourceGender: state.context.sourceGender,
            targetGender: state.context.targetGender
          },
          message: state.message
        }
      };
      
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });
  
      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Details:', {
          status: response.status,
          statusText: response.statusText,
          errorData,
          state
        });
        throw new Error(`API request failed: ${response.statusText}\nDetails: ${JSON.stringify(errorData)}`);
      }
  
      const data = await response.json();
      const parsedResponse = this.parseAnalysisResponse(data.content);
      
      // Return the cultural nuances from the parsed response
      return parsedResponse.culturalAnalysis.culturalNuances.map(nuance => nuance.description);
    } catch (error) {
      console.error('Cultural Nuances Analysis Failed:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        state 
      });
      // Return empty array as fallback
      return [];
    }
  }

  
    // Error handling wrapper
    private async safeAPICall<T>(
      apiCall: () => Promise<T>, 
      fallback: T,
      model: string = 'openai'
    ): Promise<T> {
      try {
        return await apiCall();
      } catch (error) {
        console.error('LLM API call failed:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          model,
          timestamp: new Date().toISOString()
        });
    
        if (Array.isArray(fallback)) {
          return fallback.map(suggestion => ({
            type: model === 'openai' ? 'cultural' : 'general',
            content: suggestion,
            priority: 1,
            reasoning: `Fallback suggestion due to ${model} API failure`
          })) as T;
        }
        return fallback;
      }
    }
    
    async analyze(state: AgentState, model: string): Promise<CulturalAnalysis> {
      try {
        this.validateState(state); 
          const culturalFactors = await this.assessCulturalFactors(state, model);
          const adaptationSuggestions = await this.safeAPICall(
              () => this.suggestAdaptations(culturalFactors, state, model),
              [
                  {
                      type: 'cultural' as const,
                      content: "Consider cultural differences",
                      priority: 1,
                      reasoning: 'Default cultural consideration'
                  },
                  {
                      type: 'cultural' as const,
                      content: "Adapt communication style",
                      priority: 1,
                      reasoning: 'Default adaptation suggestion'
                  }
              ]
          );
  
          await this.updateKnowledge(state, culturalFactors);
  
          return {
              contextLevel: culturalFactors.contextLevel,
              implicitMeanings: culturalFactors.implicitMeanings,
              culturalNuances: culturalFactors.culturalNuances,
              adaptationNeeded: culturalFactors.adaptationNeeded,
              keyInsights: [],
              adaptationSuggestions: adaptationSuggestions.map(suggestion => ({
                  ...suggestion,
                  type: 'cultural' as const
              })),
              confidence: culturalFactors.confidence,
              culturalConsiderations: [],
              genderConsiderations: "Default gender considerations"
          };
      } catch (error) {
          console.error('Analysis failed:', error);
          throw error;
      }
  }  
  
}
