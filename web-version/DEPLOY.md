# 快速部署指南

## 🚀 5分钟部署到GitHub Pages

### 步骤1：创建GitHub仓库

1. 登录 [GitHub](https://github.com)
2. 点击右上角 `+` → `New repository`
3. 填写信息：
   - Repository name: `volleyball-setter`（或其他名称）
   - 选择 `Public`
   - 点击 `Create repository`

### 步骤2：上传代码

**方式A：使用Git命令行**（推荐）

```bash
# 1. 打开终端，进入项目目录
cd /Users/peijiaxing/Desktop/排球轮转小游戏

# 2. 初始化Git（如果还没有）
git init

# 3. 添加所有文件
git add .

# 4. 提交
git commit -m "首次提交：添加Web版本"

# 5. 关联远程仓库（替换为你的仓库地址）
git remote add origin https://github.com/你的用户名/volleyball-setter.git

# 6. 推送
git branch -M main
git push -u origin main
```

**方式B：使用GitHub Desktop**（图形界面）

1. 下载安装 [GitHub Desktop](https://desktop.github.com/)
2. 打开应用，登录GitHub账号
3. File → Add Local Repository → 选择项目文件夹
4. 左下角填写提交信息，点击 "Commit to main"
5. 点击 "Publish repository"

**方式C：直接上传**（最简单）

1. 在GitHub仓库页面，点击 `Add file` → `Upload files`
2. 拖拽 `web-version` 文件夹到页面
3. 点击 `Commit changes`

### 步骤3：启用GitHub Pages

1. 进入仓库页面
2. 点击 `Settings`（设置）
3. 左侧菜单找到 `Pages`
4. 在 "Source" 下：
   - Branch: 选择 `main`
   - Folder: 选择 `/web-version`（或 `/(root)` 如果web-version在根目录）
5. 点击 `Save`

### 步骤4：获取网址

- 等待1-2分钟
- 页面顶部会显示：`Your site is live at https://你的用户名.github.io/volleyball-setter/`
- 点击链接访问！

---

## 🎯 访问你的网站

部署成功后：

### 主页面URL
```
https://你的用户名.github.io/volleyball-setter/
```

### 示例
如果你的GitHub用户名是 `zhang-san`：
```
https://zhang-san.github.io/volleyball-setter/
```

### 分享给学员
直接复制上面的链接，通过：
- 微信发送
- QQ发送
- 短信/邮件
- 二维码（可用草料二维码等工具生成）

---

## 🔄 更新网站内容

当你修改了代码，想更新线上版本：

```bash
# 1. 进入项目目录
cd /Users/peijiaxing/Desktop/排球轮转小游戏

# 2. 查看修改
git status

# 3. 添加修改
git add .

# 4. 提交
git commit -m "描述你的修改"

# 5. 推送
git push
```

几分钟后，网站自动更新！

---

## 🌟 进阶：自定义域名

如果你有自己的域名（如 `volleyball.com`）：

### 步骤1：配置GitHub

1. 在仓库 Settings → Pages
2. "Custom domain" 填入你的域名：`volleyball.com`
3. 勾选 "Enforce HTTPS"
4. 保存

### 步骤2：配置DNS

在你的域名服务商（如阿里云、腾讯云）：

添加CNAME记录：
- 类型：`CNAME`
- 主机记录：`@` 或 `www`
- 记录值：`你的用户名.github.io`
- TTL：`600`

等待DNS生效（几分钟到几小时）。

---

## 📱 生成二维码

使用以下工具生成二维码，方便手机扫码访问：

1. **草料二维码**: https://cli.im/
   - 输入你的网址
   - 生成二维码
   - 下载图片

2. **QR Code Generator**: https://www.qr-code-generator.com/
   - 输入网址
   - 自定义样式
   - 下载

3. **在线工具**: 搜索"二维码生成器"

---

## 🎓 给学员的访问指南

分享时可以这样说：

> **排球二传插上教学 - 在线访问**
> 
> 📱 **手机访问**：扫描下方二维码
> [贴上二维码图片]
> 
> 💻 **电脑访问**：打开浏览器，输入：
> `https://你的用户名.github.io/volleyball-setter/`
> 
> 📖 **使用说明**：
> 1. 点击"开始学习"进入主页面
> 2. 点击"下一轮"观察轮转和插上动画
> 3. 可以开关显示设置
> 
> 🏐 建议保存到浏览器收藏夹，方便随时学习！

---

## 🐛 常见问题

### Q1: 提示404错误
**A**: 检查：
- GitHub Pages是否已启用
- 文件夹路径是否正确选择
- 等待几分钟让部署完成

### Q2: 页面显示但样式错乱
**A**: 检查：
- `css/style.css` 文件路径是否正确
- 浏览器控制台是否有加载错误

### Q3: 推送失败
**A**: 
```bash
# 先拉取远程更新
git pull origin main

# 再推送
git push
```

### Q4: 想删除旧提交记录
**A**: 
```bash
# 创建新的空白提交历史
git checkout --orphan new-main
git add .
git commit -m "重新开始"
git branch -D main
git branch -m main
git push -f origin main
```

---

## 📞 需要帮助？

1. 查看 [GitHub Pages 文档](https://docs.github.com/pages)
2. 搜索相关错误信息
3. 检查浏览器控制台（F12）

---

## ✅ 部署检查清单

部署完成后，检查以下项目：

- [ ] 首页能正常显示
- [ ] "规则说明"页面可以访问
- [ ] "开始学习"能进入主页面
- [ ] 点击"下一轮"轮转正常
- [ ] 插上动画播放正常
- [ ] 箭头显示正常
- [ ] 开关功能正常
- [ ] 手机访问正常
- [ ] 二维码生成并测试

全部通过？恭喜你，部署成功！🎉

---

**现在就开始部署吧！** 🚀


