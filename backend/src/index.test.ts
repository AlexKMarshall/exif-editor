import { vi, describe, it, expect, beforeEach } from 'vitest'

vi.mock('node:fs', () => ({
  default: {
    readdirSync: vi.fn(),
    existsSync: vi.fn(),
    readFileSync: vi.fn(),
  },
}))

import fs from 'node:fs'
import { app } from './index'

const makeDirent = (name: string, opts: { dir?: boolean; file?: boolean }) => ({
  name,
  isDirectory: () => opts.dir ?? false,
  isFile: () => opts.file ?? false,
})

describe('GET /images', () => {
  beforeEach(() => {
    vi.mocked(fs.readdirSync)
      .mockReturnValueOnce([makeDirent('vacation', { dir: true })] as any)
      .mockReturnValueOnce([
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
