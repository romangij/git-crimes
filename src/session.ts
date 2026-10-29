import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { investigate } from './github';
import { DEFAULT_INTENSITY } from './intensity';
import type { Evidence, Intensity, Investigation } from './types';

/** One active evidence snapshot. Presentation changes cannot perform network I/O. */
export class InvestigationSession {
  intensity: Intensity = DEFAULT_INTENSITY;
  private snapshot?: { data: Investigation; evidence: Evidence };
  private edition = 0;

  async open(username: string, progress: (step: number) => void) {
    const data = await investigate(username, progress);
    this.snapshot = { data, evidence: analyzeEvidence(data.repos, new Date(data.retrievedAt)) };
    this.edition = 0;
    return this.current();
  }
  setIntensity(intensity: Intensity) {
    this.intensity = intensity;
    return this.current();
  }
  remix() {
    this.edition = (this.edition + 1) % 3;
    return this.current();
  }
  current() {
    if (!this.snapshot) return undefined;
    const { data, evidence } = this.snapshot;
    return { data, evidence, record: generateRecord(data.profile, evidence, new Date(data.retrievedAt), this.intensity, this.edition) };
  }
}
