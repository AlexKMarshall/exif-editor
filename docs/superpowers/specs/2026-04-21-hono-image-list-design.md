# Design: Hono Image List Server

**Date:** 2026-04-21
**Status:** Approved

## Overview

A local-only Node.js web server built with Hono that exposes a single endpoint to list image files found in the project's `images/` directory. This is the first step of a larger app for organizing photo metadata.

## Project Structure

```
exif-editor/
  images/
    <album-folder>/
      *.jpg / *.jpeg / *.png / etc.
  backend/
    src/
      index.ts
    package.json
    tsconfig.json
  frontend/          ← reserved for future UI work
  docs/
```

The `images/` directory sits at the repo root and is shared across both backend and frontend. The `backend/` directory contains the Hono server as a self-contained Node.js package. A `frontend/` directory will be added later for the UI.

The `images/` directory contains one level of subdirectories (album folders), each holding image files directly — no deeper nesting.

## Stack

- **Runtime:** Node.js
- **Package manager:** pnpm
- **Framework:** Hono with `@hono/node-server`
- **TypeScript:** Run directly via `tsx` (no build step)

## Endpoint

### `GET /images`

Reads the `images/` directory relative to the project root. Iterates each subdirectory one level deep, collects all files matching image extensions, and returns a flat JSON array of basenames.

**Supported extensions:** `.jpg`, `.jpeg`, `.png`, `.gif`, `.tiff`, `.heic`, `.webp`

**Response:**
```json
["2001_AltonTowers_0001.jpg", "2001_AltonTowers_0001_a.jpg", "2001_AltonTowers_0002.jpg"]
```

**Behaviour:**
- Files directly in `images/` (not in a subfolder) are ignored
- Non-image files inside subfolders are ignored
- Subdirectories nested deeper than one level are ignored
- Returns an empty array if no matching files are found

## Scripts

| Script | Command |
|---|---|
| `pnpm dev` | `tsx --watch src/index.ts` |

## Configuration

- **Port:** 3000
- **Images path:** `../images` relative to `backend/` (resolved at startup using `path.resolve(__dirname, '../../images')` or equivalent)
