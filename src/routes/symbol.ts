import { Hono } from 'hono'

const NODES = {
  mainnet: 'https://symbol-sakura-16.next-web-technology.com:3001',
  testnet: 'https://001-sai-dual.symboltest.net:3001',
} as const

type Network = keyof typeof NODES

function getNodeUrl(network: string): string {
  return NODES[network as Network] ?? NODES.mainnet
}

export const symbolRoutes = new Hono()

symbolRoutes.get('/accounts/:address', async (c) => {
  const { address } = c.req.param()
  const network = c.req.query('network') ?? 'mainnet'
  const nodeUrl = getNodeUrl(network)

  const res = await fetch(`${nodeUrl}/accounts/${address}`)
  const data = await res.json()
  return c.json(data, res.status as 200)
})

symbolRoutes.post('/mosaics', async (c) => {
  const network = c.req.query('network') ?? 'mainnet'
  const nodeUrl = getNodeUrl(network)
  const body = await c.req.json()

  const res = await fetch(`${nodeUrl}/mosaics`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return c.json(data, res.status as 200)
})

symbolRoutes.post('/namespaces/mosaic/names', async (c) => {
  const network = c.req.query('network') ?? 'mainnet'
  const nodeUrl = getNodeUrl(network)
  const body = await c.req.json()

  const res = await fetch(`${nodeUrl}/namespaces/mosaic/names`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return c.json(data, res.status as 200)
})
