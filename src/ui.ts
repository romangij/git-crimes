import type { CriminalRecord, Evidence, Investigation } from './types';
import { DEFAULT_INTENSITY, INTENSITIES } from './intensity';
import { DEFENSES } from './appeal';
import type { Appeal } from './appeal';

export function intensitySelector(name: string, selected = DEFAULT_INTENSITY): string {
  return `<fieldset class="intensity"><legend>CHOOSE YOUR SENTENCE</legend><div class="mode-options">${INTENSITIES.map(mode => `<label class="mode-option"><input type="radio" name="${name}" value="${mode.value}" ${mode.value === selected ? 'checked' : ''}><span><strong>${mode.label}</strong><small>${mode.hint}</small></span></label>`).join('')}</div><p>Same evidence. Different prosecutor. Switching modes costs zero API requests.</p></fieldset>`;
}

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const safeUrl = (value: string, host: string): string => {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === host ? escapeHtml(url.href) : ''; } catch { return ''; }
};

export function shell(): string {
  return `
    <header class="topbar"><a class="wordmark" href="./" aria-label="Git Crimes home"><span class="badge">G</span> GIT CRIMES<span class="division"> / GCPD</span></a><span class="online"><i></i> DIVISION ONLINE</span></header>
    <main>
      <section class="intro"><div class="eyebrow">GITHUB CRIMINAL INVESTIGATION DIVISION</div><h1>YOU CAN COMMIT.<br>YOU CAN’T <span>HIDE.</span></h1><p>Your GitHub history is a crime scene.<br class="mobile-break"> We have the receipts.</p><div class="stamp">PUBLIC DATA.<br>QUESTIONABLE JUSTICE.</div></section>
      <section class="terminal" aria-label="Investigation terminal"><div class="terminal-bar"><span><b class="dot red"></b><b class="dot amber"></b><b class="dot green"></b></span><span>gcpd / investigation-terminal</span><span class="terminal-version">v0.5.0</span></div>
        <div class="terminal-body"><p class="command"><span>root@gcpd</span>:~$ open_case<span class="cursor">▌</span></p><h2>Every developer has a record.</h2><p class="muted">Enter a public GitHub username. Let’s pull the thread.</p>
          <form id="investigation-form"><label for="username">SUSPECT’S GITHUB USERNAME</label><div class="input-row"><div class="input-wrap"><span aria-hidden="true">@</span><input id="username" name="username" placeholder="octocat" autocomplete="off" autocapitalize="none" spellcheck="false" required maxlength="39" pattern="[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?" title="Enter a GitHub username using letters, numbers, or hyphens." aria-describedby="privacy" /></div><button id="submit" type="submit">INITIATE INVESTIGATION <span aria-hidden="true">↗</span></button></div></form>
          ${intensitySelector('intensity-before')}
          <p id="privacy" class="privacy">⌁ Public evidence only. No tokens. No secrets. No mercy.</p>
          <div id="status" role="status" aria-live="polite"></div><div id="error" role="alert" hidden></div>
        </div><div class="terminal-bottom"><span>CONNECTION: SECURE ENOUGH</span><span>JURISDICTION: THE INTERNET</span></div>
      </section>
      <section id="record" tabindex="-1" aria-label="Investigation results" hidden></section>
      <section class="protocol" aria-label="How it works"><div><span>01 / IDENTIFY</span><p>You provide the suspect.</p></div><div><span>02 / INVESTIGATE</span><p>We inspect public repo metadata.</p></div><div><span>03 / INDICT</span><p>The evidence writes the roast.</p></div></section>
      <footer><span>GCPD © 2026 · A FICTIONAL DIVISION WITH REAL RECEIPTS</span><span>BUILT WITH CODEX / JSConf GUADALAJARA</span></footer>
    </main>`;
}

export function renderAppeal(appeal?: Appeal): string {
  return `<section id="plea-bargain" class="plea-bargain" aria-labelledby="appeal-heading">
    <h3 id="appeal-heading" class="eyebrow">THE DEFENDANT HAS THE RIGHT TO REMAIN SILENT</h3>
    <p class="appeal-subtitle">Unfortunately, the defendant has chosen to speak.</p>
    <div class="defense-options" role="group" aria-label="Choose a defense; one appeal per sentence">${DEFENSES.map(option => `<button type="button" data-defense="${option.value}" ${appeal ? 'disabled' : ''}>${option.statement}</button>`).join('')}</div>
    ${appeal ? `<div id="appeal-transcript" class="appeal-transcript" tabindex="-1" role="group" aria-label="Court transcript"><p><strong>DEFENDANT &gt;</strong> ${escapeHtml(appeal.statement)}</p><p><strong>JUDGE &gt;</strong> ${escapeHtml(appeal.judge)}</p><p class="appeal-ruling">${appeal.ruling}</p></div><p class="appeal-note">Appeal exhausted. The original verdict and sentence stand. Reissue the roast to try another defense.</p>` : '<p class="appeal-note">One appeal per issued sentence. No additional evidence will be fetched.</p>'}
  </section>`;
}

export function renderRecord(data: Investigation, evidence: Evidence, record: CriminalRecord, appeal?: Appeal): string {
  const { profile } = data;
  const e = escapeHtml;
  return `<div class="record-heading"><span class="eyebrow">INVESTIGATION COMPLETE</span><span class="case-id">CASE ${e(record.caseId)}</span></div>
    <div class="suspect"><img src="${safeUrl(profile.avatar_url, 'avatars.githubusercontent.com')}" alt="${e(profile.login)}’s GitHub avatar" width="80" height="80" referrerpolicy="no-referrer" /><div><span class="eyebrow">SUBJECT’S CRIMINAL RECORD</span><h2><a href="https://github.com/${encodeURIComponent(profile.login)}" target="_blank" rel="noopener noreferrer">@${e(profile.login)}</a></h2><p>${e(profile.name ?? 'Identity: proudly pseudonymous')}</p></div><span class="record-stamp">${record.charges.length ? 'CHARGED' : 'CLEARED'}</span></div>
    ${intensitySelector('intensity-after', record.intensity)}<div class="roast-actions"><span>FICTIONAL ROAST / ${INTENSITIES.find(mode => mode.value === record.intensity)!.label}</span><button id="remix" type="button">REISSUE ROAST</button></div><div class="stats"><div><strong>${evidence.total}</strong><span>REPOS INSPECTED</span></div><div><strong>${evidence.originals.length}</strong><span>ORIGINAL REPOS</span></div><div><strong>${evidence.forks.length}</strong><span>FORKS FOUND</span></div><div><strong>${record.charges.length}</strong><span>CHARGES FILED</span></div></div>
    <p class="coverage">Evidence scope: ${data.repos.length} of ${profile.public_repos} public repositories reported by GitHub; up to 100 most recently updated. ${profile.public_repos > data.repos.length ? 'This is a partial sample; older repositories were not inspected.' : 'All returned public repositories inspected.'} Retrieved ${e(new Date(data.retrievedAt).toLocaleString())}. Repository metadata only; no files, dependencies, or commit histories analyzed.</p>
    <div class="charges">${record.charges.length ? record.charges.map((charge, index) => `<article class="charge"><div class="charge-top"><span>COUNT ${String(index + 1).padStart(2, '0')} / ${charge.code}</span><span class="severity ${charge.severity === 'FELONY' ? 'felony' : ''}">${charge.severity}</span></div><h3>${e(charge.title)}</h3><p class="roast-joke">${e(charge.joke)}</p><p class="factual-evidence"><strong>EVIDENCE:</strong> ${e(charge.evidence)}</p><details><summary>VIEW RECEIPTS (${charge.repos.length})</summary><ul>${charge.repos.map(repo => `<li><a href="${safeUrl(repo.html_url, 'github.com')}" target="_blank" rel="noopener noreferrer">${e(repo.name)} ↗</a><span>${charge.code === 'GC-101' ? `Last push: ${e(repo.pushed_at ?? 'unknown')}` : charge.code === 'GC-204' ? e(repo.language ?? '') : charge.code === 'GC-404' ? 'Description: absent' : charge.code === 'GC-409' ? 'Fork: yes' : charge.code === 'GC-000' ? 'Size: 0 KB' : 'Original repository'}</span></li>`).join('')}</ul></details></article>`).join('') : `<div class="empty"><h3>${data.repos.length ? 'No charges supported by this evidence.' : 'No public repositories to inspect.'}</h3><p>${e(record.commentary)}</p></div>`}</div>
    <div class="verdict">
      <section class="verdict-section" aria-labelledby="verdict-heading"><h3 id="verdict-heading" class="eyebrow">THE VERDICT</h3><p class="verdict-text">${e(record.verdict)}</p></section>
      <section class="sentence-section" aria-labelledby="sentence-heading"><h3 id="sentence-heading" class="eyebrow">THE SENTENCE</h3><p class="sentence-text">${e(record.sentence)}</p></section>
      ${renderAppeal(appeal)}
      <div class="export-actions"><button id="export-record" type="button">EXPORT CRIMINAL RECORD</button><span>1200 × 630 PNG / GENERATED LOCALLY</span></div>
    </div><p class="disclaimer">This is developer satire. All charges and sentences are fictional. Stale repositories can be finished projects. Forks are perfectly legal.</p>`;
}
