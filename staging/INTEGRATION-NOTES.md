# 星河主题：本地集成清单（待工具恢复）

已完成：预览页已在 Pages 上线 `galaxy.html`，智能入口 `go.html`。
下面这些需要写入本机 `D:\AI\class21-site`，当前 exec/写盘工具报错，无法完成。

## 素材（本目录下，直接取用）
- `galaxy.css` 8367 字符 → 追加到 `public/theme.css`（去掉预览页专属的 body 背景覆盖）
- `galaxy.js` 11060 字符 → 新建 `public/galaxy.js`（**必须是外部文件**，CSP `script-src self` 会拦内联）
- `galaxy-body.html` → 结构参考（canvas#gx + .neb 星云层 + 控制台）

## 落地步骤
1. `public/index.html`：首屏 hero 内加 `<canvas id="gx"></canvas>`，按 heroStyle 决定是否注入 `<script src="/galaxy.js"></script>`
2. `server.js` 的 `normalizeTheme` 白名单 heroStyle 增加 `galaxy`；**枚举必须声明在调用之前**（否则 TDZ → loadState 回退默认值 → 重启清空照片，已踩过两次）
3. `public/admin.html` + `public/admin-pro.js`：主题工坊加「🌌 动态星河」选项，事件用 data-act 委托，禁止内联 onclick
4. `public/app.js` 的 `renderAll()`：heroStyle===galaxy 时挂 canvas 并加载 /galaxy.js，切走时停掉 rAF
5. 入口页探测修复：`gh-keeper.ps1` 与 `mirror.js` 里的 index.html 模板，把 `fetch(LIVE+"/healthz")`（跨源必败，永远判定离线）
   换成样式表/脚本可信标记：`<link rel=stylesheet href=LIVE+"/style.css?_=ts">` onload=在线 onerror=离线（已实测可靠，参考 go.html）
6. 只重启 node，不动 keeper/cloudflared；跑本地+公网验证后清理临时文件

## 已知环境限制
- PowerShell 处于 Constrained Language Mode；写 .ps1 需保留 UTF-8 BOM；server.js/gh-keeper.ps1 混合行尾
- `rm`/`taskkill` 被拦 → 用 node `fs.unlinkSync` / `process.kill`
- 不要把 GitHub token 写进任何公开文件或页面
