import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Options } from '../types'

const options = atom({ plugin: 'quick-options', key: 'options' } as const, [] as Options)

const MAX_OPTIONS = 9

const INSTRUCTIONS = [
  'Most replies need no `Options:` block. Add one only when this reply needs an answer from the user before you can go on: approval for an action you offer to take but will not take without their go-ahead (sending a message, changing their system, anything hard to undo), a pick between paths this reply lays out, or confirmation that they finished a step you depend on.',
  'Never add it to a status update, a report of finished work, an answer to a question, or a reply that only suggests a next step the user can take on their own. Do not offer a menu of optional follow-up work, and do not repeat a decision you already offered in an earlier turn that has not changed.',
  'When you add it, close the message with a line reading exactly `Options:` followed by a numbered list (`1.`, `2.`, ...) of at most 5 items, each one an answer to what this reply asks. If you cannot point to that ask in this reply, leave the block out; when unsure, leave it out.',
  "Write each item as the reply the user would send to pick it, short and self-contained, in the conversation's language, since the item text is sent verbatim as the user's message (e.g. `1. Go ahead and run \`npm test\``, `2. No, just show me the diff`).",
  'The user picks an option by typing its number; a bare digit right after such a list means that option.',
].join('\n')

// Matches `Options:` and its bold or heading forms; `Opções:` too.
const HEADING = /^[\s#>*_]*(options|op[cç][oõ]es)[\s*_]*:?[\s*_]*$/i
const ITEM = /^\s*(\d+)[.)]\s+(.+?)\s*$/

export function parseOptions(answer: string): Options {
  const lines = answer.split('\n')
  let start = -1
  for (let i = lines.length - 1; i >= 0; i--) {
    if (HEADING.test(lines[i] ?? '')) {
      start = i
      break
    }
  }
  if (start < 0) return []

  const items: string[] = []
  for (const line of lines.slice(start + 1)) {
    if (line.trim() === '') {
      if (items.length > 0) break
      continue
    }
    const match = ITEM.exec(line)
    if (!match) break
    items.push(match[2] ?? '')
  }
  return items.slice(0, MAX_OPTIONS)
}

function plain(text: string): string {
  return text.replace(/\*\*|__|`/g, '')
}

function fit(text: string, columns: number): string {
  return text.length <= columns ? text : `${text.slice(0, Math.max(1, columns - 1))}…`
}

export const register: Register = on => {
  on('prompt.compose', async ($, e, next) => {
    const result = await next(e)
    return {
      sections: [
        ...result.sections,
        { id: 'quick-options:instructions', text: INSTRUCTIONS, scope: 'session' },
      ],
    }
  })

  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const found = e.reason === 'answer' ? parseOptions(e.answer) : []
      await update($, options, () => found)
    }
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind !== 'composer' || e.command) return next(e)

    const current = await read($, options)
    await update($, options, () => [])

    const digit = /^\s*([1-9])\s*$/.exec(e.text)
    const picked = digit ? current[Number(digit[1]) - 1] : undefined
    return next(picked === undefined ? e : { ...e, text: picked })
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, options)
    if (e.props.hasSurvey || current.length === 0) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const columns = Math.max(20, (e.props.bodyColumns ?? 80) - 4)

    return (
      <Box flexDirection="column">
        <Text dimColor>Type the number + Enter (or click):</Text>
        {current.map((option, i) => (
          <Button
            key={`opt-${i + 1}`}
            plain
            hotkey={String(i + 1)}
            label={fit(plain(option), columns)}
            onPress={async () => {
              await update($, options, () => [])
              await $.prompt.submit({ text: option, asUser: true })
            }}
          />
        ))}
      </Box>
    )
  })
}
