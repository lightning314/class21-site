var SCOPE = new URL('./', self.location).pathname;
var GO = SCOPE + 'go';
var SKIN = '<scr' + 'ipt src="' + SCOPE + 'gx-skin.js"></scr' + 'ipt>';
var FALLBACK = '<scr' + 'ipt>/*gxFbMark*/document.addEventListener("error",function(e){var t=e.target;if(t&&t.tagName==="IMG"&&t.src.indexOf("/t/")>=0){t.src=t.src.split("/t/").join("/p/");}},true);</scr' + 'ipt>';
function decorate(html) {
  if (html.indexOf('src="p/') >= 0) html = html.split('src="p/').join('src="t/');
  var add = '';
  if (html.indexOf('src="t/') >= 0 && html.indexOf('gxFbMark') < 0) add += FALLBACK;
  if (html.indexOf('gx-skin.js') < 0) add += SKIN;
  if (add) {
    var i = html.toLowerCase().lastIndexOf('</body>');
    if (i >= 0) html = html.slice(0, i) + add + html.slice(i);
    else html = add + html;
  }
  return html;
}
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
function isEntry(p) { return p === SCOPE.slice(0, -1) || p === SCOPE || p === SCOPE + 'index.html'; }
function isAlbum(p) { var s = SCOPE + 'snapshot'; return p === s || p === s + '/' || p === s + '/index.html'; }
self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (req.method !== 'GET') return;
  var u;
  try { u = new URL(req.url); } catch (err) { return; }
  if (u.origin !== self.location.origin) return;
  if (req.mode === 'navigate' && isEntry(u.pathname)) { e.respondWith(Response.redirect(GO, 302)); return; }
  if (!isAlbum(u.pathname)) return;
  e.respondWith((async function () {
    try {
      var res = await fetch(req, { cache: 'no-store' });
      var html = await res.text();
      html = decorate(html);
      var h = new Headers();
      h.set('Content-Type', 'text/html; charset=utf-8');
      h.set('Cache-Control', 'no-store');
      return new Response(html, { status: 200, headers: h });
    } catch (err) { return fetch(req); }
  })());
});