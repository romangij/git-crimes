import { expect, it } from 'vitest';
import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { escapeHtml } from './ui';
import type { GitHubProfile, GitHubRepo } from './types';
const now = new Date('2026-10-28T12:00:00Z');
const profile: GitHubProfile = { login: 'suspect', id: 42, avatar_url: '', name: null, public_repos: 0, created_at: '2020-01-01' };
const repo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({ name: 'project', html_url: 'https://github.com/suspect/project', fork: false, archived: false, description: 'A project', language: 'Rust', pushed_at: '2026-10-27T12:00:00Z', created_at: '2020-01-01', size: 100, ...overrides });
it('excludes forks from original-repository charges', () => {
  const evidence = analyzeEvidence([repo({ fork: true, language: 'JavaScript', description: null, size: 0, pushed_at: '2020-01-01' })], now);
  expect(evidence.forks).toHaveLength(1);
  for (const key of ['originals', 'abandoned', 'javascript', 'undescribed', 'empty'] as const) expect(evidence[key]).toHaveLength(0);
});
it('handles abandonment boundaries, archived repositories, and unknown push dates', () => {
  const evidence = analyzeEvidence([repo({ archived: true, pushed_at: '2020-01-01' }), repo({ pushed_at: null }), repo({ pushed_at: 'invalid' }), repo({ pushed_at: '2025-10-28T12:00:00Z' }), repo({ name: 'stale', pushed_at: '2025-10-28T11:59:59Z' })], now);
  expect(evidence.abandoned.map(item => item.name)).toEqual(['stale']);
});
it('uses primary languages and treats whitespace descriptions as absent', () => {
  const evidence = analyzeEvidence([repo({ language: 'JavaScript', description: '  ' }), repo({ language: 'TypeScript' }), repo({ language: null })], now);
  expect(evidence.javascript).toHaveLength(2);
  expect(evidence.undescribed).toHaveLength(1);
});
it('clears empty accounts and accounts with no supported charges', () => {
  for (const repos of [[], [repo()]]) {
    const record = generateRecord(profile, analyzeEvidence(repos, now), now);
    expect(record.charges).toEqual([]);
    expect(record.verdict).toContain('Insufficient evidence');
  }
});
it('does not issue charges below thresholds', () => {
  const repos = [repo({ language: 'JavaScript', description: null }), repo({ language: 'TypeScript', description: null }), ...Array.from({ length: 4 }, () => repo({ fork: true }))];
  expect(generateRecord(profile, analyzeEvidence(repos, now), now).charges).toEqual([]);
});
it('generates six supported charges with actual receipts and deterministic IDs', () => {
  const repos = [...Array.from({ length: 10 }, (_, i) => repo({ name: `original-${i}`, language: 'JavaScript', description: null, pushed_at: '2020-01-01', size: 0 })), ...Array.from({ length: 5 }, (_, i) => repo({ name: `fork-${i}`, fork: true }))];
  const evidence = analyzeEvidence(repos, now);
  const record = generateRecord(profile, evidence, now);
  expect(record).toEqual(generateRecord(profile, evidence, now));
  expect(record.caseId).toBe('GCPD-20261028-42');
  expect(record.charges).toHaveLength(6);
  for (const charge of record.charges) {
    expect(charge.repos.length).toBeGreaterThan(0);
    expect(charge.evidence).toContain(String(charge.repos.length));
    expect(charge.repos.every(item => repos.includes(item))).toBe(true);
  }
});
it('escapes untrusted text', () => {
  expect(escapeHtml('<img onerror="oops">&')).toBe('&lt;img onerror=&quot;oops&quot;&gt;&amp;');
});
