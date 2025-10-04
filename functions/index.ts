import 'dotenv/config'
import { Hono } from 'hono'
import { serve } from '@hono/node-server'
import { callOpenAI } from './api/openai'

const app = new Hono()

app.get('/', (c) => c.text('Hono server is running!'))

app.post('/chat', async (c) => {
    const { message } = await c.req.json()
    const data = await callOpenAI(message)
    const reply = data.choices?.[0]?.message?.content || ""
    return c.json({ reply })
})


serve(app, (info) => {
    console.log(`🚀 Hono is running on http://localhost:${info.port}`)
})
