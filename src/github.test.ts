import { afterEach, expect, it, vi } from 'vitest';
import { investigate } from './github';

afterEach(() => vi.unstubAllGlobals());

it('fetches only a profile and one repository page with honest progress', async () => {
  const fetchMock = vi.fn()
    .mockResolvedValueOnce(new Response(JSON.stringify({ login: 'octocat', id: 1 })))
    .mockResolvedValueOnce(new Response(JSON.stringify([])));
  vi.stubGlobal('fetch', fetchMock);
  const progress = vi.fn();
  const result = await investigate('octocat', progress);
  expect(fetchMock).toHaveBeenCalledTimes(2);
  expect(fetchMock.mock.calls[1][0]).toContain('per_page=100');
  expect(progress.mock.calls.map(call => call[0])).toEqual([0, 1, 2]);
  expect(result.repos).toEqual([]);
});

it('stops after a missing profile', async () => {
  const fetchMock = vi.fn().mockResolvedValue(new Response('', { status: 404 }));
  vi.stubGlobal('fetch', fetchMock);
  await expect(investigate('missing', vi.fn())).rejects.toThrow('Suspect not found');
  expect(fetchMock).toHaveBeenCalledTimes(1);
});

it('explains rate limits and network failures', async () => {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('', { status: 403, headers: { 'x-ratelimit-reset': '1793188800' } })));
  await expect(investigate('octocat', vi.fn())).rejects.toThrow('rate limited');
  vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new TypeError('Network failure')));
  await expect(investigate('octocat', vi.fn())).rejects.toThrow('Check your network');
});
