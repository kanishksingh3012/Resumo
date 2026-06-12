'use client';

import { T } from '@/lib/tokens';
import type { ResumeResult } from '@/lib/types';

function DocSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <div style={{ fontSize: '9px', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: T.t2, borderBottom: `1px solid ${T.border}`, paddingBottom: '4px', marginBottom: '8px' }}>
        {title}
      </div>
      {children}
    </div>
  );
}

export default function ResumeDoc({ result }: { result: ResumeResult }) {
  return (
    <div style={{ background: '#fff', padding: '28px 32px', fontFamily: 'var(--font-body)' }}>
      <div style={{ marginBottom: '16px' }}>
        <div style={{ fontSize: '22px', fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: '-0.025em', lineHeight: 1.15 }}>{result.name}</div>
        <div style={{ fontSize: '12px', color: T.t2, marginTop: '3px' }}>{result.subtitle}</div>
        <div style={{ fontSize: '11px', color: T.t3, marginTop: '3px', fontFamily: 'var(--font-mono)' }}>{result.contact}</div>
      </div>

      <DocSection title="Summary">
        <p style={{ fontSize: '12px', lineHeight: '1.65', color: T.text }}>{result.summary}</p>
      </DocSection>

      <DocSection title="Experience">
        {result.experience.map((e, i) => (
          <div key={i} style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600 }}>{e.role}</span>
              <span style={{ fontSize: '10px', color: T.t3, fontFamily: 'var(--font-mono)', whiteSpace: 'nowrap' }}>{e.dates}</span>
            </div>
            <div style={{ fontSize: '11px', color: T.t2, marginBottom: '4px' }}>{e.company}</div>
            <ul style={{ paddingLeft: '13px', margin: 0 }}>
              {e.bullets.map((b, j) => (
                <li key={j} style={{ fontSize: '11px', lineHeight: '1.55', color: T.text, marginBottom: '2px' }}>{b}</li>
              ))}
            </ul>
          </div>
        ))}
      </DocSection>

      <DocSection title="Skills">
        {result.skills.map((sk, i) => (
          <div key={i} style={{ fontSize: '11px', marginBottom: '4px', display: 'flex', gap: '8px' }}>
            <span style={{ color: T.t2, fontWeight: 500, minWidth: '72px', flexShrink: 0 }}>{sk.category}</span>
            <span style={{ color: T.text }}>{sk.values}</span>
          </div>
        ))}
      </DocSection>

      <div style={{ marginTop: '20px', paddingTop: '12px', borderTop: `1px solid ${T.border}` }}>
        <p style={{ fontSize: '10px', color: T.t3, fontStyle: 'italic', textAlign: 'center' }}>
          Preview only. The downloaded PDF uses your selected LaTeX template.
        </p>
      </div>
    </div>
  );
}
