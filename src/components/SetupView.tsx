'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import type { ResumeFile } from '@/lib/types';

interface SetupViewProps {
  needKey: boolean;
  needResume: boolean;
  onComplete: (data: { apiKey?: string; resume?: ResumeFile }) => void;
}

export default function SetupView({ needKey, needResume, onComplete }: SetupViewProps) {
  const [keyInput, setKeyInput]   = useState('');
  const [drag, setDrag]           = useState(false);
  const [error, setError]         = useState(false);
  const [pasteText, setPasteText] = useState('');
  // Resume captured but waiting on the key (or vice versa) before completing setup
  const [pendingResume, setPendingResume] = useState<ResumeFile | null>(null);

  const keyOk        = !needKey || keyInput.trim().length > 0;
  const keyLooksOdd  = keyInput.trim().length > 0 && !keyInput.trim().startsWith('sk-ant-');
  const resumeReady  = !needResume || pendingResume !== null;

  const finish = (resume?: ResumeFile) => {
    const finalResume = resume ?? pendingResume ?? undefined;
    onComplete({
      apiKey: needKey ? keyInput.trim() : undefined,
      resume: needResume ? finalResume : undefined,
    });
  };

  const acceptResume = (resume: ResumeFile) => {
    if (keyOk) {
      finish(resume);
    } else {
      setPendingResume(resume);
    }
  };

  const [extracting, setExtracting] = useState(false);

  const handleFile = async (file: File) => {
    setError(false);
    const lower = file.name.toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isTxt = lower.endsWith('.txt');
    let text: string | null = null;

    if (isPdf) {
      // PDFs are binary — extract real text server-side (file.text() would
      // return raw bytes, not the resume content).
      setExtracting(true);
      try {
        const res = await fetch('/api/extract', { method: 'POST', body: file });
        if (res.ok) text = (await res.json()).text;
      } catch {
        text = null;
      } finally {
        setExtracting(false);
      }
    } else if (isTxt) {
      text = await file.text().catch(() => null);
    } else {
      // DOCX and others can't be reliably extracted in-browser — use paste.
      setError(true);
      return;
    }

    if (!text || text.trim().length < 50) {
      setError(true);
      return;
    }
    acceptResume({
      name: file.name,
      format: isPdf ? 'PDF' : 'TXT',
      chars: text.length,
      modified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      text,
    });
  };

  const handlePasteSave = () => {
    if (pasteText.trim().length < 50) return;
    acceptResume({
      name: 'resume.txt',
      format: 'TXT',
      chars: pasteText.length,
      modified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      text: pasteText,
    });
  };

  return (
    <div style={{ height: '100vh', overflowY: 'auto', background: T.bg, display: 'flex', alignItems: 'flex-start', justifyContent: 'center', padding: '56px 32px' }}>
      <div style={{ width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, marginBottom: '6px' }}>
            {needKey && needResume ? 'Set up Resumo' : needKey ? 'Add your API key' : 'Upload your resume'}
          </h2>
          <p style={{ fontSize: '13px', color: T.t2, lineHeight: '1.65' }}>
            {needKey
              ? 'Resumo runs on your own Anthropic API key. Everything is stored only in your browser.'
              : 'Upload once — Resumo stores it locally and tailors it for every role.'}
          </p>
        </div>

        {needKey && (
          <div>
            <PanelLabel style={{ display: 'block', marginBottom: '8px' }}>Anthropic API key</PanelLabel>
            <input
              type="password"
              value={keyInput}
              onChange={e => setKeyInput(e.target.value)}
              placeholder="sk-ant-…"
              autoComplete="off"
              style={{ width: '100%', border: `1px solid ${keyLooksOdd ? T.warning : T.border}`, borderRadius: '4px', padding: '10px 12px', fontSize: '13px', fontFamily: 'var(--font-mono)', outline: 'none', color: T.text, background: T.surface }}
            />
            {keyLooksOdd && (
              <div style={{ fontSize: '11px', color: T.warning, marginTop: '5px' }}>
                Anthropic keys usually start with &ldquo;sk-ant-&rdquo; — double-check before continuing.
              </div>
            )}
            <div style={{ fontSize: '12px', color: T.t3, marginTop: '6px', lineHeight: '1.6' }}>
              Stored only in your browser — never on our server. Don&apos;t have one?{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: T.t2, textDecoration: 'underline', textUnderlineOffset: '2px' }}>
                Create a key at console.anthropic.com
              </a>
            </div>
            {!needResume && (
              <button
                onClick={() => keyOk && finish()}
                disabled={!keyOk}
                style={{ marginTop: '14px', padding: '9px 24px', background: keyOk ? T.primary : T.border, color: keyOk ? '#fff' : T.t3, border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: keyOk ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}
              >
                Save Key
              </button>
            )}
          </div>
        )}

        {needResume && (
          <>
            {needKey && <div style={{ height: '1px', background: T.border }} />}

            <div>
              <PanelLabel style={{ display: 'block', marginBottom: '8px' }}>Resume</PanelLabel>

              {error && (
                <div style={{ padding: '11px 14px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '4px', color: T.danger, fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
                  <strong style={{ fontWeight: 500 }}>Extraction failed.</strong> We couldn&apos;t read text from this file. Paste your resume in the fallback below instead.
                </div>
              )}

              {pendingResume ? (
                <div style={{ padding: '11px 14px', background: T.successBg, border: '1px solid #BBF7D0', borderRadius: '4px', color: T.success, fontSize: '13px', display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <I.Check /> {pendingResume.name} ready — add your API key above to finish.
                </div>
              ) : (
                <>
                  <div
                    onDragOver={e => { e.preventDefault(); setDrag(true); }}
                    onDragLeave={() => setDrag(false)}
                    onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
                    onClick={() => { const inp = document.getElementById('resume-upload') as HTMLInputElement; inp?.click(); }}
                    style={{
                      border: `2px dashed ${drag ? T.accent : error ? T.danger : T.borderStrong}`,
                      borderRadius: '6px', padding: '48px 24px', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: '14px', cursor: 'pointer',
                      background: drag ? T.accentBg : error ? '#FFF5F5' : 'transparent',
                      transition: 'all 0.15s', textAlign: 'center',
                    }}
                  >
                    <span style={{ color: drag ? T.accent : error ? T.danger : T.t3, lineHeight: 0 }}><I.Upload /></span>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 500 }}>
                        {extracting ? 'Extracting text…' : 'Drop your PDF here'}
                      </div>
                      <div style={{ fontSize: '12px', color: T.t3, marginTop: '3px' }}>
                        {extracting ? 'Reading your resume' : 'or click to browse'}
                      </div>
                    </div>
                    <div style={{ fontSize: '11px', color: T.t3 }}>PDF or .txt · for .docx, paste below</div>
                  </div>
                  <input
                    id="resume-upload"
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    style={{ display: 'none' }}
                    onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
                  />

                  <div style={{ marginTop: '20px' }}>
                    <PanelLabel style={{ display: 'block', marginBottom: '8px' }}>Paste fallback</PanelLabel>
                    <textarea
                      value={pasteText}
                      onChange={e => setPasteText(e.target.value)}
                      placeholder="Paste resume text here if upload fails or for scanned PDFs…"
                      style={{ width: '100%', minHeight: '100px', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '10px 12px', fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: '1.65', resize: 'vertical', outline: 'none', color: T.text }}
                    />
                    <button
                      onClick={handlePasteSave}
                      disabled={pasteText.trim().length < 50}
                      style={{ marginTop: '10px', padding: '9px 24px', background: pasteText.trim().length >= 50 ? T.primary : T.border, color: pasteText.trim().length >= 50 ? '#fff' : T.t3, border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: pasteText.trim().length >= 50 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}
                    >
                      Save Resume
                    </button>
                  </div>
                </>
              )}
            </div>

            {pendingResume && keyOk && resumeReady && (
              <button
                onClick={() => finish()}
                style={{ padding: '10px 24px', background: T.primary, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Finish Setup
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
