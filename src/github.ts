import type { GitHubProfile, GitHubRepo, Investigation } from './types';

export class InvestigationError extends Error {}

async function get<T>(path: string): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`https://api.github.com${path}`, {
      headers: { Accept: 'application/vnd.github+json' },
      signal: AbortSignal.timeout(15000),
    });
  } catch {
    throw new InvestigationError('Connection lost. Check your network and retry. GitHub may be temporarily unavailable.');
  }
  if (response.status === 404) throw new InvestigationError('Suspect not found. Check the GitHub username and try again.');
  if (response.status === 403 || response.status === 429) {
    const reset = Number(response.headers.get('x-ratelimit-reset'));
    const time = reset ? ` Retry after ${new Date(reset * 1000).toLocaleTimeString()}.` : ' Please retry later.';
    throw new InvestigationError(`GitHub access is temporarily restricted or rate limited.${time}`);
  }
  if (!response.ok) throw new InvestigationError(`GitHub returned HTTP ${response.status}. Please retry in a moment.`);
  return response.json() as Promise<T>;
}

export async function investigate(username: string, progress: (step: number) => void): Promise<Investigation> {
  progress(0);
  const profile = await get<GitHubProfile>(`/users/${encodeURIComponent(username)}`);
  progress(1);
  const repos = await get<GitHubRepo[]>(`/users/${encodeURIComponent(profile.login)}/repos?type=owner&sort=updated&direction=desc&per_page=100`);
  progress(2);
  return { profile, repos, retrievedAt: new Date().toISOString() };
}
