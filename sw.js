// 旧 URL（このサイトの直下）で配信していた版の Service Worker を片づけるための
// 自壊用スクリプト。旧 URL の端末はここを更新確認で取りに来るので、受け取ったら
// 旧版のキャッシュと登録を消して、白紙の直下ページへ戻る。
// 新しい配信場所のアドレスは書かない（秘密のパスを直下に出さないため）。
// 消すのは、この直下の scope（self.registration.scope）が名前の末尾に付いた
// キャッシュだけ。別の場所（/d/…）や同じサイトの他アプリのキャッシュは消さない。
self.addEventListener('install', () => {
  void self.skipWaiting();
});
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const scope = self.registration.scope;
      for (const key of await caches.keys()) {
        if (key.endsWith(scope)) await caches.delete(key);
      }
      const clients = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
      await self.registration.unregister();
      for (const client of clients) {
        try {
          void client.navigate(scope);
        } catch {
          // 戻せなくても、次に開いたときは白紙になる
        }
      }
    })(),
  );
});
// 取得はキャッシュを使わず、常にネットワークへ
self.addEventListener('fetch', () => {});
