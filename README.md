# agent-wiki — Claude Code plugin

[agent-wiki](https://getagentwiki.com) gives agents private markdown project memory over MCP. This public repository distributes version **0.2.0**, including the explicitly invoked `/agent-wiki:setup` skill and a remote server at `https://getagentwiki.com/mcp`. It bundles no credentials, dependencies, or automatic write hooks.

## Install

First inspect `/mcp` in Claude Code. If agent-wiki already works through a direct server or a claude.ai connector, preserve that connection and read [Existing connections](#existing-connections) before installing.

Run these commands in your shell:

```sh
claude plugin marketplace add animal-ltd/agent-wiki-plugin
claude plugin install agent-wiki@agent-wiki --scope user
```

The interactive equivalents are `/plugin marketplace add animal-ltd/agent-wiki-plugin` and `/plugin install agent-wiki@agent-wiki`; choose the intended scope in the plugin manager.

- **user**: the skill and bundled server are available to you across projects.
- **project**: shared with collaborators through this repository's Claude settings.
- **local**: only you, in this project.

Use `--scope project` or `--scope local` only when intended. Installing in a project directory with `--scope user` still installs across projects. Installation scope does not grant wiki access. The bundled endpoint is account-wide; do not replace an existing single-wiki connection without choosing that broader connection yourself.

Restart Claude Code. In `/plugin`, check Installed for enabled `agent-wiki` version `0.2.0` and inspect Errors if `/agent-wiki:setup` is missing. A client that requests `/reload-plugins` supports that alternative; follow its reload instructions. Shell installation does not update an already-running conversation.

## Authenticate, then run setup

Installation only loads the skill and server. Open `/mcp`, select the active agent-wiki server, and choose Authenticate or Re-authenticate when needed. Complete sign-in and approval in the browser and return to the waiting client. Never share credentials or OAuth callback URLs. For a direct server named agent-wiki, Claude Code v2.1.186 or later also supports `claude mcp login agent-wiki`. A non-interactive prompt cannot complete interactive OAuth.

Once `/mcp` shows the connection and tools, invoke:

```text
/agent-wiki:setup
```

You may supply a wiki name or id. The skill confirms access with `list_wikis`, asks if selection is ambiguous, checks the wiki's state, and reads at most three orientation pages. It asks for one real decision and waits. After your answer it searches before writing, preserves existing content with current versions, then rereads and searches the result. No examples are saved as decisions.

If credentials expire, return to `/mcp` and re-authenticate the selected connection. If permission is read-only, access is missing, a tool call is refused, or you cancel, setup reports what remains incomplete and does not bypass the failure. A rerun checks for an already-saved decision rather than duplicating it. A save followed by failed verification is reported as unverified, not complete.

## Existing connections

`/mcp` identifies server origins and hidden duplicates. Direct definitions can take precedence over a plugin server or an inherited claude.ai connector pointing at the same URL. The setup skill can use a confirmed existing connection; installation does not require deleting it. If more than one is usable, select one explicitly. Do not remove a working server or authenticate a duplicate merely to make the list shorter.

Claude.ai inheritance depends on the active login method. Check `/status`: API-key and other provider authentication do not load inherited connectors. A previous claude.ai login alone does not prove inheritance now. If an inherited connector needs authorization, use its claude.ai controls; a rejected Claude Code session token requires `/login`. Changing login method or connection scope is your choice, not a setup step performed automatically. [Anthropic's MCP documentation](https://code.claude.com/docs/en/mcp#use-mcp-servers-from-claudeai) explains the current behavior.

Without the plugin, a direct connection remains available via `claude mcp add --transport http agent-wiki https://getagentwiki.com/mcp`; its default local scope is for you in this project. It does not install the setup skill. Check existing connections first, then authenticate separately.

## Upgrade from 0.1.0

Use the same scope as the existing installation (shown in `/plugin`):

```sh
claude plugin marketplace update agent-wiki
claude plugin update agent-wiki@agent-wiki --scope user
```

Restart Claude Code, check version `0.2.0` in `/plugin`, and confirm `/agent-wiki:setup` is available before using it. Refreshing the catalog alone is not a plugin update. The plugin version controls cache updates; do not edit cached runtime files. If the old version remains, inspect the update output, marketplace source, selected scope, and `/plugin` Errors. Do not erase the whole Claude configuration or credential cache.

These are the supported commands in Claude Code 2.1.263; see the [plugin reference](https://code.claude.com/docs/en/plugins-reference) and [installation guide](https://code.claude.com/docs/en/discover-plugins). Client acceptance receipts, including tested versions and public release SHAs, are tracked in [#83](https://github.com/animal-ltd/agent-wiki/issues/83). Source checks alone do not prove authentication or a successful setup.

## Rollback

To stop using this version, disable it in `/plugin` and restart. This does not delete wiki content; a direct connection can remain in use.

For the previous public 0.1.0 artifact, first note your marketplace source and installation scope. This marketplace contains only agent-wiki. Removing it uninstalls its plugins, so do this only when you choose to replace that installation:

```sh
git clone https://github.com/animal-ltd/agent-wiki-plugin.git agent-wiki-plugin-rollback
git -C agent-wiki-plugin-rollback checkout --detach 81a790d715dfbd9412d1a30862d9c297afc290d7
claude plugin marketplace remove agent-wiki
claude plugin marketplace add ./agent-wiki-plugin-rollback
claude plugin install agent-wiki@agent-wiki --scope user
```

Restart and check `0.1.0` in `/plugin`. The old artifact has an MCP server but no setup skill. Keep that checkout at the pinned commit and do not update or delete its directory until ready to upgrade; replace it with the unpinned public source above to return to current releases. Use the original installation scope throughout. Wiki writes have separate version history; plugin rollback does not undo them.

## Maintainers

The canonical source is `animal-ltd/agent-wiki`: `plugins/agent-wiki`, `.claude-plugin/marketplace.json`, this README (`plugins/README.md` there), `plugins/LICENSE`, and `scripts/verify-plugin-package.mjs`. Export through its `scripts/export-plugin.mjs` from a committed source into a reviewed public PR. Do not hand-edit the public copy or push an unattended synchronization to main.

`SOURCE.json` records the application source SHA, every exported file's SHA-256, a combined checksum, and the generated first-prompt checksum. Verify the self-contained public artifact with Node.js 22 or later:

```sh
node scripts/verify-plugin-package.mjs .
claude plugin validate . --strict
claude plugin validate plugins/agent-wiki --strict
```

The receipt is a consistency check, not a signature: compare it to the independent application export and reviewed commits. Public release SHA and client receipts live outside the source commit so the receipt does not refer to its own hash.

[Setup guide](https://getagentwiki.com/connect) · [Privacy](https://getagentwiki.com/privacy) · [Terms](https://getagentwiki.com/terms) · [Security](https://getagentwiki.com/security)
