import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Options } from '../types'

const options = atom({ plugin: 'quick-options', key: 'options' } as const, [] as Options)

const MAX_OPTIONS = 9

const INSTRUCTIONS = [
  'When you end a reply proposing something that waits on the user (a command for them to run, an action for them to approve, a choice between paths), close the message with a line reading exactly `Options:` followed by a numbered list (`1.`, `2.`, ...) of at most 5 items.',
  "Write each item as the reply the user would send to pick it, short and self-contained, in the conversation's language, since the item text is sent verbatim as the user's message (e.g. `1. Go ahead and run \`npm test\``, `2. No, just show me the diff`).",
  'The user picks an option by typing its number; a bare digit right after such a list means that option.',
  'Do not write an `Options:` line in any other situation.',
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
