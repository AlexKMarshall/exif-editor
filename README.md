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
| GET | `/images` | Returns a JSON array of URL paths (e.g. `["/images/album/photo.jpg"]`) for all images found inside `images/` |
| GET | `/images/:folder/:filename` | Serves the image file at the given path inside `images/`. Returns 404 for unknown extensions or missing files, 400 for path traversal attempts. |

## Image library

Images live at `images/<album>/` relative to the repo root. The folder is gitignored — you need your own local copy. The backend resolves the path as `../images` relative to `backend/`.
