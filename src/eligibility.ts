import type { EligibleCharge, Evidence } from './types';

/** Facts and eligibility only. Roast mode never changes these findings. */
export function eligibleCharges(e: Evidence): EligibleCharge[] {
  const charges: EligibleCharge[] = [];
  if (e.abandoned.length >= 1) charges.push({ code: 'GC-101', evidence: `${e.abandoned.length} non-archived, original repositories have no recorded push in over 365 days.`, repos: e.abandoned, severity: 'FELONY' });
  if (e.javascript.length >= 3) charges.push({ code: 'GC-204', evidence: `${e.javascript.length} original repositories list JavaScript or TypeScript as their primary language.`, repos: e.javascript, severity: 'FELONY' });
  if (e.originals.length >= 10) charges.push({ code: 'GC-303', evidence: `${e.originals.length} original repositories in the inspected sample.`, repos: e.originals, severity: 'MISDEMEANOR' });
  if (e.undescribed.length >= 3) charges.push({ code: 'GC-404', evidence: `${e.undescribed.length} original repositories have no description.`, repos: e.undescribed, severity: 'MISDEMEANOR' });
  if (e.forks.length >= 5) charges.push({ code: 'GC-409', evidence: `${e.forks.length} forks in the inspected sample.`, repos: e.forks, severity: 'MISDEMEANOR' });
  if (e.empty.length >= 1) charges.push({ code: 'GC-000', evidence: `${e.empty.length} original repositories report a size of 0 KB. Size is GitHub metadata, not a file inspection.`, repos: e.empty, severity: 'MISDEMEANOR' });
  return charges;
}
