// Service worker do app do vendedor: guarda só a casca (tela, ícones) para abrir rápido e deixar instalar.
// Dados, login e fotos NUNCA passam por aqui: tudo que não é da casca vai direto à rede.
const CACHE = "comercial-casca-v2";
const CASCA = ["./", "index.html", "manifest.webmanifest", "assets/icone-192.png", "assets/icone-512.png", "assets/supabase.js"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(CASCA)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.endsWith("versao.json")) return;   // fora da casca: rede direta
  // a tela vem da rede primeiro (versão nova sempre que houver sinal); sem sinal, usa a guardada
  e.respondWith(fetch(e.request, { cache:"no-cache" }).then(r => { if (r.ok) { const cp = r.clone(); caches.open(CACHE).then(c => c.put(e.request, cp)); } return r; }).catch(() => caches.match(e.request).then(m => m || caches.match("index.html"))));
});
