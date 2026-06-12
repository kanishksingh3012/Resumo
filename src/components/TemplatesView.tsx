'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { KEYS, load, save } from '@/lib/storage';
import { DEFAULT_TEMPLATE_LATEX } from '@/lib/defaultTemplate';
import type { Template } from '@/lib/types';

const INIT_TEMPLATES: Template[] = [
  { id: 1, name: 'Preset', type: 'builtin', latex: DEFAULT_TEMPLATE_LATEX },
];

function pill(active: boolean) {
  return {
    padding: '4px 14px', borderRadius: '3px', fontSize: '12px', cursor: 'pointer',
    fontFamily: 'var(--font-body)', transition: 'all 0.1s',
    background: active ? T.primary : 'none', color: active ? '#fff' : T.t2,
    border: active ? 'none' : `1px solid ${T.border}`,
  };
}

function EditTemplateModal({ template, onSave, onClose }: { template: Template; onSave: (t: Template) => void; onClose: () => void }) {
  const [name, setName]   = useState(template.name);
  const [mode, setMode]   = useState<'paste' | 'upload'>('paste');
  const [latex, setLatex] = useState(template.latex || '');
  const [saved, setSaved] = useState(false);
  const isBuiltin  = template.type === 'builtin';
  const canSave    = name.trim().length > 0;
  const hasChanges = name !== template.name || latex !== (template.latex || '');

  const handleSave = () => {
    if (!canSave) return;
    onSave({ ...template, name: name.trim(), latex });
    setSaved(true);
    setTimeout(onClose, 500);
  };

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,18,27,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fade" style={{ background: T.surface, borderRadius: '6px', width: '540px', maxWidth: '92vw', maxHeight: '88vh', display: 'flex', flexDirection: 'column', border: `1px solid ${T.border}`, boxShadow: '0 8px 40px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
        <div style={{ padding: '17px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '2px' }}>Edit Template</h2>
            <div style={{ fontSize: '11px', color: T.t3 }}>{template.name}</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, display: 'flex', padding: '2px', lineHeight: 0 }}><I.Close /></button>
        </div>

        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px', overflowY: 'auto', flex: 1 }}>
          {isBuiltin && (
            <div style={{ padding: '10px 12px', background: '#FFFBEB', border: '1px solid #FDE68A', borderRadius: '4px', fontSize: '12px', color: '#92400E', lineHeight: '1.55' }}>
              <strong style={{ fontWeight: 600 }}>Built-in template</strong> — you can rename it and add a custom LaTeX source to override the default.
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.t2, marginBottom: '6px' }}>Template name</label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleSave(); }}
              style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', color: T.text, background: T.surface }}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: 500, color: T.t2 }}>LaTeX source</label>
              {!latex && <span style={{ fontSize: '11px', color: T.t3 }}>Optional — leave blank to use the built-in</span>}
            </div>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              <button style={pill(mode === 'paste')}  onClick={() => setMode('paste')}>Paste LaTeX</button>
              <button style={pill(mode === 'upload')} onClick={() => setMode('upload')}>Upload .tex</button>
            </div>

            {mode === 'paste' ? (
              <div style={{ position: 'relative' }}>
                <textarea
                  value={latex}
                  onChange={e => setLatex(e.target.value)}
                  placeholder={`\\documentclass{article}\n% Paste your full LaTeX template here…`}
                  style={{ width: '100%', minHeight: '160px', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '10px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: '1.7', resize: 'vertical', outline: 'none', color: T.text, background: T.surface }}
                />
                {latex.length > 0 && (
                  <button onClick={() => setLatex('')} style={{ position: 'absolute', top: '8px', right: '8px', background: 'none', border: 'none', cursor: 'pointer', color: T.t3, lineHeight: 0, padding: '2px' }} title="Clear LaTeX">
                    <I.Close />
                  </button>
                )}
              </div>
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '28px 24px', border: `2px dashed ${T.borderStrong}`, borderRadius: '4px', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ color: T.t3, lineHeight: 0 }}><I.Upload /></span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Drop your .tex file here</div>
                  <div style={{ fontSize: '12px', color: T.t3, marginTop: '3px' }}>or click to browse</div>
                </div>
                <input type="file" accept=".tex" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; f.text().then(t => { setLatex(t); setMode('paste'); }); }} />
              </label>
            )}
          </div>
        </div>

        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, background: '#F9F8F5', display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <div style={{ fontSize: '12px', color: T.t3 }}>
            {saved ? (
              <span style={{ color: T.success, display: 'flex', alignItems: 'center', gap: '4px' }}><I.Check /> Saved</span>
            ) : hasChanges ? 'Unsaved changes' : ''}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={onClose} style={{ padding: '7px 16px', border: `1px solid ${T.border}`, borderRadius: '4px', background: 'none', color: T.t2, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
            <button onClick={handleSave} disabled={!canSave} style={{ padding: '7px 20px', background: canSave ? T.primary : T.border, color: canSave ? '#fff' : T.t3, border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', transition: 'all 0.1s' }}>Save Changes</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function AddTemplateModal({ onSave, onClose }: { onSave: (t: { name: string; latex: string }) => void; onClose: () => void }) {
  const [name, setName]   = useState('');
  const [mode, setMode]   = useState<'paste' | 'upload'>('paste');
  const [latex, setLatex] = useState('');
  const canSave = name.trim().length > 0 && (mode === 'upload' || latex.trim().length > 0);

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(17,18,27,0.32)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 300 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="fade" style={{ background: T.surface, borderRadius: '6px', width: '520px', maxWidth: '90vw', border: `1px solid ${T.border}`, boxShadow: '0 8px 40px rgba(0,0,0,0.14)', overflow: 'hidden' }}>
        <div style={{ padding: '17px 24px', borderBottom: `1px solid ${T.border}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600 }}>Add Template</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, display: 'flex', padding: '2px', lineHeight: 0 }}><I.Close /></button>
        </div>
        <div style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.t2, marginBottom: '6px' }}>Template name</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. My Custom Template" style={{ width: '100%', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '8px 12px', fontSize: '13px', outline: 'none', fontFamily: 'var(--font-body)', color: T.text }} />
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: 500, color: T.t2, marginBottom: '8px' }}>LaTeX source</label>
            <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
              <button style={pill(mode === 'paste')}  onClick={() => setMode('paste')}>Paste LaTeX</button>
              <button style={pill(mode === 'upload')} onClick={() => setMode('upload')}>Upload .tex file</button>
            </div>
            {mode === 'paste' ? (
              <textarea value={latex} onChange={e => setLatex(e.target.value)} placeholder={`\\documentclass{article}\n% Paste your full LaTeX template here…`} style={{ width: '100%', minHeight: '140px', border: `1px solid ${T.border}`, borderRadius: '4px', padding: '10px 12px', fontSize: '12px', fontFamily: 'var(--font-mono)', lineHeight: '1.7', resize: 'vertical', outline: 'none', color: T.text }} />
            ) : (
              <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', padding: '32px 24px', border: `2px dashed ${T.borderStrong}`, borderRadius: '4px', cursor: 'pointer', textAlign: 'center' }}>
                <span style={{ color: T.t3, lineHeight: 0 }}><I.Upload /></span>
                <div>
                  <div style={{ fontSize: '13px', fontWeight: 500 }}>Drop your .tex file here</div>
                  <div style={{ fontSize: '12px', color: T.t3, marginTop: '3px' }}>or click to browse</div>
                </div>
                <input type="file" accept=".tex" style={{ display: 'none' }} onChange={e => { const f = e.target.files?.[0]; if (!f) return; f.text().then(t => { setLatex(t); setMode('paste'); }); }} />
              </label>
            )}
          </div>
        </div>
        <div style={{ padding: '14px 24px', borderTop: `1px solid ${T.border}`, background: '#F9F8F5', display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ padding: '7px 16px', border: `1px solid ${T.border}`, borderRadius: '4px', background: 'none', color: T.t2, fontSize: '13px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Cancel</button>
          <button onClick={() => canSave && onSave({ name: name.trim(), latex })} style={{ padding: '7px 18px', background: canSave ? T.primary : T.border, color: canSave ? '#fff' : T.t3, border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: canSave ? 'pointer' : 'not-allowed', fontFamily: 'var(--font-body)', transition: 'all 0.1s' }}>Save Template</button>
        </div>
      </div>
    </div>
  );
}

function TemplateCard({ template, active, onSetActive, onEdit, onDelete }: { template: Template; active: boolean; onSetActive: () => void; onEdit: () => void; onDelete: () => void }) {
  return (
    <div style={{ background: active ? T.accentBg : T.surface, border: `1px solid ${active ? T.accent : T.border}`, borderRadius: '4px', padding: '14px 18px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'border-color 0.1s,background 0.1s' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        {active && <span style={{ lineHeight: 0, color: T.accent, flexShrink: 0 }}><I.Check /></span>}
        <span style={{ fontSize: '13px', fontWeight: active ? 500 : 400, whiteSpace: 'nowrap' }}>{template.name}</span>
        <span style={{ padding: '1px 6px', borderRadius: '2px', fontSize: '10px', fontWeight: 700, letterSpacing: '0.05em', background: template.type === 'builtin' ? '#F3F4F6' : T.accentBg, color: template.type === 'builtin' ? T.t2 : T.accent, whiteSpace: 'nowrap', flexShrink: 0 }}>
          {template.type === 'builtin' ? 'BUILT-IN' : 'CUSTOM'}
        </span>
      </div>
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexShrink: 0, marginLeft: '12px' }}>
        {active
          ? <span style={{ fontSize: '12px', color: T.accent, fontWeight: 500 }}>Active</span>
          : <button onClick={onSetActive} style={{ padding: '5px 12px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.text, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', fontWeight: 500 }}>Set as Active</button>
        }
        <button onClick={onEdit} style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '5px 10px', border: `1px solid ${T.border}`, borderRadius: '3px', background: 'none', color: T.t2, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)', lineHeight: 0 }}>
          <I.Edit /><span style={{ lineHeight: 'normal', fontSize: '12px' }}>Edit</span>
        </button>
        {template.type === 'custom' && (
          <button onClick={onDelete} style={{ padding: '5px 10px', border: '1px solid #FCA5A5', borderRadius: '3px', background: '#FFF5F5', color: T.danger, fontSize: '12px', cursor: 'pointer', fontFamily: 'var(--font-body)' }}>Delete</button>
        )}
      </div>
    </div>
  );
}

export default function TemplatesView({ activeTemplate, setActiveTemplate }: { activeTemplate: string; setActiveTemplate: (n: string) => void }) {
  const [templates, setTemplates]       = useState<Template[]>(() => load<Template[]>(KEYS.templates, INIT_TEMPLATES));
  const [showAddModal, setShowAddModal] = useState(false);
  const [editTarget, setEditTarget]     = useState<Template | null>(null);

  useEffect(() => { save(KEYS.templates, templates); }, [templates]);

  const handleSetActive = (id: number) => {
    const tpl = templates.find(t => t.id === id);
    if (tpl) setActiveTemplate(tpl.name);
  };

  const handleDelete = (id: number) => setTemplates(ts => ts.filter(t => t.id !== id));

  const handleAdd = ({ name, latex }: { name: string; latex: string }) => {
    setTemplates(ts => [...ts, { id: Math.max(...ts.map(t => t.id), 0) + 1, name, latex, type: 'custom' }]);
    setShowAddModal(false);
  };

  const handleEditSave = (updated: Template) => {
    const old = templates.find(t => t.id === updated.id);
    setTemplates(ts => ts.map(t => t.id === updated.id ? updated : t));
    if (old && activeTemplate === old.name) setActiveTemplate(updated.name);
    setEditTarget(null);
  };

  return (
    <div style={{ flex: 1, padding: '20px 24px', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '15px', fontWeight: 600, marginBottom: '3px' }}>Templates</h2>
          <p style={{ fontSize: '12px', color: T.t2 }}>Select a LaTeX template for your generated PDFs.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', padding: '8px 14px', background: T.primary, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)', flexShrink: 0 }}>
          <I.Plus /> Add Template
        </button>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {templates.map(t => (
          <TemplateCard
            key={t.id}
            template={t}
            active={t.name === activeTemplate}
            onSetActive={() => handleSetActive(t.id)}
            onEdit={() => setEditTarget(t)}
            onDelete={() => handleDelete(t.id)}
          />
        ))}
      </div>
      {showAddModal && <AddTemplateModal onSave={handleAdd} onClose={() => setShowAddModal(false)} />}
      {editTarget   && <EditTemplateModal template={editTarget} onSave={handleEditSave} onClose={() => setEditTarget(null)} />}
    </div>
  );
}
