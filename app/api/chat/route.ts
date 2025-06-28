import { streamText, CoreMessage } from 'ai';
import { getSystemPrompt } from '@/lib/prompts/system-prompt';
import { querySupabaseTool } from '@/lib/tools/query-supabase';
import { createOpenAI } from '@ai-sdk/openai';
import { createSupabaseServer } from '@/lib/supabase/server';

const openai = createOpenAI({
  apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY,
});

export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const supabase = await createSupabaseServer();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { messages }: { messages: CoreMessage[] } = await req.json();
    const systemPrompt = await getSystemPrompt(user.id);

    const result = streamText({
      model: openai('gpt-4o-mini'),
      system: systemPrompt,
      messages,
      tools: {
        querySupabase: querySupabaseTool,
      },
      maxSteps: 5, // allow up to 5 steps
    });

    // Stream the response back to the client so `useChat` can consume it
    return result.toDataStreamResponse();
  } catch (error: any) {
    console.error('[API] Error:', error);
    return new Response(JSON.stringify({ error: error.message || 'An unexpected error occurred.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
