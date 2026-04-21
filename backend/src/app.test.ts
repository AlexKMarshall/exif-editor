import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('node:fs', () => ({
  default: {
    promises: {
      readdir: vi.fn(),
      access: vi.fn(),
      readFile: vi.fn(),
    },
  },
}))

import fs from 'node:fs'
import { app } from './app'

const makeDirent = (name: string, opts: { dir?: boolean; file?: boolean }) => ({
  name,
  isDirectory: () => opts.dir ?? false,
  isFile: () => opts.file ?? false,
})

describe('GET /images', () => {
  beforeEach(() => {
    vi.mocked(fs.promises.readdir)
      .mockResolvedValueOnce([makeDirent('vacation', { dir: true })] as any)
      .mockResolvedValueOnce([
        makeDirent('photo.jpg', { file: true }),
        makeDirent('metadata.json', { file: true }),
      ] as any)
  })

  it('returns full URL paths for image files', async () => {
    const res = await app.request('/images')
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual(['/images/vacation/photo.jpg'])
  })
})

describe('GET /images/:folder/:filename', () => {
  it('returns 404 for non-image extension', async () => {
    const res = await app.request('/images/album/metadata.json')
    expect(res.status).toBe(404)
  })

  it('returns 404 when file does not exist', async () => {
    vi.mocked(fs.promises.access).mockRejectedValue(new Error('ENOENT'))
    const res = await app.request('/images/album/missing.jpg')
    expect(res.status).toBe(404)
  })

  it('serves a jpeg image with image/jpeg Content-Type', async () => {
    const imageData = Buffer.from('fake-image-bytes')
    vi.mocked(fs.promises.access).mockResolvedValue(undefined)
    vi.mocked(fs.promises.readFile).mockResolvedValue(imageData as any)
    const res = await app.request('/images/album/photo.jpg')
    expect(res.status).toBe(200)
    expect(res.headers.get('Content-Type')).toContain('image/jpeg')
    const buf = Buffer.from(await res.arrayBuffer())
    expect(buf).toEqual(imageData)
  })
})
