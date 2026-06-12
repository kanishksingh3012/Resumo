'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import type { ResumeFile, Model, PromptMode, NavId } from '@/lib/types';

interface HomeViewProps {
  resume: ResumeFile;
  setHasResume: (v: boolean) => void;
  jdText: string;
  setJdText: (v: string) => void;
  onGenerate: (model: Model, promptMode: PromptMode, customPrompt: string) => void;
  activeTemplate: string;
  onChangeTemplate: () => void;
  showBackupBanner: boolean;
  onDismissBanner: () => void;
}

function ResumeBar({ resume, onReplace }: { resume: ResumeFile; onReplace: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '9px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ color: T.t3, lineHeight: 0 }}><I.File /></span>
        <span style={{ fontSize: '13px', fontWeight: 500 }}>{resume.name}</span>
        <span style={{ padding: '1px 5px', borderRadius: '2px', background: '#F3F4F6', color: T.t2, fontSize: '10px', fontWeight: 700, letterSpacing: '0.04em' }}>{resume.format}</span>
        <span style={{ fontSize: '11px', color: T.t3, fontFamily: 'var(--font-mono)' }}>{resume.chars.toLocaleString()} chars</span>
        <span style={{ fontSize: '11px', color: T.t3, fontFamily: 'var(--font-mono)' }}>· {resume.modified}</span>
      </div>
      <button onClick={onReplace} style={{ background: 'none', border: 'none', color: T.t3, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'var(--font-body)' }}>Replace</button>
    </div>
  );
}

function TemplateBar({ template, onChange }: { template: string; onChange: () => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
        <span style={{ color: T.t3, lineHeight: 0 }}><I.Template /></span>
        <span style={{ fontSize: '12px', color: T.t2 }}>Template</span>
        <span style={{ fontSize: '13px', fontWeight: 500, color: T.text, whiteSpace: 'nowrap' }}>{template}</span>
      </div>
      <button onClick={onChange} style={{ background: 'none', border: 'none', color: T.t3, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'var(--font-body)' }}>Change</button>
    </div>
  );
}

const MODELS: { val: Model; label: string }[] = [
  { val: 'claude-haiku-4-5',  label: 'Haiku'  },
  { val: 'claude-sonnet-4-6', label: 'Sonnet' },
  { val: 'claude-opus-4-8',   label: 'Opus'   },
];

function SettingsPanel({
  model, setModel, promptMode, setPromptMode, customPrompt, setCustomPrompt,
}: {
  model: Model; setModel: (m: Model) => void;
  promptMode: PromptMode; setPromptMode: (m: PromptMode) => void;
  customPrompt: string; setCustomPrompt: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const pill = (active: boolean) => ({
    padding: '4px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.1s', fontWeight: active ? 500 : 400,
    background: active ? T.primary : 'none', color: active ? '#fff' : T.t2,
    border: active ? 'none' : `1px solid ${T.border}`,
  });

  return (
    <div>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', color: T.t2, fontSize: '12px', cursor: 'pointer', padding: '4px 0', fontFamily: 'var(--font-body)' }}
      >
        <span style={{ lineHeight: 0, transition: 'transform 0.15s', display: 'inline-flex', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}><I.Chev /></span>
        Settings
      </button>
      {open && (
        <div style={{ marginTop: '8px', padding: '14px 16px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div>
            <PanelLabel style={{ display: 'block', marginBottom: '7px' }}>Model</PanelLabel>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MODELS.map(({ val, label }) => (
                <button key={val} onClick={() => setModel(val)} style={pill(model === val)}>{label}</button>
              ))}
            </div>
          </div>
          <div>
            <PanelLabel style={{ display: 'block', marginBottom: '7px' }}>Prompt</PanelLabel>
            <div style={{ display: 'flex', gap: '4px', marginBottom: promptMode === 'custom' ? '10px' : 0 }}>
              {(['default', 'custom'] as PromptMode[]).map(m => (
                <button key={m} onClick={() => setPromptMode(m)} style={pill(promptMode === m)}>
                  {m === 'default' ? 'Use default' : 'Use custom'}
                </button>
              ))}
            </div>
            {promptMode === 'custom' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <textarea
                  value={customPrompt}
                  onChange={e => setCustomPrompt(e.target.value)}
                  placeholder="Enter custom prompt instructions…"
                  style={{ width: '100%', minHeight: '80px', border: `1px solid ${T.border}`, borderRadius: '3px', padding: '10px', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: '1.7', resize: 'vertical', outline: 'none', color: T.text }}
                />
                <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', border: `1px dashed ${T.borderStrong}`, borderRadius: '3px', cursor: 'pointer', fontSize: '12px', color: T.t3 }}>
                  <I.UploadSm /> Upload prompt file
                  <input type="file" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; f.text().then(setCustomPrompt); }} />
                </label>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function HomeView({ resume, setHasResume, jdText, setJdText, onGenerate, activeTemplate, onChangeTemplate, showBackupBanner, onDismissBanner }: HomeViewProps) {
  const [model, setModel]               = useState<Model>('claude-opus-4-8');
  const [promptMode, setPromptMode]     = useState<PromptMode>('default');
  const [customPrompt, setCustomPrompt] = useState('');
  const canGenerate = jdText.length >= 50;

  return (
    <div style={{ flex: 1, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto' }}>
      {showBackupBanner && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '8px 14px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px' }}>
          <span style={{ fontSize: '12px', color: T.t2, lineHeight: '1.55' }}>
            Your data is stored in this browser only — clearing site data erases it. Back it up anytime via Settings → Download backup.
          </span>
          <button onClick={onDismissBanner} title="Dismiss" style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, lineHeight: 0, padding: '2px', flexShrink: 0 }}>
            <I.Close />
          </button>
        </div>
      )}
      <ResumeBar resume={resume} onReplace={() => setHasResume(false)} />
      <TemplateBar template={activeTemplate} onChange={onChangeTemplate} />

      <textarea
        value={jdText}
        onChange={e => setJdText(e.target.value)}
        placeholder="Paste the full job description here…"
        style={{ minHeight: '220px', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '16px', fontSize: '14px', lineHeight: '1.65', resize: 'vertical', outline: 'none', fontFamily: 'var(--font-body)', background: T.surface, color: T.text }}
      />

      <SettingsPanel
        model={model} setModel={setModel}
        promptMode={promptMode} setPromptMode={setPromptMode}
        customPrompt={customPrompt} setCustomPrompt={setCustomPrompt}
      />

      <button
        onClick={canGenerate ? () => onGenerate(model, promptMode, customPrompt) : undefined}
        style={{
          padding: '11px 24px',
          background: canGenerate ? T.primary : T.border,
          color: canGenerate ? '#fff' : T.t3,
          border: 'none', borderRadius: '4px', fontSize: '14px', fontWeight: 500,
          cursor: canGenerate ? 'pointer' : 'not-allowed',
          fontFamily: 'var(--font-body)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', gap: '6px', transition: 'background 0.15s,color 0.15s',
        }}
      >
        <span style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}>
          Generate Tailored Resume <I.Send />
        </span>
      </button>

      {!canGenerate && jdText.length > 0 && (
        <div style={{ fontSize: '11px', color: T.t3, textAlign: 'center' }}>{50 - jdText.length} more characters needed to generate.</div>
      )}
      {jdText.length === 0 && (
        <div style={{ fontSize: '11px', color: T.t3, textAlign: 'center' }}>Paste a job description above to get started.</div>
      )}
    </div>
  );
}
