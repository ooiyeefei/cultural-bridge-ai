import { AnalysisResult, CulturalAnalysis, GenderAnalysis, Suggestion } from "../agents/base/analysis.types";
import { 
    Lightbulb, 
    MessageSquare, 
    ClipboardList 
  } from 'lucide-react';

interface AnalysisResultsProps {
    result: AnalysisResult;
    error?: ErrorState;
  }
  export interface ApiResponse {
    content: string;  // Raw JSON string from API
  }
  
  export interface ParsedAnalysisResult {
    culturalAnalysis: {
      keyInsights: Array<{
        id: number;
        title: string;
        description: string;
        category: string;
      }>;
      contextLevel: string;
      summary: string;
      culturalNuances: Array<{
        title: string;
        description: string;
      }>;
    };
    genderAnalysis: {
      communicationStyle: {
        style: string;
        explanation: string;
      };
      emotionalExpression: {
        level: string;
        explanation: string;
      };
      recommendations: Array<{
        focus: string;
        suggestion: string;
        reasoning: string;
      }>;
    };
    suggestions: Array<{
      type: 'cultural' | 'gender';
      content: string;
      priority: number;
      reasoning: string;
    }>;
    confidence: number;
  }
  
interface ErrorState {
    type: 'rate_limit' | 'validation' | 'general';
    message: string;
    retryAfter?: number;
    }

function parseContent(content: string) {
    try {
        const parsed = JSON.parse(content);
        return parsed;
    } catch (error) {
        console.error('Failed to parse content:', error);
        return null;
    }
    }

    export function AnalysisResults({ result, error }: AnalysisResultsProps) {
        return (
          <div className="space-y-8 p-6 bg-background dark:bg-black rounded-lg shadow-lg">
            {/* Error Display */}
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-red-600 dark:text-red-200">
                  {error.type === 'rate_limit' 
                    ? `Service is busy. Please try again in ${Math.ceil(error.retryAfter!/60)} minutes.`
                    : error.message}
                </p>
              </div>
            )}
      
            {/* Summary Section */}
            <header className="border-b pb-4 border-gray-200 dark:border-gray-700">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Communication Analysis</h2>
            </header>
      
            {/* Key Insights Section */}
            {result.culturalAnalysis?.keyInsights?.length > 0 && (
              <section className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200 flex items-center">
                  <Lightbulb className="w-5 h-5 mr-2" />
                  Key Insights
                </h3>
                <div className="grid gap-4 md:grid-cols-2">
                  {result.culturalAnalysis.keyInsights.map((insight) => (
                    <div key={insight.id} className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                        {insight.id}. {insight.title}
                      </h4>
                      <p className="text-gray-600 dark:text-gray-300">{insight.description}</p>
                    </div>
                  ))}
                </div>
              </section>
            )}
      
            {/* Cultural Nuances Section */}
            <section className="border-b pb-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold py-3 text-gray-800 dark:text-gray-100">Cultural Nuances</h3>
              <div className="space-y-4">
                {result.culturalAnalysis.culturalNuances.map((nuance, index) => (
                  <div key={index} className="p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">{nuance.title}</h4>
                    <p className="text-gray-600">{nuance.description}</p>
                  </div>
                ))}
              </div>
            </section>
      
            {/* Gender Analysis Section */}
            <section className="border-b pb-4 border-gray-200 dark:border-gray-700">
              <h3 className="text-xl font-semibold py-3 text-gray-800 dark:text-gray-100">Gender Analysis</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Communication Style</h4>
                  <p className="text-gray-700">Style: {result.genderAnalysis.communicationStyle.style}</p>
                  <p className="text-gray-600 mt-2">{result.genderAnalysis.communicationStyle.explanation}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium text-gray-900 mb-2">Emotional Expression</h4>
                  <p className="text-gray-700">Level: {result.genderAnalysis.emotionalExpression.level}</p>
                  <p className="text-gray-600 mt-2">{result.genderAnalysis.emotionalExpression.explanation}</p>
                </div>
              </div>
            </section>

            {/* Recommendations Section */}
                <section className="border-b pb-4 border-gray-200 dark:border-gray-700">
                <h3 className="text-xl font-semibold py-3 text-gray-800 dark:text-gray-100">Recommendations</h3>
                <div className="space-y-4">
                    {result.genderAnalysis.recommendations.map((rec, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg">
                        <span className="inline-block px-2 py-1 bg-gray-200 text-black text-sm rounded mb-2">
                        Focus: {rec.focus}
                        </span>
                        <p className="text-gray-800 mb-2">
                        Suggestion: {rec.suggestion}
                        </p>
                        <p className="text-sm text-gray-600">
                        Reasoning: {rec.reasoning}
                        </p>
                    </div>
                    ))}
                </div>
                {/* General Suggestions Section */}
                    <h3 className="text-xl font-semibold py-3 text-gray-800 dark:text-gray-100">Suggestions</h3>
                    <div className="space-y-4">
                        {result.genderAnalysis.suggestedAdjustments
                            .filter(sug => sug.type && sug.content)
                            .map((suggestion, index) => (
                                <div key={`sug-${index}`} className="p-4 bg-gray-50 rounded-lg">
                                    <span className="inline-block px-2 py-1 bg-gray-200 text-black text-sm rounded mb-2">
                                        Type: {suggestion.type}
                                    </span>
                                    <p className="text-gray-800 mb-2">
                                        {index + 1}. {suggestion.content}
                                    </p>
                                    <p className="text-sm text-gray-600">
                                        Reasoning: {suggestion.reasoning}
                                    </p>
                                </div>
                            ))}
                    </div>
                    </section>

      
            {/* Confidence Score */}
            <footer className="border-t pt-4">
              <div className="flex justify-between text-sm text-gray-600 dark:text-gray-100">
                <span>Confidence</span>
                <span>{(result.confidence * 100).toFixed()}%</span>
              </div>
            </footer>
          </div>
        );
      }
      