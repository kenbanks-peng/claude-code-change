import * as vscode from 'vscode';
import * as path from 'node:path';
import { FileScanner } from './fileScanner';
import { FileTypeTreeItem, FileItem } from './types';
import { DiffUtils } from './diffUtils';

export class FileTypeTreeProvider implements vscode.TreeDataProvider<FileTypeTreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<FileTypeTreeItem | undefined | null | void> = new vscode.EventEmitter<FileTypeTreeItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<FileTypeTreeItem | undefined | null | void> = this._onDidChangeTreeData.event;

    private allFiles: FileItem[] = [];
    private fileScanner: FileScanner;

    constructor(private changeDir?: string, private workspaceRoot?: string) {
        this.fileScanner = new FileScanner(changeDir);
        this.refresh();
    }

    refresh(): void {
        this.fileScanner.scanWorkspaceFiles().then(groups => {
            this.allFiles = groups.get('files') || [];
            this._onDidChangeTreeData.fire();
        });
    }

    getTreeItem(element: FileTypeTreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: FileTypeTreeItem): Thenable<FileTypeTreeItem[]> {
        if (!element) {
            // Root node - return top-level files and folders
            const items: FileTypeTreeItem[] = [];
            
            // Filter out top-level items (items without parent path)
            const topLevelItems = this.allFiles.filter(item => 
                !item.relativePath?.includes(path.sep) || item.relativePath === item.name
            );
            
            for (const item of topLevelItems) {
                let diffDescription = '';
                
                // If it's a file and has workspace root directory, calculate diff stats
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    const diffStats = DiffUtils.calculateDiff(item.path, workspaceFilePath);
                    diffDescription = DiffUtils.formatDiffStats(diffStats);
                }
                
                // Set workspace path resourceUri for files to get correct icons
                let resourceUri: vscode.Uri | undefined = undefined;
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    resourceUri = vscode.Uri.file(workspaceFilePath);
                }
                
                const treeItem = new FileTypeTreeItem(
                    item.name,
                    item.type === 'folder' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
                    item.type,
                    resourceUri,
                    item
                );
                
                // Set tooltip to workspace file path, or show relative path if it doesn't exist
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    treeItem.tooltip = workspaceFilePath;
                } else {
                    treeItem.tooltip = item.relativePath || item.name;
                }
                if (diffDescription) {
                    treeItem.description = diffDescription;
                }
                items.push(treeItem);
            }

            return Promise.resolve(items.sort((a, b) => {
                // Folders come first
                if (a.fileItem?.type === 'folder' && b.fileItem?.type === 'file') return -1;
                if (a.fileItem?.type === 'file' && b.fileItem?.type === 'folder') return 1;
                return a.label!.localeCompare(b.label!);
            }));
        } else if (element.contextValue === 'folder' && element.fileItem) {
            // Folder node - return files and subfolders under this folder
            const folderPath = element.fileItem.relativePath || element.fileItem.name;
            const items: FileTypeTreeItem[] = [];
            
            const childItems = this.allFiles.filter(item => {
                if (!item.relativePath) return false;
                const parentPath = path.dirname(item.relativePath);
                return parentPath === folderPath;
            });
            
            for (const item of childItems) {
                let diffDescription = '';
                
                // If it's a file and has workspace root directory, calculate diff stats
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    const diffStats = DiffUtils.calculateDiff(item.path, workspaceFilePath);
                    diffDescription = DiffUtils.formatDiffStats(diffStats);
                }
                
                // Set workspace path resourceUri for files to get correct icons
                let resourceUri: vscode.Uri | undefined = undefined;
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    resourceUri = vscode.Uri.file(workspaceFilePath);
                }
                
                const treeItem = new FileTypeTreeItem(
                    item.name,
                    item.type === 'folder' ? vscode.TreeItemCollapsibleState.Expanded : vscode.TreeItemCollapsibleState.None,
                    item.type,
                    resourceUri,
                    item
                );
                
                // Set tooltip to workspace file path, or show relative path if it doesn't exist
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    treeItem.tooltip = workspaceFilePath;
                } else {
                    treeItem.tooltip = item.relativePath || item.name;
                }
                if (diffDescription) {
                    treeItem.description = diffDescription;
                }
                items.push(treeItem);
            }
            
            return Promise.resolve(items.sort((a, b) => {
                // Folders come first
                if (a.fileItem?.type === 'folder' && b.fileItem?.type === 'file') return -1;
                if (a.fileItem?.type === 'file' && b.fileItem?.type === 'folder') return 1;
                return a.label!.localeCompare(b.label!);
            }));
        }

        return Promise.resolve([]);
    }
}