import { NextResponse } from 'next/server';
import { extractText, getDocumentProxy } from 'unpdf';

// Extracts real text from an uploaded PDF. The browser sends the raw file bytes;
// we return the extracted text (nothing is stored server-side).
export async function POST(request: Request) {
  try {
    const buf = await request.arrayBuffer();
    if (!buf || buf.byteLength === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 });
    }

    const pdf = await getDocumentProxy(new Uint8Array(buf));
    const { text } = await extractText(pdf, { mergePages: true });
    const clean = (text || '').replace(/\s+\n/g, '\n').trim();

    return NextResponse.json({ text: clean, chars: clean.length });
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ error: `Could not read PDF: ${error.message}` }, { status: 500 });
  }
}
