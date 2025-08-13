import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FileItem, FileTypeGroup } from './types';

export class FileScanner {
    constructor(private changeDir?: string) {}

    async scanWorkspaceFiles(): Promise<Map<string, FileItem[]>> {
        if (!this.changeDir || !fs.existsSync(this.changeDir)) {
            return new Map();
        }

        const items = this.scanDirectory(this.changeDir);
        const result = new Map<string, FileItem[]>();
        result.set('files', items);
        
        return result;
    }

    private scanDirectory(dirPath: string, relativePath: string = ''): FileItem[] {
        const items: FileItem[] = [];
        
        try {
            const entries = fs.readdirSync(dirPath, { withFileTypes: true });
            
            for (const entry of entries) {
                // 过滤掉根目录下的 .stopFlag 文件
                if (entry.name === '.stopFlag' && relativePath === '') {
                    continue;
                }
                
                const fullPath = path.join(dirPath, entry.name);
                const itemPath = relativePath ? path.join(relativePath, entry.name) : entry.name;
                
                if (entry.isDirectory()) {
                    const folderItem: FileItem = {
                        name: entry.name,
                        path: fullPath,
                        type: 'folder',
                        relativePath: itemPath
                    };
                    items.push(folderItem);
                    
                    // 递归扫描子文件夹
                    const subItems = this.scanDirectory(fullPath, itemPath);
                    items.push(...subItems);
                } else {
                    const extension = path.extname(entry.name);
                    const fileItem: FileItem = {
                        name: entry.name,
                        path: fullPath,
                        type: 'file',
                        extension: extension,
                        relativePath: itemPath
                    };
                    items.push(fileItem);
                }
            }
        } catch (error) {
            console.error('扫描目录失败:', error);
        }
        
        return items;
    }

}