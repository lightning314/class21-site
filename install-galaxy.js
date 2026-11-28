// 有爱21 · 动态星河安装器  ——  node install-galaxy.js   （卸载： node install-galaxy.js --uninstall）
var fs = require("fs"), path = require("path"), https = require("https");
var ROOT = __dirname;
var PUB = path.join(ROOT, "public");
var IDX = path.join(PUB, "index.html");
var BAK = path.join(PUB, "index.html.gx-bak");
var MARK = "<!-- 有爱21 动态星河 · 由 install-galaxy.js 注入 -->";
var BASE = "https://lightning314.github.io/class21-site/";
var FILES = ["galaxy.js", "galaxy.css", "gx-skin.js", "sw.js"];
var off = process.argv.indexOf("--uninstall") >= 0;

function log(s) { console.log(s); }
function get(url, depth, cb) {
  https.get(url, { headers: { "User-Agent": "class21-installer" } }, function (r) {
    if (r.statusCode >= 300 && r.statusCode < 400 && r.headers.location && depth < 4) { r.resume(); return get(new URL(r.headers.location, url).href, depth + 1, cb); }
    if (r.statusCode !== 200) { r.resume(); return cb(new Error("HTTP " + r.statusCode + " " + url)); }
    var b = ""; r.setEncoding("utf8"); r.on("data", function (c) { b += c; }); r.on("end", function () { cb(null, b); });
  }).on("error", cb);
}

function removeInject(s) {
  s = s.split(MARK).join("");
  s = s.split('<canvas id="gx"></canvas>').join("");
  s = s.split('<link rel="stylesheet" href="/galaxy.css">').join("");
  s = s.split('<script src="/galaxy.js"></scr' + "ipt").join("");
  return s;
}

function uninstall() {
  if (!fs.existsSync(IDX)) { log("没找到 " + IDX); return; }
  var s = fs.readFileSync(IDX, "utf8");
  if (fs.existsSync(BAK)) s = fs.readFileSync(BAK, "utf8");
  s = removeInject(s);
  fs.writeFileSync(IDX, s);
  log("已恢复 index.html（星河引用已移除，样式文件保留在 public 里没删）");
}

function install() {
  if (!fs.existsSync(IDX)) { log("× 没找到 " + IDX + "，请在 D:\\AI\\class21-site 里运行"); process.exit(1); }
  var html = fs.readFileSync(IDX, "utf8");
  if (!fs.existsSync(BAK)) { fs.writeFileSync(BAK, html); log("√ 已备份 public/index.html.gx-bak"); }
  var n = 0;
  var next = function (i) {
    if (i >= FILES.length) {
      html = removeInject(fs.readFileSync(IDX, "utf8"));
      var m = html.match(/<body[^>]*>/i);
      if (!m) { log("× 找不到 <body>，已中止，网站未改动"); process.exit(1); }
      html = html.slice(0, m.index + m[0].length) + "\n" + MARK + '\n<canvas id="gx"></canvas>\n<link rel="stylesheet" href="/galaxy.css">' + html.slice(m.index + m[0].length);
      var k = html.toLowerCase().lastIndexOf("</body>");
      html = html.slice(0, k) + "<script src=\"/galaxy.js\"></scr" + "ipt>\n" + html.slice(k);
      fs.writeFileSync(IDX, html);
      log("√ 星河已装到首页（改了 public/index.html，静态文件即时生效，不用重启服务）");
      log("");
      log("最后一步：刷新首页前，先在后台「✨ 主题工坊」打开 深色模式 并保存 —— 星河只在深色下出现，浅色下会自动隐藏以免文字看不清。");
      return;
    }
    var f = FILES[i];
    get(BASE + f, 0, function (e, body) {
      if (e) { log("× 下载 " + f + " 失败：" + e.message); process.exit(1); }
      if (!body || body.length < 200) { log("× " + f + " 内容异常，已中止，网站未改动"); process.exit(1); }
      fs.writeFileSync(path.join(PUB, f), body);
      log("√ " + f + " (" + Math.round(body.length / 1024) + " KB)");
      next(i + 1);
    });
  };
  next(0);
}

if (off) uninstall(); else install();