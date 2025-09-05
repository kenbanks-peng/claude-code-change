import * as fs from 'node:fs';
import * as path from 'node:path';
import * as crypto from 'node:crypto';
import * as os from 'node:os';

const homeDir = os.homedir();
const codeChangeDir = path.join(homeDir, '.claudeCodeChange');

interface InputData {
  cwd: string;
  tool_input: {
    file_path: string;
  };
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

const cacheChangeFile = async (data: InputData) => {
  // Parse the incoming data structure
  const { cwd, tool_input } = data;
  const { file_path } = tool_input;

  // Generate MD5 hash of cwd
  const md5Hash = crypto.createHash('md5').update(cwd).digest('hex');
  const changeDirName = `change_${md5Hash}`;

  // Create change_{md5} folder in current directory
  const changeDirPath = path.join(codeChangeDir, changeDirName);

  const stopFlagPath = path.join(changeDirPath, '.stopFlag');
  if (fs.existsSync(stopFlagPath)) {
    // Use rm -rf to delete all files
    fs.rmSync(changeDirPath, { recursive: true });
  }

  if (!fs.existsSync(changeDirPath)) {
    fs.mkdirSync(changeDirPath, { recursive: true });
  }

  // Calculate target file path relative to cwd
  const relativePath = path.relative(cwd, file_path);

  // Create corresponding file path in change_{md5} directory
  const targetFilePath = path.join(changeDirPath, relativePath);

  if (fs.existsSync(targetFilePath)) {
    console.log(`File already exists: ${targetFilePath}`);
    return;
  }

  const targetDir = path.dirname(targetFilePath);

  // Create necessary directory structure
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // Copy file to target location
  if (fs.existsSync(file_path)) {
    fs.copyFileSync(file_path, targetFilePath);
    console.log(`File copied to: ${targetFilePath}`);
  } else {
    // If file doesn't exist, create an empty file
    fs.writeFileSync(targetFilePath, '');
    console.log(`Source file doesn't exist: ${file_path}, created empty file: ${targetFilePath}`);
  }
};

const main = async () => {
  try {
    const data = await inputData();
    await cacheChangeFile(data);
  } catch (error) {
    console.error('Execution failed:', error);
    process.exit(1);
  }
};

main();