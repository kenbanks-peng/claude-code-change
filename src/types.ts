import * as vscode from 'vscode';

export interface FileItem {
    name: string;
    path: string;
    type: 'file' | 'folder';
    extension?: string;
    relativePath?: string;
}

export interface FileTypeGroup {
    label: string;
    files: FileItem[];
    collapsed: boolean;
}

export class FileTypeTreeItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string,
        public readonly resourceUri?: vscode.Uri,
        public readonly fileItem?: FileItem
    ) {
        super(label, collapsibleState);
        
        if (resourceUri) {
            this.resourceUri = resourceUri;
        }
        
        if (contextValue === 'file') {
            this.command = {
                command: 'fileTypeExplorer.openFile',
                title: '打开文件',
                arguments: [this]
            };
        }
    }
}