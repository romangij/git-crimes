import { afterEach, expect, it, vi } from 'vitest';
import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { eligibleCharges } from './eligibility';
import { INTENSITIES } from './intensity';
import { InvestigationSession } from './session';
import { renderRecord, shell } from './ui';
import type { GitHubProfile, GitHubRepo } from './types';

const date = new Date('2026-10-28T12:00:00Z');
const profile: GitHubProfile = { login: 'suspect', id: 42, avatar_url: '', name: null, public_repos: 15, created_at: '2020-01-01' };
const repo: GitHubRepo = { name: 'project', html_url: 'https://github.com/suspect/project', fork: false, archived: false, description: null, language: 'JavaScript', pushed_at: '2020-01-01', created_at: '2020-01-01', size: 0 };
const repos = [...Array.from({ length: 10 }, (_, i) => ({ ...repo, name: `original-${i}` })), ...Array.from({ length: 5 }, (_, i) => ({ ...repo, name: `fork-${i}`, fork: true }))];
const evidence = analyzeEvidence(repos, date);
afterEach(() => vi.unstubAllGlobals());

it('defaults to felony with selectable modes before investigating', () => {
  expect(generateRecord(profile, evidence, date).intensity).toBe('felony');
  expect(shell()).toContain('value="felony" checked');
  for (const mode of INTENSITIES) expect(shell()).toContain(mode.label);
});

it('keeps every fact, receipt, eligibility, severity, and case ID identical across modes', () => {
  const facts = eligibleCharges(evidence);
  const records = INTENSITIES.map(mode => generateRecord(profile, evidence, date, mode.value));
  for (const record of records) {
    expect(record.charges.map(({ title, joke, ...fact }) => fact)).toEqual(facts);
    expect(record.caseId).toBe('GCPD-20261028-42');
  }
  expect(new Set(records.map(record => record.verdict)).size).toBe(3);
  expect(new Set(records.map(record => record.sentence)).size).toBe(3);
  for (let i = 0; i < facts.length; i++) {
    expect(new Set(records.map(record => record.charges[i].title)).size).toBe(3);
    expect(new Set(records.map(record => record.charges[i].joke)).size).toBe(3);
  }
});

for (const mode of INTENSITIES) {
  it(`${mode.label}: has three deterministic editions without changing evidence`, () => {
    const records = [0, 1, 2].map(edition => generateRecord(profile, evidence, date, mode.value, edition));
    expect(new Set(records.map(record => record.verdict)).size).toBe(3);
    expect(new Set(records.map(record => record.sentence)).size).toBe(3);
    for (let i = 0; i < 6; i++) expect(new Set(records.map(record => record.charges[i].joke)).size).toBe(3);
    for (let i = 0; i < 3; i++) expect(records[i]).toEqual(generateRecord(profile, evidence, date, mode.value, i));
    expect(generateRecord(profile, evidence, date, mode.value, 3)).toEqual(records[0]);
  });

  it(`${mode.label}: entertains zero and few-repo profiles without inventing charges`, () => {
    const few = [{ ...repo, description: 'A project', language: 'Rust', size: 50, pushed_at: date.toISOString() }];
    const records = [[], few].map(sample => {
      const e = analyzeEvidence(sample, date);
      const record = generateRecord(profile, e, date, mode.value);
      expect(record.charges).toEqual([]);
      expect(record.verdict).toContain('Insufficient evidence');
      const html = renderRecord({ profile, repos: sample, retrievedAt: date.toISOString() }, e, record);
      expect(html).toContain('CLEARED');
      expect(html).toContain(record.commentary);
      expect(html).toContain('REISSUE ROAST');
      return record;
    });
    expect(records[0].commentary).not.toBe(records[1].commentary);
  });
}

it('switches and reissues with no additional requests, retaining the same snapshot', async () => {
  const fetchMock = vi.fn().mockResolvedValueOnce(new Response(JSON.stringify(profile))).mockResolvedValueOnce(new Response(JSON.stringify(repos)));
  vi.stubGlobal('fetch', fetchMock);
  const session = new InvestigationSession();
  expect(session.setIntensity('friendly')).toBeUndefined();
  expect(fetchMock).not.toHaveBeenCalled();
  const initial = (await session.open('suspect', vi.fn()))!;
  expect(initial.record.intensity).toBe('friendly');
  for (const mode of INTENSITIES) {
    const switched = session.setIntensity(mode.value)!;
    expect(switched.data).toBe(initial.data);
    expect(switched.evidence).toBe(initial.evidence);
    expect(switched.record.intensity).toBe(mode.value);
    for (let i = 0; i < 3; i++) session.remix();
    expect(session.current()!.record).toEqual(switched.record);
  }
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('escapes humor and keeps factual evidence visibly separate in rendering', () => {
  const record = generateRecord(profile, evidence, date);
  record.charges[0].joke = '<script>alert(1)</script>';
  const html = renderRecord({ profile, repos, retrievedAt: date.toISOString() }, evidence, record);
  expect(html).not.toContain('<script>');
  expect(html).toContain('&lt;script&gt;');
  expect(html).toContain('EVIDENCE:</strong>');
  expect(html).toContain('name="intensity-after"');
});

it('uses the latest mode during loading and refreshes evidence only on a new investigation', async () => {
  let finishProfile!: (response: Response) => void;
  const fetchMock = vi.fn()
    .mockImplementationOnce(() => new Promise<Response>(resolve => { finishProfile = resolve; }))
    .mockResolvedValueOnce(new Response(JSON.stringify(repos)))
    .mockResolvedValueOnce(new Response(JSON.stringify({ ...profile, login: 'another', id: 99, public_repos: 0 })))
    .mockResolvedValueOnce(new Response('[]'));
  vi.stubGlobal('fetch', fetchMock);
  const session = new InvestigationSession();
  const pending = session.open('suspect', vi.fn());
  session.setIntensity('unhinged');
  finishProfile(new Response(JSON.stringify(profile)));
  const first = (await pending)!;
  expect(first.record.intensity).toBe('unhinged');
  session.remix();
  const next = (await session.open('another', vi.fn()))!;
  expect(fetchMock).toHaveBeenCalledTimes(4);
  expect(next.data.profile.login).toBe('another');
  expect(next.evidence.total).toBe(0);
  expect(next.record.charges).toEqual([]);
  expect(next.record).toEqual(generateRecord(next.data.profile, next.evidence, new Date(next.data.retrievedAt), 'unhinged', 0));
});
