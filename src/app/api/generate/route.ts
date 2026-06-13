import Anthropic from '@anthropic-ai/sdk';
import { NextResponse } from 'next/server';
import { DEFAULT_PROMPT_TEXT } from '@/lib/prompts';

// The tailoring instructions come from the active prompt (Prompts tab); this
// block only fixes the OUTPUT FORMAT the app depends on, and is always appended.
const OUTPUT_SCHEMA = `Return ONLY a valid JSON object with this exact schema — no markdown, no preamble, and no analysis text outside the JSON:
{
  "name": "Full Name",
  "subtitle": "Title · Location",
  "contact": "email · linkedin · website",
  "summary": "Tailored 2-3 sentence summary",
  "experience": [
    {
      "company": "Company Name",
      "role": "Job Title",
      "dates": "Month Year – Month Year",
      "bullets": ["bullet 1", "bullet 2", "bullet 3"]
    }
  ],
  "skills": [
    { "category": "Category", "values": "skill1, skill2, skill3" }
  ],
  "company": "Target company name from the job description",
  "changes": [
    {
      "section": "Summary|Experience|Skills",
      "ctx": "company name if Experience section, omit otherwise",
      "action": "Reworded|Rephrased|Promoted|Reordered|Keyword added",
      "before": "original text",
      "after": "new text"
    }
  ]
}

FIELD RULES:
- "name", "subtitle" (Title · Location), and "contact" come from the candidate's resume.
- "company" is the hiring company's name, extracted from the job description.
- "changes" is the changelog: one entry per meaningful edit, max 8 entries.

ONE-PAGE RULE: The tailored resume MUST fit on a single A4 page. Be concise — use 3–5 bullets for the most recent or most relevant roles and 1–2 for older or less relevant ones, and keep each bullet to roughly one line (about 18–24 words). Tighten or drop the weakest bullets rather than overflow. Never pad content to fill space — a clean, shorter resume is better than a crowded one.`;

export async function POST(request: Request) {
  try {
    const { resumeText, jdText, model, promptText, apiKey } = await request.json();

    if (!apiKey) {
      return NextResponse.json({ error: 'API key required — add your Anthropic API key in Settings.' }, { status: 401 });
    }
    if (!resumeText || !jdText) {
      return NextResponse.json({ error: 'resumeText and jdText are required' }, { status: 400 });
    }

    // The visitor's key is used for this single call and never stored.
    const client = new Anthropic({ apiKey });

    // The active prompt drives tailoring; fall back to the shipped default. The
    // output schema is always appended so the response stays parseable.
    const instructions = (promptText && promptText.trim()) ? promptText : DEFAULT_PROMPT_TEXT;
    const systemPrompt = `${instructions}\n\n${OUTPUT_SCHEMA}`;

    const selectedModel = model || 'claude-opus-4-8';
    const useThinking   = selectedModel === 'claude-opus-4-8';

    const message = await client.messages.create({
      model: selectedModel,
      max_tokens: useThinking ? 16000 : 8000,
      // Opus 4.8 requires adaptive thinking; the installed SDK's types predate it.
      ...(useThinking ? { thinking: { type: 'adaptive' } as unknown as Anthropic.ThinkingConfigParam } : {}),
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: `BASE RESUME:\n${resumeText}\n\nJOB DESCRIPTION:\n${jdText}`,
        },
      ],
    });

    const textBlock = message.content.find((b) => b.type === 'text');
    if (!textBlock || textBlock.type !== 'text' || !textBlock.text.trim()) {
      return NextResponse.json(
        { error: `Claude returned no resume text (stop reason: ${message.stop_reason}). Try again, or switch to a lighter model in Settings.` },
        { status: 500 },
      );
    }

    let result;
    try {
      let jsonStr = textBlock.text.trim();
      // Strip ```json fences if present, then slice to the outermost JSON object
      // so any stray reasoning text around the JSON doesn't break parsing.
      if (jsonStr.startsWith('```')) {
        jsonStr = jsonStr.replace(/^```(?:json)?\n?/, '').replace(/\n?```$/, '');
      }
      const first = jsonStr.indexOf('{');
      const last = jsonStr.lastIndexOf('}');
      if (first !== -1 && last > first) {
        jsonStr = jsonStr.slice(first, last + 1);
      }
      result = JSON.parse(jsonStr);
    } catch {
      return NextResponse.json({ error: 'Could not parse the resume from Claude. Please try again.', raw: textBlock.text }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof Anthropic.AuthenticationError) {
      return NextResponse.json({ error: 'Invalid API key — check it in Settings.' }, { status: 401 });
    }
    const error = err as Error;
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
