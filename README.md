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
- `src/export-record.ts`: export data mapping, measured text layout, CORS-safe avatar loading, judicial Canvas rendering, PNG encoding, and local download.
- `src/ui.ts`: escaped HTML rendering.
- `src/main.ts`: investigation lifecycle.
- `src/style.css`: responsive styling.
- `src/analysis.test.ts`: evidence boundaries, charge thresholds, cleared states, deterministic results, receipts, and escaping.
- `src/github.test.ts`: request count, progress, missing users, rate limits, and network failures with mocked API responses.
- `src/roast.test.ts`: all modes, factual invariance, deterministic editions, sparse profiles, safe rendering, and request-free mode switching/reissuing.
- `src/export-record.test.ts`: current snapshot mapping, cleared exports, all mode/edition layouts, long-text wrapping, avatar origin/CORS/error/timeout behavior, PNG encoding, and download cleanup. Canvas and DOM are mocked; these tests do not replace browser rendering checks.

## Known limitations

- Inspects only the 100 most recently updated public repositories owned by an account, including forks. Sample size and partial coverage are disclosed. No pagination or private data.
- GitHub commonly allows 60 unauthenticated API requests/hour per IP. Shared conference Wi-Fi can exhaust that allowance. Each request has a 15-second timeout.
- No files, dependency manifests, README content, or commit histories are fetched. Primary language does not prove dependency usage; absent description does not imply missing documentation. Zero KB is metadata, not proof of no files.
- Profile and repository requests are separate snapshots; counts may change between them. Metadata may lag actual activity.
- Cases identify an account and UTC date; nothing persists after reload. Rules are deterministic for identical data and clock, but live data changes.
- Humor is a finite curated template set, not AI generation. Three editions per mode repeat by design. Only the active investigation is retained in memory; submitting a username again explicitly fetches fresh evidence.
- Export includes one principal charge, not the full record or repository list. It discloses sample coverage and metadata-only scope. All judicial language is fictional.
- Avatar loading is restricted to HTTPS `avatars.githubusercontent.com` with anonymous CORS and a four-second timeout. Missing/blocked avatars use a silhouette; a canvas security failure retries without the photo. System Courier fonts avoid external font dependencies in the PNG, but metrics may vary slightly by platform.
- Export text is wrapped and measured down to a minimum of 14 px without silent truncation. If future templates exceed the available space, export shows an error rather than dropping evidence or the sentence.
- Downloads depend on browser save behavior. Mobile browsers may present a preview or save prompt; use the browser's image/file save controls if prompted. Desktop Chrome/Firefox/Safari and physical iOS/Android download behavior still require manual verification, including successful-avatar and blocked-avatar exports and maximum-length usernames.
- Internet access is required. Optional Google Fonts falls back to local monospace fonts.
- Automated tests cover pure analysis and generation; browser interaction and live GitHub availability require manual verification.

## Planned enhancements

Optional AI roast engine behind the evidence contract, persistent archives, sharing, and broader paginated evidence retrieval. These are future work. No OpenAI/OpenRouter integration, database, authentication, leaderboard, or deployment infrastructure is included.
