# agent-wiki — Claude Code plugin

[agent-wiki](https://getagentwiki.com) is hosted markdown memory for agents: private project
wikis that Claude and other assistants read, search, and update over MCP.

This repository is the public install surface for the Claude Code plugin.

## Install

```
/plugin marketplace add animal-ltd/agent-wiki-plugin
/plugin install agent-wiki
```

Claude Code opens the sign-in flow the first time a tool runs.

Alternative without the plugin:

```
claude mcp add --transport http agent-wiki https://getagentwiki.com/mcp
```

## Docs

- Setup guide: https://getagentwiki.com/connect
- Privacy: https://getagentwiki.com/privacy · Terms: https://getagentwiki.com/terms · Security: https://getagentwiki.com/security
