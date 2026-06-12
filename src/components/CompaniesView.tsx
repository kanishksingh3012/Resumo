'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import type { Company } from '@/lib/types';

interface CompaniesViewProps {
  companies: Company[];
  setCompanies: React.Dispatch<React.SetStateAction<Company[]>>;
}

export default function CompaniesView({ companies, setCompanies }: CompaniesViewProps) {
  const [search, setSearch] = useState('');

  const filtered = companies.filter(c => c.name.toLowerCase().includes(search.toLowerCase()));

  const handleAdd = () => {
    const name = window.prompt('Company name:');
    if (!name?.trim()) return;
    const role = window.prompt('Role:') || '';
    const id   = Math.max(...companies.map(c => c.id), 0) + 1;
    const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    setCompanies(cs => [...cs, { id, name: name.trim(), role, date }]);
  };

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: T.t3, lineHeight: 0 }}><I.Search /></span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search companies…"
            style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '8px 12px 8px 32px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', color: T.text, background: T.surface }}
          />
        </div>
        <button
          onClick={handleAdd}
          style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: T.primary, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500, whiteSpace: 'nowrap' }}
        >
          <I.Plus /> Add Company
        </button>
      </div>

      {filtered.length === 0 ? (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px', padding: '40px 24px', textAlign: 'center', color: T.t3, fontSize: '13px' }}>
          {search ? 'No companies match your search.' : 'No companies yet. Add your first company above.'}
        </div>
      ) : (
        <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px', overflow: 'hidden' }}>
          {filtered.map((c, i) => (
            <div
              key={c.id}
              style={{ padding: '13px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: i < filtered.length - 1 ? `1px solid ${T.border}` : 'none', cursor: 'pointer', transition: 'background 0.1s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.background = '#F9F8F5'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500 }}>{c.name}</div>
                <div style={{ fontSize: '12px', color: T.t3, marginTop: '2px' }}>{c.role}</div>
              </div>
              <div style={{ fontSize: '11px', color: T.t3, fontFamily: 'var(--font-mono)' }}>{c.date}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
