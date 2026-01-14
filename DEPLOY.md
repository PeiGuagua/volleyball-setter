# 如何在手机上测试本项目

要让您的排球轮转小游戏在手机上运行，您需要将其部署到互联网上。最简单的方法是使用 **GitHub Pages**。

## 方法一：使用 GitHub Pages（推荐，永久免费）

1.  **上传代码到 GitHub**
    *   如果您已经有 GitHub 仓库，直接提交并推送代码。
    *   如果没有，请在 GitHub 上新建一个仓库，然后执行：
        ```bash
        git init
        git add .
        git commit -m "Initial commit"
        git branch -M main
        git remote add origin https://github.com/您的用户名/您的仓库名.git
        git push -u origin main
        ```

2.  **开启 GitHub Pages**
    *   进入 GitHub 仓库页面。
    *   点击 **Settings** (设置) -> 左侧菜单底部的 **Pages**。
    *   在 **Build and deployment** 下的 **Source** 选择 **Deploy from a branch**。
    *   在 **Branch** 下选择 `main` (或 `master`) 分支，文件夹选择 `/root`（如果您的 index.html 在根目录）或者 `/web-version`（如果是在子目录）。
    *   **注意**：由于您的 `index.html` 在 `web-version` 文件夹内，您可能需要配置 Pages 发布源为 `web-version` 文件夹（如果 GitHub 允许），或者更简单的做法是：
        *   将 `web-version` 文件夹里的所有内容移动到项目根目录。
    *   点击 **Save**。

3.  **获取链接**
    *   等待几分钟，刷新页面，您会看到一个绿色的链接，例如 `https://您的用户名.github.io/您的仓库名/`。
    *   **复制这个链接发到手机微信**，点击即可在手机上访问！

## 方法二：局域网访问（无需上传，仅限同一 Wi-Fi）

如果您的电脑和手机连在同一个 Wi-Fi 下：

1.  **在 Cursor 终端运行服务器**
    在 Cursor 的终端中输入：
    ```bash
    cd web-version
    python3 -m http.server 8000
    ```

2.  **查看电脑 IP 地址**
    *   **Mac**: 打开“系统设置” -> “Wi-Fi” -> 点击详细信息，查看 IP 地址（例如 `192.168.1.5`）。
    *   **Windows**: 打开终端输入 `ipconfig`，查看 IPv4 地址。

3.  **手机访问**
    *   打开手机浏览器，输入：`http://电脑IP:8000`
    *   例如：`http://192.168.1.5:8000`

---

## 手机端体验优化提示

本项目已经针对手机端做了如下适配：
*   ✅ **触摸优化**：滚轮选择器支持手指拖动。
*   ✅ **响应式布局**：使用 `rem` 单位，自动适应不同屏幕大小。
*   ✅ **全屏体验**：在 `<head>` 中已添加 `viewport` 设置。

祝您测试愉快！🏐
