'use client';

import { useState, useEffect, useRef } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { PanelLabel } from './atoms';
import Sidebar from './Sidebar';
import ResizeDivider from './ResizeDivider';
import SetupView from './SetupView';
import ProcessingView from './ProcessingView';
import HomeView from './HomeView';
import ResultView from './ResultView';
import PromptsView from './PromptsView';
import CompaniesView from './CompaniesView';
import TemplatesView from './TemplatesView';
import GuideView from './GuideView';
import ResumeRightPanel from './ResumeRightPanel';
import SettingsModal from './SettingsModal';
import ResumeUploadModal from './ResumeUploadModal';
import { KEYS, load, save, remove, clearAll, type StoredApiKey } from '@/lib/storage';
import { INIT_PROMPTS, DEFAULT_PROMPT_TEXT } from '@/lib/prompts';
import type { NavId, Screen, Model, PromptMode, ResumeFile, ResumeResult, Company, Prompt } from '@/lib/types';

export default function App() {
  const [nav, setNav]                       = useState<NavId>('home');
  const [screen, setScreen]                 = useState<Screen>('dashboard');
  const [apiKey, setApiKey]                 = useState<string | null>(null);
  const [resume, setResume]                 = useState<ResumeFile | null>(null);
  const [hydrated, setHydrated]             = useState(false);
  const [jdText, setJdText]                 = useState('');
  const [showSettings, setShowSettings]     = useState(false);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [collapsed, setCollapsed]           = useState(false);
  const [procMsg, setProcMsg]               = useState('Analysing job description…');
  const [activeTemplate, setActiveTemplate] = useState('Preset');
  const [companies, setCompanies]           = useState<Company[]>([]);
  const [bannerDismissed, setBannerDismissed] = useState(true);
  const [result, setResult]                 = useState<ResumeResult | null>(null);
  const [generateError, setGenerateError]   = useState<string | null>(null);
  const [sidebarW, setSidebarW]             = useState(220);
  const [rightPanelW, setRightPanelW]       = useState(500);
  const [activeDrag, setActiveDrag]         = useState<'sidebar' | 'right' | null>(null);

  const timers   = useRef<ReturnType<typeof setTimeout>[]>([]);
  const dragRef  = useRef<{ type: string; startX: number; startW: number } | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Hydrate from localStorage once on mount
  useEffect(() => {
    const storedKey = load<StoredApiKey | null>(KEYS.apiKey, null);
    if (storedKey?.key) setApiKey(storedKey.key);
    const storedResume = load<ResumeFile | null>(KEYS.resume, null);
    if (storedResume) setResume(storedResume);
    setActiveTemplate(load<string>(KEYS.activeTemplate, 'Preset'));
    setCompanies(load<Company[]>(KEYS.companies, []));
    setBannerDismissed(load<boolean>(KEYS.bannerDismissed, false));
    setHydrated(true);
  }, []);

  // Persist template choice and companies on change (post-hydration only)
  useEffect(() => { if (hydrated) save(KEYS.activeTemplate, activeTemplate); }, [activeTemplate, hydrated]);
  useEffect(() => { if (hydrated) save(KEYS.companies, companies); }, [companies, hydrated]);

  const clearTimers = () => { timers.current.forEach(clearTimeout); timers.current = []; };

  const handleSetupComplete = ({ apiKey: newKey, resume: newResume }: { apiKey?: string; resume?: ResumeFile }) => {
    if (newKey) {
      save(KEYS.apiKey, { provider: 'anthropic', key: newKey } satisfies StoredApiKey);
      setApiKey(newKey);
    }
    if (newResume) {
      save(KEYS.resume, newResume);
      setResume(newResume);
    }
  };

  const handleResumeModalComplete = (newResume: ResumeFile) => {
    save(KEYS.resume, newResume);
    setResume(newResume);
    setShowResumeModal(false);
  };

  const handleApiKeyChange = (newKey: string | null) => {
    if (newKey) {
      save(KEYS.apiKey, { provider: 'anthropic', key: newKey } satisfies StoredApiKey);
      setApiKey(newKey);
    } else {
      remove(KEYS.apiKey);
      setApiKey(null);
    }
  };

  const handleGenerate = async (model: Model, promptMode: PromptMode, customPrompt: string) => {
    if (!resume || !apiKey) return;
    setGenerateError(null);
    setScreen('processing');
    setProcMsg('Analysing job description…');
    clearTimers();

    timers.current.push(setTimeout(() => setProcMsg('Claude is tailoring your resume…'), 2500));
    timers.current.push(setTimeout(() => setProcMsg('Compiling result…'), 8000));

    abortRef.current = new AbortController();

    // The active prompt from the Prompts tab drives generation; an explicit
    // "custom" prompt from the dashboard Settings panel overrides it for this run.
    const activePromptText = load<Prompt[]>(KEYS.prompts, INIT_PROMPTS).find(p => p.active)?.text || DEFAULT_PROMPT_TEXT;
    const promptText = (promptMode === 'custom' && customPrompt.trim()) ? customPrompt : activePromptText;

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apiKey,
          resumeText: resume.text,
          jdText,
          model,
          promptText,
        }),
        signal: abortRef.current.signal,
      });

      clearTimers();

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(err.error || `HTTP ${res.status}`);
      }

      const data: ResumeResult = await res.json();
      setResult(data);
      setScreen('result');

      // Log this application in Companies (metadata only)
      if (data.company) {
        setCompanies(cs => [
          ...cs,
          {
            id: Math.max(...cs.map(c => c.id), 0) + 1,
            name: data.company,
            role: data.subtitle?.split('·')[0]?.trim() || '',
            date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          },
        ]);
      }
    } catch (err) {
      clearTimers();
      if ((err as Error).name === 'AbortError') return;
      setGenerateError((err as Error).message);
      setScreen('dashboard');
    }
  };

  const handleNewApp = () => {
    clearTimers();
    abortRef.current?.abort();
    setJdText('');
    setResult(null);
    setGenerateError(null);
    setScreen('dashboard');
    setNav('home');
  };

  const handleSkip = () => {
    clearTimers();
    abortRef.current?.abort();
    setScreen(result ? 'result' : 'dashboard');
  };

  const handleReset = () => {
    clearAll();
    setApiKey(null);
    setResume(null);
    setResult(null);
    setJdText('');
    setCompanies([]);
    setBannerDismissed(false);
    setScreen('dashboard');
    setNav('home');
    setActiveTemplate('Preset');
  };

  const dismissBanner = () => {
    setBannerDismissed(true);
    save(KEYS.bannerDismissed, true);
  };

  // Drag-resize handlers
  const startDrag = (type: 'sidebar' | 'right') => (e: React.MouseEvent) => {
    e.preventDefault();
    dragRef.current = { type, startX: e.clientX, startW: type === 'sidebar' ? sidebarW : rightPanelW };
    setActiveDrag(type);
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
  };

  useEffect(() => () => clearTimers(), []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!dragRef.current) return;
      const { type, startX, startW } = dragRef.current;
      const dx = e.clientX - startX;
      if (type === 'sidebar') setSidebarW(Math.max(160, Math.min(400, startW + dx)));
      if (type === 'right')   setRightPanelW(Math.max(220, Math.min(720, startW - dx)));
    };
    const onUp = () => {
      if (!dragRef.current) return;
      dragRef.current = null;
      setActiveDrag(null);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, []);

  // Avoid SSR mismatch — don't render until localStorage is hydrated
  if (!hydrated) return null;

  // Full-screen states — only block when API key is missing
  if (!apiKey) {
    return <SetupView needKey={true} needResume={!resume} onComplete={handleSetupComplete} />;
  }
  if (screen === 'processing') return <ProcessingView message={procMsg} onSkip={handleSkip} />;

  const renderContent = () => {
    if (nav === 'prompts')   return <PromptsView />;
    if (nav === 'companies') return <CompaniesView companies={companies} setCompanies={setCompanies} />;
    if (nav === 'templates') return <TemplatesView activeTemplate={activeTemplate} setActiveTemplate={setActiveTemplate} />;
    if (nav === 'guide')     return <GuideView />;
    if (screen === 'result' && result) return <ResultView result={result} onNewApplication={handleNewApp} />;
    return (
      <HomeView
        resume={resume}
        onUploadResume={() => setShowResumeModal(true)}
        jdText={jdText}
        setJdText={setJdText}
        onGenerate={handleGenerate}
        activeTemplate={activeTemplate}
        onChangeTemplate={() => setNav('templates')}
        showBackupBanner={!bannerDismissed}
        onDismissBanner={dismissBanner}
      />
    );
  };

  const headerLabel = () => {
    if (nav === 'prompts')   return 'Prompts';
    if (nav === 'companies') return 'Companies';
    if (nav === 'templates') return 'Templates';
    if (nav === 'guide')     return 'Guide';
    if (screen === 'result' && result) return `Tailored for ${result.company}`;
    return 'New Application';
  };

  const showRightPanel = nav === 'home';

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      <Sidebar
        nav={nav}
        setNav={id => { setNav(id); if (id === 'home') setScreen(result ? 'result' : 'dashboard'); }}
        onSettings={() => setShowSettings(true)}
        collapsed={collapsed}
        onToggle={() => setCollapsed(v => !v)}
        width={sidebarW}
      />
      {!collapsed && <ResizeDivider onMouseDown={startDrag('sidebar')} active={activeDrag === 'sidebar'} />}

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', minWidth: 450 }}>
        {/* Header bar */}
        <div style={{ padding: '0 24px', height: '52px', borderBottom: `1px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
          <PanelLabel>{headerLabel()}</PanelLabel>
          {screen === 'result' && nav === 'home' && (
            <button onClick={handleNewApp} style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', fontSize: '12px', color: T.t3, cursor: 'pointer', fontFamily: 'var(--font-body)' }}>
              <I.Back /> New Application
            </button>
          )}
        </div>

        {/* Error banner */}
        {generateError && (
          <div style={{ padding: '10px 24px', background: '#FFF5F5', borderBottom: '1px solid #FCA5A5', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
            <span style={{ fontSize: '13px', color: T.danger }}>Generation failed: {generateError}</span>
            <button onClick={() => setGenerateError(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: T.t3, lineHeight: 0 }}><I.Close /></button>
          </div>
        )}

        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {renderContent()}
        </div>
      </div>

      {showRightPanel && (
        <>
          <ResizeDivider onMouseDown={startDrag('right')} active={activeDrag === 'right'} />
          <div style={{ width: rightPanelW, flexShrink: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>
            <div style={{ padding: '0 16px', height: '52px', borderBottom: `1px solid ${T.border}`, background: T.surface, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
              <PanelLabel>Resume Preview</PanelLabel>
              <span style={{ fontSize: '11px', color: T.t3, fontFamily: 'var(--font-mono)' }}>
                {result ? `Tailored · ${result.company}` : `Uploaded · ${resume.modified}`}
              </span>
            </div>
            <ResumeRightPanel panelWidth={rightPanelW} result={result} />
          </div>
        </>
      )}

      {showResumeModal && (
        <ResumeUploadModal
          onComplete={handleResumeModalComplete}
          onClose={() => setShowResumeModal(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onGoTemplates={() => setNav('templates')}
          activeTemplate={activeTemplate}
          resume={resume}
          apiKey={apiKey}
          onApiKeyChange={handleApiKeyChange}
          onReplaceResume={() => { setShowSettings(false); setShowResumeModal(true); }}
          onReset={handleReset}
        />
      )}
    </div>
  );
}
