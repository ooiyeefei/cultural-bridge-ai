import { CommunicationAgentLogic } from '@/app/agents/communication/communication-agent-logic';
import { NextResponse } from 'next/server';

// app/api/analyze/route.ts
export async function POST(req: Request) {
    try {
      const { model, ...data } = await req.json();
      
      if (!model) {
        return NextResponse.json({
          error: "Missing required model parameter"
        }, { status: 400 });
      }
  
      const agent = new CommunicationAgentLogic();
      try {
        const result = await agent.processMessage(data, model);
        return NextResponse.json(result);
      } catch (error) {
        console.error('Process Message Error:', {
          error: error instanceof Error ? error.message : 'Unknown error',
          model,
          data
        });
        return NextResponse.json({
          error: "Internal processing error",
          details: error instanceof Error ? error.message : 'Unknown error'
        }, { status: 500 });
      }
    } catch (error) {
      return NextResponse.json({
        error: "Invalid request format",
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 400 });
    }
  }
  