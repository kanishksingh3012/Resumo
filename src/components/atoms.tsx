'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import type { CSSProperties } from 'react';

export function PanelLabel({ children, style = {} }: { children: React.ReactNode; style?: CSSProperties }) {
  return (
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '10px', letterSpacing: '0.1em', textTransform: 'uppercase', color: T.t3, ...style }}>
      {children}
    </span>
  );
}

export function Divider({ style = {} }: { style?: CSSProperties }) {
  return <div style={{ height: '1px', background: T.border, ...style }} />;
}

export function ToolBtn({
  children, onClick, title, disabled, active,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  title?: string;
  disabled?: boolean;
  active?: boolean;
}) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      title={title}
      disabled={disabled}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        width: '26px', height: '26px', borderRadius: '3px', border: 'none',
        background: active ? T.accentBg : (hov && !disabled) ? T.bg : 'none',
        color: disabled ? T.t3 : active ? T.accent : hov ? T.text : T.t2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        lineHeight: 0, padding: 0, transition: 'background 0.1s,color 0.1s', flexShrink: 0,
      }}
    >
      {children}
    </button>
  );
}

export function GhostBtn({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}
    >
      {children}
    </button>
  );
}

export function SettRow({ label, sub, children }: { label: string; sub?: string; children?: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: '11px', color: T.t3, marginTop: '2px' }}>{sub}</div>}
      </div>
      {children}
    </div>
  );
}
