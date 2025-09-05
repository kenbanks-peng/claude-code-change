
import * as fs from 'node:fs';
import * as os from 'node:os';
import * as path from 'node:path';

export function createHookWrite() {
  // Check and create .claudeCodeChange directory
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
        "command": `node ${preHookJsPath}`
      }
    ]
  };
  const stopHookConfig = {
    "hooks": [
      {
        "type": "command",
        "command": `node ${stopHookJsPath}`
      }
    ]
  };
  if (!currentConfig.hooks) {
    currentConfig.hooks = {}
  }
  if (!currentConfig.hooks.PreToolUse) {
    currentConfig.hooks.PreToolUse = [];
  }
  if (!currentConfig.hooks.Stop) {
    currentConfig.hooks.Stop = [];
  }
  // Check if the same PreToolUse hook already exists
  const preHookExists = currentConfig.hooks.PreToolUse.some((item: any) => {
    return (item.hooks || []).some((hook: any) => hook.command === `node ${preHookJsPath}`);
  });

  // Check if the same Stop hook already exists
  const stopHookExists = currentConfig.hooks.Stop.some((item: any) => {
    return (item.hooks || []).some((hook: any) => hook.command === `node ${stopHookJsPath}`);
  });

  // Only add PreToolUse hook if it doesn't exist
  if (!preHookExists) {
    currentConfig.hooks.PreToolUse.push(preHookConfig);
  }

  // Only add Stop hook if it doesn't exist
  if (!stopHookExists) {
    currentConfig.hooks.Stop.push(stopHookConfig);
  }

  // Only write file when update is needed
  if (!preHookExists || !stopHookExists) {
    fs.writeFileSync(claudeConfigPath, JSON.stringify(currentConfig, null, 2));
  }
}