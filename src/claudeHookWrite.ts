
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
  currentConfig['hooks']['PreToolUse'].push(preHookConfig);
  currentConfig['hooks']['Stop'].push(stopHookConfig);
  fs.writeFileSync(claudeConfigPath, JSON.stringify(currentConfig, null, 2));
  vscode.window.showInformationMessage('Claude Hook Write Success');
}