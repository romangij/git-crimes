import type { Intensity } from './types';

export const DEFAULT_INTENSITY: Intensity = 'felony';
export const INTENSITIES = [
  { value: 'friendly', label: 'FRIENDLY WARNING', hint: 'A gentle lint warning.' },
  { value: 'felony', label: 'FELONY', hint: 'Sarcasm with receipts.' },
  { value: 'unhinged', label: 'UNHINGED', hint: 'The court has lost the plot.' },
] as const;
export function isIntensity(value: string): value is Intensity {
  return INTENSITIES.some(mode => mode.value === value);
}
