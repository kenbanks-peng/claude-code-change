# 部署指南

## GitHub Actions 自动发布配置

### 前置要求

1. **VSCode Marketplace 发布令牌 (VSCE_PAT)**
   - 访问 https://marketplace.visualstudio.com/manage
   - 创建新的Personal Access Token
   - 权限设置为：`Marketplace (publish)`

2. **Open VSX Registry 发布令牌 (OVSX_PAT)**
   - 访问 https://open-vsx.org/
   - 注册账号并获取Access Token

3. **GitHub Secrets 配置**
   - 在仓库设置中添加以下Secrets：
     - `VSCE_PAT`: VSCode Marketplace令牌
     - `OVSX_PAT`: Open VSX Registry令牌

### 使用方式

#### 1. 标签发布（推荐）
```bash
# 创建并推送版本标签
git tag v1.0.2
git push origin v1.0.2
```

#### 2. 手动触发发布
- 进入GitHub Actions页面
- 选择"Publish VSCode Extension"工作流
- 点击"Run workflow"
- 输入版本号（如：1.0.2）

### 发布流程

1. **编译检查**: 自动编译TypeScript代码
2. **打包扩展**: 生成.vsix文件
3. **发布到VSCode Marketplace**: 使用vsce工具发布
4. **发布到Open VSX**: 使用ovsx工具发布
5. **创建GitHub Release**: 自动创建发布版本并上传.vsix文件

### 注意事项

- 确保`package.json`中的版本号与发布版本一致
- 发布前会自动运行编译检查
- 支持同时发布到两个平台，提高扩展的可用性
- 每次发布都会在GitHub上创建对应的Release

### 故障排查

- 如果发布失败，检查令牌是否正确配置
- 确认package.json中的publisher字段与VSCode Marketplace账户一致
- 检查版本号是否已存在于市场中