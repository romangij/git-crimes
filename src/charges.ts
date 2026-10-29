import type { Charge, CriminalRecord, Evidence, GitHubProfile } from './types';

export function generateRecord(profile: GitHubProfile, evidence: Evidence, date: Date): CriminalRecord {
  const charges: Charge[] = [];
  if (evidence.abandoned.length >= 1) charges.push({ code: 'GC-101', title: 'Aggravated Repository Abandonment', evidence: `${evidence.abandoned.length} non-archived, original repositories have no recorded push in over 365 days. The TODOs have started a support group.`, repos: evidence.abandoned, severity: 'FELONY' });
  if (evidence.javascript.length >= 3) charges.push({ code: 'GC-204', title: 'First-Degree JavaScript Allegiance', evidence: `${evidence.javascript.length} original repositories list JavaScript or TypeScript as their primary language. One ecosystem was apparently enough.`, repos: evidence.javascript, severity: 'FELONY' });
  if (evidence.originals.length >= 10) charges.push({ code: 'GC-303', title: 'Serial Repository Creation', evidence: `${evidence.originals.length} original repositories in the inspected sample. “This one will be different,” the suspect allegedly said.`, repos: evidence.originals, severity: 'MISDEMEANOR' });
  if (evidence.undescribed.length >= 3) charges.push({ code: 'GC-404', title: 'Repository Description Negligence', evidence: `${evidence.undescribed.length} original repositories have no description. Future you has been left on read.`, repos: evidence.undescribed, severity: 'MISDEMEANOR' });
  if (evidence.forks.length >= 5) charges.push({ code: 'GC-409', title: 'Excessive Fork Possession', evidence: `${evidence.forks.length} forks in the inspected sample. This is a GitHub account, not a cutlery drawer.`, repos: evidence.forks, severity: 'MISDEMEANOR' });
  if (evidence.empty.length >= 1) charges.push({ code: 'GC-000', title: 'Possession of an Empty Promise', evidence: `${evidence.empty.length} original repositories report a size of 0 KB. Big “coming soon” energy. Size is GitHub metadata, not a file inspection.`, repos: evidence.empty, severity: 'MISDEMEANOR' });
  return {
    caseId: `GCPD-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${profile.id}`,
    charges,
    verdict: charges.length ? `Guilty of being extremely online. ${charges.length} charge${charges.length === 1 ? '' : 's'} entered into the fictional record.` : 'Insufficient evidence. Suspiciously respectable behavior.',
    sentence: charges.length ? `${charges.length} hours of community documentation service, one glass of water, and a supervised walk away from the keyboard.` : 'Free to go. The division will be watching. Respectfully.',
  };
}
