import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as os from 'node:os';

const homeDir = os.homedir();
const codeChangeDir = path.join(homeDir, '.claudeCodeChange');

interface InputData {
  transcript_path: string;
}

const inputData = async (): Promise<InputData> => {
  return new Promise((resolve, reject) => {
    let input = '';
    process.stdin.setEncoding('utf8');
    process.stdin.on('data', (chunk) => {
        input += chunk;
    });
    process.stdin.on('end', () => {
      try {
        const result = JSON.parse(input.trim());
        resolve(result);
      } catch (error) {
        reject(error);
      }
    });
  });
};

const flagStop = async (data: InputData) => {
  const { transcript_path } = data;

  // Read JSONL file
  if (!fs.existsSync(transcript_path)) {
    console.log(`Transcript file doesn't exist: ${transcript_path}`);
    return;
  }

  // Read first line
  const content = fs.readFileSync(transcript_path, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.log('JSONL file is empty');
    return;
  }

  // Parse first cwd
  const cwdLine = lines.find(line => {
    try {
      return JSON.parse(line).cwd;
    } catch {
      return false;
    }
  }) || '{}';
  
  const { cwd = null } = JSON.parse(cwdLine);
  console.log('cwd', cwd);

  if (!cwd) {
    console.log('cwd path not found');
    return;
  }

  // Generate MD5 hash of cwd
  const md5Hash = crypto.createHash('md5').update(cwd).digest('hex');
  const changeDirName = `change_${md5Hash}`;

  // Create .stopFlag file in current directory's change_{md5} folder
  const changeDirPath = path.join(codeChangeDir, changeDirName);

  // Ensure directory exists
  if (!fs.existsSync(changeDirPath)) {
    fs.mkdirSync(changeDirPath, { recursive: true });
  }

  // Create .stopFlag file
  const stopFlagPath = path.join(changeDirPath, '.stopFlag');
  fs.writeFileSync(stopFlagPath, '');

  console.log(`Created stop flag file: ${stopFlagPath}`);
};

const main = async () => {
  try {
    const data = await inputData();
    await flagStop(data);
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  }
};

main();