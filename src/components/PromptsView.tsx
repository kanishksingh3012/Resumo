'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import { KEYS, load, save } from '@/lib/storage';
import { INIT_PROMPTS } from '@/lib/prompts';
import { SAMPLE_PROMPT_TEXT } from '@/lib/samples';
import { downloadTextFile } from '@/lib/export';
import type { Prompt } from '@/lib/types';

export default function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>(() => load<Prompt[]>(KEYS.prompts, INIT_PROMPTS));
  const [sel, setSel]         = useState(0);
  const [text, setText]       = useState(() => load<Prompt[]>(KEYS.prompts, INIT_PROMPTS)[0]?.text ?? '');
  const [renaming, setRenaming] = useState(false);
  const [nameInput, setNameInput] = useState('');

  useEffect(() => { save(KEYS.prompts, prompts); }, [prompts]);

  const current = prompts[sel];

  const handleSave = () => {
    setPrompts(ps => ps.map((p, i) => i === sel ? { ...p, text } : p));
  };

  const toggleActive = () => {
    setPrompts(ps => ps.map((p, i) => ({ ...p, active: i === sel })));
  };

  const isActive = current?.active;

  const handleDelete = () => {
    if (prompts.length <= 1) return; // keep at least one prompt
    const wasActive = prompts[sel]?.active;
    const next = prompts.filter((_, i) => i !== sel);
    if (wasActive && next.length) next[0] = { ...next[0], active: true };
    const newSel = Math.max(0, sel - 1);
    setPrompts(next);
    setSel(newSel);
    setText(next[newSel]?.text ?? '');
  };

  return (
    <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '200px 1fr', overflow: 'hidden' }}>
      {/* List */}
      <div style={{ borderRight: `1px solid ${T.border}`, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '10px 12px', borderBottom: `1px solid ${T.border}` }}>
          <PanelLabel>Prompts</PanelLabel>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '4px' }}>
          {prompts.map((p, i) => (
            <div
              key={p.id}
              onClick={() => { setSel(i); setText(p.text); setRenaming(false); }}
              style={{ padding: '8px 10px', borderRadius: '3px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '7px', background: sel === i ? T.accentBg : 'transparent', borderLeft: sel === i ? `2px solid ${T.accent}` : '2px solid transparent' }}
            >
              {p.active && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.accent, flexShrink: 0 }} />}
              <span style={{ fontSize: '13px', fontWeight: sel === i ? 500 : 400, color: sel === i ? T.text : T.t2 }}>{p.name}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: '8px', borderTop: `1px solid ${T.border}` }}>
          <button
            onClick={() => {
              const id = Math.max(...prompts.map(p => p.id)) + 1;
              // Start new prompts from the annotated sample so the format is
              // always valid and non-breaking — the user edits in their own rules.
              setPrompts(ps => [...ps, { id, name: `Prompt ${id}`, active: false, text: SAMPLE_PROMPT_TEXT }]);
              setSel(prompts.length);
              setText(SAMPLE_PROMPT_TEXT);
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: '3px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer', color: T.t2, fontFamily: 'var(--font-body)' }}
          >
            <I.Plus /> New Prompt
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
          {renaming ? (
            <input
              autoFocus
              value={nameInput}
              onChange={e => setNameInput(e.target.value)}
              onBlur={() => {
                const trimmed = nameInput.trim();
                if (trimmed) setPrompts(ps => ps.map((p, i) => i === sel ? { ...p, name: trimmed } : p));
                setRenaming(false);
              }}
              onKeyDown={e => {
                if (e.key === 'Enter') (e.target as HTMLInputElement).blur();
                if (e.key === 'Escape') setRenaming(false);
              }}
              style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, border: 'none', borderBottom: `2px solid ${T.accent}`, outline: 'none', background: 'transparent', color: T.text, width: '100%', padding: '0' }}
            />
          ) : (
            <>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }}>{current?.name}</div>
              <button
                onClick={() => { setNameInput(current?.name ?? ''); setRenaming(true); }}
                title="Rename prompt"
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, lineHeight: 0, padding: '2px', borderRadius: '3px', flexShrink: 0 }}
              >
                <I.Edit />
              </button>
            </>
          )}
        </div>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          style={{ flex: 1, border: 'none', outline: 'none', padding: '16px 20px', fontSize: '12px', lineHeight: '1.8', fontFamily: 'var(--font-mono)', resize: 'none', color: T.text, background: 'transparent' }}
        />
        <div style={{ padding: '10px 20px', borderTop: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', gap: '8px', background: '#F9F8F5', flexShrink: 0 }}>
          <button
            onClick={handleSave}
            style={{ padding: '6px 14px', background: T.primary, color: '#fff', border: 'none', borderRadius: '3px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            Save
          </button>
          <button
            onClick={toggleActive}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: isActive ? T.successBg : 'none', color: isActive ? T.success : T.t2, border: isActive ? '1px solid #BBF7D0' : `1px solid ${T.border}`, borderRadius: '3px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            {isActive && <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: T.success }} />}
            {isActive ? 'Active' : 'Set Active'}
          </button>
          <button
            onClick={() => setText(SAMPLE_PROMPT_TEXT)}
            title="Replace the editor with the sample prompt format"
            style={{ padding: '6px 12px', background: 'none', color: T.t2, border: `1px solid ${T.border}`, borderRadius: '3px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            Insert sample
          </button>
          <button
            onClick={() => downloadTextFile('resumo-sample-prompt.txt', SAMPLE_PROMPT_TEXT)}
            title="Download the sample prompt as a .txt reference file"
            style={{ padding: '6px 12px', background: 'none', color: T.t2, border: `1px solid ${T.border}`, borderRadius: '3px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
          >
            Download sample
          </button>
          {prompts.length > 1 && (
            <button
              onClick={handleDelete}
              style={{ marginLeft: 'auto', padding: '6px 12px', background: '#FFF5F5', color: T.danger, border: '1px solid #FCA5A5', borderRadius: '3px', fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}
            >
              Delete
            </button>
          )}
        </div>
        <div style={{ padding: '8px 20px', borderTop: `1px solid ${T.border}`, background: '#F9F8F5', fontSize: '11px', color: T.t3, lineHeight: '1.55', flexShrink: 0 }}>
          Describe only <strong style={{ fontWeight: 600, color: T.t2 }}>how</strong> to tailor the resume. The app always enforces the output format and one-page limit — you don&apos;t need to mention JSON or structure.
        </div>
      </div>
    </div>
  );
}
