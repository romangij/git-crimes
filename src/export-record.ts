import { INTENSITIES } from './intensity';
import type { CriminalRecord, Investigation } from './types';

export const EXPORT_WIDTH = 1200;
export const EXPORT_HEIGHT = 630;
const FONT = '"Courier New", Courier, monospace';
const INK = '#25201b';
const RED = '#99392d';

export interface ExportDocument {
  username: string;
  avatarUrl: string;
  caseId: string;
  mode: string;
  stamp: 'CONVICTED' | 'CLEARED';
  charge: string;
  evidence: string;
  scope: string;
  verdict: string;
  sentence: string;
}

/** The lead charge follows the engine's stable ordering; no new accusations. */
export function buildExportDocument(data: Investigation, record: CriminalRecord): ExportDocument {
  const lead = record.charges[0];
  return {
    username: `@${data.profile.login}`,
    avatarUrl: data.profile.avatar_url,
    caseId: record.caseId,
    mode: INTENSITIES.find(mode => mode.value === record.intensity)!.label,
    stamp: lead ? 'CONVICTED' : 'CLEARED',
    charge: lead ? `${lead.code} / ${lead.title}` : 'NO CHARGES / INSUFFICIENT EVIDENCE',
    evidence: lead?.evidence ?? `${data.repos.length} public repositories inspected. No charge thresholds met.`,
    scope: `Scope: ${data.repos.length} of ${data.profile.public_repos} public repos reported; metadata only.`,
    verdict: record.verdict,
    sentence: record.sentence,
  };
}

/** Break long words too, so even a maximum-length username stays inside its box. */
export function wrapText(text: string, width: number, measure: (value: string) => number): string[] {
  const lines: string[] = [];
  let line = '';
  for (const word of text.trim().split(/\s+/)) {
    if (!word) continue;
    const next = line ? `${line} ${word}` : word;
    if (measure(next) <= width) { line = next; continue; }
    if (line) { lines.push(line); line = ''; }
    for (const char of word) {
      if (line && measure(line + char) > width) { lines.push(line); line = ''; }
      line += char;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function fitText(ctx: Pick<CanvasRenderingContext2D, 'font' | 'measureText'>, text: string, width: number, height: number, preferred: number, minimum = 14, bold = false) {
  for (let size = preferred; size >= minimum; size--) {
    ctx.font = `${bold ? 'bold ' : ''}${size}px ${FONT}`;
    const lines = wrapText(text, width, value => ctx.measureText(value).width);
    const lineHeight = size * 1.22;
    if (lines.length * lineHeight <= height && lines.every(line => ctx.measureText(line).width <= width)) return { lines, lineHeight, size };
  }
  throw new Error('This record is too long for the PNG layout. Try another roast edition.');
}

export function loadAvatar(url: string): Promise<HTMLImageElement | null> {
  let safe: URL;
  try {
    safe = new URL(url);
    if (safe.protocol !== 'https:' || safe.hostname !== 'avatars.githubusercontent.com' || safe.username || safe.password || safe.port) return Promise.resolve(null);
    safe.searchParams.set('s', '256');
  } catch { return Promise.resolve(null); }
  return new Promise(resolve => {
    const image = new Image();
    const finish = (value: HTMLImageElement | null) => {
      clearTimeout(timer);
      image.onload = null;
      image.onerror = null;
      resolve(value);
    };
    const timer = setTimeout(() => finish(null), 4000);
    // Set these before src. Never draw an image loaded without anonymous CORS.
    image.crossOrigin = 'anonymous';
    image.referrerPolicy = 'no-referrer';
    image.onload = () => finish(image.naturalWidth && image.naturalHeight ? image : null);
    image.onerror = () => finish(null);
    image.src = safe.href;
  });
}

export function drawDocument(canvas: HTMLCanvasElement, doc: ExportDocument, avatar: HTMLImageElement | null) {
  canvas.width = EXPORT_WIDTH;
  canvas.height = EXPORT_HEIGHT;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('PNG export requires Canvas support in your browser.');
  ctx.textBaseline = 'top';
  ctx.fillStyle = '#f3ead7';
  ctx.fillRect(0, 0, EXPORT_WIDTH, EXPORT_HEIGHT);
  // Deterministic paper flecks; no external texture or font required.
  ctx.fillStyle = '#5b40230b';
  for (let i = 0; i < 1600; i++) ctx.fillRect((i * 137) % 1200, (i * 73) % 630, 1, 1);
  ctx.strokeStyle = INK;
  ctx.lineWidth = 2;
  ctx.strokeRect(22, 22, 1156, 586);
  ctx.lineWidth = 0.7;
  ctx.strokeRect(29, 29, 1142, 572);

  const text = (value: string, x: number, y: number, width: number, height: number, size: number, color = INK, bold = false, minimum = 14) => {
    const layout = fitText(ctx, value, width, height, size, minimum, bold);
    ctx.fillStyle = color;
    layout.lines.forEach((line, index) => ctx.fillText(line, x, y + index * layout.lineHeight));
  };
  const rule = (x: number, y: number, width: number) => {
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + width, y); ctx.stroke();
  };
  // A shared 60 px inset and a fixed exhibit column keep every case aligned.
  text('GITHUB CRIME POLICE DEPARTMENT', 60, 46, 1080, 40, 32, INK, true);
  text('JUDICIAL RECORD / DEVELOPER OFFENSES DIVISION / FICTIONAL', 60, 88, 1080, 22, 16);
  rule(60, 118, 1080);

  // Evidence photo, printed as a monochrome court exhibit.
  ctx.fillStyle = '#e3d6bd'; ctx.fillRect(60, 138, 188, 174);
  if (avatar) {
    ctx.save();
    ctx.filter = 'grayscale(1) sepia(0.2)';
    const crop = Math.min(avatar.naturalWidth, avatar.naturalHeight);
    ctx.drawImage(avatar, (avatar.naturalWidth - crop) / 2, (avatar.naturalHeight - crop) / 2, crop, crop, 73, 144, 162, 162);
    ctx.restore();
  } else {
    // A dossier silhouette rather than a broken image or an empty box.
    ctx.fillStyle = '#8a7b65';
    ctx.beginPath(); ctx.arc(154, 199, 32, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(154, 297, 66, 47, 0, Math.PI, Math.PI * 2); ctx.fill();
  }
  ctx.strokeRect(60, 138, 188, 174);
  text('EXHIBIT A / SUBJECT', 60, 321, 200, 22, 15);
  if (!avatar) text('PHOTO UNAVAILABLE', 60, 343, 200, 20, 14, RED);

  ctx.save();
  ctx.translate(154, 393); ctx.rotate(-0.10);
  ctx.strokeStyle = RED; ctx.lineWidth = 3;
  ctx.strokeRect(-92, -24, 184, 48); ctx.strokeRect(-87, -19, 174, 38);
  // Center both stamp labels optically, including the shorter CLEARED state.
  const stamp = fitText(ctx, doc.stamp, 162, 34, 28, 14, true);
  text(doc.stamp, -ctx.measureText(doc.stamp).width / 2, -stamp.size / 2, 162, 34, stamp.size, RED, true);
  ctx.restore();

  text(`CASE ${doc.caseId}`, 280, 138, 470, 22, 15);
  text(`INTENSITY: ${doc.mode}`, 770, 138, 370, 22, 15, RED, true);
  text(doc.username, 280, 170, 860, 42, 33, INK, true);
  rule(280, 220, 860);
  text('PRINCIPAL CHARGE', 280, 231, 860, 20, 14, RED, true);
  text(doc.charge, 280, 255, 860, 55, 22, INK, true);
  text(`EVIDENCE: ${doc.evidence}`, 280, 315, 860, 40, 16);
  rule(280, 363, 860);
  text('THE VERDICT', 280, 372, 860, 20, 14, RED, true);
  text(doc.verdict, 280, 395, 860, 42, 17, INK, true);

  // Full-width sentencing order: the final punchline gets the strongest voice.
  ctx.fillStyle = '#99392d0b'; ctx.fillRect(60, 449, 1080, 104);
  ctx.fillStyle = RED; ctx.fillRect(60, 449, 3, 104);
  text('THE SENTENCE', 80, 461, 1040, 20, 15, RED, true);
  text(doc.sentence, 80, 486, 1040, 57, 26, INK, true, 22);

  // A dedicated footer row stays entirely inside the uninterrupted double frame.
  rule(60, 560, 1080);
  text('NEW INVESTIGATIONS: git-crimes.pages.dev', 60, 570, 550, 20, 16, RED, true);
  text(doc.scope, 620, 570, 520, 20, 14);
}

function toPng(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(blob => blob ? resolve(blob) : reject(new Error('The browser could not encode this PNG. Please retry.')), 'image/png');
  });
}

export async function createRecordPng(doc: ExportDocument): Promise<Blob> {
  const avatar = await loadAvatar(doc.avatarUrl);
  const canvas = document.createElement('canvas');
  try {
    drawDocument(canvas, doc, avatar);
    return await toPng(canvas);
  } catch (cause) {
    // Resetting the canvas removes a tainted bitmap; never weaken CORS to retry.
    if (avatar && cause instanceof DOMException && cause.name === 'SecurityError') {
      drawDocument(canvas, doc, null);
      return toPng(canvas);
    }
    throw cause;
  }
}

export function downloadRecord(blob: Blob, username: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `git-crimes-${username.replace(/[^a-zA-Z0-9-]/g, '') || 'record'}.png`;
  link.hidden = true;
  document.body.append(link);
  try { link.click(); } finally {
    link.remove();
    // Allow mobile browsers time to consume the download before revocation.
    setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }
}
