import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { serveStatic } from '@hono/node-server/serve-static'
import { symbolRoutes } from './routes/symbol.js'

const app = new Hono()

app.route('/api', symbolRoutes)
app.use('/*', serveStatic({ root: './public' }))

const port = Number(process.env.PORT ?? 3000)

serve({ fetch: app.fetch, port }, () => {
  console.log(`Server running at http://localhost:${port}`)
})
