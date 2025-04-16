import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
    try {
      return NextResponse.next();
    } catch (error) {
      console.error('Unhandled API Error:', error);
      return NextResponse.json({
        error: 'Internal Server Error',
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  }
  