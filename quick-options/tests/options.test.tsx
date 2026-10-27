import { expect, test } from 'claude-code/testing'

import { parseOptions } from '../hooks/register'

const BAND = {
  plugin: 'quick-options',
  component: 'AbovePrompt',
  requestId: 'above-prompt',
  props: { hasSurvey: false, bodyColumns: 80 },
} as const

const ANSWER = [
  'The migration needs to run.',
  '',
  '**Options:**',
  '1. Go ahead and run `bin/rails db:migrate`',
  '2. No, just show me the SQL',
].join('\n')

test('parses the numbered list after the Options line', () => {
  expect(parseOptions(ANSWER)).toEqual(['Go ahead and run `bin/rails db:migrate`', 'No, just show me the SQL'])
  expect(parseOptions('1. no heading')).toEqual([])
})

test('a typed digit becomes the option text and the band shows the options', async ($, on) => {
  const submitted: string[] = []
  on('turn.complete', (_, e) => ({ text: e.answer }))
  on('prompt.submit', (_, e) => {
    submitted.push(e.text)
    return { text: e.text }
  })

  await $.turn.complete({ answer: ANSWER, durationMs: 1, isAborted: false, turnId: 't1', reason: 'answer' })

  const ui = await $.ui.mount({ ...BAND, surface: 'terminal' })
  expect((await ui.find({ type: 'Button', key: 'opt-2' }))?.text).toBe('No, just show me the SQL')
  await ui.unmount()

  // Stands for the person typing at the prompt: the engine stamps that origin.
  const typed = (text: string) => $.prompt.submit({ text, origin: { kind: 'composer' } } as never)

  await typed('2')
  expect(submitted).toEqual(['No, just show me the SQL'])

  await typed('1')
  expect(submitted[1]).toBe('1')
})
