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
- `src/charges.ts`: deterministic charge templates and case generation.
- `src/ui.ts`: escaped HTML rendering.
- `src/main.ts`: investigation lifecycle.
- `src/style.css`: responsive styling.
- `src/analysis.test.ts`: evidence boundaries, charge thresholds, cleared states, deterministic results, receipts, and escaping.
- `src/github.test.ts`: request count, progress, missing users, rate limits, and network failures with mocked API responses.

## Known limitations

- Inspects only the 100 most recently updated public repositories owned by an account, including forks. Sample size and partial coverage are disclosed. No pagination or private data.
- GitHub commonly allows 60 unauthenticated API requests/hour per IP. Shared conference Wi-Fi can exhaust that allowance. Each request has a 15-second timeout.
- No files, dependency manifests, README content, or commit histories are fetched. Primary language does not prove dependency usage; absent description does not imply missing documentation. Zero KB is metadata, not proof of no files.
- Profile and repository requests are separate snapshots; counts may change between them. Metadata may lag actual activity.
- Cases identify an account and UTC date; nothing persists after reload. Rules are deterministic for identical data and clock, but live data changes.
- Internet access is required. Optional Google Fonts falls back to local monospace fonts.
- Automated tests cover pure analysis and generation; browser interaction and live GitHub availability require manual verification.

## Planned enhancements

Optional AI roast engine behind the evidence contract, persistent archives, sharing, and broader paginated evidence retrieval. These are future work. No OpenAI/OpenRouter integration, database, authentication, leaderboard, or deployment infrastructure is included.
