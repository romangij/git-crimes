import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { investigate } from './github';
import { DEFAULT_INTENSITY } from './intensity';
import type { Evidence, Intensity, Investigation } from './types';
import { generateAppeal } from './appeal';
import type { Appeal, Defense } from './appeal';

/** One active evidence snapshot. Presentation changes cannot perform network I/O. */
export class InvestigationSession {
  intensity: Intensity = DEFAULT_INTENSITY;
  private snapshot?: { data: Investigation; evidence: Evidence };
  private edition = 0;
  private appeal?: Appeal;

  async open(username: string, progress: (step: number) => void) {
    const data = await investigate(username, progress);
    this.snapshot = { data, evidence: analyzeEvidence(data.repos, new Date(data.retrievedAt)) };
    this.edition = 0;
    this.appeal = undefined;
    return this.current();
  }
  setIntensity(intensity: Intensity) {
    if (intensity !== this.intensity) this.appeal = undefined;
    this.intensity = intensity;
    return this.current();
  }
  remix() {
    this.appeal = undefined;
    this.edition = (this.edition + 1) % 3;
    return this.current();
  }
  current() {
    if (!this.snapshot) return undefined;
    const { data, evidence } = this.snapshot;
    return { data, evidence, record: generateRecord(data.profile, evidence, new Date(data.retrievedAt), this.intensity, this.edition), appeal: this.appeal };
  }
  submitDefense(defense: Defense) {
    const current = this.current();
    if (!current) return undefined;
    // Enforce the one-shot rule in state, not just through disabled buttons.
    this.appeal ??= generateAppeal(current.record, defense, this.edition);
    return this.appeal;
  }
}
