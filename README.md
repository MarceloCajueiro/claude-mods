# claude-mods

Mods for Claude Code.
Each folder is one mod, and this repository is a marketplace that lists all of them.

## quick-options

When Claude's reply asks you something it cannot continue without (approve an action, pick one of the paths it laid out, confirm you finished a step), it closes the message with an `Options:` line and a numbered list.
Status updates, reports of finished work, answers and loose next-step suggestions get no list.
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

When Claude suggests a command for you to run in the session with the `!` prefix (`` `! gcloud auth login` ``, or a `! ...` line in a code block), a band above the prompt lists it with a Copy button.
Copy puts the command, with its `!`, on your clipboard: paste it in the empty prompt to run it in the session.

Click Copy, or press its digit with the prompt empty: `9` copies, `0` closes the band.
With several commands, the next rows copy with `8`, `7`, `6`, counting down so they never clash with quick-options' numbers.
The band closes after a copy, or when you send your next prompt.

A mod cannot run a `!` command for you: only typing `!` in the prompt box enters shell mode, so text a mod sends or writes into the box reaches Claude as a message.

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
