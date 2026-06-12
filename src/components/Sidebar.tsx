'use client';

import { T } from '@/lib/tokens';
import { I } from './icons';
import type { NavId } from '@/lib/types';

interface SidebarProps {
  nav: NavId;
  setNav: (id: NavId) => void;
  onSettings: () => void;
  collapsed: boolean;
  onToggle: () => void;
  width: number;
}

const NAV_ITEMS = [
  { id: 'home' as NavId,      label: 'Dashboard', Icon: I.Home      },
  { id: 'prompts' as NavId,   label: 'Prompts',   Icon: I.Prompts   },
  { id: 'companies' as NavId, label: 'Companies', Icon: I.Companies },
  { id: 'templates' as NavId, label: 'Templates', Icon: I.Template  },
  { id: 'guide' as NavId,     label: 'Guide',     Icon: I.Guide     },
];

export default function Sidebar({ nav, setNav, onSettings, collapsed, onToggle, width }: SidebarProps) {
  return (
    <div
      className="sidebar"
      style={{
        width: collapsed ? 56 : width,
        minWidth: collapsed ? 56 : width,
        flexShrink: 0,
        background: T.surfaceAlt,
        borderRight: collapsed ? `1px solid ${T.border}` : 'none',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 12px', height: '52px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
        {!collapsed && (
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '15px', letterSpacing: '-0.02em', color: T.text }}>
            resumo
          </span>
        )}
        <button
          onClick={onToggle}
          style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, display: 'flex', padding: '4px', borderRadius: '3px', marginLeft: collapsed ? 'auto' : 0, marginRight: collapsed ? 'auto' : 0, lineHeight: 0 }}
        >
          {collapsed ? <I.Expand /> : <I.Collapse />}
        </button>
      </div>

      <nav style={{ flex: 1, padding: '8px', display: 'flex', flexDirection: 'column', gap: '1px' }}>
        {NAV_ITEMS.map(({ id, label, Icon }) => {
          const active = nav === id;
          return (
            <div
              key={id}
              onClick={() => setNav(id)}
              style={{
                display: 'flex', alignItems: 'center', gap: '9px',
                padding: collapsed ? '9px 0' : '8px 10px',
                justifyContent: collapsed ? 'center' : 'flex-start',
                borderRadius: '4px', cursor: 'pointer', fontSize: '13px',
                fontWeight: active ? 500 : 400,
                color: active ? T.text : T.t2,
                background: active ? T.accentBg : 'transparent',
                borderLeft: !collapsed ? (active ? `2px solid ${T.accent}` : '2px solid transparent') : 'none',
                transition: 'all 0.1s',
                userSelect: 'none',
              }}
            >
              <span style={{ color: active ? T.accent : T.t3, flexShrink: 0, lineHeight: 0 }}><Icon /></span>
              {!collapsed && label}
            </div>
          );
        })}
      </nav>

      <div style={{ padding: '8px', borderTop: `1px solid ${T.border}` }}>
        <div
          onClick={onSettings}
          style={{ display: 'flex', alignItems: 'center', gap: '9px', padding: collapsed ? '9px 0' : '8px 10px', justifyContent: collapsed ? 'center' : 'flex-start', borderRadius: '4px', cursor: 'pointer', color: T.t3, fontSize: '13px', transition: 'all 0.1s', userSelect: 'none' }}
        >
          <span style={{ lineHeight: 0 }}><I.Settings /></span>
          {!collapsed && 'Settings'}
        </div>
      </div>
    </div>
  );
}
