# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

FreedomSound API — a NestJS/TypeScript backend that supplements the FreedomSound iOS app. It ingests "liked" tracks from a streaming platform (currently SoundCloud), links them to local mp3 files, lets users tag tracks (genre/mood), and generates `.m3u` playlists from tag/artist criteria. Requires a MySQL database.

## Commands

```shell
npm run start:dev       # run with watch mode (main dev loop)
npm run start:debug      # watch mode + --inspect-brk
npm run build            # nest build
npm run lint             # eslint --fix over src/apps/libs/test
npm run format            # prettier --write over src/ and test/

npm test                 # unit tests (jest, *.spec.ts, colocated under src/)
npm run test:watch
npm run test:cov
npx jest src/tracks/track.spec.ts   # run a single unit test file

npm run test:e2e         # e2e tests (test/*.e2e-spec.ts), requires a reachable MySQL instance
npm run test:merge        # merge unit + e2e lcov reports into coverage-merged/ (needs lcov/genhtml installed)
```

- Unit tests live next to the code they test (`src/**/*.spec.ts`) and use Jest's default config in `package.json`.
- E2E tests (`test/*.e2e-spec.ts`, config in `test/jest-e2e.json`) run against a real MySQL DB: `global-setup.ts` creates the database named by `MYSQL_ROOT_DBNAME` in `.env.test` before the suite runs, `global-teardown.ts` tears it down after. `test/utils/factories.ts` has DB seeding helpers (`createFullMockDb`, `createManyTestTracks`, etc.) used across e2e specs.
- There is no `dev:start` npm script even though the README mentions one — use `start:dev`.

## Running locally

Two documented paths (see README.md for full detail):
- **Docker Compose** (recommended): copy `docker-compose 1.yml` → `docker-compose.yml`, `.env-1` → `.env`, fill in the blanks, then `docker compose up -d`. Spins up MySQL, Adminer, and the API.
- **Standalone**: `npm i && npm run start:dev` against your own MySQL instance, using a filled-in `.env` based on `.env-1`.

Required env vars (see `.env-1`): `MYSQL_HOST`, `MYSQL_PORT`, `MYSQL_USER`, `MYSQL_PASSWORD`, `MYSQL_ROOT_DBNAME`, `SC_TOKEN`, `BASE_SC_URL`, `LOCAL_FILES_FOLDER`. `API_PORT` is optional (defaults to 3000).

Swagger docs are served at `{root_url}/api-docs` (see `main.ts`).

## Architecture

Standard NestJS module-per-domain layout under `src/`, each with `*.module.ts` / `*.controller.ts` / `*.service.ts` / `*.dto.ts` / `*.entity.ts`:

- **`artists/`, `tags/`, `tracks/`, `tracksources/`** — the core domain entities (TypeORM, `synchronize: true` in `app.module.ts`, MySQL).
  - `Track` is the hub entity: many-to-many with `Artist` (via `track_artists`) and `Tag` (via `track_tags`), one-to-many with `TrackSource`.
  - `TrackSource` records where a track came from (`Platform.LOCAL` or `Platform.SOUNDCLOUD`) plus its `externalId`/`url`, and is upserted on the `(externalId, platform)` pair to avoid duplicate imports.
  - `Track.fileName` empty string means "not yet linked to a local file" — this convention is used throughout (playlist filtering, stats, download-candidate detection) instead of a boolean flag.
  - `user_vetted` exists on `Track`, `Artist`, and `Tag` as a manual-review flag exposed via `stats/`.

- **`soundcloud-interface/`** — talks to the SoundCloud API (paginated `/me/track_likes/ids`, batched `/tracks?ids=...`) using `SC_TOKEN`/`BASE_SC_URL`, splits multi-artist strings (`splitArtists`, handles `x`, `&`, `feat.`, `ft.`, commas, etc.), and upserts everything into `Track`/`Artist`/`Tag`/`TrackSource`. This is the "sync likes from streaming platform" half of the pipeline described in the README.

- **`localfiles-interface/`** — the "match local files to liked tracks" half. Reads mp3s from `LOCAL_FILES_FOLDER`, extracts the streaming-platform ID embedded in filenames as `... [id].mp3` (`mapFileToId`), reads ID3 tags via `node-id3` and duration via `ffprobe` (shells out — the Docker image installs `ffmpeg` for this), then either links the file to an existing `TrackSource`-less track or creates a brand-new `Track`+`Artist`+`Tag`+`TrackSource`. Emits an `'events'` event via `@nestjs/event-emitter` when processing starts (no other emitters/listeners currently wired up beyond this).

- **`playlist/`** — builds `.m3u` files from a TypeORM query-builder pipeline: optional "only tracks with a local file" filter, optional AND/OR matching on tag IDs and/or artist IDs (AND-matching uses `GROUP BY` + `HAVING COUNT(...) = N`), random order, optional `limit`. `generateFile: false` returns the track list without touching disk. When writing a file, the output filename is sanitized and the resolved path is checked to stay under the intended output directory before writing — do not bypass that when touching this file, since the filename is user-supplied.

- **`stats/`** — read-only aggregate counts (`total`/`vetted`/`missingFiles`) over tracks, artists, tags. No caching; recomputes over the full table each call.

- **`common/`** — cross-cutting NestJS pieces: `ResponseInterceptor` wraps every controller response as `{ statusCode, message, data }`, and the message is set per-route via the `@ResponseMessage('...')` decorator (falls back to `'Success'`). `StringToNumberArrayPipe` is a custom pipe for parsing comma-separated query params into `number[]`.

- **Deployment**: two targets exist side by side —
  - `src/main.ts` — standard Nest bootstrap (Express), used for Docker/standalone (`Dockerfile`, `docker-compose.yml`).
  - `src/lambda.ts` + `serverless.yml` — AWS Lambda handler via `@codegenie/serverless-express`, deployed with the Serverless Framework (esbuild bundling, Node 22 runtime). Keep both entry points in sync when changing global pipes/interceptors/Swagger setup in `AppModule`/bootstrap, since `lambda.ts` builds its own Nest app instance independently of `main.ts`.

## Notes

- `ValidationPipe` is global with `whitelist: true` and `forbidNonWhitelisted: true` — DTOs must declare every field they accept or requests will be rejected.
- TypeORM `synchronize: true` is on, so entity changes apply to the DB schema automatically on boot in every environment currently configured — there are no migrations in use despite the `migration:create` script existing in `package.json`.
- ESLint has `@typescript-eslint/no-explicit-any` off and `no-floating-promises`/`no-unsafe-argument` as warnings (not errors) — don't tighten these incidentally as part of unrelated changes.
