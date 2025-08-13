import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

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

  // 读取JSONL文件
  if (!fs.existsSync(transcript_path)) {
    console.log(`Transcript文件不存在: ${transcript_path}`);
    return;
  }

  // 读取第一行
  const content = fs.readFileSync(transcript_path, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  if (lines.length === 0) {
    console.log('JSONL文件为空');
    return;
  }

  // 解析第一个cwd
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
    console.log('未找到cwd路径');
    return;
  }

  // 生成cwd的MD5哈希
  const md5Hash = crypto.createHash('md5').update(cwd).digest('hex');
  const changeDirName = `change_${md5Hash}`;

  // 在当前目录的change_{md5}文件夹中创建.stopFlag文件
  const changeDirPath = path.join(codeChangeDir, changeDirName);

  // 确保目录存在
  if (!fs.existsSync(changeDirPath)) {
    fs.mkdirSync(changeDirPath, { recursive: true });
  }

  // 创建.stopFlag文件
  const stopFlagPath = path.join(changeDirPath, '.stopFlag');
  fs.writeFileSync(stopFlagPath, '');

  console.log(`已创建停止标志文件: ${stopFlagPath}`);
};

const main = async () => {
  try {
    const data = await inputData();
    await flagStop(data);
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
};

main();