var SCOPE = new URL('./', self.location).pathname;
var GO = SCOPE + 'go';
var SKIN = '<scr' + 'ipt src="' + SCOPE + 'gx-skin.js"></scr' + 'ipt>';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });
function isEntry(p) { return p === SCOPE.slice(0, -1) || p === SCOPE || p === SCOPE + 'index.html'; }
function isAlbum(p) { return /^\/class21-site\/snapshot\/(index\.html)?$/.test(p) || p === SCOPE + 'snapshot/'; }
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
      if (html.indexOf('gx-skin.js') < 0 && /<\/body>/i.test(html)) html = html.replace(/<\/body>/i, SKIN + '</body>');
      var h = new Headers();
      h.set('Content-Type', 'text/html; charset=utf-8');
      h.set('Cache-Control', 'no-store');
      return new Response(html, { status: 200, headers: h });
    } catch (err) { return fetch(req); }
  })());
});