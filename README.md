# claude-mods

Mods for Claude Code.
Each folder is one mod, and this repository is a marketplace that lists all of them.

## quick-options

When Claude ends a reply with a suggestion that waits on you (a command to run, an action to approve, a choice between paths), it closes the message with an `Options:` line and a numbered list.
A band above the prompt shows those options.
Type the number and press Enter, and the option's text is sent as your message, so you never retype what Claude suggested.
You can also click an option in the band.

```
Options:
1. Go ahead and run `npm test`
2. No, just show me the diff
```

Typing anything other than a bare digit sends your text as usual and clears the options.

### Install

At the prompt of a Claude Code terminal session:

```
/plugin install quick-options --marketplace MarceloCajueiro/claude-mods
```

Answer `y` to add the marketplace, then pick a scope.

From a shell:

```
claude plugin install quick-options --marketplace MarceloCajueiro/claude-mods
```

In the desktop app, where `/plugin` does not run: click + next to the prompt box, then Plugins, Add marketplace with `MarceloCajueiro/claude-mods`, then Add plugin.

## bang-run

When Claude suggests a command for you to run in the session with the `!` prefix (`` `! gcloud auth login` ``, or a `! ...` line in a code block), a band above the prompt lists it with two actions.
Send runs `!command` in the session, as if you had typed it.
Copy puts the command, without the `!`, on your clipboard, to run it somewhere else.

Click the action, or focus the band (`ctrl+x` then `tab`) and press its key: `e` sends, `c` copies, `x` closes the band.
With several commands, the next rows send with `r`, `t`, `y` and copy with `v`, `b`, `n`.
The band clears when you send your next prompt.

### Install

```
/plugin install bang-run --marketplace MarceloCajueiro/claude-mods
```

From a shell:

```
claude plugin install bang-run --marketplace MarceloCajueiro/claude-mods
```

## License

MIT
