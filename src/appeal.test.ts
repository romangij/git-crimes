import { afterEach, expect, it, vi } from 'vitest';
import { DEFENSES, generateAppeal, isDefense } from './appeal';
import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { INTENSITIES } from './intensity';
import { InvestigationSession } from './session';
import { renderAppeal, renderRecord } from './ui';
import { buildExportDocument } from './export-record';
import { APPEAL_TEMPLATES } from './appeal-templates';
import type { Charge, GitHubRepo, Investigation } from './types';

const data: Investigation = {
  profile: { login: 'suspect', id: 42, name: null, avatar_url: '', public_repos: 1, created_at: '2020-01-01' },
  repos: [{ name: 'project', html_url: '', fork: false, archived: false, description: 'A project', language: 'Rust', pushed_at: '2020-01-01', created_at: '2020-01-01', size: 50 }],
  retrievedAt: '2026-10-28T12:00:00Z',
};
const date = new Date(data.retrievedAt);
const evidence = analyzeEvidence(data.repos, date);
const record = generateRecord(data.profile, evidence, date);
function mockInvestigation() {
  const fetchMock = vi.fn().mockImplementation((url: string) => Promise.resolve(new Response(JSON.stringify(url.includes('/repos?') ? data.repos : data.profile))));
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}
afterEach(() => vi.unstubAllGlobals());

function expectGrounded(judge: string, charge: Charge) {
  const count = String(charge.repos.length);
  expect(judge).toContain(count);
  expect(judge).toContain('sample');
  const facts = {
    'GC-101': [/non-archived/, /original/, /no recorded push/, /over 365 days/],
    'GC-204': [/original/, /JavaScript or TypeScript/, /primary language/],
    'GC-303': [/original/, /repos/],
    'GC-404': [/original/, /description/],
    'GC-409': [/forks/],
    'GC-000': [/original/, /0 KB/, /size/],
  };
  for (const fact of facts[charge.code]) expect(judge).toMatch(fact);
  const allowed = new Set([count, ...(charge.code === 'GC-101' ? ['365'] : []), ...(charge.code === 'GC-000' ? ['0'] : [])]);
  for (const number of judge.match(/\d+/g) ?? []) expect(allowed.has(number)).toBe(true);
}


for (const defense of DEFENSES) {
  it(`${defense.statement}: deterministic, evidence-aware responses across modes`, () => {
    const judges = new Set<string>();
    for (const mode of INTENSITIES) {
      const current = generateRecord(data.profile, evidence, date, mode.value);
      const appeal = generateAppeal(current, defense.value);
      expect(appeal.statement).toBe(defense.statement);
      expect(appeal.ruling).toBe('APPEAL DENIED.');
      expectGrounded(appeal.judge, current.charges[0]);
      expect(appeal).toEqual(generateAppeal(current, defense.value));
      judges.add(appeal.judge);
    }
    expect(judges.size).toBe(3);
  });
}

it('uses actual evidence for every charge without inventing numerical facts', () => {
  const repos: GitHubRepo[] = [...Array.from({ length: 10 }, () => ({ ...data.repos[0], description: null, language: 'JavaScript', size: 0 })), ...Array.from({ length: 5 }, () => ({ ...data.repos[0], fork: true }))];
  const current = generateRecord(data.profile, analyzeEvidence(repos, date), date);
  expect(current.charges).toHaveLength(6);
  for (const charge of current.charges) for (const defense of DEFENSES) {
    const appeal = generateAppeal({ ...current, charges: [charge] }, defense.value);
    expectGrounded(appeal.judge, charge);
  }
});

it('falls back sensibly for empty and below-threshold profiles without implying guilt', () => {
  for (const repos of [[], [{ ...data.repos[0], pushed_at: data.retrievedAt }]]) {
    for (const mode of INTENSITIES) for (let edition = 0; edition < 3; edition++) {
      const current = generateRecord(data.profile, analyzeEvidence(repos, date), date, mode.value, edition);
      expect(current.charges).toEqual([]);
      for (const defense of DEFENSES) {
        const appeal = generateAppeal(current, defense.value, edition);
        expect(appeal.judge).toContain('No charge thresholds were met');
        expect(appeal.judge).toContain('Your clearance stands');
        expect(appeal.judge).not.toMatch(/\d/);
        expect(appeal.judge.match(/[.!?](?:\s|$)/g)?.length).toBeLessThanOrEqual(2);
      }
    }
  }
});

it('provides multiple repeatable response variants for each defense', () => {
  for (const defense of DEFENSES) {
    const responses = Array.from({ length: 30 }, (_, id) => generateAppeal({ ...record, caseId: `GCPD-${id}` }, defense.value).judge);
    expect(new Set(responses).size).toBe(3);
  }
  expect(isDefense('intern')).toBe(true);
  expect(isDefense('invalid')).toBe(false);
});

it('keeps all charge-specific replies concise, grounded, and free of generic fact appendices', () => {
  const repos: GitHubRepo[] = [...Array.from({ length: 17 }, () => ({ ...data.repos[0], description: null, language: 'JavaScript', size: 0 })), ...Array.from({ length: 5 }, () => ({ ...data.repos[0], fork: true }))];
  const current = generateRecord(data.profile, analyzeEvidence(repos, date), date);
  expect(Object.keys(APPEAL_TEMPLATES)).toHaveLength(current.charges.length);
  for (const charge of current.charges) for (const mode of INTENSITIES) for (const defense of DEFENSES) {
    const replies = [];
    for (let edition = 0; edition < 3; edition++) {
      const appeal = generateAppeal({ ...current, intensity: mode.value, charges: [charge] }, defense.value, edition);
      expectGrounded(appeal.judge, charge);
      expect(appeal.judge).not.toContain(charge.evidence);
      expect(appeal.judge).not.toMatch(/duck|galax|scapegoat injection|the evidence shows|public exhibit:|public metadata:|\{\w+\}/i);
      expect(appeal.judge.length).toBeLessThan(360);
      expect(appeal.judge.match(/[.!?](?:\s|$)/g)?.length).toBeLessThanOrEqual(2);
      replies.push(appeal.judge);
    }
    expect(new Set(replies).size).toBe(3);
  }
});

it('weaves each defense into a recognizable, different evidence-specific punchline', () => {
  const premise = {
    'not-guilty': /plea|innocence|alibi/i,
    'my-machine': /machine|local|laptop|code was executed|code\. Please/i,
    intern: /intern|scapegoat|blame/i,
  };
  for (const mode of INTENSITIES) for (let edition = 0; edition < 3; edition++) {
    const current = generateRecord(data.profile, evidence, date, mode.value, edition);
    const appeals = DEFENSES.map(defense => generateAppeal(current, defense.value, edition));
    expect(new Set(appeals.map(appeal => appeal.judge)).size).toBe(3);
    const openings = appeals.map(appeal => appeal.judge);
    expect(new Set(openings.map(opening => opening.slice(0, 60))).size).toBe(3);
    for (const [index, appeal] of appeals.entries()) {
      expect(openings[index]).toMatch(premise[appeal.defense]);
      expectGrounded(appeal.judge, current.charges[0]);
      expect(appeal).toEqual(generateAppeal(current, appeal.defense, edition));
    }
  }
});

it('cycles judge wording on every reissue for every defense, then repeats after three editions', async () => {
  const fetchMock = mockInvestigation();
  for (const mode of INTENSITIES) for (const defense of DEFENSES) {
    const session = new InvestigationSession();
    session.setIntensity(mode.value);
    await session.open('suspect', vi.fn());
    const appeals = [];
    for (let edition = 0; edition < 4; edition++) {
      expect(session.current()!.appeal).toBeUndefined();
      const appeal = session.submitDefense(defense.value)!;
      expect(appeal.defense).toBe(defense.value);
      expect(appeal.statement).toBe(defense.statement);
      expectGrounded(appeal.judge, session.current()!.record.charges[0]);
      appeals.push(appeal);
      session.remix();
    }
    expect(new Set(appeals.slice(0, 3).map(appeal => appeal.judge)).size).toBe(3);
    expect(appeals[3]).toEqual(appeals[0]);
  }
  expect(fetchMock).toHaveBeenCalledTimes(18); // Two requests per case; none for appeals/reissues.
});

it('propagates the three rendered defense identifiers through successive reissued sentences', async () => {
  const fetchMock = mockInvestigation();
  const session = new InvestigationSession();
  await session.open('suspect', vi.fn());
  const identifiers = [...renderAppeal().matchAll(/data-defense="([^"]+)"/g)].map(match => match[1]);
  expect(identifiers).toEqual(DEFENSES.map(defense => defense.value));
  const replies = [];
  for (const identifier of identifiers) {
    expect(isDefense(identifier)).toBe(true);
    if (!isDefense(identifier)) throw new Error('Unrecognized rendered defense');
    const appeal = session.submitDefense(identifier)!;
    expect(appeal.defense).toBe(identifier);
    const html = renderAppeal(appeal);
    expect(html).toContain(appeal.statement);
    expect(html).toContain('disabled');
    replies.push(appeal.judge);
    session.remix();
  }
  expect(new Set(replies).size).toBe(3);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('allows only one appeal per sentence with no extra requests or PNG changes', async () => {
  const fetchMock = mockInvestigation();
  const session = new InvestigationSession();
  expect(session.submitDefense('not-guilty')).toBeUndefined();
  const before = (await session.open('suspect', vi.fn()))!;
  const png = buildExportDocument(before.data, before.record);
  const first = session.submitDefense('not-guilty');
  expect(session.submitDefense('intern')).toBe(first);
  const after = session.current()!;
  expect(after.appeal?.defense).toBe('not-guilty');
  expect(after.record).toEqual(before.record);
  expect(after.evidence).toBe(before.evidence);
  expect(buildExportDocument(after.data, after.record)).toEqual(png);
  expect(fetchMock).toHaveBeenCalledTimes(2);
});

it('resets appeals on changed mode, every reissue, and new investigations', async () => {
  const fetchMock = mockInvestigation();
  const session = new InvestigationSession();
  await session.open('suspect', vi.fn());
  const first = session.submitDefense('intern');
  session.setIntensity('felony'); // Selecting the same mode is not a new sentence.
  expect(session.current()!.appeal).toBe(first);
  session.setIntensity('friendly');
  expect(session.current()!.appeal).toBeUndefined();
  expect(session.submitDefense('my-machine')?.statement).toBe('IT WORKS ON MY MACHINE');
  for (let edition = 0; edition < 3; edition++) {
    session.remix();
    expect(session.current()!.appeal).toBeUndefined();
    session.submitDefense('not-guilty');
  }
  expect(fetchMock).toHaveBeenCalledTimes(2);
  await session.open('suspect', vi.fn()); // Same username still issues a fresh sentence.
  expect(session.current()!.appeal).toBeUndefined();
  expect(fetchMock).toHaveBeenCalledTimes(4);
});

it('renders the hearing after the sentence and locks all defenses after submission', () => {
  const html = renderRecord(data, evidence, record);
  expect(html.indexOf('id="plea-bargain"')).toBeGreaterThan(html.indexOf('id="sentence-heading"'));
  expect(html).toContain('THE DEFENDANT HAS THE RIGHT TO REMAIN SILENT');
  expect(html).toContain('Unfortunately, the defendant has chosen to speak.');
  const appeal = generateAppeal(record, 'intern');
  const transcript = renderAppeal(appeal);
  expect(transcript.match(/ disabled/g)).toHaveLength(3);
  expect(transcript).toContain('DEFENDANT &gt;');
  expect(transcript).toContain('JUDGE &gt;');
  expect(transcript).toContain('APPEAL DENIED.');
  expect(renderAppeal()).not.toContain('disabled');
  expect(renderAppeal({ ...appeal, judge: '<script>oops</script>' })).toContain('&lt;script&gt;');
});
