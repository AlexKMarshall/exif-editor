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
        files.push(entry.name)
      }
    }
  }

  return c.json(files)
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
