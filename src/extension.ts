import * as vscode from 'vscode';
import * as os from 'node:os';
import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import { FileTypeTreeProvider } from './fileTypeTreeProvider';
import { FileTypeTreeItem } from './types';
import { createHookWrite } from './claudeHookWrite';
import { copyHookFile } from './copyHookFile';
import { GitUtils } from './gitUtils';

function clearCacheDirectory(cacheDir: string): void {
    try {
        if (fs.existsSync(cacheDir)) {
            // Remove all files but keep the directory structure
            const files = fs.readdirSync(cacheDir);
            for (const file of files) {
                const filePath = path.join(cacheDir, file);
                const stat = fs.statSync(filePath);
                if (stat.isFile()) {
                    fs.unlinkSync(filePath);
                } else if (stat.isDirectory()) {
                    fs.rmSync(filePath, { recursive: true });
                }
            }
        }
    } catch (error) {
        console.error('Failed to clear cache directory:', error);
    }
}

export function activate(context: vscode.ExtensionContext) {
    // Check and create .claudeCodeChange directory
    const homeDir = os.homedir();
    const codeChangeDir = path.join(homeDir, '.claudeCodeChange');

    if (!fs.existsSync(codeChangeDir)) {
        fs.mkdirSync(codeChangeDir);
    }

    // Automatically install hooks on startup (silent mode)
    copyHookFile(context.extensionPath);
    createHookWrite();

    // Get current workspace path and calculate MD5
    const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
    let changeDir = codeChangeDir;

    if (workspaceFolder) {
        const workspacePath = workspaceFolder.uri.fsPath;
        const md5Hash = crypto.createHash('md5').update(workspacePath).digest('hex');
        changeDir = path.join(codeChangeDir, `change_${md5Hash}`);

        // Create corresponding change directory
        if (!fs.existsSync(changeDir)) {
            fs.mkdirSync(changeDir);
        }
    }

    const provider = new FileTypeTreeProvider(changeDir, workspaceFolder?.uri.fsPath);

    const treeView = vscode.window.createTreeView('fileTypeExplorer', {
        treeDataProvider: provider
    });

    // Git monitoring for cache clearing
    let lastCommitHash: string | null = null;
    const checkGitStatus = () => {
        if (!workspaceFolder || !GitUtils.isGitRepository(workspaceFolder.uri.fsPath)) {
            return;
        }

        const currentCommitHash = GitUtils.getCurrentCommitHash(workspaceFolder.uri.fsPath);
        
        // If commit hash has changed, it means new commits have been made
        if (lastCommitHash !== null && currentCommitHash !== lastCommitHash && currentCommitHash !== null) {
            const isClean = GitUtils.isWorkingDirectoryClean(workspaceFolder.uri.fsPath);
            
            if (isClean) {
                // Working directory is clean and we have new commits, clear the cache
                clearCacheDirectory(changeDir);
                provider.refresh();
            }
        }
        
        lastCommitHash = currentCommitHash;
    };

    // Initialize git status
    if (workspaceFolder) {
        lastCommitHash = GitUtils.getCurrentCommitHash(workspaceFolder.uri.fsPath);
    }

    const openFileCommand = vscode.commands.registerCommand('fileTypeExplorer.openFile', (item: FileTypeTreeItem) => {
        if (item.fileItem && item.fileItem.type === 'file' && item.fileItem.relativePath && workspaceFolder) {
            const workspaceFilePath = path.join(workspaceFolder.uri.fsPath, item.fileItem.relativePath);
            const changeFilePath = item.fileItem.path;

            // Check if workspace file exists
            if (fs.existsSync(workspaceFilePath)) {
                // Open diff view, workspace file on right (main file), changed file on left
                vscode.commands.executeCommand('vscode.diff',
                    vscode.Uri.file(changeFilePath),
                    vscode.Uri.file(workspaceFilePath),
                    `${item.fileItem.name} (Changes ↔ Workspace)`
                );
            } else {
                // Workspace file doesn't exist, open changed file directly
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

                // Get extension installation directory
                const extensionPath = context.extensionPath;
                copyHookFile(extensionPath);
                createHookWrite();

                return Promise.resolve();
            });

            vscode.window.showInformationMessage('Claude Code Change tools installed successfully!');
        } catch (error) {
            vscode.window.showErrorMessage(`Installation failed: ${error}`);
        }
    });

    const clearCacheCommand = vscode.commands.registerCommand('fileTypeExplorer.clearCache', () => {
        clearCacheDirectory(changeDir);
        provider.refresh();
        vscode.window.showInformationMessage('Cache cleared successfully!');
    });

    // Set auto-refresh timer, refresh every 5 seconds and check git status
    const autoRefreshInterval = setInterval(() => {
        checkGitStatus();
        provider.refresh();
    }, 5000);

    context.subscriptions.push(
        treeView,
        openFileCommand,
        refreshCommand,
        installCommand,
        clearCacheCommand,
        {
            dispose: () => {
                clearInterval(autoRefreshInterval);
            }
        }
    );
}

export function deactivate() {}