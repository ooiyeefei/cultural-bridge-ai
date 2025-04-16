// import { OpenAI } from 'openai';
// import { NextRequest, NextResponse } from 'next/server';

// const openai = new OpenAI({
//   baseURL: "https://models.inference.ai.azure.com",
//   apiKey: process.env.GITHUB_TOKEN
// });

// interface GenderDynamics {
//     communicationStyle: string;
//     emotionalExpression: string;
//     genderConsiderations: string;
//   }

// export async function POST(request: NextRequest) {
//   try {
//     const body = await request.json();
//     const { type, analysis, state, message, dynamics } = body;
//     if (!type) {
//         return NextResponse.json({
//           error: "Missing required 'type' parameter"
//         }, { status: 400 });
//       }

//       if (!state || !state.context) {
//         return NextResponse.json({
//           error: "Missing required state.context"
//         }, { status: 400 });
//       }

//     // Add null checks for state and context
//     if (type === "nuances" && (!state || !state.context)) {
//         return NextResponse.json({
//           error: "Missing required state.context for nuances analysis"
//         }, { status: 400 });
//       }
  
//       // Add null checks for gender analysis
//       if (type === "gender" && (!state?.context?.sourceGender || !state?.context?.targetGender)) {
//         return NextResponse.json({
//           error: "Missing required gender information"
//         }, { status: 400 });
//       }

//     let systemContent = `You are an expert in cross-cultural communication analysis. 
//         Return your analysis ONLY in the specified JSON format without any markdown, headers, or additional text.
//         Provide analysis in the following JSON format:

//         {
//         "cultural_considerations": [
//             {
//             "id": number,
//             "title": string,
//             "description": string
//             }
//         ],
//         "suggestions": [
//             {
//             "id": number,
//             "title": string,
//             "points": string[]
//             }
//         ]
//         }
//         `;
//     let userContent = "";
//     let finalMessages = [];

//     // Handle different types of requests
//     switch(type) {
//         case "adaptations":
//           systemContent = systemContent;
//           userContent = `
//             Based on this analysis:
//             Cultural Context: ${JSON.stringify(analysis)}
//             Gender Context: ${state.context.sourceGender} to ${state.context.targetGender}
            
//             Suggest specific adaptations to improve communication.
//             Focus on:
//             1. Cultural sensitivity and adaptation
//             2. Gender-appropriate communication
//             3. Combined cultural-gender considerations
//             4. Practical recommendations
            
//             Please return in this exact JSON structure:
//             {
//             "adaptations": {
//                 "cultural": [{
//                 "category": "Cultural Sensitivity",
//                 "recommendations": [
//                     {
//                     "point": "string",
//                     "reasoning": "string",
//                     "priority": number
//                     }
//                 ]
//                 }],
//                 "gender": [{
//                 "category": "Gender Communication",
//                 "recommendations": [
//                     {
//                     "point": "string",
//                     "reasoning": "string",
//                     "priority": number
//                     }
//                 ]
//                 }]
//             }
//             }
//           `;
//           break;
  
//         case "nuances":
//           systemContent = systemContent;
//           userContent = `
//             Analyze the communication dynamics between:
//             - Source Culture: ${state.context.sourceCulture}
//             - Target Culture: ${state.context.targetCulture}
//             - Source Gender: ${state.context.sourceGender}
//             - Target Gender: ${state.context.targetGender}
            
//             Message: "${state.message}"
            
//             Consider:
//             - Cultural communication styles
//             - Gender-specific patterns
//             - Social hierarchy implications
//             - Cultural values and beliefs
//             - Gender-cultural intersectionality

//             Please return in this exact JSON structure:
//             {
//             "culturalAnalysis": {
//                 "keyInsights": [
//                 {
//                     "id": number,
//                     "title": "string",
//                     "description": "string",
//                     "category": "communication_style" | "hierarchy" | "values" | "gender_dynamics"
//                 }
//                 ],
//                 "contextLevel": "high" | "low",
//                 "summary": "string"
//             }
//             }
//           `;
//           break;
  
//         case "gender":
//           systemContent = systemContent;
//           userContent = `
//             Analyze the gender communication dynamics:
//             Source Gender: ${state.context.sourceGender}
//             Target Gender: ${state.context.targetGender}
//             Cultural Context: ${state.context.sourceCulture} to ${state.context.targetCulture}
//             Message: "${state.message}"
            
//             Consider:
//             - Gender-specific communication patterns
//             - Cultural influence on gender expression
//             - Professional context
//             - Power dynamics

//             Please return in this exact JSON structure:
//             {
//                 "genderAnalysis": {
//                     "communicationStyle": {
//                     "style": "string",
//                     "explanation": "string"
//                     },
//                     "emotionalExpression": {
//                     "level": "string",
//                     "explanation": "string"
//                     },
//                     "recommendations": [
//                     {
//                         "focus": "string",
//                         "suggestion": "string",
//                         "reasoning": "string"
//                     }
//                     ]
//                 }
//                 }
//           `;
//           break;
  
//         case "gender-suggestions":
//           systemContent = systemContent;
//           userContent = `
//             Based on these dynamics:
//             ${JSON.stringify(dynamics as GenderDynamics)}
            
//             Suggest specific adjustments to improve communication.
//             Focus on:
//             1. Culturally-aware inclusive language
//             2. Gender-appropriate communication style
//             3. Professional context adaptation
//             4. Cultural sensitivity

//             Please return in this exact JSON structure:
//             {
//             "suggestions": {
//                 "language": [{
//                 "category": "Inclusive Language",
//                 "points": ["string"],
//                 "context": "string"
//                 }],
//                 "style": [{
//                 "category": "Communication Style",
//                 "points": ["string"],
//                 "context": "string"
//                 }],
//                 "cultural": [{
//                 "category": "Cultural Adaptation",
//                 "points": ["string"],
//                 "context": "string"
//                 }]
//             }
//             }
//           `;
//           break;
//       }

//       finalMessages = [
//         {
//           role: "system",
//           content: systemContent
//         },
//         {
//           role: "user",
//           content: userContent
//         }
//       ];

//       // If additional messages were provided, use those instead
//       if (message && Array.isArray(message) && message.length > 0) {
//         finalMessages = [
//           {
//             role: "system",
//             content: "You are an AI assistant specialized in cross-cultural and gender-aware communication."
//           },
//           ...message
//         ];
//       }

//     const response = await openai.chat.completions.create({
//       model: "gpt-4o",
//       messages: finalMessages,
//       temperature: 0.7,
//       max_tokens: 500
//     });

//     return NextResponse.json({
//       content: response.choices[0].message.content
//     });

//   } catch (error) {
//     console.error('OpenAI API Error:', {
//         error: error instanceof Error ? error.message : 'Unknown error',
//         stack: error instanceof Error ? error.stack : undefined,
//         type: error instanceof OpenAI.APIError ? error.type : undefined,
//         status: error instanceof OpenAI.APIError ? error.status : undefined
//       });
    
//       return NextResponse.json({
//         error: error instanceof Error ? error.message : 'Unknown error',
//         details: error instanceof OpenAI.APIError ? {
//           type: error.type,
//           status: error.status,
//           message: error.message
//         } : undefined
//       }, { status: 500 });
//   }
// }


import { OpenAI } from 'openai/index.mjs';
import { NextRequest, NextResponse } from 'next/server';

const openai = new OpenAI({
  baseURL: "https://models.inference.ai.azure.com",
  apiKey: process.env.GITHUB_TOKEN
});

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

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: systemContent
        },
        {
          role: "user",
          content: userContent
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    return NextResponse.json({
      content: response.choices[0].message.content
    });

  } catch (error) {
    if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          const retryAfter = parseInt(error.headers?.['retry-after'] || '60');
          return NextResponse.json({
            error: "Service temporarily unavailable",
            retryAfter,
            message: `Please try again in ${Math.ceil(retryAfter/60)} minutes`
          }, { 
            status: 429,
            headers: { 'Retry-After': String(retryAfter) }
          });
        }
      }
    
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error instanceof OpenAI.APIError ? {
        type: error.type,
        status: error.status,
        message: error.message
      } : undefined
    }, { status: 500 });
  }
}
