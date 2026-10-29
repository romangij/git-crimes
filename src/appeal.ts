import type { CriminalRecord } from './types';
import { APPEAL_TEMPLATES, CLEARED_APPEALS, renderAppealTemplate } from './appeal-templates';

export const DEFENSES = [
  { value: 'not-guilty', statement: 'I PLEAD NOT GUILTY' },
  { value: 'my-machine', statement: 'IT WORKS ON MY MACHINE' },
  { value: 'intern', statement: 'BLAME THE INTERN' },
] as const;
export type Defense = typeof DEFENSES[number]['value'];
export interface Appeal { defense: Defense; statement: string; judge: string; ruling: 'APPEAL DENIED.' }

export function isDefense(value: string): value is Defense {
  return DEFENSES.some(defense => defense.value === value);
}

/** Count only the retrieved repositories supporting the existing lead charge. */
export function generateAppeal(record: CriminalRecord, defense: Defense, edition = 0): Appeal {
  const statement = DEFENSES.find(option => option.value === defense)!.statement;
  const lead = record.charges[0];
  const variants = lead ? APPEAL_TEMPLATES[lead.code][defense] : CLEARED_APPEALS[defense];
  // Keep the established deterministic starting point and explicit edition cycle.
  const key = `${record.caseId}|${record.intensity}|${defense}`;
  let seed = 0;
  for (const char of key) seed = (Math.imul(seed, 31) + char.charCodeAt(0)) >>> 0;
  const offset = Number.isSafeInteger(edition) && edition >= 0 ? edition % variants.length : 0;
  const template = variants[(seed % variants.length + offset) % variants.length];
  return {
    defense, statement,
    judge: renderAppealTemplate(template, lead?.repos.length ?? 0, record.intensity),
    ruling: 'APPEAL DENIED.',
  };
}
