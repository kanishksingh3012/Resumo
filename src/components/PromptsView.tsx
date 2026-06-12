'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import { KEYS, load, save } from '@/lib/storage';
import { INIT_PROMPTS } from '@/lib/prompts';
import type { Prompt } from '@/lib/types';

export default function PromptsView() {
  const [prompts, setPrompts] = useState<Prompt[]>(() => load<Prompt[]>(KEYS.prompts, INIT_PROMPTS));
  const [sel, setSel]         = useState(0);
  const [text, setText]       = useState(() => load<Prompt[]>(KEYS.prompts, INIT_PROMPTS)[0]?.text ?? '');

  useEffect(() => { save(KEYS.prompts, prompts); }, [prompts]);

  const current = prompts[sel];

  const handleSave = () => {
    setPrompts(ps => ps.map((p, i) => i === sel ? { ...p, text } : p));
  };

  const toggleActive = () => {
    setPrompts(ps => ps.map((p, i) => ({ ...p, active: i === sel })));
  };

  const isActive = current?.active;

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
              onClick={() => { setSel(i); setText(p.text); }}
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
              setPrompts(ps => [...ps, { id, name: `Prompt ${id}`, active: false, text: '' }]);
              setSel(prompts.length);
              setText('');
            }}
            style={{ display: 'flex', alignItems: 'center', gap: '5px', width: '100%', background: 'none', border: `1px solid ${T.border}`, borderRadius: '3px', padding: '7px 10px', fontSize: '12px', cursor: 'pointer', color: T.t2, fontFamily: 'var(--font-body)' }}
          >
            <I.Plus /> New Prompt
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '13px 20px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600 }}>{current?.name}</div>
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
        </div>
      </div>
    </div>
  );
}
