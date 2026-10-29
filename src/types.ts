export interface GitHubProfile {
  login: string;
  id: number;
  avatar_url: string;
  name: string | null;
  public_repos: number;
  created_at: string;
}

export interface GitHubRepo {
  name: string;
  html_url: string;
  fork: boolean;
  archived: boolean;
  description: string | null;
  language: string | null;
  pushed_at: string | null;
  created_at: string;
  size: number;
}

export interface Investigation { profile: GitHubProfile; repos: GitHubRepo[]; retrievedAt: string }
export interface Evidence {
  total: number;
  originals: GitHubRepo[];
  abandoned: GitHubRepo[];
  javascript: GitHubRepo[];
  undescribed: GitHubRepo[];
  forks: GitHubRepo[];
  empty: GitHubRepo[];
}
export type Intensity = 'friendly' | 'felony' | 'unhinged';
export type ChargeCode = 'GC-101' | 'GC-204' | 'GC-303' | 'GC-404' | 'GC-409' | 'GC-000';
export interface EligibleCharge { code: ChargeCode; evidence: string; repos: GitHubRepo[]; severity: 'MISDEMEANOR' | 'FELONY' }
export interface Charge extends EligibleCharge { title: string; joke: string }
export interface CriminalRecord { caseId: string; intensity: Intensity; charges: Charge[]; verdict: string; sentence: string; commentary: string }
