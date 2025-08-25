import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

// Proxy endpoint for the OpenAI Chat Completions API with structured output
export async function POST(req: NextRequest) {
  const body = await req.json();

  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  try {
    // Convert the input format to chat completions format
    const messages = body.input || [];
    
    if (body.text?.format?.type === 'json_schema') {
      // Use structured output with response_format
      const response = await openai.chat.completions.create({
        model: body.model || 'gpt-4o-mini',
        messages: messages,
        response_format: {
          type: 'json_schema',
          json_schema: body.text.format.json_schema
        },
        temperature: 0.1,
        max_tokens: 500,
      });

      const content = response.choices[0].message.content;
      const parsed = content ? JSON.parse(content) : {};
      
      return NextResponse.json({
        output_parsed: parsed,
        output: content,
        usage: response.usage,
      });
    } else {
      // Regular chat completion
      const response = await openai.chat.completions.create({
        model: body.model || 'gpt-4o-mini',
        messages: messages,
        temperature: 0.1,
        max_tokens: 500,
      });

      return NextResponse.json({
        output: response.choices[0].message.content,
        usage: response.usage,
      });
    }
  } catch (err: any) {
    console.error('Chat completions proxy error:', err);
    return NextResponse.json({ 
      error: 'failed', 
      details: err.message 
    }, { status: 500 });
  }
}
  