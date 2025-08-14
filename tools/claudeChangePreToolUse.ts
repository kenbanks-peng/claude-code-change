import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as os from 'os';

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
  // 解析传入的数据结构
  const { cwd, tool_input } = data;
  const { file_path } = tool_input;

  // 生成cwd的MD5哈希
  const md5Hash = crypto.createHash('md5').update(cwd).digest('hex');
  const changeDirName = `change_${md5Hash}`;

  // 在当前目录创建change_{md5}文件夹
  const changeDirPath = path.join(codeChangeDir, changeDirName);

  const stopFlagPath = path.join(changeDirPath, '.stopFlag');
  if (fs.existsSync(stopFlagPath)) {
    // 用rm -rf 删除所有文件
    fs.rmSync(changeDirPath, { recursive: true });
  }

  if (!fs.existsSync(changeDirPath)) {
    fs.mkdirSync(changeDirPath, { recursive: true });
  }

  // 计算目标文件相对于cwd的路径
  const relativePath = path.relative(cwd, file_path);

  // 在change_{md5}目录中创建对应的文件路径
  const targetFilePath = path.join(changeDirPath, relativePath);

  if (fs.existsSync(targetFilePath)) {
    console.log(`文件已存在: ${targetFilePath}`);
    return;
  }

  const targetDir = path.dirname(targetFilePath);

  // 创建必要的目录结构
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  // 复制文件到目标位置
  if (fs.existsSync(file_path)) {
    fs.copyFileSync(file_path, targetFilePath);
    console.log(`文件已复制到: ${targetFilePath}`);
  } else {
    // 如果文件不存在，则创建一个空文件
    fs.writeFileSync(targetFilePath, '');
    console.log(`源文件不存在: ${file_path}, 已创建空文件: ${targetFilePath}`);
  }
};

const main = async () => {
  try {
    const data = await inputData();
    await cacheChangeFile(data);
  } catch (error) {
    console.error('执行失败:', error);
    process.exit(1);
  }
};

main();