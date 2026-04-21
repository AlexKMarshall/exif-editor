import { Hono } from 'hono'
import fs from 'node:fs'
import path from 'node:path'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.heic', '.webp'])

const IMAGES_DIR = path.resolve(process.cwd(), '../images')

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.webp': 'image/webp',
}

export const app = new Hono()

app.get('/images', async (c) => {
  const albumEntries = await fs.promises.readdir(IMAGES_DIR, { withFileTypes: true })
  const albums = albumEntries.filter(entry => entry.isDirectory())

  const albumFiles = await Promise.all(
    albums.map(async (album) => {
      const albumPath = path.join(IMAGES_DIR, album.name)
      const entries = await fs.promises.readdir(albumPath, { withFileTypes: true })
      return entries
        .filter(entry => entry.isFile() && IMAGE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()))
        .map(entry => `/images/${album.name}/${entry.name}`)
    })
  )

  return c.json(albumFiles.flat())
})

app.get('/images/:folder/:filename', async (c) => {
  const folder = c.req.param('folder')
  const filename = c.req.param('filename')
  const subPath = `${folder}/${filename}`

  // Defense-in-depth: Hono's URL normalization already collapses ".." path
  // segments before routing, so this guard cannot be triggered via a normal
  // HTTP request with the fixed two-level route. It remains as a safeguard
  // against future refactors or unexpected runtime behavior.
  const resolvedPath = path.resolve(IMAGES_DIR, subPath)
  if (!resolvedPath.startsWith(IMAGES_DIR + path.sep)) {
    return c.text('Bad request', 400)
  }

  const ext = path.extname(filename).toLowerCase()
  if (!IMAGE_EXTENSIONS.has(ext)) {
    return c.text('Not found', 404)
  }

  try {
    await fs.promises.access(resolvedPath)
  } catch {
    return c.text('Not found', 404)
  }

  const file = await fs.promises.readFile(resolvedPath)
  return c.body(file, 200, { 'Content-Type': CONTENT_TYPES[ext] })
})
