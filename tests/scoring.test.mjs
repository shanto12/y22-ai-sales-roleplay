import { test } from 'node:test'
import assert from 'node:assert/strict'
import score from '../netlify/functions/score.mjs'
const transcript = [{ who:'user', t:'00:01', text:'What is your primary challenge?' }]
globalThis.Netlify = { env: { get: key => key === 'XAI_API_KEY' ? 'test-only' : undefined } }
for (const [name,response] of [['upstream failure',new Response('{}',{status:503})],['malformed response',new Response(JSON.stringify({output_text:'{}'}))],['incomplete evidence',new Response(JSON.stringify({output_text:JSON.stringify({scores:{discovery:{score:4,rationale:'a'}}})}))]]) {
 test(name + ' never emits fabricated grades', async () => {
  globalThis.fetch = async () => response
  const r = await score(new Request('https://test/api/score',{method:'POST',body:JSON.stringify({transcript,final:true})}))
  const body = await r.text()
  assert.match(body,/event: error/)
  assert.doesNotMatch(body,/event: result|event: tile|90-day payback/)
 })
}
test('empty live transcript is unavailable, not a sample result', async () => {
 const r=await score(new Request('https://test/api/score',{method:'POST',body:JSON.stringify({transcript:[],final:true})}))
 const body=await r.text();assert.match(body,/event: error/);assert.doesNotMatch(body,/event: result/)
})

test('missing provider key cannot silently substitute sample grades', async () => {
 globalThis.Netlify = { env: { get: () => undefined } }
 const r=await score(new Request('https://test/api/score',{method:'POST',body:JSON.stringify({transcript,final:true})}))
 const body=await r.text();assert.match(body,/event: error/);assert.doesNotMatch(body,/event: result|event: tile/)
})
