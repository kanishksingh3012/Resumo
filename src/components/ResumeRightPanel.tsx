'use client';

import { useState, useEffect } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { ToolBtn } from './atoms';
import ResumeDoc from './ResumeDoc';
import { downloadResumePdf } from '@/lib/export';
import type { ResumeResult } from '@/lib/types';

const A4_W = 794;
const PAD  = 40;
const STEP = 0.1;
const MIN  = 0.4;
const MAX  = 2.0;

const PLACEHOLDER_RESULT: ResumeResult = {
  name: 'Your Name',
  subtitle: 'Your Title · Your Location',
  contact: 'email@example.com · linkedin.com/in/you',
  summary: 'Upload your resume and paste a job description to generate a tailored resume.',
  experience: [
    {
      company: 'Your Company',
      role: 'Your Role',
      dates: 'Jan 2022 – Present',
      bullets: ['Your tailored bullet points will appear here after generation.'],
    },
  ],
  skills: [{ category: 'Skills', values: 'Will be tailored to the job description' }],
  company: '',
  changes: [],
};

interface ResumeRightPanelProps {
  panelWidth: number;
  result: ResumeResult | null;
}

export default function ResumeRightPanel({ panelWidth, result }: ResumeRightPanelProps) {
  const calcFitZoom = () => +Math.max(MIN, Math.min(MAX, (panelWidth - PAD) / A4_W)).toFixed(2);

  const [zoom, setZoom]     = useState(() => calcFitZoom());
  const [isFitW, setIsFitW] = useState(true);

  useEffect(() => { if (isFitW) setZoom(calcFitZoom()); }, [panelWidth]);

  const zoomIn    = () => { setZoom(z => +Math.min(MAX, z + STEP).toFixed(1)); setIsFitW(false); };
  const zoomOut   = () => { setZoom(z => +Math.max(MIN, z - STEP).toFixed(1)); setIsFitW(false); };
  const resetZoom = () => { setZoom(1); setIsFitW(false); };
  const fitWidth  = () => { setZoom(calcFitZoom()); setIsFitW(true); };

  const VDivider = () => <div style={{ width: '1px', height: '16px', background: T.border, margin: '0 4px', flexShrink: 0 }} />;

  const displayResult = result || PLACEHOLDER_RESULT;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg, flex: 'none', width: '100%', height: '100%' }}>
      {/* Toolbar */}
      <div style={{ height: '34px', borderBottom: `1px solid ${T.border}`, background: T.surfaceAlt, display: 'flex', alignItems: 'center', padding: '0 10px', gap: '1px', flexShrink: 0 }}>
        <ToolBtn onClick={zoomOut} title="Zoom out (−)" disabled={zoom <= MIN}><I.ZoomOut /></ToolBtn>
        <button
          onClick={resetZoom}
          title="Reset to 100%"
          style={{ padding: '2px 7px', background: 'none', border: `1px solid ${T.border}`, borderRadius: '3px', fontSize: '11px', fontFamily: 'var(--font-mono)', cursor: 'pointer', color: T.t2, minWidth: '44px', lineHeight: 'normal', transition: 'border-color 0.1s' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = T.accent)}
          onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
        >
          {Math.round(zoom * 100)}%
        </button>
        <ToolBtn onClick={zoomIn} title="Zoom in (+)" disabled={zoom >= MAX}><I.ZoomIn /></ToolBtn>

        <VDivider />

        <ToolBtn onClick={fitWidth} title="Fit width" active={isFitW}><I.FitW /></ToolBtn>

        <div style={{ flex: 1 }} />

        <ToolBtn title={result ? 'Print / Save as PDF' : 'Generate a resume first'} disabled={!result} onClick={() => result && downloadResumePdf(result)}><I.Print /></ToolBtn>
        <VDivider />
        <ToolBtn title={result ? 'Download PDF' : 'Generate a resume first'} disabled={!result} onClick={() => result && downloadResumePdf(result)}><I.Download /></ToolBtn>
      </div>

      {/* Scrollable doc */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'auto', padding: '20px' }}>
        <div style={{ zoom: zoom, width: `${A4_W}px`, margin: '0 auto' }}>
          <div style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: '3px', boxShadow: '0 2px 14px rgba(0,0,0,0.07)', overflow: 'hidden', width: `${A4_W}px` }}>
            <ResumeDoc result={displayResult} />
          </div>
        </div>
      </div>
    </div>
  );
}
