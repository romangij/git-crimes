import { AccompliceSession } from './accomplice';
import { jointTerminal, renderJoint } from './accomplice-ui';

/** Isolated DOM and state: switching modes never changes an ongoing solo case. */
export function mountAccompliceMode() {
  const soloForm = document.querySelector<HTMLElement>('#investigation-form')!;
  const soloIntensity = document.querySelector<HTMLElement>('.terminal-body > .intensity')!;
  const soloRecord = document.querySelector<HTMLElement>('#record')!;
  const soloStatus = document.querySelector<HTMLElement>('#status')!;
  const soloError = document.querySelector<HTMLElement>('#error')!;
  const solo = document.createElement('div');
  solo.id = 'solo-panel';
  soloForm.before(solo);
  [soloForm, soloIntensity, document.querySelector('#privacy')!, soloStatus, soloError].forEach(el => solo.append(el));
  const switcher = document.createElement('div');
  switcher.className = 'investigation-modes';
  switcher.setAttribute('role', 'group');
  switcher.setAttribute('aria-label', 'Investigation mode');
  switcher.innerHTML = '<button type="button" aria-pressed="true" data-mode="solo">SOLO INVESTIGATION</button><button type="button" aria-pressed="false" data-mode="joint">ACCOMPLICE MODE</button>';
  solo.before(switcher);
  const joint = document.createElement('div');
  joint.id = 'joint-panel';
  joint.hidden = true;
  joint.innerHTML = jointTerminal();
  solo.after(joint);
  const jointRecord = document.createElement('section');
  jointRecord.id = 'joint-record';
  jointRecord.tabIndex = -1;
  jointRecord.hidden = true;
  jointRecord.setAttribute('aria-label', 'Joint investigation results');
  soloRecord.after(jointRecord);
  // Keep the dossier initials visible when an avatar is blocked or unavailable.
  jointRecord.addEventListener('error', event => {
    if (event.target instanceof HTMLImageElement) event.target.hidden = true;
  }, true);
  // Wrapper keeps hidden results hidden even when an in-flight solo request finishes.
  const soloResultPanel = document.createElement('div');
  soloRecord.before(soloResultPanel);
  soloResultPanel.append(soloRecord);
  let mode = 'solo';
  switcher.addEventListener('click', event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('button[data-mode]');
    if (!button) return;
    mode = button.dataset.mode!;
    solo.hidden = soloResultPanel.hidden = mode !== 'solo';
    joint.hidden = mode !== 'joint';
    jointRecord.hidden = mode !== 'joint' || !session.current();
    switcher.querySelectorAll('button').forEach(b => b.setAttribute('aria-pressed', String(b === button)));
  });
  const session = new AccompliceSession();
  const form = joint.querySelector<HTMLFormElement>('form')!;
  const status = joint.querySelector<HTMLElement>('#joint-status')!;
  const error = joint.querySelector<HTMLElement>('#joint-error')!;
  let busy = false;
  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (busy) return;
    const inputs = [...form.querySelectorAll('input')];
    const button = form.querySelector('button')!;
    busy = true;
    inputs.forEach(input => { input.value = input.value.trim(); input.disabled = true; });
    button.disabled = true;
    button.textContent = 'INVESTIGATING BOTH…';
    form.setAttribute('aria-busy', 'true');
    error.hidden = true;
    status.textContent = '> Retrieving both public evidence files…';
    jointRecord.hidden = true;
    try {
      const record = await session.open(inputs[0].value, inputs[1].value);
      jointRecord.innerHTML = renderJoint(record);
      jointRecord.hidden = mode !== 'joint';
      status.textContent = '> Both evidence files retrieved. Joint hearing complete.';
      if (mode === 'joint') jointRecord.focus({ preventScroll: true });
    } catch (cause) {
      status.textContent = '';
      error.textContent = cause instanceof Error ? cause.message : 'Joint investigation interrupted. Retry both suspects.';
      error.hidden = false;
    } finally {
      busy = false;
      inputs.forEach(input => { input.disabled = false; });
      button.disabled = false;
      button.textContent = 'INVESTIGATE BOTH';
      form.removeAttribute('aria-busy');
    }
  });
}
