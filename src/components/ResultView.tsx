'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import ResumeDoc from './ResumeDoc';
import type { ResumeResult } from '@/lib/types';

const SECTION_META: Record<string, [string, string]> = {
  Summary:    [T.accentBg,  T.accent ],
  Experience: ['#EFF6FF',   '#1D4ED8'],
  Skills:     [T.successBg, T.success],
  Education:  ['#FFF7ED',   '#C2410C'],
};

export default function ResultView({ result, onNewApplication }: { result: ResumeResult; onNewApplication: () => void }) {
  const [tab, setTab] = useState<'preview' | 'changes'>('preview');
  const tabs: [string, string][] = [['preview', 'Preview'], ['changes', `What Changed (${result.changes.length})`]];

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <div style={{ display: 'flex', borderBottom: `1px solid ${T.border}`, padding: '0 24px', background: T.surface, flexShrink: 0 }}>
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id as 'preview' | 'changes')}
            style={{ padding: '12px 16px', border: 'none', background: 'none', fontSize: '13px', fontWeight: tab === id ? 600 : 400, color: tab === id ? T.text : T.t3, cursor: 'pointer', fontFamily: 'var(--font-body)', borderBottom: tab === id ? `2px solid ${T.text}` : '2px solid transparent', marginBottom: '-1px', transition: 'all 0.1s' }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px 24px' }}>
        {tab === 'preview' ? (
          <div style={{ maxWidth: '680px', margin: '0 auto', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '3px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
            <ResumeDoc result={result} />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxWidth: '680px', margin: '0 auto' }}>
            {result.changes.map((c, i) => {
              const [bg, col] = SECTION_META[c.section] || ['#F3F4F6', '#374151'];
              return (
                <div key={i} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px', padding: '14px 16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
                    <span style={{ padding: '2px 7px', borderRadius: '2px', fontSize: '10px', fontWeight: 700, background: bg, color: col, letterSpacing: '0.06em' }}>{c.section.toUpperCase()}</span>
                    {c.ctx && <span style={{ fontSize: '12px', color: T.t2 }}>{c.ctx}</span>}
                    <span style={{ marginLeft: 'auto', fontSize: '11px', color: T.t3, fontStyle: 'italic' }}>{c.action}</span>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <PanelLabel style={{ display: 'block', marginBottom: '4px' }}>Before</PanelLabel>
                      <div style={{ fontSize: '12px', color: T.t2, lineHeight: '1.55', fontWeight: 400 }}>{c.before}</div>
                    </div>
                    <div>
                      <PanelLabel style={{ display: 'block', marginBottom: '4px' }}>After</PanelLabel>
                      <div style={{ fontSize: '12px', color: T.text, lineHeight: '1.55', fontWeight: 500 }}>{c.after}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div style={{ padding: '11px 24px', borderTop: `1px solid ${T.border}`, background: T.surface, display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', background: T.primary, color: '#fff', border: 'none', borderRadius: '4px', padding: '8px 16px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          <I.Download /> Download PDF
        </button>
        <button style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '8px 14px', fontSize: '13px', color: T.t2, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
          Open in Overleaf <I.External />
        </button>
        <button
          onClick={onNewApplication}
          style={{ background: 'none', border: 'none', color: T.t3, fontSize: '13px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'var(--font-body)', padding: '8px 0' }}
        >
          New Application
        </button>
        <span style={{ marginLeft: 'auto', fontSize: '12px', color: T.t3 }}>
          Tailored for <strong style={{ color: T.t2, fontWeight: 500 }}>{result.company}</strong>
        </span>
      </div>
    </div>
  );
}
