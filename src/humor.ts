import type { ChargeCode, Intensity } from './types';

type ChargeTemplate = { title: string; jokes: readonly string[] };
type ModeTemplates = {
  charges: Record<ChargeCode, ChargeTemplate>;
  verdicts: readonly string[];
  sentences: readonly string[];
  cleared: readonly string[];
  released: readonly string[];
  empty: readonly string[];
  quiet: readonly string[];
};

/** All theatrical claims live here, never in factual evidence. */
export const HUMOR: Record<Intensity, ModeTemplates> = {
  friendly: {
    charges: {
      'GC-101': { title: 'Failure to Water the Repo Plant', jokes: ['Some projects are perennials. A little attention next spring?', 'Your repository is on a very generous coffee break.', 'Even a TODO deserves a little vitamin D.'] },
      'GC-204': { title: 'A Cozy Relationship with JavaScript', jokes: ['You found your ecosystem. It brought a lockfile as a housewarming gift.', 'TypeScript is JavaScript wearing its conference name badge.', 'Your comfort zone comes with excellent autocomplete.'] },
      'GC-303': { title: 'Enthusiastic New-Repo Energy', jokes: ['So many little beginnings. A whole nursery of side quests.', 'The new-repository button appreciates your continued support.', 'Every idea deserves a home. Yours have a neighborhood.'] },
      'GC-404': { title: 'A Missing Introduction', jokes: ['A short description is a tiny welcome mat for your code.', 'Future you would appreciate a sticky note.', 'Even a repo likes to say hello before the technical interview.'] },
      'GC-409': { title: 'A Well-Stocked Fork Drawer', jokes: ['Excellent table settings for the open-source potluck.', 'Sharing is caring. Apparently so is collecting the utensils.', 'A tasteful collection. Please leave room for the spoons.'] },
      'GC-000': { title: 'A Very Minimal Beginning', jokes: ['Minimalism, but make it version controlled.', 'A blank canvas with excellent hosting.', 'The scaffolding is currently enjoying some personal space.'] },
    },
    verdicts: ['A friendly warning from the court of side projects. You may keep your keyboard.', 'The jury recommends a stretch break and continued tinkering.', 'Your developer license remains valid. Please enjoy the conference snacks.'],
    sentences: ['Write one kind description for future you, then take a coffee break.', 'Explain a side project to a rubber duck. The duck may ask follow-up questions.', 'Attend one JSConfMX talk without opening a new project tab. Participation ribbon included.'],
    cleared: ['Insufficient evidence. The rubber-duck jury offers a polite nod.', 'Insufficient evidence. Your public sample gets a friendly wave.', 'Insufficient evidence. We brought a warning sticker and have nowhere to put it.'],
    released: ['Free to go. Pick up a complimentary imaginary sticker on your way out.', 'Enjoy the conference. Your keyboard privileges are fully intact.', 'No sentence. Have a snack; investigations are hungry work.'],
    empty: ['No public repositories returned. Our evidence folder is enjoying a peaceful afternoon.', 'No public repositories to inspect. The magnifying glass gets a day off.', 'An empty public sample. Even the terminal is speaking softly.'],
    quiet: ['The sample does not support a charge. Our tiny courtroom can become a reading nook.', 'No eligible charges here. The department will practice its indoor voice.', 'The public evidence stayed below our thresholds. A rare lint-free moment.'],
  },
  felony: {
    charges: {
      'GC-101': { title: 'Aggravated Repository Abandonment', jokes: ['The TODOs would like to speak to a manager. Unfortunately, the manager is also a TODO.', 'The court rejects “I will get back to it after JSConf” as a maintenance strategy.', 'Your backlog has requested its own conference badge.'] },
      'GC-204': { title: 'First-Degree JavaScript Allegiance', jokes: ['The defense says it can quit the ecosystem any time. The ecosystem says “npm install”.', 'The court recognizes TypeScript as JavaScript with a legal department.', 'A language ecosystem so comfortable it charges rent in configuration files.'] },
      'GC-303': { title: 'Serial Repository Creation', jokes: ['The new-repo button is not a project management methodology.', '“This one will be different” is inadmissible testimony.', 'The court suggests finishing a side quest before unlocking the next expansion.'] },
      'GC-404': { title: 'Repository Description Negligence', jokes: ['“The name explains it” has been overruled.', 'Future you has retained counsel and would like one sentence of context.', 'A repo description is not a spoiler. You can tell us the premise.'] },
      'GC-409': { title: 'Excessive Fork Possession', jokes: ['This is a GitHub account, not a cutlery drawer.', 'The open-source buffet has requested the return of its utensils.', 'The defense has confused version control with wedding registry management.'] },
      'GC-000': { title: 'Possession of an Empty Promise', jokes: ['“Coming soon” has entered a long-term relationship with “eventually”.', 'An elevator pitch with no elevator.', 'The court appreciates a lightweight bundle. This is taking the brief literally.'] },
    },
    verdicts: ['Guilty in the fictional court of developer decisions. The linter declines to comment.', 'The jury has returned from npm install and finds this deeply roastable.', 'The defense tried “works on my machine”. This court does not recognize that jurisdiction.'],
    sentences: ['Community documentation service, followed by a walk with no podcast about frameworks.', 'Explain semver to a rubber duck until the duck requests a major version bump.', 'One JSConfMX coffee break without saying “we should rewrite it”. Parole depends on the duck.'],
    cleared: ['Insufficient evidence. The prosecution has rage-quit its own slide deck.', 'Insufficient evidence. Our dramatic entrance was apparently the entire presentation.', 'Insufficient evidence. The department has filed a bug against its expectations.'],
    released: ['Free to go. The prosecutor must now explain the empty expense report.', 'No sentence. The court will spend your hearing time renaming its Slack channels.', 'Released without charges. The prosecution owes the rubber duck an apology.'],
    empty: ['No public repositories returned. We deployed a whole crime lab to inspect an empty array.', 'Public repo sample: empty. Our corkboard is now a very expensive rectangle.', 'No public repos to inspect. Even Array.prototype.reduce asked for an initial value.'],
    quiet: ['No eligible charges in this sample. Our accusation pipeline exited with code 0.', 'The evidence did not reach a charge threshold. The prosecutor is opening a retrospective.', 'This public sample defeated our roast rules. Please stop making our if statements look dramatic.'],
  },
  unhinged: {
    charges: {
      'GC-101': { title: 'Temporal Repo Displacement in the First Dimension', jokes: ['SUMMON THE CHRONOMANCER. The court wishes to cross-examine the concept of “later”.', 'The fictional TODO council has declared a ceremonial state of eventually.', 'A tiny wizard has been appointed Minister of Getting Back To It. The hat is enormous.'] },
      'GC-204': { title: 'Grand Theft Event Loop', jokes: ['THE COUNCIL OF CURLY BRACES DEMANDS A TRIAL BY MICROTASK.', 'The imaginary bailiff is three promises in a trench coat. None have settled.', 'The court has transformed into a bundler. Nobody knows which output directory to stand in.'] },
      'GC-303': { title: 'Unauthorized Summoning of Repository Multiverses', jokes: ['Every new repo opens a portal to another ceremonial planning meeting.', 'THE SIDE-QUEST HYDRA requests a dedicated project manager and a tiny crown.', 'The fictional multiverse has run out of “final-final” naming permits.'] },
      'GC-404': { title: 'Context Evaporation Before the Galactic Tribunal', jokes: ['THE SCROLL OF EXPLANATION IS BLANK. Fetch the ceremonial label maker.', 'The imaginary narrator has left the building carrying all the exposition.', 'A dramatic fog machine is doing the work of a one-line description.'] },
      'GC-409': { title: 'Interdimensional Cutlery Accumulation', jokes: ['THE BANQUET OF OPEN SOURCE requires a forklift for its forks.', 'The imaginary Fork King has requested diplomatic immunity and a napkin.', 'A silverware singularity has formed in the fictional evidence locker.'] },
      'GC-000': { title: 'Trafficking in Artisanal Digital Nothing', jokes: ['BEHOLD: a locally sourced, version-controlled absence. The museum gift shop is delighted.', 'The imaginary orchestra performs four minutes of git status.', 'The court has subpoenaed the void. The void sent a very small bundle.'] },
    },
    verdicts: ['THE GALACTIC RUBBER DUCK TRIBUNAL HAS SPOKEN. Reality must now pass a lint check.', 'BY THE POWER VESTED IN THIS CEREMONIAL USB-C DONGLE: maximum theatrical guilt.', 'THE BUILD GOBLINS DEMAND A STANDING OVATION. The judge is a sentient loading spinner.'],
    sentences: ['Teach a fictional volcano TypeScript until its lava is strongly typed. Safety goggles are imaginary.', 'Serve as ceremonial Scrum Master to a parliament of rubber ducks on the moon.', 'Perform an interpretive dance explaining the event loop to a council of sentient conference lanyards.'],
    cleared: ['Insufficient evidence. THE GALACTIC TRIBUNAL HAS DRAMATICALLY SUBPOENAED AN EMPTY CHAIR.', 'Insufficient evidence. THE BUILD GOBLIN HAS OBJECTED TO THE CONCEPT OF OBJECTING.', 'Insufficient evidence. THE CEREMONIAL GAVEL HAS BEEN DEMOTED TO A VERY SMALL SPOON.'],
    released: ['No sentence. The entire imaginary court must attend remedial evidence school on Neptune.', 'Released. The fictional prosecutor must fold the universe back into its original packaging.', 'Free to go. The rubber-duck choir will perform your exit music in 7/8 time.'],
    empty: ['ZERO PUBLIC REPOS RETURNED. We rented a thunderstorm for an empty JSON array.', 'THE PUBLIC EVIDENCE FOLDER CONTAINS ONLY THE ECHO OF OUR OWN DRAMATIC ENTRANCE.', 'No public repos to inspect. The imaginary crime lab has been converted into a planetarium.'],
    quiet: ['THE SAMPLE SUPPORTS NO CHARGES. The ceremonial smoke machine has filed for unemployment.', 'Our thresholds remain unmet. The imaginary orchestra must now play a very embarrassed kazoo solo.', 'No eligible charges. THE COUNCIL OF IF STATEMENTS HAS ADJOURNED TO THE SNACK DIMENSION.'],
  },
};

export function pickTemplate(templates: readonly string[], seed: number, edition: number): string {
  return templates[((seed % templates.length) + (edition % templates.length)) % templates.length];
}
