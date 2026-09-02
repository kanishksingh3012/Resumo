'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import type { ResumeFile } from '@/lib/types';

interface ResumeUploadModalProps {
  onComplete: (resume: ResumeFile) => void;
  onClose: () => void;
}

export default function ResumeUploadModal({ onComplete, onClose }: ResumeUploadModalProps) {
  const [drag, setDrag]           = useState(false);
  const [error, setError]         = useState(false);
  const [pasteText, setPasteText] = useState('');
  const [extracting, setExtracting] = useState(false);

  const handleFile = async (file: File) => {
    setError(false);
    const lower = file.name.toLowerCase();
    const isPdf = lower.endsWith('.pdf');
    const isTxt = lower.endsWith('.txt');
    let text: string | null = null;

    if (isPdf) {
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
      setError(true);
      return;
    }

    if (!text || text.trim().length < 50) {
      setError(true);
      return;
    }
    onComplete({
      name: file.name,
      format: isPdf ? 'PDF' : 'TXT',
      chars: text.length,
      modified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      text,
    });
  };

  const handlePasteSave = () => {
    if (pasteText.trim().length < 50) return;
    onComplete({
      name: 'resume.txt',
      format: 'TXT',
      chars: pasteText.length,
      modified: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      text: pasteText,
    });
  };

  return (
    /* Overlay — click outside modal to dismiss */
    <div
      style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.45)',
        zIndex: 200,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
      onClick={onClose}
    >
      {/* Modal card — stop propagation so clicks inside don't close */}
      <div
        style={{
          background: T.surface,
          borderRadius: '8px',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2), 0 0 0 1px rgba(0,0,0,0.06)',
          width: '100%',
          maxWidth: '480px',
          maxHeight: '90vh',
          overflowY: 'auto',
          margin: '0 20px',
          padding: '24px',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header row: title + X */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '18px', fontWeight: 600, color: T.text }}>
            Upload your resume
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, lineHeight: 0, padding: '4px', borderRadius: '4px' }}
          >
            <I.Close />
          </button>
        </div>
        <p style={{ fontSize: '13px', color: T.t2, lineHeight: '1.65', marginBottom: '20px' }}>
          Upload once — Resumo stores it locally and tailors it for every role.
        </p>

        <div>
          <PanelLabel style={{ display: 'block', marginBottom: '8px' }}>Resume</PanelLabel>

          {error && (
            <div style={{ padding: '11px 14px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '4px', color: T.danger, fontSize: '13px', lineHeight: '1.6', marginBottom: '12px' }}>
              <strong style={{ fontWeight: 500 }}>Extraction failed.</strong> We couldn&apos;t read text from this file. Paste your resume in the fallback below instead.
            </div>
          )}

          <div
            onDragOver={e => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={e => { e.preventDefault(); setDrag(false); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            onClick={() => (document.getElementById('resume-upload-modal') as HTMLInputElement)?.click()}
            style={{
              border: `2px dashed ${drag ? T.accent : error ? T.danger : T.borderStrong}`,
              borderRadius: '6px', padding: '48px 24px',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '14px',
              cursor: 'pointer',
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
            id="resume-upload-modal"
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
              style={{ width: '100%', minHeight: '100px', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '10px 12px', fontSize: '13px', fontFamily: 'var(--font-body)', lineHeight: '1.65', resize: 'vertical', outline: 'none', color: T.text, background: T.surface }}
            />
            <button
              onClick={handlePasteSave}
              disabled={pasteText.trim().length < 50}
              style={{ marginTop: '10px', padding: '9px 24px', background: pasteText.trim().length >= 50 ? T.primary : T.border, color: pasteText.trim().length >= 50 ? '#fff' : T.t3, border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: pasteText.trim().length >= 50 ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}
            >
              Save Resume
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
