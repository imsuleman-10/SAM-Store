import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { cookies } from 'next/headers';

function requireAdmin() {
  const session = cookies().get('baroque_admin_session');
  return session && session.value === 'valid';
}

async function callGroqAI(prompt, apiKey) {
  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are a professional e-commerce product copywriter. RETURN EXACTLY ONE JSON OBJECT AND NOTHING ELSE.
        The JSON must contain only two keys: "name" and "description".
        - Output MUST be valid JSON with no surrounding text, code fences, or commentary.
        - "name": short product title (max 60 characters).
        - "description": plain text only, 2-4 short paragraphs. Do NOT include markdown, bullets, hashtags, pricing, currency symbols, "Compare at" lines, or CTAs (e.g., "Order now").
        - If the input includes a price, DO NOT repeat or mention price in the description.
        - If you cannot improve a field, return the original string unchanged.
        Return only the JSON object, e.g. {"name":"Compact Wireless Controller","description":"Lightweight controller..."}`,
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.8,
      max_tokens: 250,
    }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.error?.message || 'AI request failed');
  }

  const result = await response.json();

  // content may be a string or already an object depending on the model response
  let raw = result.choices?.[0]?.message?.content;
  let rawContent = '';
  if (typeof raw === 'string') {
    rawContent = raw.trim();
  } else if (raw && typeof raw === 'object') {
    try {
      rawContent = JSON.stringify(raw);
    } catch (e) {
      rawContent = '';
    }
  }

  if (!rawContent) {
    return { name: '', description: '' };
  }

  // Try to parse JSON within the response safely and validate fields
  try {
    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    let parsed = null;

    if (jsonMatch) {
      try {
        parsed = JSON.parse(jsonMatch[0]);
      } catch (e) {
        parsed = null;
      }
    }

    if (!parsed) {
      try {
        parsed = JSON.parse(rawContent);
      } catch (e) {
        parsed = null;
      }
    }

    // If still not parsed, return original inputs to avoid saving malformed text
    if (!parsed || typeof parsed !== 'object') {
      return { name: '', description: rawContent };
    }

    // Normalize fields
    const outName = typeof parsed.name === 'string' ? parsed.name.trim() : '';
    let outDesc = typeof parsed.description === 'string' ? parsed.description.trim() : '';

    // Remove price/currency fragments and common CTAs from description
    if (outDesc) {
      // Remove any trailing lines that mention price or compare-at
      outDesc = outDesc.replace(/(?:Compare at|Compare|Now available at|Available at|Price|Rs\.?|₹)[\s\S]*$/i, '').trim();
      // Remove standalone currency mentions like 'Rs 999' anywhere
      outDesc = outDesc.replace(/(?:Rs\.?|₹)\s*\d+[\d,]*/gi, '').trim();
      // Remove repeated multiple spaces and stray punctuation left behind
      outDesc = outDesc.replace(/\s{2,}/g, ' ').replace(/\s+\./g, '.').trim();
      // Enforce max length for description (safety), but keep paragraphs
      if (outDesc.length > 2000) outDesc = outDesc.slice(0, 2000);
    }

    // If parsing produced invalid fields, fallback to originals
    if (!outName && !outDesc) {
      return { name: '', description: rawContent };
    }

    return { name: outName, description: outDesc };
  } catch (err) {
    return { name: '', description: '' };
  }
}

export async function POST(request) {
  if (!requireAdmin()) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!supabaseAdmin) {
    return NextResponse.json({ error: 'SUPABASE_SERVICE_ROLE_KEY missing' }, { status: 500 });
  }

  const { name, category, description, price, compare_at_price } = await request.json();

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'Groq API key not configured in environment variables.' }, { status: 400 });
  }

  const prompt = `Product name: ${name || 'Unnamed product'}\nCategory: ${category || 'General'}\nPrice: Rs ${price || 'N/A'}${compare_at_price ? ` (compare at Rs ${compare_at_price})` : ''}\nCurrent description: ${description || 'No description provided.'}\n\nGenerate an improved product title and a polished product description suitable for an online store. Return JSON with the fields name and description.`;

  try {
    const suggested = await callGroqAI(prompt, apiKey);
    return NextResponse.json({
      name: suggested.name || name,
      description: suggested.description || description,
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
