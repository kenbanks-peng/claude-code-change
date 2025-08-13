import * as fs from 'fs';

export interface DiffStats {
    added: number;
    deleted: number;
}

export class DiffUtils {
    static calculateDiff(originalPath: string, changedPath: string): DiffStats | null {
        try {
            if (!fs.existsSync(originalPath) || !fs.existsSync(changedPath)) {
                return null;
            }

            const originalContent = fs.readFileSync(originalPath, 'utf8');
            const changedContent = fs.readFileSync(changedPath, 'utf8');

            return this.diffLines(originalContent, changedContent);
        } catch (error) {
            console.error('计算文件差异失败:', error);
            return null;
        }
    }

    private static diffLines(original: string, changed: string): DiffStats {
        const originalLines = original.split('\n');
        const changedLines = changed.split('\n');

        // 简单的行级差异算法
        const originalSet = new Set(originalLines);
        const changedSet = new Set(changedLines);

        let added = 0;
        let deleted = 0;

        // 计算新增行
        for (const line of changedLines) {
            if (!originalSet.has(line)) {
                added++;
            }
        }

        // 计算删除行
        for (const line of originalLines) {
            if (!changedSet.has(line)) {
                deleted++;
            }
        }

        return { added, deleted };
    }

    static formatDiffStats(stats: DiffStats | null): string {
        if (!stats) {
            return '';
        }

        const parts: string[] = [];
        if (stats.added > 0) {
            parts.push(`+${stats.added}`);
        }
        if (stats.deleted > 0) {
            parts.push(`-${stats.deleted}`);
        }

        return parts.length > 0 ? `(${parts.join(' ')})` : '';
    }
}