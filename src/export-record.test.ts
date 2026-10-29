import { afterEach, expect, it, vi } from 'vitest';
import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { INTENSITIES } from './intensity';
import { buildExportDocument, createRecordPng, downloadRecord, drawDocument, fitText, loadAvatar, wrapText } from './export-record';
import type { GitHubRepo, Investigation } from './types';

const data: Investigation = {
  profile: { login: 'a'.repeat(39), id: 42, avatar_url: 'https://avatars.githubusercontent.com/u/42', name: null, public_repos: 300, created_at: '2020-01-01' },
  repos: Array.from({ length: 12 }, (_, i): GitHubRepo => ({ name: `project-${i}`, html_url: '', fork: false, archived: false, description: null, language: 'JavaScript', pushed_at: '2020-01-01', created_at: '2020-01-01', size: 0 })),
  retrievedAt: '2026-10-28T12:00:00Z',
};
const date = new Date(data.retrievedAt);
const evidence = analyzeEvidence(data.repos, date);
const makeDoc = () => buildExportDocument(data, generateRecord(data.profile, evidence, date));

function mockCanvas() {
  const drawn: { text: string; x: number; y: number; size: number; width: number }[] = [];
  const ctx = {
    font: '', fillStyle: '', strokeStyle: '', lineWidth: 0, textBaseline: '', filter: '',
    fillRect: vi.fn(), strokeRect: vi.fn(), beginPath: vi.fn(), moveTo: vi.fn(), lineTo: vi.fn(), stroke: vi.fn(),
    arc: vi.fn(), ellipse: vi.fn(), fill: vi.fn(), save: vi.fn(), restore: vi.fn(), translate: vi.fn(), rotate: vi.fn(), drawImage: vi.fn(),
    fillText: vi.fn((text: string, x: number, y: number): void => {
      const size = Number(ctx.font.match(/(\d+)px/)?.[1] ?? 16);
      drawn.push({ text, x, y, size, width: text.length * size * 0.61 });
    }),
    measureText(value: string) { return { width: value.length * Number(this.font.match(/(\d+)px/)?.[1] ?? 16) * 0.61 }; },
  };
  const canvas = { width: 0, height: 0, getContext: () => ctx, toBlob: vi.fn((callback: BlobCallback) => callback(new Blob(['png'], { type: 'image/png' }))) };
  return { ctx, drawn, canvas: canvas as unknown as HTMLCanvasElement };
}

afterEach(() => { vi.unstubAllGlobals(); vi.restoreAllMocks(); vi.useRealTimers(); });

it('exports the exact current mode, edition, lead charge, evidence, verdict, and sentence', () => {
  for (const mode of INTENSITIES) for (let edition = 0; edition < 3; edition++) {
    const record = generateRecord(data.profile, evidence, date, mode.value, edition);
    const doc = buildExportDocument(data, record);
    expect(doc.mode).toBe(mode.label);
    expect(doc.charge).toContain(record.charges[0].title);
    expect(doc.evidence).toBe(record.charges[0].evidence);
    expect(doc.verdict).toBe(record.verdict);
    expect(doc.sentence).toBe(record.sentence);
    expect(doc.scope).toContain('12 of 300');
    expect(doc.stamp).toBe('CONVICTED');
  }
});

it('clears empty profiles without inventing a charge', () => {
  const empty = { ...data, repos: [] };
  const record = generateRecord(data.profile, analyzeEvidence([], date), date, 'unhinged');
  const doc = buildExportDocument(empty, record);
  expect(doc.stamp).toBe('CLEARED');
  expect(doc.charge).toContain('NO CHARGES');
  expect(doc.evidence).toBe('0 public repositories inspected. No charge thresholds met.');
});

it('wraps long words and fits complete text without truncating it', () => {
  expect(wrapText('abcdefghij', 4, value => value.length)).toEqual(['abcd', 'efgh', 'ij']);
  const { ctx } = mockCanvas();
  const text = 'a'.repeat(39) + ' ' + 'A theatrical developer sentence. '.repeat(4);
  const layout = fitText(ctx as unknown as CanvasRenderingContext2D, text, 850, 70, 24);
  expect(layout.lines.join(' ').replaceAll(' ', '')).toBe(text.replaceAll(' ', ''));
  expect(layout.lines.length * layout.lineHeight).toBeLessThanOrEqual(70);
  expect(layout.lines.every(line => ctx.measureText(line).width <= 850)).toBe(true);
  expect(() => fitText(ctx as unknown as CanvasRenderingContext2D, 'x'.repeat(5000), 100, 20, 20)).toThrow('too long');
});

it('renders all modes and editions into an exact 1200 x 630 canvas with a photo fallback', () => {
  for (const mode of INTENSITIES) for (let edition = 0; edition < 3; edition++) {
    const { canvas, ctx } = mockCanvas();
    const doc = buildExportDocument(data, generateRecord(data.profile, evidence, date, mode.value, edition));
    drawDocument(canvas, doc, null);
    expect([canvas.width, canvas.height]).toEqual([1200, 630]);
    expect(ctx.fillText.mock.calls.map(call => call[0]).join(' ')).toContain('git-crimes.pages.dev');
    expect(ctx.fillText.mock.calls.map(call => call[0]).join(' ')).toContain('PHOTO UNAVAILABLE');
    expect(ctx.drawImage).not.toHaveBeenCalled();
    expect(ctx.arc).toHaveBeenCalled();
  }
});

it('rejects untrusted avatar origins without initiating a load', async () => {
  const ImageMock = vi.fn();
  vi.stubGlobal('Image', ImageMock);
  for (const url of ['http://avatars.githubusercontent.com/u/1', 'https://evil.example/avatar', 'data:image/png;base64,abc', 'not a URL']) expect(await loadAvatar(url)).toBeNull();
  expect(ImageMock).not.toHaveBeenCalled();
});

it('keeps the complete sentence prominent and the footer clear of the frame for every charge and edition', () => {
  const samples = [data.repos, []];
  for (const sample of samples) for (const mode of INTENSITIES) for (let edition = 0; edition < 3; edition++) {
    const record = generateRecord(data.profile, analyzeEvidence(sample, date), date, mode.value, edition);
    // Exercise every eligible charge as the principal charge, including long titles and evidence.
    for (const lead of record.charges.length ? record.charges : [undefined]) {
      const doc = buildExportDocument({ ...data, repos: sample }, { ...record, charges: lead ? [lead] : [] });
      const { canvas, drawn } = mockCanvas();
      drawDocument(canvas, doc, null);
      const sentence = drawn.filter(run => run.y >= 486 && run.y < 543);
      expect(sentence.map(run => run.text).join(' ')).toBe(doc.sentence);
      expect(sentence.every(run => run.size >= 22 && run.x + run.width <= 1120 && run.y + run.size * 1.22 <= 543)).toBe(true);
      const verdict = drawn.filter(run => run.y >= 395 && run.y < 437);
      expect(verdict.map(run => run.text).join(' ')).toBe(doc.verdict);
      expect(Math.min(...sentence.map(run => run.size))).toBeGreaterThan(Math.max(...verdict.map(run => run.size)));
      const footer = drawn.filter(run => run.y >= 570);
      expect(footer).toHaveLength(2);
      // At least 10 px above the inner frame; never paint over either border.
      for (const run of footer) {
        expect(run.y + run.size * 1.22).toBeLessThanOrEqual(591);
        expect(run.x).toBeGreaterThanOrEqual(60);
        expect(run.x + run.width).toBeLessThanOrEqual(1140);
      }
      expect(drawn.filter(run => run.x >= 280 && run.y >= 138 && run.y < 437).every(run => run.x + run.width <= 1140)).toBe(true);
    }
  }
});

it('sets anonymous CORS before loading and handles avatar errors and timeouts', async () => {
  vi.useFakeTimers();
  let image: { crossOrigin: string; referrerPolicy: string; src: string; onerror: null | (() => void) };
  class FakeImage {
    crossOrigin = ''; referrerPolicy = ''; onerror = null; onload = null;
    constructor() { image = this; }
    set src(value: string) {
      expect(this.crossOrigin).toBe('anonymous');
      expect(this.referrerPolicy).toBe('no-referrer');
      expect(value).toContain('s=256');
    }
  }
  vi.stubGlobal('Image', FakeImage);
  const failed = loadAvatar(data.profile.avatar_url);
  image!.onerror!();
  expect(await failed).toBeNull();
  const timedOut = loadAvatar(data.profile.avatar_url);
  await vi.advanceTimersByTimeAsync(4000);
  expect(await timedOut).toBeNull();
});

it('encodes a PNG locally and surfaces encoding failures', async () => {
  const { canvas } = mockCanvas();
  vi.stubGlobal('document', { createElement: () => canvas });
  const doc = { ...makeDoc(), avatarUrl: '' };
  expect((await createRecordPng(doc)).type).toBe('image/png');
  vi.mocked(canvas.toBlob).mockImplementation(callback => callback(null));
  await expect(createRecordPng(doc)).rejects.toThrow('could not encode');
});

it('loads a CORS-enabled avatar and retries without it if canvas export is blocked', async () => {
  class FakeImage {
    naturalWidth = 256; naturalHeight = 256;
    onload: null | (() => void) = null;
    onerror = null;
    set src(_value: string) { queueMicrotask(() => this.onload?.()); }
  }
  vi.stubGlobal('Image', FakeImage);
  const { canvas, ctx } = mockCanvas();
  vi.stubGlobal('document', { createElement: () => canvas });
  vi.mocked(canvas.toBlob).mockImplementationOnce(() => { throw new DOMException('Tainted', 'SecurityError'); });
  const blob = await createRecordPng(makeDoc());
  expect(blob.type).toBe('image/png');
  expect(ctx.drawImage).toHaveBeenCalledOnce();
  const photo = ctx.drawImage.mock.calls[0];
  expect(photo[7]).toBe(photo[8]); // Preserve the square crop without stretching the avatar.
  expect(ctx.fillText.mock.calls.map(call => call[0]).join(' ')).toContain('PHOTO UNAVAILABLE');
  expect(canvas.toBlob).toHaveBeenCalledTimes(2);
});

it('downloads through a temporary object URL and cleans it up after mobile browsers consume it', () => {
  vi.useFakeTimers();
  const create = vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:local');
  const revoke = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
  const link = { href: '', download: '', hidden: false, click: vi.fn(), remove: vi.fn() };
  vi.stubGlobal('document', { createElement: () => link, body: { append: vi.fn() } });
  downloadRecord(new Blob(['png']), 'octocat');
  expect(create).toHaveBeenCalledOnce();
  expect(link.download).toBe('git-crimes-octocat.png');
  expect(link.href).toBe('blob:local');
  expect(link.click).toHaveBeenCalledOnce();
  expect(link.remove).toHaveBeenCalledOnce();
  expect(revoke).not.toHaveBeenCalled();
  vi.advanceTimersByTime(60_000);
  expect(revoke).toHaveBeenCalledWith('blob:local');
});
