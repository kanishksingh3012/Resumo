export interface ResumeFile {
  name: string;
  format: string;
  chars: number;
  modified: string;
  text: string;
}

export interface Template {
  id: number;
  name: string;
  type: 'builtin' | 'custom';
  latex: string;
}

export interface Company {
  id: number;
  name: string;
  role: string;
  date: string;
}

export interface Prompt {
  id: number;
  name: string;
  active: boolean;
  text: string;
}

export interface ExperienceEntry {
  company: string;
  role: string;
  dates: string;
  bullets: string[];
}

export interface SkillEntry {
  category: string;
  values: string;
}

export interface ChangeEntry {
  section: string;
  ctx?: string;
  action: string;
  before: string;
  after: string;
}

export interface ResumeResult {
  name: string;
  subtitle: string;
  contact: string;
  summary: string;
  experience: ExperienceEntry[];
  skills: SkillEntry[];
  company: string;
  changes: ChangeEntry[];
}

export type NavId = 'home' | 'prompts' | 'companies' | 'templates' | 'guide';
export type Screen = 'dashboard' | 'processing' | 'result';
export type Model = 'claude-haiku-4-5' | 'claude-sonnet-4-6' | 'claude-opus-4-8';
export type PromptMode = 'default' | 'custom';
