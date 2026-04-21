import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import fs from 'node:fs'
import path from 'node:path'

const IMAGE_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.gif', '.tiff', '.heic', '.webp'])

const IMAGES_DIR = path.resolve(process.cwd(), '../images')

export const app = new Hono()

app.get('/images', (c) => {
  const albums = fs.readdirSync(IMAGES_DIR, { withFileTypes: true })
    .filter(entry => entry.isDirectory())

  const files: string[] = []

  for (const album of albums) {
    const albumPath = path.join(IMAGES_DIR, album.name)
    const entries = fs.readdirSync(albumPath, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isFile()) continue
      const ext = path.extname(entry.name).toLowerCase()
      if (IMAGE_EXTENSIONS.has(ext)) {
        files.push(`/images/${album.name}/${entry.name}`)
      }
    }
  }

  return c.json(files)
})

const CONTENT_TYPES: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.gif': 'image/gif',
  '.tiff': 'image/tiff',
  '.heic': 'image/heic',
  '.webp': 'image/webp',
}

app.get('/images/:folder/:filename', (c) => {
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

  if (!fs.existsSync(resolvedPath)) {
    return c.text('Not found', 404)
  }

  const file = fs.readFileSync(resolvedPath)
  return c.body(file, 200, { 'Content-Type': CONTENT_TYPES[ext] })
})

function startServer(port: number) {
  const server = serve({ fetch: app.fetch, port }, () => {
    console.log(`Server running on http://localhost:${port}`)
  })

  server.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.log(`Port ${port} is in use, trying ${port + 1}...`)
      startServer(port + 1)
    } else {
      throw err
    }
  })
}

if (process.env.NODE_ENV !== 'test') {
  startServer(3000)
}
