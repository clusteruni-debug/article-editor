import { NextRequest, NextResponse } from 'next/server';
import { generateArticleDraft } from '@/lib/gemini/client';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, summary, actionType } = body;

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword is required' },
        { status: 400 }
      );
    }

    const draft = await generateArticleDraft(keyword, summary, actionType);

    return NextResponse.json(draft);
  } catch (error) {
    console.error('Generate draft error:', error);
    return NextResponse.json(
      { error: 'Failed to generate draft' },
      { status: 500 }
    );
  }
}
