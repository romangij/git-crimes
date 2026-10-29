import './style.css';
import { investigate } from './github';
import { analyzeEvidence } from './evidence';
import { generateRecord } from './charges';
import { renderRecord, shell } from './ui';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = shell();
const form = document.querySelector<HTMLFormElement>('#investigation-form')!;
const input = document.querySelector<HTMLInputElement>('#username')!;
const button = document.querySelector<HTMLButtonElement>('#submit')!;
const status = document.querySelector<HTMLDivElement>('#status')!;
const error = document.querySelector<HTMLDivElement>('#error')!;
const result = document.querySelector<HTMLElement>('#record')!;
let busy = false;

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
    const data = await investigate(input.value, step => {
      const steps = ['Locating public GitHub profile…', 'Profile located. Retrieving public repositories…', 'Evidence retrieved. Preparing the fictional record…'];
      status.textContent = `> ${steps[step]}`;
    });
    const date = new Date(data.retrievedAt);
    const evidence = analyzeEvidence(data.repos, date);
    result.innerHTML = renderRecord(data, evidence, generateRecord(data.profile, evidence, date));
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
