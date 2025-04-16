import { AgentState } from "./base/agent.types";
import { GenderAnalysis, CommunicationStyle, EmotionalExpression, Suggestion } from "./base/analysis.types";
import { AgentMemory, KnowledgeBase } from "./base/base.types";

export class GenderAgent {
    private goals = ['understand_gender_dynamics', 'improve_communication'];
    private memory: AgentMemory;

    constructor() {
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
            },
            recall: async (query: string) => {
              return this.memory.shortTerm.get(query) || null;
            }
          };
    }

    private async assessGenderPatterns(state: AgentState, model: string = 'openai') {
        try {
            const apiEndpoint = model === 'openai' ? '/api/openai' : '/api/metaLlama';
            const payload = {
                type: "gender",
                model,
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
      
          const responseData = await response.json();

        if (!response.ok) {
            console.error('Gender API Error Details:', {
                status: response.status,
                statusText: response.statusText,
                endpoint: apiEndpoint,
                errorData: responseData,
                errorMessage: responseData.error,
                details: responseData.details,
                requestPayload: payload,
                model,
                timestamp: new Date().toISOString(),
                path: responseData?.stack?.split('\n')?.[1]?.trim() || 'No stack trace'
            });

            if (response.status === 429) {
                throw new Error(`Rate limit exceeded: Please try again in ${Math.ceil(responseData.retryAfter/60)} minutes`);
            }

            if (response.status === 500) {
                throw new Error(`Internal Server Error:\nError: ${responseData.error}\nDetails: ${JSON.stringify(responseData.details)}\nStack: ${responseData.stack || 'No stack trace'}`);
            }

            throw new Error(`API request failed: ${responseData.error || response.statusText}`);
        }

        return responseData;


        } catch (error: unknown) {
            console.error('Gender Pattern Assessment Failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                stack: error instanceof Error ? error.stack : undefined,
                state,
                model,
                timestamp: new Date().toISOString()
              });
          
          return {
            communicationStyle: this.analyzeCommunicationStyle(state.message, state.context.sourceGender),
            emotionalExpression: this.analyzeEmotionalContent(state.message),
            genderConsiderations: "Unable to perform detailed gender analysis.",
            confidence: 0.5
          };
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
    private analyzeCommunicationStyle(
        message: string,
        gender: string
    ): CommunicationStyle {
        const directPatterns = /\b(need|want|should|must|do|don't)\b/gi;
        const emotionalPatterns = /\b(feel|think|believe|wonder|maybe)\b/gi;

        const directCount = (message.match(directPatterns) || []).length;
        const emotionalCount = (message.match(emotionalPatterns) || []).length;

        if (directCount > emotionalCount) {
            return 'direct';
        } else if (emotionalCount > directCount) {
            return 'emotional';
        } else {
            return 'factual';
        }
    }

    private analyzeEmotionalContent(message: string): EmotionalExpression {
        const emotionalWords = /\b(happy|sad|angry|excited|worried|concerned|love|hate)\b/gi;
        const count = (message.match(emotionalWords) || []).length;

        if (count > 5) return 'high';
        if (count > 2) return 'moderate';
        return 'low';
    }

    private calculateConfidence(state: AgentState): number {
        return 0.8;
    }

    private async generateSuggestions(
        genderDynamics: any,
        model: string,
        state: AgentState
    ): Promise<Suggestion[]> {
        try {
            const {
                sourceCulture,
                targetCulture,
                sourceGender,
                targetGender,
                message
            } = genderDynamics;
    
            const apiEndpoint = model === 'openai' ? '/api/openai' : '/api/metaLlama';
            const payload = {
                type: "gender-suggestions",
                state: {
                    context: {
                        sourceCulture: state.context.sourceCulture,
                        targetCulture: state.context.targetCulture,
                        sourceGender: state.context.sourceGender,
                        targetGender: state.context.targetGender
                    },
                    message: state.message
                },
                dynamics: {
                    communicationStyle: genderDynamics.communicationStyle,
                    emotionalExpression: genderDynamics.emotionalExpression,
                    genderConsiderations: genderDynamics.genderConsiderations
                },
                model: model
            };
    
            const response = await fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload)
            });
    
            if (!response.ok) {
                return [{
                    type: 'gender' as const,
                    content: `Unable to process gender suggestions using ${model}`,
                    priority: 1,
                    reasoning: "API request failed"
                }];
            }
    
            const data = await response.json();
            const parsedContent = JSON.parse(data.content);

            const recommendationSuggestions = (parsedContent.genderAnalysis?.recommendations || []).map((rec: any, index: number) => ({
                type: 'gender' as const,
                content: rec.suggestion || '',
                priority: index + 1,
                reasoning: rec.reasoning || ''
            }));
    
            // Extract and map general suggestions
            const generalSuggestions = (parsedContent.suggestions || [])
                .filter((sug: any) => 
                    sug && 
                    typeof sug.content === 'string' && 
                    sug.type && 
                    sug.reasoning
                )
                .map((suggestion: any) => ({
                    type: suggestion.type as 'cultural' | 'gender',
                    content: suggestion.content,
                    priority: suggestion.priority || 1,
                    reasoning: suggestion.reasoning
                }));
    
            // Combine both arrays and ensure unique suggestions
            const allSuggestions = [...recommendationSuggestions, ...generalSuggestions]
                .filter((sug, index, self) => 
                    index === self.findIndex(s => s.content === sug.content)
                );
    
            return allSuggestions.length > 0 ? allSuggestions : [{
                type: 'gender' as const,
                content: `No suggestions available`,
                priority: 1,
                reasoning: "No suggestions could be generated"
            }];
        } catch (error) {
            return [{
                type: 'gender' as const,
                content: `Unable to generate specific gender suggestions using ${model}`,
                priority: 1,
                reasoning: "Error during suggestion generation"
            }];
        }
    }

    private async updateKnowledge(state: AgentState, analysis: any): Promise<void> {
        await this.memory.addMemory({
            timestamp: new Date(),
            state,
            analysis,
            outcome: 'pending'
        });
    }

    async analyze(state: AgentState, model: string): Promise<GenderAnalysis> {
        try {
            this.validateState(state); 

            const response = await this.assessGenderPatterns(state, model);
            const parsedResponse = JSON.parse(response.content);

            const suggestedAdjustments = await this.generateSuggestions(parsedResponse, model, state);
    
            await this.updateKnowledge(state, response);
    
            return {
                genderConsiderations: parsedResponse.genderAnalysis.communicationStyle.explanation,
                communicationStyle: parsedResponse.genderAnalysis.communicationStyle,
                emotionalExpression: parsedResponse.genderAnalysis.emotionalExpression,
                recommendations: parsedResponse.genderAnalysis.recommendations,
                suggestedAdjustments,
                confidence: parsedResponse.confidence
              };
        } catch (error) {
            console.error('Gender analysis failed:', {
                error: error instanceof Error ? error.message : 'Unknown error',
                model,
                state
            });
            throw error;
        }
    }
    
}