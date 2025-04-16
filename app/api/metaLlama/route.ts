
import ModelClient from "@azure-rest/ai-inference";
import { AzureKeyCredential } from "@azure/core-auth";
import { NextRequest, NextResponse } from 'next/server';

const token = process.env.GITHUB_TOKEN ?? '';
if (!token) {
  throw new Error('GITHUB_TOKEN environment variable is required');
}
const endpoint = "https://models.inference.ai.azure.com";
const modelName = "Llama-3.3-70B-Instruct";

export async function POST(request: NextRequest) {
  try {
    const { state, message } = await request.json();

    if (!state || !state.context) {
      return NextResponse.json({
        error: "Missing required state.context"
      }, { status: 400 });
    }

    const { sourceCulture, targetCulture, sourceGender, targetGender } = state.context;

    if (!sourceGender || !targetGender) {
      return NextResponse.json({
        error: "Missing required gender information"
      }, { status: 400 });
    }

    const systemContent = `You are an expert in cross-cultural and gender-aware communication analysis. 
      Return your analysis ONLY in the specified JSON format without any markdown, headers, or additional text.`;

    const userContent = `
      Analyze this cross-cultural communication scenario:
      Source Culture: ${sourceCulture}
      Target Culture: ${targetCulture}
      Source Gender: ${sourceGender}
      Target Gender: ${targetGender}
      Message: "${state.message}"

      Consider all aspects of cultural and gender dynamics.

      Return the analysis in this exact JSON structure:
      {
        "culturalAnalysis": {
          "keyInsights": [{
            "id": number,
            "title": string,
            "description": string,
            "category": "communication_style" | "hierarchy" | "values" | "gender_dynamics"
          }],
          "contextLevel": "high" | "low",
          "summary": string,
          "culturalNuances": [{
            "title": string,
            "description": string
          }]
        },
        "genderAnalysis": {
          "communicationStyle": {
            "style": string,
            "explanation": string
          },
          "emotionalExpression": {
            "level": string,
            "explanation": string
          },
          "recommendations": [{
            "focus": string,
            "suggestion": string,
            "reasoning": string
          }]
        },
        "suggestions": [{
          "type": "cultural" | "gender",
          "content": string,
          "priority": number,
          "reasoning": string
        }],
        "confidence": number
      }`;

      // Add request validation logging
    console.log('MetaLlama Request:', {
        timestamp: new Date().toISOString(),
        payload: { state, message }
      });
  
      const client = ModelClient(
        endpoint,
        new AzureKeyCredential(token)
      );
  
      // Add client initialization logging
      console.log('MetaLlama Client Status:', {
        endpoint,
        hasToken: !!token,
        timestamp: new Date().toISOString()
      });
  

    const response = await client.path("/chat/completions").post({
      body: {
        messages: [
          { role: "system", content: systemContent },
          { role: "user", content: userContent }
        ],
        temperature: 0.7,
        top_p: 1.0,
        max_tokens: 1000,
        model: modelName
      }
    });

    // Check if response is an error response
    if ('error' in response.body) {
        throw new Error(response.body.error.message || 'Unknown error');
    }
  
    // Now TypeScript knows this is a ChatCompletionsOutput
    if (response.status !== "200") {
        throw new Error('API request failed');
    }
    return NextResponse.json({
        content: response.body.choices[0].message.content
    });

  } catch (error: any) {
    // Enhanced error logging
    console.error('MetaLlama API Error:', {
      error: error.message,
      stack: error.stack,
      type: error.constructor.name,
      timestamp: new Date().toISOString(),
      details: error.details || 'No additional details'
    });

    return NextResponse.json({
      error: "Internal Server Error",
      details: {
        message: error.message,
        type: error.constructor.name,
        timestamp: new Date().toISOString()
      }
    }, { status: 500 });
  }
}
