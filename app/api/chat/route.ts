// app/api/chat/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { prompt } = await req.json();

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
    }),
  });

  const data = await res.json();

  // 🐞 Debug log to see actual response
  console.log("OpenAI response:", data);

  if (!data.choices || !data.choices.length) {
    return NextResponse.json(
      { error: "Invalid OpenAI response", fullResponse: data },
      { status: 500 }
    );
  }

  return NextResponse.json({ reply: data.choices[0].message.content });
}
