# 有爱21 · 集成说明（星河版）

## 公网结构
- 永久入口: https://lightning314.github.io/class21-site/  （sw.js 生效后 302 到 /go）
- 星河入口: /class21-site/go  （读 tunnel.json → preload 探针探活 → 自动进入或转离线相册）
- 离线相册: /class21-site/snapshot/  （缩略图 t/ + 原图 p/，gx-skin.js 自动套星河皮肤）
- 实时通道: data/tunnel.json（由 gh-keeper.ps1 更新），班级电脑关机时入口显示「暂时没开机」

## 动态星河
- galaxy.js = 深空 canvas 引擎（星野闪烁 + 银河带 + 旋臂尘埃 + 流星 + 星座连线 + 鼠标视差），
  末尾 IIFE 读 --paper 亮度，亮度 < 0.45 时给 <html> 加 gx-dark，1.5s 轮询，浅色模式自动隐藏
- galaxy.css = 本地官网用（#gx 固定层 z-index:-1，仅 html.gx-dark 显示）
- gx-skin.js = 离线相册用（自建 #gx/.neb/.vig + 深色玻璃覆盖样式，仅当页面存在 section.blk 时注入深色）
- sw.js = 入口 302 到 /go；相册页 HTML 若缺 gx-skin.js 则在 </body> 前注入（重建 Headers）

## 本地集成（班级电脑）
- 在 D:\AI\class21-site\public 目录执行: node install-galaxy.js
  会下载 galaxy.js/galaxy.css/gx-skin.js/sw.js，备份 index.html.gx-bak，并在 index.html 注入 canvas+link+script
  卸载: node install-galaxy.js --uninstall
- 星河只在深色模式出现：后台「✨ 主题工坊」→ 深色模式（或选 neon 预设）

## 已知坑（务必保留）
- 探活不能用跨域 fetch（CORS 必 reject，这是「网站打不开」的老 bug）；mode:no-cors 死通道也 resolve；
  样式表探针不可靠；<script> 探针会执行远端 JS。最优 = link rel=preload as=script（活≈330ms / 死≈580ms error）
  控制台 "preloaded but not used" warning 属预期，不是错误
- raw.githubusercontent.com 在本机网络被 reset，下载一律走 lightning314.github.io 或 api.github.com/contents
- keeper 的本地模板仍是旧版 index.html / snapshot/index.html，运行时会覆盖 Pages 上的探针修复版；
  sw.js 的重定向与皮肤注入可部分兜住，go.html/sw.js/gx-skin.js/galaxy.* /install-galaxy.js 不受 keeper 影响
- server.js 里枚举常量必须在首次调用前声明（TDZ 会让 loadState 静默回退默认值 → 重启清空全部照片）
- 若要正规接入主题工坊：normalizeTheme 的 heroStyle 白名单加 galaxy；admin 用 data-act 委托（CSP 无内联）；
  只重启 node，不要动 keeper/cloudflared（隧道地址会变）
