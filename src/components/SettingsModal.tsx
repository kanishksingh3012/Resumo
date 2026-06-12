'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { Divider, GhostBtn, SettRow } from './atoms';
import { exportAll, importAll } from '@/lib/storage';
import type { ResumeFile, Model, PromptMode } from '@/lib/types';

interface SettingsModalProps {
  onClose: () => void;
  onGoTemplates: () => void;
  activeTemplate: string;
  resume: ResumeFile;
  apiKey: string;
  onApiKeyChange: (key: string | null) => void;
  onReplaceResume: () => void;
  onReset: () => void;
}

function maskKey(key: string): string {
  if (key.length <= 12) return '••••';
  return `${key.slice(0, 7)}…${key.slice(-4)}`;
}

const MODELS: { val: Model; label: string; cost: string }[] = [
  { val: 'claude-haiku-4-5',  label: 'Haiku',  cost: '~$0.01' },
  { val: 'claude-sonnet-4-6', label: 'Sonnet', cost: '~$0.05' },
  { val: 'claude-opus-4-8',   label: 'Opus',   cost: '~$0.25' },
];

export default function SettingsModal({ onClose, onGoTemplates, activeTemplate, resume, apiKey, onApiKeyChange, onReplaceResume, onReset }: SettingsModalProps) {
  const [model, setModel]               = useState<Model>('claude-opus-4-8');
  const [promptMode, setPromptMode]     = useState<PromptMode>('default');
  const [customPrompt, setCustomPrompt] = useState('');
  const [confirmReset, setConfirmReset] = useState(false);
  const [editingKey, setEditingKey]     = useState(false);
  const [keyInput, setKeyInput]         = useState('');
  const [restoreError, setRestoreError] = useState<string | null>(null);

  const saveKey = () => {
    if (!keyInput.trim()) return;
    onApiKeyChange(keyInput.trim());
    setKeyInput('');
    setEditingKey(false);
  };

  const downloadBackup = () => {
    const blob = new Blob([exportAll()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resumo-backup.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const restoreBackup = (file: File) => {
    setRestoreError(null);
    file.text()
      .then(text => { importAll(text); window.location.reload(); })
      .catch(err => setRestoreError((err as Error).message));
  };

  const pill = (a: boolean) => ({
    flex: 1, padding: '6px 8px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.1s', textAlign: 'center' as const,
    background: a ? T.primary : 'none', color: a ? '#fff' : T.t2,
    border: a ? 'none' : `1px solid ${T.border}`,
  });
  const pill2 = (a: boolean) => ({
    padding: '5px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.1s',
    background: a ? T.primary : 'none', color: a ? '#fff' : T.t2,
    border: a ? 'none' : `1px solid ${T.border}`,
  });

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,18,27,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200 }}>
      <div className="fade" style={{ background: T.surface, borderRadius: '6px', width: '480px', maxWidth: '90vw', border: `1px solid ${T.border}`, boxShadow: '0 8px 40px rgba(0,0,0,0.14)', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '17px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>Settings</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, display: 'flex', padding: '2px', lineHeight: 0 }}><I.Close /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '18px', overflowY: 'auto' }}>
          {/* API key */}
          {!editingKey ? (
            <SettRow label="API Key" sub={`Anthropic · ${maskKey(apiKey)} · stored in this browser only`}>
              <div style={{ display: 'flex', gap: '6px' }}>
                <GhostBtn onClick={() => setEditingKey(true)}>Replace</GhostBtn>
                <button onClick={() => onApiKeyChange(null)} style={{ padding: '5px 12px', border: '1px solid #FCA5A5', borderRadius: '3px', background: '#FFF5F5', color: T.danger, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Remove</button>
              </div>
            </SettRow>
          ) : (
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>API Key</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="password"
                  value={keyInput}
                  onChange={e => setKeyInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveKey(); }}
                  placeholder="sk-ant-…"
                  autoComplete="off"
                  autoFocus
                  style={{ flex: 1, border: `1px solid ${T.border}`, borderRadius: '3px', padding: '7px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)', outline: 'none', color: T.text }}
                />
                <button onClick={saveKey} disabled={!keyInput.trim()} style={{ padding: '6px 14px', background: keyInput.trim() ? T.primary : T.border, color: keyInput.trim() ? '#fff' : T.t3, border: 'none', borderRadius: '3px', fontSize: '12px', fontWeight: 500, cursor: keyInput.trim() ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)' }}>Save</button>
                <button onClick={() => { setEditingKey(false); setKeyInput(''); }} style={{ padding: '6px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
              </div>
            </div>
          )}
          <Divider />

          <SettRow label="Resume" sub={`${resume.name} · ${resume.format} · ${resume.chars.toLocaleString()} chars`}>
            <GhostBtn onClick={onReplaceResume}>Replace</GhostBtn>
          </SettRow>
          <Divider />

          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Model</div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {MODELS.map(({ val, label, cost }) => (
                <button key={val} onClick={() => setModel(val)} style={pill(model === val)}>
                  <div style={{ fontWeight: model === val ? 500 : 400 }}>{label}</div>
                  <div style={{ fontSize: '10px', opacity: 0.65, marginTop: '1px' }}>{cost}</div>
                </button>
              ))}
            </div>
          </div>
          <Divider />

          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '8px' }}>Prompt</div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: promptMode === 'custom' ? '8px' : 0 }}>
              <button style={pill2(promptMode === 'default')} onClick={() => setPromptMode('default')}>Use default</button>
              <button style={pill2(promptMode === 'custom')} onClick={() => setPromptMode('custom')}>Use custom</button>
            </div>
            {promptMode === 'custom' && (
              <textarea value={customPrompt} onChange={e => setCustomPrompt(e.target.value)} placeholder="Custom prompt instructions…" style={{ width: '100%', minHeight: '70px', border: `1px solid ${T.border}`, borderRadius: '3px', padding: '8px 10px', fontSize: '12px', fontFamily: 'var(--font-mono)', resize: 'vertical', outline: 'none', color: T.text }} />
            )}
          </div>
          <Divider />

          <SettRow label="Active Template" sub={activeTemplate}>
            <button onClick={() => { onGoTemplates(); onClose(); }} style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              Manage →
            </button>
          </SettRow>
          <Divider />

          {/* Data backup */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '3px' }}>Your data</div>
            <div style={{ fontSize: '11px', color: T.t3, marginBottom: '10px', lineHeight: '1.6' }}>
              Everything lives in this browser only. Download a backup to keep it safe or move it to another device.
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <GhostBtn onClick={downloadBackup}>Download backup</GhostBtn>
              <label style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
                Restore from backup
                <input type="file" accept=".json,application/json" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (f) restoreBackup(f); }} />
              </label>
            </div>
            {restoreError && <div style={{ fontSize: '12px', color: T.danger, marginTop: '8px' }}>{restoreError}</div>}
          </div>
          <Divider />

          {!confirmReset ? (
            <SettRow label="Reset app" sub="Clears your API key, resume, and all local data">
              <button onClick={() => setConfirmReset(true)} style={{ padding: '5px 12px', border: '1px solid #FCA5A5', borderRadius: '3px', background: '#FFF5F5', color: T.danger, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Reset</button>
            </SettRow>
          ) : (
            <div style={{ padding: '13px 16px', background: '#FFF5F5', border: '1px solid #FCA5A5', borderRadius: '4px' }}>
              <div style={{ fontSize: '13px', fontWeight: 500, color: T.danger, marginBottom: '5px' }}>Are you sure?</div>
              <div style={{ fontSize: '12px', color: T.t2, marginBottom: '12px', lineHeight: '1.6' }}>This clears your API key, resume, templates, prompts, companies — everything stored in this browser. Download a backup first if you want to keep it.</div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => setConfirmReset(false)} style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
                <button onClick={() => { onReset(); onClose(); }} style={{ padding: '5px 14px', border: 'none', borderRadius: '3px', background: T.danger, color: '#fff', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Yes, reset everything</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
