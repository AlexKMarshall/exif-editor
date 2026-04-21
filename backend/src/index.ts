import { serve } from '@hono/node-server'
import { app } from './app.js'

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

startServer(3000)
