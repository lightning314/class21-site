(function () {
  var D = document;
  if (D.getElementById("gx")) return;
  if (!D.body) { D.addEventListener("DOMContentLoaded", arguments.callee); return; }
  var me = D.currentScript || D.scripts[D.scripts.length - 1];
  var dir = (me && me.src ? me.src.slice(0, me.src.lastIndexOf("/") + 1) : "");
  var cv = D.createElement("canvas"); cv.id = "gx"; D.body.insertBefore(cv, D.body.firstChild);
  var neb = D.createElement("div"); neb.className = "neb";
  for (var i = 0; i < 3; i++) neb.appendChild(D.createElement("i"));
  var vig = D.createElement("div"); vig.className = "vig";
  D.body.insertBefore(neb, cv.nextSibling); D.body.appendChild(vig);
  var CSS = [    "#gx{position:fixed;inset:0;z-index:0;pointer-events:none}",
    ".neb{position:fixed;inset:0;z-index:0;pointer-events:none;filter:blur(70px);opacity:.45}",
    ".neb i{position:absolute;display:block;border-radius:50%;mix-blend-mode:screen}",
    ".neb i:nth-child(1){width:46vw;height:46vw;left:56%;top:-14%;background:radial-gradient(circle at 40% 40%,#0ea5e9,transparent 68%);animation:gxd1 44s ease-in-out infinite}",
    ".neb i:nth-child(2){width:38vw;height:38vw;left:-8%;top:44%;background:radial-gradient(circle at 50% 50%,#a78bfa,transparent 70%);animation:gxd2 56s ease-in-out infinite}",
    ".neb i:nth-child(3){width:32vw;height:32vw;left:36%;top:74%;background:radial-gradient(circle at 50% 50%,#22d3ee,transparent 70%);opacity:.7;animation:gxd3 49s ease-in-out infinite}",
    "@keyframes gxd1{0%,100%{transform:translate(0,0) scale(1)}50%{transform:translate(-6vw,5vh) scale(1.12)}}",
    "@keyframes gxd2{0%,100%{transform:translate(0,0) scale(1.05)}50%{transform:translate(7vw,-6vh) scale(.92)}}",
    "@keyframes gxd3{0%,100%{transform:translate(0,0) scale(.95)}50%{transform:translate(5vw,-9vh) scale(1.16)}}",
    ".vig{position:fixed;inset:0;z-index:1;pointer-events:none;background:radial-gradient(125% 105% at 50% 38%,transparent 52%,rgba(0,0,0,.55))}",
    "@media (prefers-reduced-motion: reduce){.neb i{animation:none}}"  ].join("\n");
  var DARK = [    "body{background-color:#03050e;background-image:radial-gradient(120% 82% at 78% 14%,rgba(99,102,241,.28),transparent 60%),radial-gradient(96% 72% at 10% 88%,rgba(14,165,233,.16),transparent 62%),linear-gradient(180deg,#050b20 0%,#03060f 55%,#01020a 100%);color:#eaf2ff}",
    ".wrap{position:relative;z-index:2}",
    "header.top{background:rgba(6,10,24,.74);border-bottom-color:rgba(255,255,255,.10)}",
    ".brand{color:#fff}.chip{background:rgba(34,211,238,.16);color:#7dd3fc}header.top a{color:#8fd3ff}",
    ".hero h1{background:linear-gradient(120deg,#7dd3fc,#a78bfa);-webkit-background-clip:text;background-clip:text;color:transparent}",
    ".hero p.s{color:rgba(234,242,255,.70)}",
    ".stat{background:rgba(255,255,255,.06);border-color:rgba(255,255,255,.13);box-shadow:none;backdrop-filter:blur(10px)}",
    ".stat b{color:#fff}.stat span{color:rgba(234,242,255,.58)}",
    "section.blk{background:rgba(9,14,30,.66);border-color:rgba(255,255,255,.11);box-shadow:0 26px 60px -44px #000;backdrop-filter:blur(14px)}",
    "section.blk h2{color:#fff}section.blk p.sub{color:rgba(234,242,255,.56)}",
    ".banner{background:rgba(255,179,71,.10);border-color:rgba(255,179,71,.32);color:#ffe8c6}",
    ".banner b{color:#ffcf8a}.banner div{color:#cdb389!important}",
    ".banner a.ghost{background:rgba(255,255,255,.07);color:#eaf2ff;border-color:rgba(255,255,255,.18)}",
    ".card{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.10)}",
    ".note{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.10);color:rgba(234,242,255,.86)}",
    ".note h4{color:#fff}.empty{color:rgba(234,242,255,.45);border-color:rgba(255,255,255,.18)}",
    ".gcard{background:rgba(255,255,255,.05);border-color:rgba(255,255,255,.10);background-image:none}",
    ".gcard .gh b{color:#fff}.gcard .gh time{color:rgba(234,242,255,.45)}.gcard .gc{color:rgba(234,242,255,.88)}",
    ".likes{color:rgba(234,242,255,.50)}footer{color:rgba(234,242,255,.42)}"  ].join("\n");
  function add(css) { var s = D.createElement("style"); s.textContent = css; (D.head || D.body).appendChild(s); }
  add(CSS);
  if (D.querySelector("section.blk")) add(DARK);
  var sc = D.createElement("script"); sc.src = dir + "galaxy.js"; D.body.appendChild(sc);
})();
(function () {
  try {
    if (!('serviceWorker' in navigator) || location.protocol !== 'https:') return;
    var tag = document.querySelector('script[src*=' + String.fromCharCode(34) + 'gx-skin.js' + String.fromCharCode(34) + ']');
    if (!tag || !tag.src) return;
    var u = new URL(tag.src, location.href);
    var root = u.pathname.slice(0, u.pathname.lastIndexOf('/') + 1);
    var cur = String(navigator.serviceWorker.scriptURL || "");
    if (cur.indexOf(root + "sw.js") === 0) return;
    navigator.serviceWorker.register(root + "sw.js", { scope: root }).catch(function () {});
  } catch (e) {}
})();
