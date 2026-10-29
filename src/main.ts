import './style.css';
import { mountAccompliceMode } from './accomplice-controller';
import { InvestigationSession } from './session';
import { isIntensity } from './intensity';
import { renderAppeal, renderRecord, shell } from './ui';
import { isDefense } from './appeal';
import { buildExportDocument, createRecordPng, downloadRecord } from './export-record';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = shell();
const form = document.querySelector<HTMLFormElement>('#investigation-form')!;
const input = document.querySelector<HTMLInputElement>('#username')!;
const button = document.querySelector<HTMLButtonElement>('#submit')!;
const status = document.querySelector<HTMLDivElement>('#status')!;
const error = document.querySelector<HTMLDivElement>('#error')!;
const result = document.querySelector<HTMLElement>('#record')!;
let busy = false;
const session = new InvestigationSession();
let exporting = false;

result.addEventListener('click', async event => {
  if (!(event.target instanceof Element)) return;
  const exportButton = event.target.closest<HTMLButtonElement>('#export-record');
  if (!exportButton || exporting) return;
  const current = session.current();
  if (!current) return;
  // Capture the exact mode and edition at click time, before avatar loading.
  const document = buildExportDocument(current.data, current.record);
  exporting = true;
  exportButton.disabled = true;
  exportButton.textContent = 'PREPARING RECORD…';
  status.hidden = false;
  status.textContent = '> Printing the judicial record. Nothing is uploaded.';
  try {
    const blob = await createRecordPng(document);
    downloadRecord(blob, current.data.profile.login);
    status.textContent = '> PNG ready. Download requested; your browser may show a save or preview prompt.';
  } catch (cause) {
    status.textContent = `> Export failed. ${cause instanceof Error ? cause.message : 'Please retry in a current browser.'}`;
  } finally {
    exporting = false;
    const active = result.querySelector<HTMLButtonElement>('#export-record');
    if (active) { active.disabled = false; active.textContent = 'EXPORT CRIMINAL RECORD'; }
  }
});

function renderCurrent() {
  const current = session.current();
  if (current) result.innerHTML = renderRecord(current.data, current.evidence, current.record, current.appeal);
  if (exporting) {
    const exportButton = result.querySelector<HTMLButtonElement>('#export-record');
    if (exportButton) { exportButton.disabled = true; exportButton.textContent = 'PREPARING RECORD…'; }
  }
}

document.addEventListener('change', event => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement) || !target.name.startsWith('intensity-') || !isIntensity(target.value)) return;
  session.setIntensity(target.value);
  // Preserve the focused radio instead of replacing its containing fieldset.
  if (target.name === 'intensity-after') {
    const controls = result.querySelector('.intensity')!;
    renderCurrent();
    result.querySelector('.intensity')!.replaceWith(controls);
    target.focus({ preventScroll: true });
  } else renderCurrent();
  document.querySelectorAll<HTMLInputElement>('input[name="intensity-before"], input[name="intensity-after"]').forEach(radio => {
    radio.checked = radio.value === session.intensity;
  });
  if (!result.hidden) status.textContent = '> Sentence revised. Same evidence. Zero additional API requests.';
});

result.addEventListener('click', event => {
  if (!(event.target instanceof Element) || !event.target.closest('#remix')) return;
  session.remix();
  renderCurrent();
  result.querySelector<HTMLButtonElement>('#remix')!.focus({ preventScroll: true });
  status.textContent = '> Roast reissued. Three editions per mode; evidence unchanged.';
});

result.addEventListener('click', event => {
  if (!(event.target instanceof Element) || busy) return;
  const defense = event.target.closest<HTMLButtonElement>('button[data-defense]')?.dataset.defense;
  if (!defense || !isDefense(defense)) return;
  const appeal = session.submitDefense(defense);
  if (!appeal) return;
  // Update only the hearing, preserving receipts, export state, and the sentence.
  result.querySelector('#plea-bargain')!.outerHTML = renderAppeal(appeal);
  result.querySelector<HTMLElement>('#appeal-transcript')!.focus();
});

form.addEventListener('submit', async event => {
  event.preventDefault();
  if (busy) return;
  input.value = input.value.trim();
  if (!form.reportValidity()) return;
  busy = true;
  button.disabled = true;
  input.disabled = true;
  button.textContent = 'INVESTIGATING…';
  error.hidden = true;
  result.hidden = true;
  status.hidden = false;
  form.setAttribute('aria-busy', 'true');
  try {
    await session.open(input.value, step => {
      const steps = ['Locating public GitHub profile…', 'Profile located. Retrieving public repositories…', 'Evidence retrieved. Preparing the fictional record…'];
      status.textContent = `> ${steps[step]}`;
    });
    renderCurrent();
    result.hidden = false;
    status.textContent = '> Case closed. The receipts are below.';
    result.focus({ preventScroll: true });
    result.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start' });
  } catch (cause) {
    status.hidden = true;
    error.textContent = cause instanceof Error ? cause.message : 'Investigation interrupted. Please retry.';
    error.hidden = false;
  } finally {
    busy = false;
    button.disabled = false;
    input.disabled = false;
    button.innerHTML = 'INITIATE INVESTIGATION <span aria-hidden="true">↗</span>';
    form.removeAttribute('aria-busy');
  }
});

mountAccompliceMode();
