# 排球二传插上教学 - Web版

## 📋 项目说明

这是从微信小程序版本转换而来的纯Web版本，可以直接在浏览器中访问，无需微信环境。

### 版本信息
- **版本号**: v1.0.0 (Web)
- **转换日期**: 2026年1月3日
- **原始版本**: 微信小程序 v1.0.0

---

## 🌐 在线访问

部署后，用户可以通过以下方式访问：
- **直接链接**: `https://你的域名/web-version/`
- **分享**: 复制链接发送给学员
- **任何浏览器**: Chrome、Safari、Firefox、Edge等

---

## 📁 项目结构

```
web-version/
├── index.html          # 单页应用HTML（包含所有页面）
├── css/
│   └── style.css      # 全局样式（响应式设计）
├── js/
│   ├── rotation.js    # 轮转逻辑（核心算法）
│   └── app.js         # 应用逻辑（页面控制、动画）
└── README.md          # 本文件
```

---

## 🚀 快速开始

### 方法1：直接打开（本地测试）

1. 用浏览器直接打开 `index.html` 文件
2. 立即可以使用，无需任何配置

### 方法2：本地服务器（推荐）

使用Python启动本地服务器：

```bash
# 进入web-version目录
cd web-version

# Python 3
python3 -m http.server 8000

# 或 Python 2
python -m SimpleHTTPServer 8000
```

然后访问：`http://localhost:8000`

### 方法3：使用Node.js

```bash
# 安装http-server（全局）
npm install -g http-server

# 进入web-version目录并启动
cd web-version
http-server -p 8000
```

---

## 🌍 部署到线上

### 方案A：GitHub Pages（免费⭐⭐⭐⭐⭐）

**步骤：**

1. **创建GitHub仓库**
   ```bash
   # 初始化git（在排球轮转小游戏目录）
   git init
   git add .
   git commit -m "初始提交"
   ```

2. **推送到GitHub**
   ```bash
   # 创建新仓库（在GitHub网站上）
   # 然后关联并推送
   git remote add origin https://github.com/你的用户名/volleyball-setter.git
   git branch -M main
   git push -u origin main
   ```

3. **启用GitHub Pages**
   - 进入仓库设置 → Pages
   - Source选择 `main` 分支
   - 文件夹选择 `/web-version`
   - 保存

4. **访问网站**
   - 地址：`https://你的用户名.github.io/volleyball-setter/`
   - 几分钟后生效

**优势：**
- ✅ 完全免费
- ✅ 自动HTTPS
- ✅ 高稳定性
- ✅ 简单易用

---

### 方案B：Vercel（免费⭐⭐⭐⭐⭐）

**步骤：**

1. 访问 [vercel.com](https://vercel.com)
2. 使用GitHub账号登录
3. 点击 "Import Project"
4. 选择你的GitHub仓库
5. 设置根目录为 `web-version`
6. 点击 "Deploy"

**优势：**
- ✅ 速度更快（CDN加速）
- ✅ 自动部署
- ✅ 支持自定义域名
- ✅ 国内访问速度好

**访问地址：**
`https://你的项目名.vercel.app`

---

### 方案C：Netlify（免费⭐⭐⭐⭐）

**步骤：**

1. 访问 [netlify.com](https://netlify.com)
2. 注册/登录
3. 拖拽 `web-version` 文件夹到页面
4. 等待部署完成

**访问地址：**
`https://随机名称.netlify.app`

可在设置中修改为自定义名称。

---

### 方案D：自己的服务器

如果你有自己的服务器（如阿里云、腾讯云）：

**使用Nginx：**

```nginx
server {
    listen 80;
    server_name yourdomain.com;
    
    root /path/to/web-version;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

**使用Apache：**

将 `web-version` 文件夹放到 `htdocs` 或 `www` 目录即可。

---

## 📱 功能特性

### 与小程序版本对比

| 功能 | 小程序版 | Web版 | 说明 |
|------|---------|-------|------|
| 6个轮次演示 | ✅ | ✅ | 完全一致 |
| 插上动画 | ✅ | ✅ | 完全一致 |
| Canvas箭头 | ✅ | ✅ | 改用标准API |
| 响应式布局 | ✅ | ✅ | 适配更多设备 |
| 分享功能 | 微信分享 | URL分享 | 更灵活 |
| 离线使用 | ✅ | ⚠️ | 需要缓存配置 |

### Web版优势

- ✅ **跨平台**: 任何设备、任何浏览器
- ✅ **无需安装**: 直接访问链接
- ✅ **易于分享**: 复制链接即可
- ✅ **SEO友好**: 可被搜索引擎收录
- ✅ **维护简单**: 更新即时生效

### Web版限制

- ❌ 不支持微信分享卡片
- ❌ 不能添加到微信小程序
- ⚠️ 首次加载需要网络（可配置离线缓存）

---

## 🛠️ 技术实现

### 核心技术

- **HTML5**: 语义化标签、Canvas API
- **CSS3**: Flexbox布局、动画、响应式设计
- **JavaScript**: ES6+、原生DOM操作
- **Canvas 2D**: 绘制插上路线箭头

### 关键改造点

#### 1. 单位转换
```javascript
// 小程序: rpx（750rpx = 屏幕宽度）
width: 100rpx;

// Web版: rem + 百分比
width: 6.25rem;  // 固定尺寸
width: 75%;      // 相对尺寸（球场位置）
```

#### 2. API替换
```javascript
// 小程序 → Web
wx.createAnimation() → CSS Transition
wx.createSelectorQuery() → document.querySelector()
wx.navigateTo() → showPage()函数
bindtap → onclick
```

#### 3. Canvas改造
```javascript
// 小程序Canvas 2D
const query = wx.createSelectorQuery();
query.select('#canvas').fields({ node: true }).exec(...);

// 标准Canvas API
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
```

#### 4. 响应式设计
```css
/* 使用媒体查询适配不同屏幕 */
@media screen and (max-width: 768px) {
  html { font-size: 14px; }
}

@media screen and (max-width: 480px) {
  html { font-size: 12px; }
}
```

---

## 🎨 浏览器兼容性

### 完全支持
- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

### 部分支持
- ⚠️ IE 11（不推荐，需要Polyfill）
- ⚠️ 旧版Android浏览器（5.0+）

### 推荐浏览器
- 🌟 Chrome（最佳性能）
- 🌟 Safari（iOS设备）
- 🌟 Edge（Windows设备）

---

## 🔧 自定义修改

### 修改颜色主题

编辑 `css/style.css`，搜索颜色代码：

```css
/* 主色调 */
#FF6B9D → 你的颜色

/* 二传颜色 */
#FFD54F → 你的颜色

/* 箭头颜色 */
#FF9800 → 你的颜色
```

### 修改动画速度

编辑 `css/style.css` 和 `js/app.js`：

```css
/* CSS动画时长 */
transition: all 0.5s ease;  /* 改为你想要的时长 */
```

```javascript
// JavaScript延时
setTimeout(() => {...}, 600);  // 改为匹配的时长
```

### 添加新功能

在 `js/app.js` 中添加你的函数，然后在 `index.html` 中调用。

---

## 📊 性能优化

### 已实现的优化

- ✅ CSS Transition替代JavaScript动画
- ✅ 响应式Canvas自动调整
- ✅ DOM操作批量更新
- ✅ 事件防抖处理

### 可选优化

1. **启用PWA**（离线访问）
   - 添加 `manifest.json`
   - 添加 Service Worker

2. **CDN加速**
   - 使用Vercel/Netlify自动CDN
   - 或配置Cloudflare

3. **资源压缩**
   - 压缩CSS/JS文件
   - 使用构建工具

---

## 🐛 故障排除

### 问题1：页面显示空白
**原因**: JavaScript加载失败  
**解决**: 检查浏览器控制台错误，确保JS文件路径正确

### 问题2：动画不流畅
**原因**: 浏览器性能不足  
**解决**: 使用现代浏览器，关闭其他标签页

### 问题3：箭头不显示
**原因**: Canvas未初始化  
**解决**: 确保Canvas元素ID正确，检查控制台错误

### 问题4：手机上显示异常
**原因**: 响应式未生效  
**解决**: 检查viewport meta标签是否存在

---

## 📞 技术支持

如遇问题，请检查：
1. 浏览器控制台（F12）的错误信息
2. 文件路径是否正确
3. 浏览器版本是否过旧

---

## 📝 更新日志

### v1.0.0 (2026-01-03)
- ✅ 从小程序版本完整转换
- ✅ 所有核心功能正常运行
- ✅ 响应式设计适配多种设备
- ✅ 标准Canvas API实现
- ✅ 三种部署方案支持

---

## 📄 许可证

MIT License

---

## 🎉 开始使用

选择一种部署方式，将你的Web版排球教学应用分享给学员吧！

推荐流程：
1. 本地测试（方法2）
2. 部署到GitHub Pages（方案A）
3. 分享链接给学员

**祝教学顺利！** 🏐✨


