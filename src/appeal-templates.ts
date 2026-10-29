import type { ChargeCode, Intensity } from './types';
import type { Defense } from './appeal';

/** Each reply is written around a specific finding, not a generic joke plus a fact appendix. */
export const APPEAL_TEMPLATES: Record<ChargeCode, Record<Defense, readonly string[]>> = {
  'GC-101': {
    'not-guilty': [
      'Not guilty? The {court} has {count} non-archived original {repos} in this sample with no recorded push in over 365 days; your alibi needs a calendar invite.',
      'With no recorded push in over 365 days for {count} non-archived original {repos} in this sample, your plea has entered the {court} as a very optimistic reminder notification.',
      'The {court} accepts that a project can be finished; your innocence plea cannot dismiss {count} non-archived original {repos} with no recorded push in over 365 days from this sample as a rounding error.',
    ],
    'my-machine': [
      'Whatever runs on your machine, the {court} still has {count} non-archived original {repos} in this sample with no recorded push in over 365 days; localhost cannot git push an alibi.',
      'Your machine was not inspected, but {count} non-archived original {repos} in this sample have no recorded push in over 365 days; the {court} needs a public timestamp, not a local standing ovation.',
      'The {court} cannot audit your laptop, and its hostname is not a timestamp for the {count} non-archived original {repos} in this sample with no recorded push in over 365 days.',
    ],
    intern: [
      'No intern was established, yet your alibi for {count} non-archived original {repos} in this sample with no recorded push in over 365 days is already requesting imaginary leave from the {court}.',
      'The {court} has {count} non-archived original {repos} in this sample with no recorded push in over 365 days and no evidence of an intern; git blame does not come with a create-person flag.',
      'Blaming an unverified intern for {count} non-archived original {repos} in this sample with no recorded push in over 365 days is an ambitious staffing proposal for the {court}.',
    ],
  },
  'GC-204': {
    'not-guilty': [
      'Your innocence plea lists {count} original {repos} with JavaScript or TypeScript as the primary language in this sample; the {court} recognizes a union type of alibis.',
      'The {court} asked for your defense, not another JavaScript ecosystem entry point; this sample already has {count} original {repos} listing JavaScript or TypeScript as the primary language.',
      'With {count} original {repos} listing JavaScript or TypeScript as the primary language in this sample, pleading innocence in the {court} needs a stronger type than any.',
    ],
    'my-machine': [
      'Your machine was not tested, and localhost is not a language exemption: {count} original {repos} in this sample list JavaScript or TypeScript as the primary language before the {court}.',
      'Whatever runs locally, {count} original {repos} in this sample still list JavaScript or TypeScript as the primary language; the {court} cannot resolve an ecosystem defense with a different port.',
      'The {court} has no local test results, just {count} original {repos} listing JavaScript or TypeScript as the primary language in this sample; changing machines is not changing languages.',
    ],
    intern: [
      'No intern was established, but your defense would like to delegate {count} original {repos} listing JavaScript or TypeScript as the primary language in this sample; the {court} rejects imaginary dependency injection.',
      'Blaming an unverified intern does not retype the {count} original {repos} listing JavaScript or TypeScript as the primary language in this sample; the {court} has no intern.d.ts on file.',
      'The {court} cannot assign {count} original {repos} listing JavaScript or TypeScript as the primary language in this sample to an intern who exists only in your alibi interface.',
    ],
  },
  'GC-303': {
    'not-guilty': [
      'With {count} original {repos} in this sample, your innocence plea has enough scope to become another side project; the {court} refuses to open its repository.',
      'The {court} counts {count} original {repos} in this sample and an innocence plea that sounds suspiciously like a proposal for the next one.',
      'Pleading not guilty with {count} original {repos} in this sample is a bold choice; the {court} is reviewing your defense as a monorepo migration proposal.',
    ],
    'my-machine': [
      'Whatever works on your machine, {count} original {repos} are already in this public sample; the {court} cannot mark a repository count as a local-only feature.',
      'The {court} did not test your machine, but {count} original {repos} in this sample are not a localhost routing issue.',
      'Your machine was not inspected; the {court} is counting the {count} original {repos} in this sample, not asking whether the new-project wizard runs locally.',
    ],
    intern: [
      'No intern was established, but assigning {count} original {repos} from this sample to an imaginary starter task is quite the onboarding plan for the {court}.',
      'The {court} has {count} original {repos} in this sample and no verified intern; your delegation strategy requires a person before it requires a project board.',
      'Blaming an unverified intern for {count} original {repos} in this sample is not a defense; the {court} calls it staffing by autocomplete.',
    ],
  },
  'GC-404': {
    'not-guilty': [
      'Your innocence plea is more descriptive than {count} original {repos} in this sample with no description; the {court} suggests copying it into the missing field.',
      'The {court} has {count} original {repos} without descriptions in this sample; pleading not guilty is welcome, but a sentence of context would make a better opening statement.',
      'With {count} original {repos} missing descriptions in this sample, the {court} is impressed that your innocence plea came with words attached.',
    ],
    'my-machine': [
      'The {court} cannot see your machine; with {count} original {repos} missing descriptions in this sample, GitHub cannot even see your elevator pitch.',
      'Whatever runs locally, the description field is still blank on {count} original {repos} in this sample; the {court} does not accept localhost as alt text.',
      'Your machine was not tested, and a local success claim is not a description for the {count} original {repos} missing one in this sample; the {court} requests a public-facing noun.',
    ],
    intern: [
      'No intern was established, but this alibi has more context than the {count} original {repos} missing descriptions in this sample; the {court} suggests documenting the repos before the imaginary org chart.',
      'Blaming an unverified intern for {count} original {repos} without descriptions in this sample is a curious defense; the {court} notes that even your scapegoat got a job title.',
      'The {court} has {count} original {repos} missing descriptions in this sample and no verified intern; filling the blame field does not fill the description field.',
    ],
  },
  'GC-409': {
    'not-guilty': [
      'With {count} forks in this sample, your innocence plea has branching potential; the {court} is declining the pull request.',
      'The {court} counts {count} forks in this sample; pleading innocence does not turn the fork button into a character witness.',
      'Not guilty? The {court} has {count} forks in this sample, and your defense appears to be requesting an upstream pardon.',
    ],
    'my-machine': [
      'Whatever runs locally, {count} forks are listed in this public sample; the {court} is reviewing the account, not your machine-specific remote configuration.',
      'The {court} did not inspect your machine, but the {count} forks in this sample are not waiting for localhost to confirm their existence.',
      'Your laptop was not tested; the {court} counts {count} forks in this sample, and changing the local origin URL is not an appeal.',
    ],
    intern: [
      'No intern was established, but your defense wants to fork responsibility for {count} forks in this sample; the {court} has disabled imaginary transfers.',
      'The {court} has {count} forks in this sample and no verified intern; you cannot add a fictional upstream maintainer to your alibi.',
      'Blaming an unverified intern for {count} forks in this sample is not delegation; the {court} calls that an unsupported remote.',
    ],
  },
  'GC-000': {
    'not-guilty': [
      'With {count} original {repos} reporting 0 KB in this sample, your innocence plea is bringing more payload than the size metadata to the {court}.',
      'The {court} has {count} original {repos} reporting 0 KB in this sample; that is size metadata, but your innocence plea is still an impressively heavyweight response.',
      'Your plea asks the {court} to dismiss {count} original {repos} reporting 0 KB in this sample as size metadata; even the alibi has embraced a minimal bundle.',
    ],
    'my-machine': [
      'Your machine was not inspected; with {count} original {repos} reporting a size of 0 KB in this sample, the {court} cannot accept a local success claim as an upload receipt.',
      'Whatever runs locally, the size metadata for {count} original {repos} in this sample reports 0 KB; the {court} cannot weigh a localhost demo.',
      'The {court} did not run your code or inspect files; the size report lists {count} original {repos} at 0 KB in this sample, and your laptop is not a replacement unit of measurement.',
    ],
    intern: [
      'No intern was established, but you are assigning someone imaginary the {count} original {repos} reporting 0 KB in this sample; the {court} finds your org chart heavier than the size metadata.',
      'The {court} has size metadata for {count} original {repos} reporting 0 KB in this sample and no verified intern; your defense is allocating imaginary headcount against a size report.',
      'Blaming an unverified intern for {count} original {repos} reporting 0 KB in this sample gives the {court} a rare example of scope creep in an empty-size alibi.',
    ],
  },
};

export const CLEARED_APPEALS: Record<Defense, readonly string[]> = {
  'not-guilty': [
    'Your clearance stands; pleading not guilty to a cleared record is a redundant assertion in the {court}. No charge thresholds were met.',
    'No charge thresholds were met, so the {court} has marked your innocence plea as already implemented. Your clearance stands.',
    'Your clearance stands; the {court} declines to merge an innocence plea that changes nothing. No charge thresholds were met.',
  ],
  'my-machine': [
    'Your clearance stands, and your machine was not tested; the {court} has no failing public case to reproduce. No charge thresholds were met.',
    'No charge thresholds were met; the {court} does not need a localhost demo to close an already cleared case. Your clearance stands.',
    'Your clearance stands; the {court} is closing this public case without borrowing your laptop. No charge thresholds were met.',
  ],
  intern: [
    'Your clearance stands; the {court} declines to assign an imaginary intern a case with no charges. No charge thresholds were met.',
    'No charge thresholds were met, and no intern was established; the {court} has nobody to onboard into this alibi. Your clearance stands.',
    'Your clearance stands; inventing an intern to blame for a cleared record is unnecessary headcount in the {court}. No charge thresholds were met.',
  ],
};

const COURTS: Record<Intensity, string> = {
  friendly: 'small-claims court',
  felony: 'court',
  unhinged: 'emergency release tribunal',
};

export function renderAppealTemplate(template: string, count: number, intensity: Intensity): string {
  return template.replaceAll('{count}', String(count))
    .replaceAll('{repos}', count === 1 ? 'repository' : 'repositories')
    .replaceAll('{court}', COURTS[intensity]);
}
