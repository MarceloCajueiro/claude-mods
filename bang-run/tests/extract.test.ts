import { expect, test } from 'claude-code/testing'

import { extract } from '../hooks/register'

test('finds inline and fenced bang commands', () => {
  const answer = [
    'Run `! gcloud auth login`, then:',
    '```bash',
    '! gh auth status',
    'echo not-me',
    '```',
    'Ignore `ls -la` and repeat `!gcloud auth login`.',
  ].join('\n')
  expect(extract(answer)).toEqual(['gh auth status', 'gcloud auth login'])
})

test('nothing when there is no bang', () => {
  expect(extract('Use `npm test`.')).toEqual([])
})

test('keeps at most four commands, the last ones', () => {
  const answer = ['a', 'b', 'c', 'd', 'e'].map(c => `\`! ${c}\``).join(' ')
  expect(extract(answer)).toEqual(['b', 'c', 'd', 'e'])
})
