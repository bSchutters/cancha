# Sport profiles — le « dossier de sports »

One profile per sport. A profile declares only the rules that genuinely **differ
between sports**. The tournament *structure* (draw, brackets, schedule,
match codes) is sport-agnostic and stays in `src/lib/tournament` — it operates on
team ids, not scores.

## How it grows

The architecture is two registries that compose: a tournament = a **sport**
(rules, here) × a **format** (structure, in `src/lib/tournament`). Sports and
formats are each added one file at a time, without touching the rest.

`SportProfile` (`types.ts`) grows one facet at a time, as each step wires it in.
A field appears here only once something consumes it — no dead config.

- **Step 1 (current): group-stage scoring points.** `computeStandings` reads
  `profile.scoring` (win/draw/loss) instead of hardcoded 3-1-0. The `futsal`
  profile reproduces the previous behavior exactly and is the default, so every
  existing tournament is unchanged.

### Planned next facets (not yet present — added when their step lands)

- score model: scalar (goals/points) vs series (sets / Bo-N)
- draws allowed? + KO tie resolution (penalties / decider / none)
- tiebreaker cascade (goal diff, head-to-head, Buchholz for Swiss, set ratio, …)
- registration unit: team / pair / solo
- allowed formats per sport
- standings column labels (Buts vs Sets, …)

## Adding a sport

1. Add a profile file under `profiles/` and register it in `index.ts`.
2. Add its id to the `SportId` union in `types.ts`.

`getSportProfile(id)` resolves a profile by id and falls back to the default for
unknown/empty values, so callers can pass a raw DB field without guarding.
