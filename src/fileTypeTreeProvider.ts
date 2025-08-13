import * as vscode from 'vscode';
import * as path from 'path';
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
            // 根节点 - 返回顶层文件和文件夹
            const items: FileTypeTreeItem[] = [];
            
            // 筛选出顶层项目（没有父路径的项目）
            const topLevelItems = this.allFiles.filter(item => 
                !item.relativePath?.includes(path.sep) || item.relativePath === item.name
            );
            
            for (const item of topLevelItems) {
                let diffDescription = '';
                
                // 如果是文件且有工作区根目录，计算差异统计
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    const diffStats = DiffUtils.calculateDiff(item.path, workspaceFilePath);
                    diffDescription = DiffUtils.formatDiffStats(diffStats);
                }
                
                // 为文件设置工作区路径的resourceUri以获得正确图标
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
                
                // 设置tooltip为工作区文件路径，如果不存在则显示相对路径
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
                // 文件夹排在前面
                if (a.fileItem?.type === 'folder' && b.fileItem?.type === 'file') return -1;
                if (a.fileItem?.type === 'file' && b.fileItem?.type === 'folder') return 1;
                return a.label!.localeCompare(b.label!);
            }));
        } else if (element.contextValue === 'folder' && element.fileItem) {
            // 文件夹节点 - 返回该文件夹下的文件和子文件夹
            const folderPath = element.fileItem.relativePath || element.fileItem.name;
            const items: FileTypeTreeItem[] = [];
            
            const childItems = this.allFiles.filter(item => {
                if (!item.relativePath) return false;
                const parentPath = path.dirname(item.relativePath);
                return parentPath === folderPath;
            });
            
            for (const item of childItems) {
                let diffDescription = '';
                
                // 如果是文件且有工作区根目录，计算差异统计
                if (item.type === 'file' && item.relativePath && this.workspaceRoot) {
                    const workspaceFilePath = path.join(this.workspaceRoot, item.relativePath);
                    const diffStats = DiffUtils.calculateDiff(item.path, workspaceFilePath);
                    diffDescription = DiffUtils.formatDiffStats(diffStats);
                }
                
                // 为文件设置工作区路径的resourceUri以获得正确图标
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
                
                // 设置tooltip为工作区文件路径，如果不存在则显示相对路径
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
                // 文件夹排在前面
                if (a.fileItem?.type === 'folder' && b.fileItem?.type === 'file') return -1;
                if (a.fileItem?.type === 'file' && b.fileItem?.type === 'folder') return 1;
                return a.label!.localeCompare(b.label!);
            }));
        }

        return Promise.resolve([]);
    }
}