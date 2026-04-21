# exif-editor

A local web app for organising photo metadata. Not intended for public deployment — runs entirely on localhost.

## Project structure

```
exif-editor/
  images/                  # Local photo library (gitignored)
    <album-name>/          # One folder per album
      *.jpg / *.jpeg / ...
  backend/                 # Hono API server (Node.js + pnpm + TypeScript)
    src/index.ts
    package.json
    tsconfig.json
  frontend/                # Reserved — UI to be added
  docs/
    superpowers/specs/     # Design docs per feature
```

## Stack

- **Backend:** Hono on Node.js, TypeScript via `tsx` (no build step), pnpm
- **Frontend:** TBD

## Running the backend

```bash
cd backend
pnpm install
pnpm dev
```

Starts on port 3000 (automatically increments if in use).

## API

| Method | Path | Description |
|---|---|---|
| GET | `/images` | Returns a flat JSON array of image filenames found one level deep inside `images/` |

## Image library

Images live at `images/<album>/` relative to the repo root. The folder is gitignored — you need your own local copy. The backend resolves the path as `../images` relative to `backend/`.
