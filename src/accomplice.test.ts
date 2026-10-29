import { afterEach, expect, it, vi } from 'vitest';
import { AccompliceSession, compareAccomplices, validUsername } from './accomplice';
import { renderJoint } from './accomplice-ui';
import { jointVerdict } from './accomplice-verdict';
import { InvestigationSession } from './session';
import type { GitHubRepo, Investigation } from './types';

const repo = (overrides: Partial<GitHubRepo> = {}): GitHubRepo => ({ name: 'repo', html_url: 'https://github.com/a/repo', fork: false, archived: false, description: 'Documented', language: 'Rust', pushed_at: '2026-10-01', created_at: '2020-01-01', size: 100, ...overrides });
const sample = (id: number, repos: GitHubRepo[]): Investigation => ({ profile: { id, login: `suspect-${id}`, name: null, avatar_url: '', public_repos: repos.length, created_at: '2020-01-01' }, repos, retrievedAt: '2026-10-29T12:00:00Z' });
const originals = (count: number, bad = 0) => Array.from({ length: count }, (_, i) => repo(i < bad ? { size: 0 } : {}));
afterEach(() => vi.unstubAllGlobals());

it('uses normalized proportions rather than raw counts or repository creation', () => {
  const result = compareAccomplices(sample(1, originals(4, 2)), sample(2, originals(20, 4)));
  expect(result.winner).toBe(0);
  expect(result.scores).toEqual([1000, 400]);
  expect(result.rows.some(r => r.code === 'GC-303')).toBe(false);
  expect(result.suspects[1].charges.some(c => c.code === 'GC-303')).toBe(false);
});
it('gives equal proportions equal scores across different sample sizes', () => {
  const result = compareAccomplices(sample(1, originals(4, 2)), sample(2, originals(100, 50)));
  expect(result.outcome).toBe('tie');
  expect(result.winner).toBeNull();
});
it('assigns deterministic roles independent of input and repository order', () => {
  const a = sample(1, originals(10, 6)), b = sample(2, originals(10, 2));
  expect(compareAccomplices(a, b)).toEqual(compareAccomplices(a, b));
  expect(compareAccomplices(b, a).winner).toBe(1);
  expect(compareAccomplices({ ...a, repos: [...a.repos].reverse() }, b).scores).toEqual(compareAccomplices(a, b).scores);
});
it('keeps ties and insufficient samples unassigned, including empty and fork-only samples', () => {
  for (const repos of [[], originals(2), Array.from({ length: 5 }, () => repo({ fork: true }))]) {
    const result = compareAccomplices(sample(1, repos), sample(2, originals(10, 5)));
    expect(result.outcome).toBe('insufficient');
    expect(result.winner).toBeNull();
    expect(renderJoint(result)).toContain('ROLE UNASSIGNED');
  }
  expect(compareAccomplices(sample(1, originals(5)), sample(2, originals(5))).outcome).toBe('tie');
});
it('excludes incomplete dimensions for both and never counts unknown values as findings', () => {
  const unknown = repo({ language: null, pushed_at: null, description: undefined, size: undefined } as unknown as Partial<GitHubRepo>);
  const result = compareAccomplices(sample(1, [unknown, ...originals(5)]), sample(2, originals(6, 6)));
  expect(result.rows.filter(r => r.comparable).map(r => r.code)).toEqual(['GC-409']);
  expect(result.outcome).toBe('insufficient');
  expect(result.suspects[0].charges).toEqual([]);
  const broken = compareAccomplices(sample(1, [repo({ fork: undefined } as unknown as Partial<GitHubRepo>), ...originals(5)]), sample(2, originals(6)));
  expect(broken.rows.every(r => !r.comparable)).toBe(true);
});
it('reuses eligibility thresholds and filters unknown descriptions before eligibility', () => {
  const result = compareAccomplices(sample(1, [repo({ description: null, language: 'JavaScript' }), repo({ description: '', language: 'TypeScript' }), repo({ description: undefined } as unknown as Partial<GitHubRepo>)]), sample(2, originals(3)));
  expect(result.suspects[0].charges).toEqual([]);
  expect(result.rows.find(r => r.code === 'GC-204')!.counts[0].numerator).toBe(0);
  const eligible = compareAccomplices(sample(1, Array.from({ length: 3 }, () => repo({ description: null }))), sample(2, originals(3)));
  expect(eligible.suspects[0].charges[0].evidence).toContain('3 original');
});
it('shares a clock at the abandonment boundary and excludes archived originals', () => {
  const a = sample(1, Array.from({ length: 3 }, () => repo({ pushed_at: '2025-10-29T12:00:00Z' })));
  const b = { ...sample(2, a.repos), retrievedAt: '2026-10-29T12:00:01Z' };
  expect(compareAccomplices(a, b).outcome).toBe('tie');
  const archived = compareAccomplices(sample(1, Array.from({ length: 3 }, () => repo({ archived: true, pushed_at: '2020-01-01' }))), b);
  expect(archived.rows[0].comparable).toBe(false);
});
it('validates usernames and rejects case-insensitive duplicates without requests', async () => {
  const fetchMock = vi.fn(); vi.stubGlobal('fetch', fetchMock);
  const session = new AccompliceSession();
  for (const bad of ['', '-bad', 'bad-', 'a--b', 'a/b', 'a'.repeat(40)]) {
    expect(validUsername(bad)).toBe(false);
    await expect(session.open(bad, 'other')).rejects.toThrow('valid GitHub');
  }
  await expect(session.open(' Octocat ', 'octocat')).rejects.toThrow('distinct');
  expect(fetchMock).not.toHaveBeenCalled();
});

function mockAccounts(fail?: string, sameId = false) {
  const a = sample(1, originals(5, 3)), b = sample(sameId ? 1 : 2, originals(5));
  return vi.fn(async (url: string) => {
    if (url.includes('/repos?')) return new Response(JSON.stringify(url.includes('/first/') ? a.repos : b.repos));
    if (url.endsWith('/second') && fail) return new Response('', { status: Number(fail) });
    return new Response(JSON.stringify({ ...(url.endsWith('/first') ? a.profile : b.profile), login: url.endsWith('/first') ? 'first' : 'second' }));
  });
}
it('uses four existing API calls, keeps solo presentation isolated, and rejects stale partial results', async () => {
  const fetchMock = mockAccounts(); vi.stubGlobal('fetch', fetchMock);
  const solo = new InvestigationSession();
  await solo.open('first', () => {});
  solo.setIntensity('unhinged'); solo.remix(); solo.submitDefense('not-guilty');
  const before = solo.current();
  const joint = new AccompliceSession();
  const record = await joint.open('first', 'second');
  expect(fetchMock).toHaveBeenCalledTimes(6);
  expect(record.winner).toBe(0);
  expect(solo.current()).toEqual(before);
  vi.stubGlobal('fetch', mockAccounts('404'));
  await expect(joint.open('first', 'second')).rejects.toThrow('@second: Suspect not found');
  expect(joint.current()).toBeUndefined();
  expect(solo.current()).toEqual(before);
});
it('reports rate limits and same-account aliases without issuing a joint verdict', async () => {
  const session = new AccompliceSession();
  for (const status of ['403', '429']) {
    vi.stubGlobal('fetch', mockAccounts(status));
    await expect(session.open('first', 'second')).rejects.toThrow('No joint verdict issued');
    expect(session.current()).toBeUndefined();
  }
  vi.stubGlobal('fetch', mockAccounts(undefined, true));
  await expect(session.open('first', 'second')).rejects.toThrow('same account');
});
it('escapes joint public text and omits solo actions', () => {
  const a = sample(1, originals(5, 3)); a.profile.name = '<script>bad</script>';
  const html = renderJoint(compareAccomplices(a, sample(2, originals(5))));
  expect(html).toContain('&lt;script&gt;');
  expect(html).not.toContain('<script>');
  expect(html).toContain('CRIMINAL MASTERMIND');
  expect(html).toContain('WILLING ACCOMPLICE');
  expect(html).not.toContain('id="export-record"');
  expect(html).not.toContain('id="plea-bargain"');
});
it('rejects repository-only failures and network failures without partial publication', async () => {
  const joint = new AccompliceSession();
  const fetchMock = mockAccounts();
  vi.stubGlobal('fetch', vi.fn((url: string) => url.includes('/second/repos?') ? Promise.resolve(new Response('', { status: 500 })) : fetchMock(url)));
  await expect(joint.open('first', 'second')).rejects.toThrow('@second: GitHub returned HTTP 500');
  expect(joint.current()).toBeUndefined();
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('offline')));
  await expect(joint.open('first', 'second')).rejects.toThrow('Check your network');
  expect(joint.current()).toBeUndefined();
});
it('discloses coverage and withholds scores when evidence is insufficient', () => {
  const a = sample(1, originals(2)); a.profile.public_repos = 200;
  const html = renderJoint(compareAccomplices(a, sample(2, originals(2))));
  expect(html).toContain('2 inspected / 200');
  expect(html).toContain('partial sample');
  expect(html).toContain('Score withheld');
  expect(html).toContain('Missing metadata is not proof of guilt');
});


it('leads with the matchup and verdict and collapses all technical detail', () => {
  const record = compareAccomplices(sample(1, originals(4, 2)), sample(2, originals(20, 4)));
  const html = renderJoint(record);
  const [primary, evidence] = html.split('<details class="joint-method">');
  expect(primary).toContain('CRIMINAL SHOWDOWN');
  expect(primary).toContain('Two suspects. One mastermind.');
  expect(primary).toContain('aria-label="versus"');
  expect(primary).toContain('is-mastermind');
  expect(primary).toContain('is-accomplice');
  expect(primary.indexOf('showdown-matchup')).toBeLessThan(primary.indexOf('THE COURT HAS REACHED A VERDICT'));
  expect(primary).not.toContain('GC-000');
  expect(primary).not.toContain('inspected /');
  expect(primary).not.toContain(' / 100 fictional evidence index');
  expect(evidence).toContain('EXAMINE THE EVIDENCE');
  expect(evidence).toContain('GC-000');
  expect(evidence).toContain('4 inspected / 4');
  expect(html).not.toMatch(/<details[^>]* open/);
});

it('explains the normalized edge using actual counts even when the winner has fewer findings', () => {
  const a = sample(1, originals(4, 2)), b = sample(2, originals(20, 4));
  const verdict = jointVerdict(compareAccomplices(a, b));
  expect(verdict).toContain('@suspect-1 takes CRIMINAL MASTERMIND');
  expect(verdict).toContain('2 of 4 originals report a size of 0 KB');
  expect(verdict).toContain('@suspect-2: 4 of 20');
  expect(verdict).toContain('lightweight exhibit');
  expect(jointVerdict(compareAccomplices(b, a))).toBe(verdict);
});

it('uses a finding-specific payoff for each comparable evidence category', () => {
  const cases: [Partial<GitHubRepo>, string, string][] = [
    [{ pushed_at: '2020-01-01' }, 'no recorded push in over 365 days', 'get back to it'],
    [{ language: 'TypeScript' }, 'TypeScript as their primary language', 'tsconfig'],
    [{ description: null }, 'have no description', 'refusal to elaborate'],
    [{ size: 0 }, 'size of 0 KB', 'lightweight exhibit'],
  ];
  for (const [change, fact, joke] of cases) {
    const a = sample(1, Array.from({ length: 5 }, () => repo(change)));
    const verdict = jointVerdict(compareAccomplices(a, sample(2, originals(5))));
    expect(verdict).toContain(fact);
    expect(verdict).toContain(joke);
  }
  const forks = sample(1, [...originals(5), ...Array.from({ length: 5 }, () => repo({ fork: true }))]);
  const verdict = jointVerdict(compareAccomplices(forks, sample(2, originals(10))));
  expect(verdict).toContain('5 of 10 inspected repositories are forks');
  expect(verdict).toContain('fork button');
});

it('does not describe below-threshold or excluded evidence as absent or decisive', () => {
  const a = sample(1, Array.from({ length: 3 }, () => repo({ language: 'JavaScript' })));
  const b = sample(2, [repo({ language: 'JavaScript' }), repo({ language: 'TypeScript' }), repo()]);
  const verdict = jointVerdict(compareAccomplices(a, b));
  expect(verdict).toContain('no eligible charge in that category');
  expect(verdict).toContain('below-threshold findings are not counted');
  expect(verdict).not.toContain('0 of 3');
  const unknown = sample(2, Array.from({ length: 3 }, () => repo({ language: null })));
  expect(compareAccomplices(a, unknown).outcome).toBe('tie');
  expect(jointVerdict(compareAccomplices(a, unknown))).not.toContain('tsconfig');
});

it('makes ties and insufficient evidence visually explicit without role assignment', () => {
  const records = [
    compareAccomplices(sample(1, originals(4, 2)), sample(2, originals(8, 4))),
    compareAccomplices(sample(1, originals(4)), sample(2, originals(4))),
    compareAccomplices(sample(1, []), sample(2, originals(5))),
  ];
  for (const record of records) {
    const primary = renderJoint(record).split('<details class="joint-method">')[0];
    expect(primary).toContain('NO MASTERMIND');
    expect(primary).not.toContain('is-mastermind');
    expect(primary).not.toContain('WILLING ACCOMPLICE');
    expect(primary.match(/ROLE UNASSIGNED/g)).toHaveLength(2);
    expect(jointVerdict(record).toLowerCase()).toContain('both roles stay unassigned');
  }
});

it('uses allowlisted avatars and escapes long public names in the showdown', () => {
  const a = sample(1, originals(5, 3));
  a.profile.login = 'a'.repeat(39);
  a.profile.name = '<img src=x onerror=bad>';
  a.profile.avatar_url = 'https://avatars.githubusercontent.com/u/1?v=4&size=176';
  const b = sample(2, originals(5)); b.profile.avatar_url = 'https://untrusted.example/avatar';
  const html = renderJoint(compareAccomplices(a, b));
  expect(html).toContain('width="176" height="176"');
  expect(html).toContain('v=4&amp;size=176');
  expect(html).toContain('referrerpolicy="no-referrer"');
  expect(html).not.toContain('untrusted.example');
  expect(html).toContain('@' + 'a'.repeat(39));
  expect(html).not.toContain('<img src=x');
  expect(html).toContain('&lt;img src=x onerror=bad&gt;');
  a.profile.avatar_url = 'javascript:alert(1)';
  expect(renderJoint(compareAccomplices(a, b))).not.toContain('javascript:');
});
