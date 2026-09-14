import { expect, it } from 'vitest'
import { mergeTranscript } from './transcript.ts'
it('replaces revisions for the same provider item without counting extra speech',()=>{
 const first={who:'user' as const,t:'00:01',text:'Hello',id:'turn-1'}
 const next=mergeTranscript([first],{who:'user',t:'00:02',text:'Hello Sarah, what is your challenge?',id:'turn-1'})
 expect(next).toHaveLength(1);expect(next[0].t).toBe('00:01')
 expect(mergeTranscript(next,{who:'user',t:'00:03',text:'Hello again',id:'turn-2'})).toHaveLength(2)
})
it('coalesces cumulative legacy text but preserves unrelated turns',()=>{
 const first={who:'user' as const,t:'00:01',text:'Hello Sarah.'}
 const next=mergeTranscript([first],{who:'user',t:'00:02',text:'Hello Sarah, what is your challenge?'})
 expect(next).toHaveLength(1)
 expect(mergeTranscript(next,{who:'buyer',t:'00:03',text:'Budget.'})).toHaveLength(2)
})
