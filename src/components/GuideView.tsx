'use client';

import { useState } from 'react';
import { T } from '@/lib/tokens';
import { I } from './icons';
import { downloadTextFile } from '@/lib/export';
import { SAMPLE_PROMPT_TEXT, SAMPLE_TEMPLATE_LATEX } from '@/lib/samples';

/* ── Small building blocks ─────────────────────────────────────────── */

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '14px', fontWeight: 600, color: T.text, margin: '0 0 10px' }}>
      {children}
    </h3>
  );
}

function Card({ children, accent }: { children: React.ReactNode; accent?: 'warning' | 'accent' }) {
  const border =
    accent === 'warning' ? '#FDE68A' :
    accent === 'accent'  ? T.accent  :
    T.border;
  const bg =
    accent === 'warning' ? '#FFFBEB' :
    accent === 'accent'  ? T.accentBg :
    T.surface;
  return (
    <div style={{ background: bg, border: `1px solid ${border}`, borderRadius: '4px', padding: '16px 18px' }}>
      {children}
    </div>
  );
}

function Step({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
      <div style={{ flexShrink: 0, width: '24px', height: '24px', borderRadius: '50%', background: T.primary, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px', fontWeight: 600, fontFamily: 'var(--font-display)' }}>
        {n}
      </div>
      <div style={{ paddingTop: '2px' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: T.text, marginBottom: '3px' }}>{title}</div>
        <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.65' }}>{children}</div>
      </div>
    </div>
  );
}

function FeatureRow({ Icon, name, desc }: { Icon: () => React.ReactNode; name: string; desc: string }) {
  return (
    <div style={{ display: 'flex', gap: '11px', alignItems: 'flex-start', padding: '12px 0', borderBottom: `1px solid ${T.border}` }}>
      <span style={{ color: T.t3, lineHeight: 0, marginTop: '1px', flexShrink: 0 }}><Icon /></span>
      <div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: T.text }}>{name}</div>
        <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.6', marginTop: '2px' }}>{desc}</div>
      </div>
    </div>
  );
}

function Faq({ q, a }: { q: string; a: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ borderBottom: `1px solid ${T.border}` }}>
      <button
        onClick={() => setOpen(v => !v)}
        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', padding: '13px 0', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left', fontFamily: 'var(--font-body)' }}
      >
        <span style={{ fontSize: '13px', fontWeight: 500, color: T.text }}>{q}</span>
        <span style={{ lineHeight: 0, color: T.t3, flexShrink: 0, transition: 'transform 0.15s', transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}><I.Chev /></span>
      </button>
      {open && (
        <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.7', padding: '0 0 14px' }}>{a}</div>
      )}
    </div>
  );
}

/* ── Guide ─────────────────────────────────────────────────────────── */

export default function GuideView() {
  return (
    <div style={{ flex: 1, overflowY: 'auto', padding: '28px 24px' }}>
      <div style={{ maxWidth: '720px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>

        {/* Intro */}
        <div>
          <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em', color: T.text, marginBottom: '8px' }}>
            Welcome to Resumo
          </h2>
          <p style={{ fontSize: '14px', color: T.t2, lineHeight: '1.7' }}>
            Resumo takes your base resume and any job description, then uses Claude AI to produce a tightly
            tailored, one-page resume — along with a clear diff of what changed and why. Everything runs on
            your own Anthropic API key, and all your data stays in your browser.
          </p>
        </div>

        {/* How to use */}
        <div>
          <SectionHeading>How to use it</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <Step n={1} title="Add your API key">
              On first launch you&apos;ll be asked for an Anthropic API key. Create one free at{' '}
              <a href="https://console.anthropic.com/settings/keys" target="_blank" rel="noreferrer" style={{ color: T.accent, textDecoration: 'underline', textUnderlineOffset: '2px' }}>console.anthropic.com</a>.
              It is stored only in your browser and used solely for your own generations.
            </Step>
            <Step n={2} title="Upload your base resume">
              Upload a PDF, DOCX, or paste the text once. Resumo keeps it on hand for every future application.
            </Step>
            <Step n={3} title="Paste a job description">
              On the Dashboard, paste the full JD (at least 50 characters) into the text box.
            </Step>
            <Step n={4} title="Pick a model and generate">
              Optionally open Settings to choose Haiku, Sonnet, or Opus and tweak the prompt, then click
              <strong style={{ fontWeight: 500, color: T.text }}> Generate Tailored Resume</strong>.
            </Step>
            <Step n={5} title="Review and download">
              Switch between <strong style={{ fontWeight: 500, color: T.text }}>Preview</strong> and{' '}
              <strong style={{ fontWeight: 500, color: T.text }}>What Changed</strong> to see the before/after
              diff, then download or open in Overleaf.
            </Step>
          </div>
        </div>

        {/* Features */}
        <div>
          <SectionHeading>Features</SectionHeading>
          <Card>
            <div style={{ marginTop: '-12px' }}>
              <FeatureRow Icon={I.Home}      name="Dashboard"  desc="Paste a JD, choose a model, and generate a tailored one-page resume with a live preview alongside." />
              <FeatureRow Icon={I.Prompts}   name="Prompts"    desc="Customise the tailoring instructions. Save multiple prompts and mark one active." />
              <FeatureRow Icon={I.Companies} name="Companies"  desc="Every generation is logged here automatically so you can track where you've applied." />
              <FeatureRow Icon={I.Template}  name="Templates"  desc="Manage built-in and custom LaTeX templates that control how the downloaded PDF looks." />
            </div>
            <div style={{ height: '2px' }} />
          </Card>
        </div>

        {/* Sample files */}
        <div>
          <SectionHeading>Sample files</SectionHeading>
          <Card>
            <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.7', marginBottom: '14px' }}>
              Writing your own prompt or LaTeX template? Download these reference files as a known-good starting
              point. The app always enforces the output format and one-page limit, so your custom prompt only needs
              to describe <strong style={{ fontWeight: 500, color: T.text }}>how</strong> to tailor — no JSON or
              structure required.
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              <button
                onClick={() => downloadTextFile('resumo-sample-prompt.txt', SAMPLE_PROMPT_TEXT)}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: T.primary, color: '#fff', border: 'none', borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Download sample prompt (.txt)
              </button>
              <button
                onClick={() => downloadTextFile('resumo-sample-template.tex', SAMPLE_TEMPLATE_LATEX, 'application/x-tex')}
                style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '9px 16px', background: 'none', color: T.text, border: `1px solid ${T.border}`, borderRadius: '4px', fontSize: '13px', fontWeight: 500, cursor: 'pointer', fontFamily: 'var(--font-body)' }}
              >
                Download sample template (.tex)
              </button>
            </div>
          </Card>
        </div>

        {/* Your data & privacy */}
        <div>
          <SectionHeading>Your data &amp; privacy</SectionHeading>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <Card accent="accent">
              <div style={{ fontSize: '13px', fontWeight: 500, color: T.text, marginBottom: '5px' }}>Bring your own key</div>
              <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.7' }}>
                Resumo has no server-side API key. Your key is stored only in this browser and sent over HTTPS
                with each request, used for that single Claude call, and never saved on any server. Your usage
                bills only your own Anthropic account — and never anyone else&apos;s.
              </div>
            </Card>
            <Card>
              <div style={{ fontSize: '13px', fontWeight: 500, color: T.text, marginBottom: '5px' }}>Everything lives in your browser</div>
              <div style={{ fontSize: '13px', color: T.t2, lineHeight: '1.7' }}>
                Your resume, templates, prompts, companies, and key are saved to this browser&apos;s local
                storage. They survive refreshes, closing the app, and restarts — no accounts, no database.
              </div>
            </Card>
          </div>
        </div>

        {/* Cautions */}
        <div>
          <SectionHeading>Cautions</SectionHeading>
          <Card accent="warning">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '13px', color: '#92400E', lineHeight: '1.7' }}>
              <div>
                <strong style={{ fontWeight: 600 }}>Clearing site data erases everything.</strong> Because your
                data lives only in this browser, clearing the browser&apos;s site data (or using a different
                browser/device) starts you fresh.
              </div>
              <div>
                <strong style={{ fontWeight: 600 }}>Back up regularly.</strong> Use{' '}
                <strong style={{ fontWeight: 600 }}>Settings → Download backup</strong> to save everything as a
                single JSON file, and <strong style={{ fontWeight: 600 }}>Restore from backup</strong> to bring
                it back or move it to another device.
              </div>
              <div>
                <strong style={{ fontWeight: 600 }}>The preview is approximate.</strong> The on-screen resume is
                a preview; the downloaded PDF uses your selected LaTeX template, which may differ slightly in
                layout.
              </div>
              <div>
                <strong style={{ fontWeight: 600 }}>Always proofread.</strong> AI can occasionally rephrase
                imperfectly — review the final resume before sending it to an employer.
              </div>
            </div>
          </Card>
        </div>

        {/* FAQ */}
        <div>
          <SectionHeading>FAQs</SectionHeading>
          <Card>
            <div style={{ marginTop: '-13px' }}>
              <Faq q="Does it cost anything to use Resumo?" a={
                <>The app itself is free. You pay Anthropic directly for the API usage of your own key — typically
                a fraction of a cent to a few cents per resume depending on the model you pick.</>
              } />
              <Faq q="Which model should I choose?" a={
                <>Opus gives the best quality and is the default. Sonnet is a strong, cheaper middle ground.
                Haiku is the fastest and cheapest, good for quick drafts.</>
              } />
              <Faq q="Will Claude invent experience I don't have?" a={
                <>No — the tailoring prompt explicitly forbids inventing roles, companies, or skills. It only
                reorders, rephrases, and emphasises what&apos;s already in your base resume. You can adjust this
                in the Prompts tab.</>
              } />
              <Faq q="Is my resume or key sent anywhere permanent?" a={
                <>No. Your key and resume are stored only in your browser. During generation they&apos;re sent
                once to Claude via the app&apos;s API route to produce the result, and nothing is stored
                server-side.</>
              } />
              <Faq q="How do I move my data to another computer?" a={
                <>Open <strong style={{ fontWeight: 500, color: T.text }}>Settings → Download backup</strong> on
                the first machine, then <strong style={{ fontWeight: 500, color: T.text }}>Restore from backup</strong>{' '}
                with that file on the second.</>
              } />
              <Faq q="Can other people use this app with my key?" a={
                <>No. Each person who opens the app enters their own key, stored in their own browser. Sharing the
                URL never shares your key or your billing.</>
              } />
            </div>
          </Card>
        </div>

        <div style={{ paddingBottom: '8px', fontSize: '12px', color: T.t3, textAlign: 'center' }}>
          Need to change your key or back up your data? Open <strong style={{ fontWeight: 500, color: T.t2 }}>Settings</strong> from the bottom of the sidebar.
        </div>
      </div>
    </div>
  );
}
