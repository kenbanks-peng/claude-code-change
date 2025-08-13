import * as vscode from 'vscode';
import * as os from 'os';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import { FileTypeTreeProvider } from './fileTypeTreeProvider';
import { FileTypeTreeItem } from './types';
import { createHookWrite } from './claudeHookWrite';

export function activate(context: vscode.ExtensionContext) {
    // 检查并创建 .claudeCodeChange 目录
    const homeDir = os.homedir();
    const codeChangeDir = path.join(homeDir, '.claudeCodeChange');

    if (!fs.existsSync(codeChangeDir)) {
        fs.mkdirSync(codeChangeDir);
    }

    // 获取当前工作区路径并计算MD5
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    let changeDir = codeChangeDir;

    if (workspaceFolder) {
        const workspacePath = workspaceFolder.uri.fsPath;
        const md5Hash = crypto.createHash('md5').update(workspacePath).digest('hex');
        changeDir = path.join(codeChangeDir, `change_${md5Hash}`);

        // 创建对应的change目录
        if (!fs.existsSync(changeDir)) {
            fs.mkdirSync(changeDir);
        }
    }

    const provider = new FileTypeTreeProvider(changeDir, workspaceFolder?.uri.fsPath);

    const treeView = vscode.window.createTreeView('fileTypeExplorer', {
        treeDataProvider: provider
    });

    const openFileCommand = vscode.commands.registerCommand('fileTypeExplorer.openFile', (item: FileTypeTreeItem) => {
        if (item.fileItem && item.fileItem.type === 'file' && item.fileItem.relativePath && workspaceFolder) {
            const workspaceFilePath = path.join(workspaceFolder.uri.fsPath, item.fileItem.relativePath);
            const changeFilePath = item.fileItem.path;

            // 检查工作区文件是否存在
            if (fs.existsSync(workspaceFilePath)) {
                // 打开diff视图，工作区文件在右侧（主文件），变更文件在左侧
                vscode.commands.executeCommand('vscode.diff',
                    vscode.Uri.file(changeFilePath),
                    vscode.Uri.file(workspaceFilePath),
                    `${item.fileItem.name} (Changes ↔ Workspace)`
                );
            } else {
                // 工作区文件不存在，直接打开变更文件
                vscode.window.showTextDocument(vscode.Uri.file(changeFilePath));
            }
        }
    });

    const refreshCommand = vscode.commands.registerCommand('fileTypeExplorer.refresh', () => {
        provider.refresh();
    });

    const installCommand = vscode.commands.registerCommand('claudeCodeChange.install', async () => {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: "Installing Claude Code Change tools...",
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50, message: "Copying tool files..." });

                // 获取插件安装目录
                const extensionPath = context.extensionPath;
                const toolsSrcDir = path.join(extensionPath, 'out', 'tools');

                // 复制编译后的文件到 .claudeCodeChange/tools
                const homeDir = require('os').homedir();
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

                progress.report({ increment: 50, message: "Running installation script..." });

                createHookWrite();

                return Promise.resolve();
            });

            vscode.window.showInformationMessage('Claude Code Change tools installed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Installation failed: ${error}`);
        }
    });

    // 设置自动刷新定时器，每5秒刷新一次
    const autoRefreshInterval = setInterval(() => {
        provider.refresh();
    }, 5000);

    context.subscriptions.push(
        treeView,
        openFileCommand,
        refreshCommand,
        installCommand,
        {
            dispose: () => {
                clearInterval(autoRefreshInterval);
            }
        }
    );
}

export function deactivate() {}