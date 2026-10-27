import { atom, read, update } from 'claude-code'
import type { Register } from 'claude-code'

import type { Commands } from '../types'

const commands = atom({ plugin: 'bang-run', key: 'commands' } as const, [] as Commands)

const MAX_COMMANDS = 4

// Letters, so they never clash with the digits other bands (quick-options) use.
const COPY_KEYS = 'cvbn'

// `! cmd` inside inline code, or a line starting with `! ` inside a fenced block.
export function extract(answer: string): Commands {
  const found: string[] = []
  const add = (raw: string) => {
    const cmd = raw.trim()
    if (cmd && !found.includes(cmd)) found.push(cmd)
  }

  const withoutFences = answer.replace(/```[^\n]*\n([\s\S]*?)```/g, (_, body: string) => {
    for (const line of body.split('\n')) {
      const match = /^\s*!\s*(\S.*)$/.exec(line)
      if (match) add(match[1] ?? '')
    }
    return ''
  })

  for (const match of withoutFences.matchAll(/`!\s*([^`\n]+)`/g)) add(match[1] ?? '')

  return found.slice(-MAX_COMMANDS)
}

export const register: Register = on => {
  on('turn.complete', async ($, e, next) => {
    if (e.agentId === undefined) {
      const found = e.reason === 'answer' ? extract(e.answer) : []
      await update($, commands, () => found)
    }
    return next(e)
  })

  on('prompt.submit', async ($, e, next) => {
    if (e.origin?.kind === 'composer') await update($, commands, () => [])
    return next(e)
  }).catch(($, e, next) => next(e))

  on('ui.render', { component: 'AbovePrompt' }, async ($, e, next) => {
    const current = await read($, commands)
    if (e.props.hasSurvey || e.props.isWorking || current.length === 0) return next(e)

    const { Box, Button, Text } = $.ui.resolve(e)
    const below = await next(e)

    const copy = async (cmd: string, surface: typeof e.surface) => {
      const result = await $.ui.copy({ text: cmd, surface })
      $.ui.toast(result.isCopied ? `Copied: ${cmd}` : `Not copied (${result.reason})`)
    }

    return (
      <Box flexDirection="column">
        {current.map((cmd, i) => (
          <Box key={`row-${i}`}>
            <Button
              key={`copy-${i}`}
              plain
              hotkey={COPY_KEYS[i]}
              label="Copy"
              onPress={press => copy(cmd, press.surface)}
            />
            <Text>  ! {cmd}</Text>
          </Box>
        ))}
        <Button key="dismiss" role="dismiss" plain dimColor hotkey="x" label="Close" onPress={() => update($, commands, () => [])} />
        {below}
      </Box>
    )
  })
}
