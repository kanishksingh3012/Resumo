import type { ResumeFile, Template, Prompt, Company } from './types';

export interface StoredApiKey {
  provider: 'anthropic';
  key: string;
}

export const KEYS = {
  apiKey:          'resumo_api_key',
  resume:          'resumo_resume',
  activeTemplate:  'resumo_active_template',
  templates:       'resumo_templates',
  prompts:         'resumo_prompts',
  companies:       'resumo_companies',
  bannerDismissed: 'resumo_banner_dismissed',
} as const;

type StorageKey = (typeof KEYS)[keyof typeof KEYS];

export function load<T>(key: StorageKey, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : (JSON.parse(raw) as T);
  } catch {
    return fallback;
  }
}

export function save(key: StorageKey, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable — nothing useful to do
  }
}

export function remove(key: StorageKey): void {
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

export function clearAll(): void {
  Object.values(KEYS).forEach(remove);
}

export interface BackupShape {
  app: 'resumo';
  version: 1;
  exportedAt: string;
  data: {
    apiKey: StoredApiKey | null;
    resume: ResumeFile | null;
    activeTemplate: string | null;
    templates: Template[] | null;
    prompts: Prompt[] | null;
    companies: Company[] | null;
  };
}

export function exportAll(): string {
  const backup: BackupShape = {
    app: 'resumo',
    version: 1,
    exportedAt: new Date().toISOString(),
    data: {
      apiKey:         load<StoredApiKey | null>(KEYS.apiKey, null),
      resume:         load<ResumeFile | null>(KEYS.resume, null),
      activeTemplate: load<string | null>(KEYS.activeTemplate, null),
      templates:      load<Template[] | null>(KEYS.templates, null),
      prompts:        load<Prompt[] | null>(KEYS.prompts, null),
      companies:      load<Company[] | null>(KEYS.companies, null),
    },
  };
  return JSON.stringify(backup, null, 2);
}

export function importAll(json: string): void {
  const parsed = JSON.parse(json) as BackupShape;
  if (parsed?.app !== 'resumo' || parsed?.version !== 1 || typeof parsed.data !== 'object') {
    throw new Error('Not a valid Resumo backup file.');
  }
  const { data } = parsed;
  if (data.apiKey !== null && data.apiKey !== undefined)                 save(KEYS.apiKey, data.apiKey);
  if (data.resume !== null && data.resume !== undefined)                 save(KEYS.resume, data.resume);
  if (data.activeTemplate !== null && data.activeTemplate !== undefined) save(KEYS.activeTemplate, data.activeTemplate);
  if (data.templates !== null && data.templates !== undefined)           save(KEYS.templates, data.templates);
  if (data.prompts !== null && data.prompts !== undefined)               save(KEYS.prompts, data.prompts);
  if (data.companies !== null && data.companies !== undefined)           save(KEYS.companies, data.companies);
}
