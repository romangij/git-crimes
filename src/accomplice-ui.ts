import { escapeHtml as e } from './ui';
import type { JointRecord } from './accomplice';
import { jointVerdict } from './accomplice-verdict';

export function jointTerminal() {
  return `<p class="muted">CRIMINAL SHOWDOWN / Two suspects. One mastermind. Fictional roles. Public evidence.</p><form id="joint-form"><div class="joint-inputs">${[0, 1].map(i => `<div><label for="joint-${i}">SUSPECT ${i + 1} / GITHUB USERNAME</label><div class="input-wrap"><span aria-hidden="true">@</span><input id="joint-${i}" autocomplete="off" autocapitalize="none" spellcheck="false" required maxlength="39" placeholder="${i ? 'hubot' : 'octocat'}" /></div></div>`).join('')}</div><button type="submit">INVESTIGATE BOTH</button></form><p class="privacy">Public metadata only. No joint PNG export or plea bargain in v0.5.</p><div id="joint-status" role="status" aria-live="polite"></div><div id="joint-error" role="alert" hidden></div>`;
}

export function renderJoint(record: JointRecord) {
  const verdict = jointVerdict(record);
  const outcome = record.outcome === 'assigned' ? 'MASTERMIND IDENTIFIED' : record.outcome === 'tie' ? 'DEAD HEAT / NO MASTERMIND' : 'INSUFFICIENT EVIDENCE / NO MASTERMIND';
  return `<header class="showdown-heading"><span class="eyebrow">GCPD / FICTIONAL ROLE ASSIGNMENT</span><h2>CRIMINAL SHOWDOWN</h2><p>Two suspects. One mastermind.</p><strong class="showdown-outcome">${outcome}</strong></header>
    <div class="showdown-matchup">${record.suspects.map(({ data }, i) => {
      const mastermind = record.outcome === 'assigned' && record.winner === i;
      const role = record.outcome !== 'assigned' ? 'ROLE UNASSIGNED' : mastermind ? 'CRIMINAL MASTERMIND' : 'WILLING ACCOMPLICE';
      const avatar = avatarUrl(data.profile.avatar_url);
      return `${i ? '<div class="showdown-vs" aria-label="versus"><span>VS</span></div>' : ''}<article class="showdown-dossier ${mastermind ? 'is-mastermind' : record.outcome === 'assigned' ? 'is-accomplice' : 'is-unassigned'}">
        <div class="dossier-topline"><span>PUBLIC DOSSIER / 0${i + 1}</span><span>FICTIONAL</span></div>
        <div class="showdown-portrait"><span aria-hidden="true">${e(data.profile.login.slice(0, 2).toUpperCase())}</span>${avatar ? `<img src="${avatar}" alt="GitHub avatar of @${e(data.profile.login)}" width="176" height="176" referrerpolicy="no-referrer" />` : ''}</div>
        <h3><a href="https://github.com/${encodeURIComponent(data.profile.login)}" target="_blank" rel="noopener noreferrer">@${e(data.profile.login)}</a></h3><p class="dossier-name">${e(data.profile.name ?? 'Pseudonym on file')}</p>
        <div class="showdown-stamp">${role}</div><p class="dossier-caption">${mastermind ? 'LEAD ROLE / SATIRE ONLY' : record.outcome === 'assigned' ? 'SUPPORTING ROLE / SATIRE ONLY' : record.outcome === 'tie' ? 'SAME INDEX. NO TIE-BREAK.' : 'THE COURT WITHHOLDS JUDGMENT.'}</p>
      </article>`;
    }).join('')}</div>
    <section class="verdict showdown-verdict" aria-labelledby="joint-verdict-heading"><h3 id="joint-verdict-heading" class="eyebrow">THE COURT HAS REACHED A VERDICT</h3><p class="verdict-text">${e(verdict)}</p></section>
    <p class="disclaimer">Fictional developer satire. These roles do not establish real misconduct or imply that these accounts collaborated.</p>
    <details class="joint-method"><summary>EXAMINE THE EVIDENCE</summary><div class="joint-suspects">${record.suspects.map(({ data, charges }, i) => `<article class="charge"><span class="eyebrow">${record.winner === null ? 'ROLE UNASSIGNED' : record.winner === i ? 'CRIMINAL MASTERMIND' : 'WILLING ACCOMPLICE'}</span><h2><a href="https://github.com/${encodeURIComponent(data.profile.login)}" target="_blank" rel="noopener noreferrer">@${e(data.profile.login)}</a></h2><p>${e(data.profile.name ?? 'Pseudonym on file')}</p><p class="joint-score">${record.outcome === 'insufficient' ? 'Score withheld' : `${(record.scores[i] / 100).toFixed(2)} / 100 fictional evidence index`}</p><p class="coverage">${data.repos.length} inspected / ${e(String(data.profile.public_repos))} reported public repositories. Up to 100 most recently updated; ${data.profile.public_repos > data.repos.length ? 'partial sample' : 'all returned repositories'}. Retrieved ${e(data.retrievedAt)}.</p>${charges.length ? charges.map(c => `<details><summary>${c.code} / ${c.repos.length} supporting repositories</summary><p>${e(c.evidence)}</p><ul>${c.repos.map(r => `<li><a href="https://github.com/${encodeURIComponent(data.profile.login)}/${encodeURIComponent(r.name)}" target="_blank" rel="noopener noreferrer">${e(r.name)}</a></li>`).join('')}</ul></details>`).join('') : '<p>No eligible normalized findings supported by known metadata.</p>'}</article>`).join('')}</div><p>Equal-weight mean of eligible finding proportions across shared dimensions; at least 3 relevant repositories per suspect and 2 shared dimensions required. Existing charge thresholds apply: below-threshold findings count as zero. Repository creation counts are excluded. Unknown metadata excludes a dimension for both suspects. Scores rounded to 0.01; equal scores leave roles unassigned.</p><div class="comparison-scroll"><table><caption>Eligible findings / relevant repositories (not overall account totals)</caption><thead><tr><th>Dimension</th>${record.suspects.map(s => `<th>@${e(s.data.profile.login)}</th>`).join('')}<th>Used?</th></tr></thead><tbody>${record.rows.map(r => `<tr><th>${r.label}</th>${r.counts.map(c => `<td>${c.complete ? `${c.numerator} / ${c.denominator}` : 'Incomplete metadata'}</td>`).join('')}<td>${r.comparable ? 'YES' : 'NO / incomplete or fewer than 3'}</td></tr>`).join('')}</tbody></table></div><p>Staleness uses non-archived originals with known push dates; language, descriptions and size use originals; forks use the entire sample. No files or private activity inspected. Different samples and charge thresholds can affect results. This index measures fictional findings in returned metadata, not developer skill or real wrongdoing.</p></details><p class="disclaimer">All crimes, roles and verdicts are fictional developer satire. Missing metadata is not proof of guilt. No real collaboration or relationship between these accounts is implied.</p>`;
}

function avatarUrl(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' && url.hostname === 'avatars.githubusercontent.com' && !url.username && !url.password ? e(url.href) : '';
  } catch { return ''; }
}
