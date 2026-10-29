import type { CriminalRecord, Evidence, GitHubProfile, Intensity } from './types';
import { eligibleCharges } from './eligibility';
import { HUMOR, pickTemplate } from './humor';
import { DEFAULT_INTENSITY } from './intensity';

export function generateRecord(profile: GitHubProfile, evidence: Evidence, date: Date, intensity: Intensity = DEFAULT_INTENSITY, edition = 0): CriminalRecord {
  const templates = HUMOR[intensity];
  const variant = Number.isSafeInteger(edition) && edition >= 0 ? edition : 0;
  const seed = profile.id + evidence.total;
  const pick = (items: readonly string[]) => pickTemplate(items, seed, variant);
  const charges = eligibleCharges(evidence).map((charge, index) => ({
    ...charge, title: templates.charges[charge.code].title,
    joke: pickTemplate(templates.charges[charge.code].jokes, seed + index, variant),
  }));
  return {
    caseId: `GCPD-${date.toISOString().slice(0, 10).replaceAll('-', '')}-${profile.id}`,
    intensity, charges,
    verdict: pick(charges.length ? templates.verdicts : templates.cleared),
    sentence: pick(charges.length ? templates.sentences : templates.released),
    commentary: pick(evidence.total === 0 ? templates.empty : templates.quiet),
  };
}
