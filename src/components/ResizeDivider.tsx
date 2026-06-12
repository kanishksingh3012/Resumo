'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';

export default function ResizeDivider({ onMouseDown, active }: { onMouseDown: (e: React.MouseEvent) => void; active: boolean }) {
  const [hov, setHov] = useState(false);
  const on = hov || active;
  return (
    <div
      onMouseDown={onMouseDown}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: '5px', flexShrink: 0, cursor: 'col-resize', zIndex: 10,
        background: on ? `${T.accent}22` : 'transparent',
        borderLeft: `1px solid ${on ? T.accent : T.border}`,
        transition: 'background 0.12s, border-color 0.12s',
        userSelect: 'none',
      }}
    />
  );
}
