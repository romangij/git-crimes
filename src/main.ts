import './style.css';
import { InvestigationSession } from './session';
import { isIntensity } from './intensity';
import { renderRecord, shell } from './ui';

document.querySelector<HTMLDivElement>('#app')!.innerHTML = shell();
const form = document.querySelector<HTMLFormElement>('#investigation-form')!;
const input = document.querySelector<HTMLInputElement>('#username')!;
const button = document.querySelector<HTMLButtonElement>('#submit')!;
const status = document.querySelector<HTMLDivElement>('#status')!;
const error = document.querySelector<HTMLDivElement>('#error')!;
const result = document.querySelector<HTMLElement>('#record')!;
let busy = false;
const session = new InvestigationSession();

function renderCurrent() {
  const current = session.current();
  if (current) result.innerHTML = renderRecord(current.data, current.evidence, current.record);
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
