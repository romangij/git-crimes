import type { Evidence, GitHubRepo } from './types';

export function analyzeEvidence(repos: GitHubRepo[], now: Date): Evidence {
  const originals = repos.filter(repo => !repo.fork);
  const cutoff = now.getTime() - 365 * 24 * 60 * 60 * 1000;
  return {
    total: repos.length,
    originals,
    abandoned: originals.filter(repo => !repo.archived && repo.pushed_at !== null && Date.parse(repo.pushed_at) < cutoff),
    javascript: originals.filter(repo => repo.language === 'JavaScript' || repo.language === 'TypeScript'),
    undescribed: originals.filter(repo => !repo.description?.trim()),
    forks: repos.filter(repo => repo.fork),
    empty: originals.filter(repo => repo.size === 0),
  };
}
