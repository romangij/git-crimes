import { analyzeEvidence } from './evidence';
import { eligibleCharges } from './eligibility';
import { investigate } from './github';
import type { ChargeCode, GitHubRepo, Investigation } from './types';

export const validUsername = (value: string) => /^[a-z\d](?:[a-z\d-]{0,37}[a-z\d])?$/i.test(value) && !value.includes('--');
const dimensions: { code: ChargeCode; label: string; relevant: (r: GitHubRepo) => boolean; known: (r: GitHubRepo) => boolean }[] = [
  { code: 'GC-101', label: 'Stale non-archived originals', relevant: r => !r.fork && !r.archived, known: r => typeof r.archived === 'boolean' && typeof r.pushed_at === 'string' && Number.isFinite(Date.parse(r.pushed_at)) },
  { code: 'GC-204', label: 'JavaScript / TypeScript originals', relevant: r => !r.fork, known: r => typeof r.language === 'string' },
  { code: 'GC-404', label: 'Undescribed originals', relevant: r => !r.fork, known: r => r.description === null || typeof r.description === 'string' },
  { code: 'GC-409', label: 'Forks', relevant: () => true, known: () => true },
  { code: 'GC-000', label: 'Zero-KB originals', relevant: r => !r.fork, known: r => typeof r.size === 'number' && Number.isFinite(r.size) && r.size >= 0 },
];

export function compareAccomplices(left: Investigation, right: Investigation) {
  // One common clock avoids order-dependent abandonment boundaries.
  const now = new Date(Math.max(Date.parse(left.retrievedAt), Date.parse(right.retrievedAt)));
  const suspects = [left, right].map(data => {
    // Missing structural metadata cannot establish an original or a fork.
    const repos = data.repos.filter(r => typeof r.fork === 'boolean');
    const evidence = analyzeEvidence(repos, now);
    const known = (code: ChargeCode, r: GitHubRepo) => dimensions.find(d => d.code === code)!.known(r);
    evidence.abandoned = evidence.abandoned.filter(r => known('GC-101', r));
    evidence.javascript = evidence.javascript.filter(r => known('GC-204', r));
    evidence.undescribed = evidence.undescribed.filter(r => known('GC-404', r));
    evidence.empty = evidence.empty.filter(r => known('GC-000', r));
    const charges = eligibleCharges(evidence).filter(c => c.code !== 'GC-303');
    return { data, charges };
  });
  const rows = dimensions.map(d => {
    const counts = suspects.map(({ data, charges }) => {
      const relevant = data.repos.filter(d.relevant);
      const complete = data.repos.every(r => typeof r.fork === 'boolean') && (d.code !== 'GC-101' || data.repos.filter(r => !r.fork).every(r => typeof r.archived === 'boolean')) && relevant.every(d.known);
      return { numerator: charges.find(c => c.code === d.code)?.repos.length ?? 0, denominator: relevant.length, complete };
    });
    return { code: d.code, label: d.label, counts, comparable: counts.every(c => c.complete && c.denominator >= 3) };
  });
  const shared = rows.filter(r => r.comparable);
  // Integer basis points make the displayed scores and tie decision identical.
  const scores = suspects.map((_, i) => shared.length ? Math.round(shared.reduce((sum, r) => sum + r.counts[i].numerator / r.counts[i].denominator, 0) / shared.length * 10000) : 0);
  const insufficient = shared.length < 2 || left.profile.id === right.profile.id || !Number.isFinite(now.getTime());
  const winner = insufficient || scores[0] === scores[1] ? null : scores[0] > scores[1] ? 0 : 1;
  return { suspects, rows, scores, winner, outcome: insufficient ? 'insufficient' : winner === null ? 'tie' : 'assigned' };
}
export type JointRecord = ReturnType<typeof compareAccomplices>;

/** Separate from solo state. A failed request never publishes a partial verdict. */
export class AccompliceSession {
  private record?: JointRecord;
  current() { return this.record; }
  async open(first: string, second: string) {
    this.record = undefined;
    const names = [first.trim(), second.trim()];
    if (!names.every(validUsername)) throw new Error('Enter two valid GitHub usernames (letters, numbers, single hyphens; up to 39 characters).');
    if (names[0].toLowerCase() === names[1].toLowerCase()) throw new Error('Two distinct suspects required. You cannot be your own accomplice.');
    const results = await Promise.allSettled(names.map(name => investigate(name, () => {})));
    const failures = results.flatMap((r, i) => r.status === 'rejected' ? [`@${names[i]}: ${r.reason instanceof Error ? r.reason.message : 'Investigation interrupted.'}`] : []);
    if (failures.length) throw new Error(`${failures.join(' ')} No joint verdict issued. Retry both suspects.`);
    const [a, b] = results.map(r => (r as PromiseFulfilledResult<Investigation>).value);
    if (a.profile.id === b.profile.id || a.profile.login.toLowerCase() === b.profile.login.toLowerCase()) throw new Error('Both usernames resolve to the same account. Choose two distinct suspects.');
    this.record = compareAccomplices(a, b);
    return this.record;
  }
}
