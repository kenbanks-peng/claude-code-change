import * as fs from 'node:fs';
import * as path from 'node:path';
import * as os from 'node:os';

export function copyHookFile(extensionPath: string) {
  // 获取插件安装目录
  const toolsSrcDir = path.join(extensionPath, 'out', 'tools');

  // 复制编译后的文件到 .claudeCodeChange/tools
  const homeDir = os.homedir();
  const toolsDestDir = path.join(homeDir, '.claudeCodeChange', 'tools');

  if (!fs.existsSync(toolsDestDir)) {
      fs.mkdirSync(toolsDestDir, { recursive: true });
  }

  // 复制所有编译后的工具文件
  if (fs.existsSync(toolsSrcDir)) {
      const files = fs.readdirSync(toolsSrcDir);
      for (const file of files) {
          if (file.endsWith('.js')) {
              const srcFile = path.join(toolsSrcDir, file);
              const destFile = path.join(toolsDestDir, file);
              fs.copyFileSync(srcFile, destFile);
          }
      }
  } else {
      throw new Error(`Tools directory not found: ${toolsSrcDir}`);
  }
}