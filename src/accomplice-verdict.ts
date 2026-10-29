import type { JointRecord } from './accomplice';
import type { ChargeCode } from './types';

const findings: Partial<Record<ChargeCode, { fact: string; punchline: string }>> = {
  'GC-101': { fact: 'non-archived originals have no recorded push in over 365 days', punchline: 'The court recognizes a long-term commitment to “I’ll get back to it.”' },
  'GC-204': { fact: 'originals list JavaScript or TypeScript as their primary language', punchline: 'The court asked for a statement. Counsel requested a tsconfig first.' },
  'GC-404': { fact: 'originals have no description', punchline: '“The code speaks for itself” has been entered as a refusal to elaborate.' },
  'GC-409': { fact: 'inspected repositories are forks', punchline: 'The fork button has been called as a character witness. It knows the defendant well.' },
  'GC-000': { fact: 'originals report a size of 0 KB', punchline: 'The court ordered a deliverable and received a remarkably lightweight exhibit.' },
};

/** Presentation only: explain the largest positive contribution to the existing index. */
export function jointVerdict(record: JointRecord): string {
  if (record.outcome === 'insufficient') return 'The court cannot name a mastermind on this evidence. There is not enough comparable public metadata to assign either role. “Trust me, it works locally” remains inadmissible. Both roles stay unassigned.';
  if (record.outcome === 'tie') {
    const clean = record.scores.every(score => score === 0);
    return clean
      ? 'No eligible findings in the shared comparison. The prosecution brought two usernames and no punchline strong enough to convict. No mastermind; both roles stay unassigned.'
      : 'Equal fictional evidence indices. The court has reviewed the diff and cannot approve a lead suspect. No tie-break by alphabetical order: both roles stay unassigned.';
  }
  const winner = record.winner!;
  const other = 1 - winner;
  const lead = record.rows.filter(row => row.comparable).reduce<JointRecord['rows'][number] | undefined>((best, row) => {
    const edge = (r: typeof row) => r.counts[winner].numerator / r.counts[winner].denominator - r.counts[other].numerator / r.counts[other].denominator;
    return !best || edge(row) > edge(best) ? row : best;
  }, undefined)!;
  const finding = findings[lead.code]!;
  const a = lead.counts[winner], b = lead.counts[other];
  const contrast = b.numerator > 0
    ? `@${record.suspects[other].data.profile.login}: ${b.numerator} of ${b.denominator} in the same category.`
    : `@${record.suspects[other].data.profile.login} has no eligible charge in that category; below-threshold findings are not counted.`;
  return `@${record.suspects[winner].data.profile.login} takes CRIMINAL MASTERMIND in this fictional showdown with the higher overall index. The strongest edge: ${a.numerator} of ${a.denominator} ${finding.fact}. ${contrast} ${finding.punchline}`;
}
