import { NextResponse } from 'next/server';

/**
 *
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'mastra-test-dashboard',
    },
    { status: 200 }
  );
}
