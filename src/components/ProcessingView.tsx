'use client';

import { T } from '@/lib/tokens';

export default function ProcessingView({ message, onSkip }: { message: string; onSkip: () => void }) {
  return (
    <div style={{ height: '100vh', background: T.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px' }}>
      <div
        className="spin"
        style={{ width: '30px', height: '30px', borderRadius: '50%', border: `1.5px solid ${T.border}`, borderTopColor: T.primary }}
      />
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '5px' }}>{message}</div>
        <div style={{ fontSize: '12px', color: T.t3 }}>Usually under 30 seconds</div>
      </div>
      <button
        onClick={onSkip}
        style={{ background: 'none', border: 'none', color: T.t3, fontSize: '12px', cursor: 'pointer', textDecoration: 'underline', textUnderlineOffset: '2px', fontFamily: 'var(--font-body)' }}
      >
        Skip to result →
      </button>
    </div>
  );
}
