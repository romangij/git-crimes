import type { CriminalRecord, Evidence, Investigation } from './types';

export const escapeHtml = (value: string): string => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!);
const safeUrl = (value: string, host: string): string => {
  try { const url = new URL(value); return url.protocol === 'https:' && url.hostname === host ? escapeHtml(url.href) : ''; } catch { return ''; }
};

export function shell(): string {
  return `
    <header class="topbar"><a class="wordmark" href="./" aria-label="Git Crimes home"><span class="badge">G</span> GIT CRIMES<span class="division"> / GCPD</span></a><span class="online"><i></i> DIVISION ONLINE</span></header>
    <main>
      <section class="intro"><div class="eyebrow">GITHUB CRIMINAL INVESTIGATION DIVISION</div><h1>YOU CAN COMMIT.<br>YOU CAN’T <span>HIDE.</span></h1><p>Your GitHub history is a crime scene.<br class="mobile-break"> We have the receipts.</p><div class="stamp">PUBLIC DATA.<br>QUESTIONABLE JUSTICE.</div></section>
      <section class="terminal" aria-label="Investigation terminal"><div class="terminal-bar"><span><b class="dot red"></b><b class="dot amber"></b><b class="dot green"></b></span><span>gcpd / investigation-terminal</span><span class="terminal-version">v0.1.0</span></div>
        <div class="terminal-body"><p class="command"><span>root@gcpd</span>:~$ open_case<span class="cursor">▌</span></p><h2>Every developer has a record.</h2><p class="muted">Enter a public GitHub username. Let’s pull the thread.</p>
          <form id="investigation-form"><label for="username">SUSPECT’S GITHUB USERNAME</label><div class="input-row"><div class="input-wrap"><span aria-hidden="true">@</span><input id="username" name="username" placeholder="octocat" autocomplete="off" autocapitalize="none" spellcheck="false" required maxlength="39" pattern="[a-zA-Z0-9]([a-zA-Z0-9-]{0,37}[a-zA-Z0-9])?" title="Enter a GitHub username using letters, numbers, or hyphens." aria-describedby="privacy" /></div><button id="submit" type="submit">INITIATE INVESTIGATION <span aria-hidden="true">↗</span></button></div></form>
          <p id="privacy" class="privacy">⌁ Public evidence only. No tokens. No secrets. No mercy.</p>
          <div id="status" role="status" aria-live="polite"></div><div id="error" role="alert" hidden></div>
        </div><div class="terminal-bottom"><span>CONNECTION: SECURE ENOUGH</span><span>JURISDICTION: THE INTERNET</span></div>
      </section>
      <section id="record" tabindex="-1" aria-label="Investigation results" hidden></section>
      <section class="protocol" aria-label="How it works"><div><span>01 / IDENTIFY</span><p>You provide the suspect.</p></div><div><span>02 / INVESTIGATE</span><p>We inspect public repo metadata.</p></div><div><span>03 / INDICT</span><p>The evidence writes the roast.</p></div></section>
      <footer><span>GCPD © 2026 · A FICTIONAL DIVISION WITH REAL RECEIPTS</span><span>BUILT WITH CODEX / JSConf GUADALAJARA</span></footer>
    </main>`;
}

export function renderRecord(data: Investigation, evidence: Evidence, record: CriminalRecord): string {
  const { profile } = data;
  const e = escapeHtml;
  return `<div class="record-heading"><span class="eyebrow">INVESTIGATION COMPLETE</span><span class="case-id">CASE ${e(record.caseId)}</span></div>
    <div class="suspect"><img src="${safeUrl(profile.avatar_url, 'avatars.githubusercontent.com')}" alt="${e(profile.login)}’s GitHub avatar" width="80" height="80" referrerpolicy="no-referrer" /><div><span class="eyebrow">SUBJECT’S CRIMINAL RECORD</span><h2><a href="https://github.com/${encodeURIComponent(profile.login)}" target="_blank" rel="noopener noreferrer">@${e(profile.login)}</a></h2><p>${e(profile.name ?? 'Identity: proudly pseudonymous')}</p></div><span class="record-stamp">${record.charges.length ? 'CHARGED' : 'CLEARED'}</span></div>
    <div class="stats"><div><strong>${evidence.total}</strong><span>REPOS INSPECTED</span></div><div><strong>${evidence.originals.length}</strong><span>ORIGINAL REPOS</span></div><div><strong>${evidence.forks.length}</strong><span>FORKS FOUND</span></div><div><strong>${record.charges.length}</strong><span>CHARGES FILED</span></div></div>
    <p class="coverage">Evidence scope: ${data.repos.length} of ${profile.public_repos} public repositories reported by GitHub; up to 100 most recently updated. ${profile.public_repos > data.repos.length ? 'This is a partial sample; older repositories were not inspected.' : 'All returned public repositories inspected.'} Retrieved ${e(new Date(data.retrievedAt).toLocaleString())}. Repository metadata only; no files, dependencies, or commit histories analyzed.</p>
    <div class="charges">${record.charges.length ? record.charges.map((charge, index) => `<article class="charge"><div class="charge-top"><span>COUNT ${String(index + 1).padStart(2, '0')} / ${charge.code}</span><span class="severity ${charge.severity === 'FELONY' ? 'felony' : ''}">${charge.severity}</span></div><h3>${e(charge.title)}</h3><p>${e(charge.evidence)}</p><details><summary>VIEW RECEIPTS (${charge.repos.length})</summary><ul>${charge.repos.map(repo => `<li><a href="${safeUrl(repo.html_url, 'github.com')}" target="_blank" rel="noopener noreferrer">${e(repo.name)} ↗</a><span>${charge.code === 'GC-101' ? `Last push: ${e(repo.pushed_at ?? 'unknown')}` : charge.code === 'GC-204' ? e(repo.language ?? '') : charge.code === 'GC-404' ? 'Description: absent' : charge.code === 'GC-409' ? 'Fork: yes' : charge.code === 'GC-000' ? 'Size: 0 KB' : 'Original repository'}</span></li>`).join('')}</ul></details></article>`).join('') : `<div class="empty"><h3>${data.repos.length ? 'No charges supported by this evidence.' : 'No public repositories to inspect.'}</h3><p>The department refuses to invent evidence. A rare moment of professionalism.</p></div>`}</div>
    <div class="verdict"><span class="eyebrow">THE VERDICT</span><h3>${e(record.verdict)}</h3><p><strong>SENTENCE:</strong> ${e(record.sentence)}</p></div><p class="disclaimer">This is developer satire. All charges and sentences are fictional. Stale repositories can be finished projects. Forks are perfectly legal.</p>`;
}
