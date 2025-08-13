# Claude Code Change

A VSCode extension that provides file comparison and change tracking functionality for Claude Code conversations.

为 Claude Code 对话提供文件比较和变更跟踪功能的 VSCode 扩展。

## Installation / 安装

1. Install the extension from the VSCode marketplace / 从 VSCode 市场安装扩展
2. Open Command Palette (`Cmd+Shift+P` / `Ctrl+Shift+P`) / 打开命令面板
3. Run "Claude Code Change: Install Tools" / 运行安装工具命令
4. The extension will inject hooks into Claude Code's settings.json / 扩展将向 Claude Code 的 settings.json 注入钩子

**⚠️ Important / 重要**: Do not manually delete these hook entries / 请勿手动删除这些钩子条目

## Features

- **Activity Bar Integration**: Double-arrow icon (↔) button for easy access
- **File Tree Browser**: Browse cached changes with folder structure
- **Diff Comparison**: Click files to open diff view comparing workspace and cached files
- **Change Statistics**: See (+/-) line counts for each file
- **Auto Refresh**: Updates every 5 seconds

## Usage

1. Click the double-arrow (↔) button in activity bar
2. Browse files in the panel
3. Click files to open diff view
4. Change statistics format: `(+5 -2)` = Added 5, deleted 2 lines

## Commands

- `Claude Code Change: Install Tools` - Install companion tools

## Requirements

- VSCode 1.74.0 or higher

## License

ISC License