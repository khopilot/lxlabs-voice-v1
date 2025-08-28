import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Proxy endpoint for the Responses API with optional structured output
export async function POST(req: NextRequest) {
  const body = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: 'OPENAI_API_KEY missing' },
      { status: 500 }
    );
  }

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    function toResponsesInput(raw: any): any[] {
      if (!raw) return [];
      if (typeof raw === 'string') {
        return [{ role: 'user', content: [{ type: 'input_text', text: raw }] }];
      }
      if (Array.isArray(raw)) {
        return raw.map((item) => {
          // Already in responses format
          if (item?.content && Array.isArray(item.content) && item.content[0]?.type?.startsWith('input_')) {
            return item;
          }
          // Codex-style or chat-style: { type: 'message', role, content: string }
          const role = item.role || 'user';
          const text = typeof item.content === 'string' ? item.content : typeof item.content === 'object' ? JSON.stringify(item.content) : String(item.content ?? '');
          return { role, content: [{ type: 'input_text', text }] };
        });
      }
      // Fallback: stringify object
      return [{ role: 'user', content: [{ type: 'input_text', text: JSON.stringify(raw) }] }];
    }

    const normalizedInput = toResponsesInput(body.input);

    const common: any = {
      model: body.model || 'gpt-4o-mini',
      temperature: body.temperature ?? 0.1,
      max_output_tokens: body.max_output_tokens ?? 500,
    };

    if (body.text?.format) {
      // Structured output using zodTextFormat(...)
      const response = await openai.responses.create({
        ...common,
        input: normalizedInput,
        text: { format: body.text.format },
        tools: body.tools,
        parallel_tool_calls: body.parallel_tool_calls,
      });

      return NextResponse.json({
        output_parsed: (response as any).output_parsed,
        output_text: (response as any).output_text,
        output: (response as any).output,
      });
    } else {
      // Normal text response
      const response = await openai.responses.create({
        ...common,
        input: normalizedInput,
        tools: body.tools,
        parallel_tool_calls: body.parallel_tool_calls,
      });

      return NextResponse.json({
        output: (response as any).output,
        output_text: (response as any).output_text,
      });
    }
  } catch (err: any) {
    console.error('Responses proxy error:', err?.response?.data || err);
    return NextResponse.json(
      {
        error: 'failed',
        details: err?.message || 'Unknown error',
      },
      { status: 500 },
    );
  }
}
