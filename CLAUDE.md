# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Coding Conventions

- Use `node:` prefix for Node.js built-in module imports (e.g., `import * as fs from 'node:fs'`, `import * as path from 'node:path'`)

## Commands

### Development
- `npm run compile` - Compile TypeScript to JavaScript
- `npm run watch` - Watch mode compilation (auto-compile on changes)
- `npm run package` - Package extension into .vsix file for distribution

### Publishing
- `git tag v1.0.x && git push origin v1.0.x` - Trigger automated publishing to VSCode Marketplace and Open VSX

## Architecture

This is a VSCode extension that provides file comparison and change tracking functionality for Claude Code conversations.

### Core Components

**Extension Entry Point (`src/extension.ts`)**
- Main activation logic for the VSCode extension
- Creates `.claudeCodeChange` directory in user's home directory
- Automatically installs hooks on startup
- Manages workspace-specific change directories using MD5 hashes
- Sets up auto-refresh timer (5 seconds) for the tree view

**File Tree Provider (`src/fileTypeTreeProvider.ts`)**
- Implements VSCode TreeDataProvider interface for the activity bar view
- Displays cached files in a hierarchical folder structure
- Shows diff statistics (+/- line counts) for each file
- Handles file/folder sorting and tree expansion

**File Scanner (`src/fileScanner.ts`)**
- Scans the change directory for cached files
- Builds file tree structure with proper parent-child relationships

**Diff Utilities (`src/diffUtils.ts`)**
- Calculates line-by-line differences between workspace and cached files
- Formats diff statistics display (+X -Y format)

**Hook Management**
- `src/claudeHookWrite.ts` - Writes hook configuration to Claude Code settings
- `src/copyHookFile.ts` - Copies tool files to system locations
- `tools/claudeChangePreToolUse.ts` - Pre-tool-use hook that caches files before modifications
- `tools/claudeChangeStop.ts` - Stop hook for cleanup operations

### How It Works

1. **File Caching**: The extension hooks into Claude Code's tool execution cycle
2. **Pre-Tool Hook**: Before any file modification, `claudeChangePreToolUse.ts` creates a cached copy
3. **Directory Structure**: Files are cached in `~/.claudeCodeChange/change_{workspace_md5}/`
4. **Tree Display**: The extension shows cached files in VSCode's activity bar with diff statistics
5. **Diff View**: Clicking files opens VSCode's built-in diff viewer comparing cached vs workspace versions

### Key Files Structure

```
src/
├── extension.ts              # Main extension entry point
├── fileTypeTreeProvider.ts   # Tree view implementation
├── fileScanner.ts           # File system scanning
├── diffUtils.ts             # Diff calculation utilities
├── claudeHookWrite.ts       # Hook installation
├── copyHookFile.ts          # Tool file copying
└── types.ts                 # TypeScript type definitions

tools/
├── claudeChangePreToolUse.ts # Pre-tool execution hook
└── claudeChangeStop.ts       # Cleanup hook
```

The extension automatically integrates with Claude Code by injecting hooks into the settings.json configuration, enabling seamless file change tracking during AI-assisted development sessions.