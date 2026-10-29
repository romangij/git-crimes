# GIT CRIMES

**Your GitHub history is a crime scene. We have the receipts.**

A fictional GitHub Criminal Investigation Division for JSConf Guadalajara, October 28–29, 2026. Enter a public GitHub username for a developer roast supported by real repository metadata. All charges and sentences are satire.

Developed using **OpenAI Codex during the OpenAI Codex Build Day**.

## Installation and development

Requires Node.js 22.12+ (22.x), 24.x, or 26+ and npm. Node 24 LTS is a suitable default.

```sh
npm install
npm run dev
```

Open the Vite URL (normally http://localhost:5173).

```sh
npm run build    # TypeScript check and production build
npm test         # Automated tests
npm run preview # Preview production build
```

## Features

- **Accomplice Mode (v0.5):** switch between independent solo and joint investigations. Investigate two distinct public GitHub usernames, inspect both evidence files and comparison ratios, and receive fictional CRIMINAL MASTERMIND / WILLING ACCOMPLICE roles only when comparable scores differ. Ties and insufficient evidence leave both roles unassigned. Joint cases do not support PNG export, intensity controls, or Plea Bargain. Solo features remain available in the solo panel.

- **Plea Bargain (v0.4):** after THE SENTENCE, choose I PLEAD NOT GUILTY, IT WORKS ON MY MACHINE, or BLAME THE INTERN. A terminal court transcript quotes the statement, responds with existing lead-charge evidence and a mode-specific judge quip, and concludes APPEAL DENIED.
- One appeal is allowed per issued sentence. A successful new investigation (including the same username), a changed intensity, or any reissued roast resets it. Re-selecting the current intensity does not. A failed investigation does not issue a new sentence.
- Appeals use six charge-specific template sets that weave retrieved counts and metadata into the punchline. Innocence, localhost alibis, and imaginary delegation have distinct comedic premises, without a repeated factual appendix. Replies stay within two sentences and do not infer abandonment, local activity, file contents, or a real intern.
- Appeals are deterministic with three response variants per defense and mode. Case, intensity, and defense select the starting variant; the explicit roast edition advances it. REISSUE ROAST unlocks another appeal and changes the judge wording for the same defense, cycling after three editions. No additional API calls occur. Cleared cases receive a generic ceremonial-send-off response that explicitly preserves their clearance. Appeals never change charges, verdicts, sentences, or PNG exports.
- **Export Your Criminal Record (v0.3):** use **EXPORT CRIMINAL RECORD** beneath the sentence to download a 1200 × 630 PNG. The ivory judicial document includes the public avatar (or dossier silhouette), username, case ID, current intensity, principal charge and factual evidence, current verdict and sentence, and `git-crimes.pages.dev`.
- Export captures the mode and roast edition at click time. The principal charge uses the engine's stable order (abandonment, language, creation, descriptions, forks, empty size); cleared profiles get a CLEARED stamp and an insufficient-evidence finding instead of a conviction.
- Canvas rendering and PNG encoding run entirely in the browser. Nothing is uploaded, published, or persisted by the app. The existing public avatar may be requested anonymously from GitHub; no additional profile/repository API calls are made.
- **Choose Your Sentence (v0.2):** select FRIENDLY WARNING, FELONY (default), or UNHINGED before investigating, then switch directly above the record. Modes range from gentle lint-warning humor to theatrical rubber-duck tribunals.
- Mode changes instantly reuse the current evidence snapshot without additional GitHub requests. The selectors stay synchronized, including when a mode is chosen during loading.
- **REISSUE ROAST** cycles through three deterministic editions per mode: different charge jokes, verdicts, and sentences, with the same factual findings and case ID. Editions cycle after three; switching mode preserves the current edition. A fresh investigation starts at edition one, with its initial wording selected by account ID and sample size.
- Zero-repository and below-threshold samples get mode-specific insufficient-evidence jokes and fictional releases. No charges or private activity are invented to fill the page.
- Roast text is displayed separately from labeled factual evidence. Intensity changes presentation only; eligibility, severity, repository links, and statistics stay identical.
- Responsive terminal interface with reduced motion support, keyboard access, and live progress without artificial delays.
- Real GitHub public profile and up to 100 repositories, using two requests per investigation with no token.
- Six deterministic possible charges with linked receipts, case ID, avatar, statistics, verdict, and sentence.
- Cleared records when evidence supports no charges, including accounts with no public repositories.
- Missing-user, rate-limit/access restriction, network, and timeout errors; retry through the form.
- Escaped public text and restricted outbound repository/avatar URLs.

## Evidence rules

Rules use the retrieved sample; forks are excluded from original-repository rules.

| Charge | Required evidence |
| --- | --- |
| Repository Abandonment | One or more original, non-archived repos with last push over 365 days ago |
| JavaScript Allegiance | Three or more originals with primary language JavaScript or TypeScript |
| Serial Repository Creation | Ten or more originals |
| Description Negligence | Three or more originals with missing or blank descriptions |
| Excessive Fork Possession | Five or more forks |
| Empty Promise | One or more originals with reported size 0 KB |

## Architecture

- `src/github.ts`: API retrieval, progress, and errors.
- `src/types.ts`: shared data contracts.
- `src/evidence.ts`: pure analysis with explicit clock.
- `src/eligibility.ts`: factual charge eligibility and evidence statements, independent of humor.
- `src/intensity.ts`: typed modes, labels, descriptions, and default.
- `src/humor.ts`: curated mode-specific charge titles, joke variants, verdicts, sentences, and cleared-record commentary.
- `src/charges.ts`: deterministic presentation assembly and case generation.
- `src/session.ts`: active evidence snapshot, mode selection, and three-edition cycle. Only opening an investigation performs network requests.
- `src/appeal.ts`: defense options, pure evidence-aware judge responses, and appeal data types; one-shot/reset state is owned by the session.
- `src/appeal-templates.ts`: charge-specific defense writing, cleared-case replies, and mode-aware courtroom wording; counts come from the existing charge's supporting repositories.
- `src/export-record.ts`: export data mapping, measured text layout, CORS-safe avatar loading, judicial Canvas rendering, PNG encoding, and local download.
- `src/ui.ts`: escaped HTML rendering.
- `src/main.ts`: investigation lifecycle.
- `src/style.css`: responsive styling.
- `src/analysis.test.ts`: evidence boundaries, charge thresholds, cleared states, deterministic results, receipts, and escaping.
- `src/github.test.ts`: request count, progress, missing users, rate limits, and network failures with mocked API responses.
- `src/roast.test.ts`: all modes, factual invariance, deterministic editions, sparse profiles, safe rendering, and request-free mode switching/reissuing.
- `src/appeal.test.ts`: defenses, evidence and cleared fallbacks, deterministic variants, one-shot/reset state, unchanged exports, request counts, and transcript rendering.
- `src/export-record.test.ts`: current snapshot mapping, cleared exports, all mode/edition layouts, long-text wrapping, avatar origin/CORS/error/timeout behavior, PNG encoding, and download cleanup. Canvas and DOM are mocked; these tests do not replace browser rendering checks.

## Known limitations

- Inspects only the 100 most recently updated public repositories owned by an account, including forks. Sample size and partial coverage are disclosed. No pagination or private data.
- GitHub commonly allows 60 unauthenticated API requests/hour per IP. Shared conference Wi-Fi can exhaust that allowance. Each request has a 15-second timeout.
- No files, dependency manifests, README content, or commit histories are fetched. Primary language does not prove dependency usage; absent description does not imply missing documentation. Zero KB is metadata, not proof of no files.
- Profile and repository requests are separate snapshots; counts may change between them. Metadata may lag actual activity.
- Cases identify an account and UTC date; nothing persists after reload. Rules are deterministic for identical data and clock, but live data changes.
- Humor is a finite curated template set, not AI generation. Three editions per mode repeat by design. Only the active solo and active joint investigations are retained separately in memory; submitting a username again explicitly fetches fresh evidence.
- Export includes one principal charge, not the full record or repository list. It discloses sample coverage and metadata-only scope. All judicial language is fictional.
- Avatar loading is restricted to HTTPS `avatars.githubusercontent.com` with anonymous CORS and a four-second timeout. Missing/blocked avatars use a silhouette; a canvas security failure retries without the photo. System Courier fonts avoid external font dependencies in the PNG, but metrics may vary slightly by platform.
- Export text is wrapped and measured down to a minimum of 14 px without silent truncation. If future templates exceed the available space, export shows an error rather than dropping evidence or the sentence.
- Downloads depend on browser save behavior. Mobile browsers may present a preview or save prompt; use the browser's image/file save controls if prompted. Desktop Chrome/Firefox/Safari and physical iOS/Android download behavior still require manual verification, including successful-avatar and blocked-avatar exports and maximum-length usernames.
- Internet access is required. Optional Google Fonts falls back to local monospace fonts.
- Automated tests cover pure analysis and generation; browser interaction and live GitHub availability require manual verification.

## Planned enhancements

Optional AI roast engine behind the evidence contract, persistent archives, sharing, and broader paginated evidence retrieval. These are future work. No OpenAI/OpenRouter integration, database, authentication, leaderboard, or deployment infrastructure is included.

## Accomplice comparison methodology (v0.5)

The joint engine reuses `investigate`, `analyzeEvidence`, and `eligibleCharges`. Each account costs the existing profile request plus one repository-page request (four requests total on success); no new endpoints, dependencies, authentication, or persistence. Both requests must succeed before any verdict appears. Failures identify the affected username, clear the previous joint case, and require retrying both accounts. Duplicate names are rejected case-insensitively before fetching; aliases resolving to one account are rejected after fetching.

For each dimension, the numerator is the number of supporting repositories **only if the existing charge threshold is met**, otherwise zero:

| Dimension | Denominator | Existing eligibility threshold |
| --- | --- | --- |
| Staleness | Non-archived original repositories | At least 1 last push older than 365 days |
| JS / TS primary language | Original repositories | At least 3 JS / TS originals |
| Absent / blank description | Original repositories | At least 3 undescribed originals |
| Forks | All inspected repositories | At least 5 forks |
| Reported zero KB | Original repositories | At least 1 zero-KB original |

GC-303 (raw original repository count) is excluded entirely from joint findings and scoring. Each dimension must have at least **3 relevant repositories per account**, and all relevant metadata must be known on both sides. Otherwise the dimension is excluded for **both** suspects. Unknown fork flags exclude all dimensions; unknown archive flags exclude staleness; null/invalid push dates, null languages, omitted descriptions, or missing/invalid sizes exclude their respective dimensions. GitHub's explicit null description means no description (an existing satirical rule); an omitted description is unknown. Null language means unknown, not proof of language allegiance. Archived repositories do not count toward the staleness denominator. Unknown values are also removed from charge evidence before applying thresholds.

At least **2 shared dimensions** are required. The fictional evidence index is `100 ? mean(eligible findings / relevant repositories)` across those same dimensions, equally weighted, rounded to two decimal places. The higher displayed score receives CRIMINAL MASTERMIND; the other receives WILLING ACCOMPLICE. Equal rounded scores produce a tie, without a username/ID tie-breaker. Insufficient evidence withholds scores and roles. Both accounts use the later retrieval timestamp as a common abandonment clock. Identical snapshots and clock produce identical results; input order does not change which account wins.

This is an interpretable satire heuristic, not a statistical confidence estimate or a measure of developer skill. Charge thresholds create discontinuities: equal proportions can differ when only one sample reaches an eligibility threshold. The minimum sample guard is conservative, not a significance test. The up-to-100 most recently updated samples may differ in size, coverage, and composition. No conclusions about an entire account, actual collaboration, private work, or real wrongdoing are justified. All roles and crimes are fictional.

Implementation: `src/accomplice.ts` owns comparison and joint session state; `src/accomplice-ui.ts` renders the form, evidence, methodology and verdict; `src/accomplice-controller.ts` owns independent DOM/lifecycle state. `src/accomplice.test.ts` covers normalized comparisons, thresholds, order stability, sparse and incomplete metadata, failures, escaping, and solo session isolation.

### Manual browser checks for v0.5

1. Run `npm run dev`, open the Vite URL, and investigate a public account in SOLO INVESTIGATION. Change intensity, reissue the roast, submit a plea, and download a PNG.
2. Switch to ACCOMPLICE MODE, enter two distinct public accounts, and select INVESTIGATE BOTH. Confirm two evidence cards, sample coverage, linked receipts, fictional verdict and methodology table. Expand EXAMINE THE EVIDENCE and verify the equal-weight mean using only YES rows. Confirm no joint export or plea controls.
3. Switch back to solo and confirm its intensity, edition, evidence and appeal remain intact. Switch during either investigation's loading state and confirm the result appears only in its own mode.
4. Reverse the two usernames and check roles follow the account for unchanged evidence. Try two sparse accounts (or fixture responses with equal ratios) and confirm roles remain unassigned.
5. Try case variants of the same username, whitespace, invalid punctuation, consecutive hyphens, and a nonexistent account. Confirm specific errors and no stale joint verdict. Retry with valid names.
6. In browser network tools, block one `/repos` request or simulate offline/403/429 responses. Confirm the affected suspect is identified, no partial verdict appears, and solo state remains usable. A successful joint request should make four GitHub API calls.
7. Check a narrow mobile viewport, keyboard-only mode switching and form submission, visible focus, live progress/errors, long names, and horizontally scrollable comparison table. Test in current Chrome, Firefox and Safari.

Automated tests do not exercise an actual browser DOM or live GitHub. Browser layout, accessibility, in-flight switching and real network behavior still require these manual checks.

### Accomplice showdown presentation

Joint results lead with CRIMINAL SHOWDOWN, two large public avatars (initials if unavailable), a VS separator, and distinct fictional role stamps. Ties and insufficient evidence explicitly withhold a mastermind. The verdict immediately follows the matchup; scores, coverage, charge codes, linked receipts, and methodology sit inside the initially collapsed EXAMINE THE EVIDENCE panel.

`src/accomplice-verdict.ts` adds presentation only. For an assigned result, it selects the largest positive proportional contribution among dimensions already marked comparable by the existing engine, contrasts eligible counts and denominators, and uses a finding-specific developer punchline. Equal contributions use existing dimension order. A zero eligible numerator is described as no eligible charge, not as proof that no matching repositories exist. Tie and insufficient-evidence copy does not select a winner or imply collaboration. Scoring and API requests are unchanged.

Manual visual checks: verify avatar loading and blocked-avatar initials, a winner in either position, nonzero and zero-score ties, insufficient evidence, 39-character usernames, mobile stacked dossiers, keyboard access to the evidence disclosure, and preserved solo behavior. Browser layout and image-error handling require manual verification.
