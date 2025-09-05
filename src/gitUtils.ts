import * as child_process from 'node:child_process';
import * as path from 'node:path';

export class GitUtils {
    /**
     * Check if a directory is a git repository
     */
    static isGitRepository(workspaceRoot: string): boolean {
        try {
            const result = child_process.execSync('git rev-parse --git-dir', {
                cwd: workspaceRoot,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            return result.trim().length > 0;
        } catch {
            return false;
        }
    }

    /**
     * Get the list of files that have changes (modified, added, deleted)
     */
    static getChangedFiles(workspaceRoot: string): string[] {
        try {
            // Get staged and unstaged changes
            const result = child_process.execSync('git status --porcelain', {
                cwd: workspaceRoot,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            
            const lines = result.trim().split('\n').filter(line => line.length > 0);
            const changedFiles: string[] = [];
            
            for (const line of lines) {
                // Git status --porcelain format: XY filename
                // X = staged status, Y = unstaged status
                const filename = line.substring(3); // Skip the status characters and space
                changedFiles.push(filename);
            }
            
            return changedFiles;
        } catch {
            return [];
        }
    }

    /**
     * Check if the working directory is clean (no uncommitted changes)
     */
    static isWorkingDirectoryClean(workspaceRoot: string): boolean {
        const changedFiles = this.getChangedFiles(workspaceRoot);
        return changedFiles.length === 0;
    }

    /**
     * Get the current git commit hash
     */
    static getCurrentCommitHash(workspaceRoot: string): string | null {
        try {
            const result = child_process.execSync('git rev-parse HEAD', {
                cwd: workspaceRoot,
                encoding: 'utf8',
                stdio: 'pipe'
            });
            return result.trim();
        } catch {
            return null;
        }
    }
}