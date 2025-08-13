
import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';

export function createHookWrite() {
  // 检查并创建 .claudeCodeChange 目录
  const homeDir = os.homedir();
  const codeChangeDir = path.join(homeDir, '.claudeCodeChange');
  const preHookJsPath = path.join(codeChangeDir, 'tools/claudeChangePreToolUse.js');
  const stopHookJsPath = path.join(codeChangeDir, 'tools/claudeChangeStop.js');
  const claudeConfigPath = path.join(homeDir, '.claude/settings.json');

  if (!fs.existsSync(claudeConfigPath)) {
    fs.writeFileSync(preHookJsPath, '{}');
  }

  const currentConfig = JSON.parse(fs.readFileSync(claudeConfigPath, 'utf8'));
  const preHookConfig = {
    "matcher": "MultiEdit|Edit|Write",
    "hooks": [
      {
        "type": "command",
        "command": "node " + preHookJsPath
      }
    ]
  };
  const stopHookConfig = {
    "hooks": [
      {
        "type": "command",
        "command": "node " + stopHookJsPath
      }
    ]
  };
  if (!currentConfig['hooks']) {
    currentConfig['hooks'] = {}
  }
  if (!currentConfig['hooks']['PreToolUse']) {
    currentConfig['hooks']['PreToolUse'] = [];
  }
  if (!currentConfig['hooks']['Stop']) {
    currentConfig['hooks']['Stop'] = [];
  }
  // 检查是否已存在相同的PreToolUse hook
  const preHookExists = currentConfig['hooks']['PreToolUse'].some((item: any) => {
    return (item.hooks || []).some((hook: any) => hook.command === ('node ' + preHookJsPath));
  });

  // 检查是否已存在相同的Stop hook
  const stopHookExists = currentConfig['hooks']['Stop'].some((item: any) => {
    return (item.hooks || []).some((hook: any) => hook.command === ('node ' + stopHookJsPath));
  });

  // 只有不存在时才添加PreToolUse hook
  if (!preHookExists) {
    currentConfig['hooks']['PreToolUse'].push(preHookConfig);
  }

  // 只有不存在时才添加Stop hook
  if (!stopHookExists) {
    currentConfig['hooks']['Stop'].push(stopHookConfig);
  }

  // 只有需要更新时才写入文件
  if (!preHookExists || !stopHookExists) {
    fs.writeFileSync(claudeConfigPath, JSON.stringify(currentConfig, null, 2));
  }
}