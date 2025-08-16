// This file is a standard Next.js API route that acts as a proxy
// to the Genkit flows. It allows the client-side code to call
// the server-side Genkit flows.

import { NextRequest, NextResponse } from 'next/server';
import * as flows from '@/ai/flows';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  const flowName = params.slug.join('/');
  
  if (!(flowName in flows)) {
    return NextResponse.json({ error: `Flow ${flowName} not found` }, { status: 404 });
  }

  try {
    const input = await req.json();
    const flow = (flows as any)[flowName];
    const result = await flow(input);
    return NextResponse.json(result);
  } catch (err: any) {
    console.error(err);
    const errorMessage = err.message || 'An unexpected error occurred';
    return NextResponse.json({ error: 'Flow execution failed', details: errorMessage }, { status: 500 });
  }
}

// Create an index file for flows to easily import them all.
// This is a workaround for not being able to dynamically import.
// We will create this file in the next step.
