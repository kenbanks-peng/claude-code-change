# Claude Code Change

A VSCode extension that provides file comparison and change tracking functionality for Claude Code conversations.

## Features

- **Activity Bar Integration**: Adds a button with double-arrow icon (↔) to the VSCode activity bar for easy access
- **File Tree Browser**: Browse files in a dedicated change directory with folder structure support
- **Diff Comparison**: Click any file to open a diff view comparing workspace files with cached changes
- **Change Statistics**: See added/deleted line counts for each file at a glance
- **Auto Refresh**: Files and diff stats refresh automatically every 5 seconds
- **Manual Refresh**: Use the refresh button for immediate updates
- **Tool Installation**: Install companion tools via Command Palette

## Installation

1. Install the extension from the VSCode marketplace
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`)
3. Run "Claude Code Change: Install Tools"
4. The extension will:
   - Set up necessary tools in `~/.claudeCodeChange/tools/`
   - Inject hooks into Claude Code's settings.json file for automatic file tracking

**⚠️ Important**: The installation will modify your Claude Code settings.json file to add hook configurations. **Do not manually delete these hook entries** as they are essential for the extension to work properly.

## Usage

### Viewing Changes

1. Click the double-arrow (↔) button in the activity bar
2. Browse files in the Claude Code Change panel
3. Click any file to open a diff view:
   - Left side: Cached changes
   - Right side: Current workspace file
4. Hover over files to see workspace file paths

### Change Statistics

Each file displays change statistics in the format:
- `(+5 -2)` - Added 5 lines, deleted 2 lines
- `(+10)` - Added 10 lines (new file)
- `(-3)` - Deleted 3 lines

### Directory Structure

Files are organized in the extension's cache directory:
```
~/.claudeCodeChange/
├── change_{workspace_md5}/
│   ├── src/
│   │   ├── file1.ts
│   │   └── file2.ts
│   └── docs/
│       └── readme.md
└── tools/
    ├── claudeChangePreToolUse.js
    └── claudeChangeStop.js
```

## Configuration

The extension automatically:
- Creates cache directories based on workspace MD5 hash
- Maintains folder structure matching your project
- Provides real-time diff statistics
- Injects hooks into Claude Code settings for file tracking

### Claude Code Integration

After installation, the extension adds hooks to your Claude Code settings.json file located at:
- **macOS**: `~/.claude/settings.json`
- **Windows**: `%USERPROFILE%\.claude\settings.json`
- **Linux**: `~/.claude/settings.json`

These hooks enable automatic file caching when Claude Code processes file operations. The hooks include:
- Pre-tool-use hooks for file caching
- Stop hooks for session management

**Important**: Do not manually remove these hook configurations as they are required for proper functionality.

## Technical Details

- **Workspace Detection**: Uses MD5 hash of workspace path for unique identification
- **File Scanning**: Recursively scans cache directory with proper TypeScript typing
- **Diff Algorithm**: Line-based comparison showing additions and deletions
- **Auto-refresh**: 5-second interval updates for real-time tracking

## Commands

- `Claude Code Change: Install Tools` - Install companion tools
- `Refresh` - Manually refresh file tree and diff stats

## Requirements

- VSCode 1.74.0 or higher
- Node.js for tool compilation (development only)

## Extension Settings

This extension contributes the following settings:

- Automatic file scanning and diff calculation
- Activity bar integration with double-arrow icon
- Tree view with file/folder structure support

## Known Issues

- Large files may take longer to calculate diff statistics
- Binary files are not supported for diff comparison

## Release Notes

### 1.0.0

Initial release with core functionality:
- File tree browser with diff comparison
- Change statistics display
- Tool installation system
- Auto-refresh capability

## Contributing

This extension is designed to work with Claude Code conversations and change tracking workflows.

## License

ISC License