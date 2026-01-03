# OptionList PWA化 完全手順書

## 📋 概要
このガイドでは、OptionListをPWA（Progressive Web App）化し、スマホのホーム画面に追加できるようにする手順を説明します。

---

## ステップ1: Vite PWA プラグインのインストール

### 1-1. パッケージのインストール

プロジェクトのルートディレクトリで以下のコマンドを実行：

```bash
npm install vite-plugin-pwa -D
```

または

```bash
yarn add vite-plugin-pwa -D
```

---

## ステップ2: Vite設定ファイルの更新

### 2-1. `vite.config.ts` を編集

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
      manifest: {
        name: 'OptionList - やりたいことリスト',
        short_name: 'OptionList',
        description: 'やりたいことをリスト化し、新しい体験への一歩を後押しするアプリ',
        theme_color: '#ffffff',
        background_color: '#ffffff',
        display: 'standalone',
        scope: '/',
        start_url: '/',
        orientation: 'portrait',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365 // 1年
              },
              cacheableResponse: {
                statuses: [0, 200]
              }
            }
          }
        ]
      }
    })
  ]
})
```

**重要ポイント:**
- `registerType: 'autoUpdate'` - 自動更新を有効化
- `display: 'standalone'` - アプリらしい表示モード
- `orientation: 'portrait'` - 縦向き固定（スマホ最適化）

---

## ステップ3: アイコン画像の準備

### 3-1. 必要なアイコンサイズ

`public/` ディレクトリに以下の画像を配置：

- `pwa-192x192.png` (192×192ピクセル)
- `pwa-512x512.png` (512×512ピクセル)
- `apple-touch-icon.png` (180×180ピクセル、iOS用)
- `favicon.ico` (32×32ピクセル)

### 3-2. アイコン作成のヒント

**デザイン案:**
- シンプルな「オプション」記号（三点リーダー風）
- 明るいカラフルな配色
- 背景は単色または軽いグラデーション

**無料アイコン生成ツール:**
- [Canva](https://www.canva.com/) - デザインツール
- [Favicon.io](https://favicon.io/) - favicon生成
- [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator) - CLIツール

**CLIで一括生成する場合:**
```bash
npx pwa-asset-generator [元画像.png] public/icons --icon-only
```

---

## ステップ4: HTMLファイルの更新

### 4-1. `index.html` の `<head>` に追加

```html
<!DOCTYPE html>
<html lang="ja">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    
    <!-- PWA用メタタグ -->
    <meta name="theme-color" content="#ffffff" />
    <meta name="description" content="やりたいことをリスト化し、新しい体験への一歩を後押しするアプリ" />
    
    <!-- iOS用 -->
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="default" />
    <meta name="apple-mobile-web-app-title" content="OptionList" />
    
    <title>OptionList - やりたいことリスト</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

## ステップ5: ビルドとテスト

### 5-1. ローカルでビルド

```bash
npm run build
```

これにより、PWA対応のファイルが `dist/` ディレクトリに生成されます。

### 5-2. ローカルプレビュー

```bash
npm run preview
```

ブラウザで開いて、デベロッパーツールの「Application」タブで以下を確認：
- Manifest が正しく読み込まれているか
- Service Worker が登録されているか

---

## ステップ6: デプロイ（Vercel推奨）

### 6-1. Vercelでのデプロイ手順

**準備:**
1. GitHubにプロジェクトをプッシュ
2. [Vercel](https://vercel.com/)でアカウント作成（無料）

**デプロイ:**
1. Vercelダッシュボードで「New Project」をクリック
2. GitHubリポジトリを選択
3. フレームワークが「Vite」として自動検出されることを確認
4. 「Deploy」をクリック

**完了！**
- 数分でデプロイ完了
- `https://your-app.vercel.app` のようなURLが発行されます
- HTTPS対応（PWAに必須）

### 6-2. その他のデプロイオプション

**Netlify:**
```bash
npm install netlify-cli -g
netlify deploy --prod
```

**GitHub Pages:**
```bash
npm run build
# dist/ フォルダをgh-pagesブランチにデプロイ
```

---

## ステップ7: スマホでインストール

### 7-1. iOSでのインストール

1. SafariでデプロイしたURLを開く
2. 画面下部の「共有」ボタンをタップ
3. 「ホーム画面に追加」を選択
4. アプリ名を確認して「追加」

### 7-2. Androidでのインストール

1. Chrome/EdgeでデプロイしたURLを開く
2. 画面上部に「ホーム画面に追加」のポップアップが表示
3. または、メニュー → 「ホーム画面に追加」を選択

---

## 追加の最適化（オプション）

### オフライン対応の強化

`vite.config.ts` の `workbox` セクションにキャッシュ戦略を追加：

```typescript
workbox: {
  // すべての静的ファイルをキャッシュ
  globPatterns: ['**/*.{js,css,html,ico,png,svg,json}'],
  
  // LocalStorageのデータもオフラインで動作
  runtimeCaching: [
    {
      urlPattern: /^https:\/\/.*\.(png|jpg|jpeg|svg)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'images-cache',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 60 * 24 * 30 // 30日
        }
      }
    }
  ]
}
```

### プッシュ通知（将来的に）

現時点ではLocalStorageのみですが、将来的にバックエンドを追加する場合：
- Firebase Cloud Messaging (FCM)
- Service Worker Notification API

---

## トラブルシューティング

### Service Workerが登録されない

**原因:** HTTPS接続でない
**解決策:** ローカルは `localhost` で動作、本番はHTTPSでデプロイ

### アイコンが表示されない

**原因:** パスが間違っている
**解決策:** `public/` 直下に配置、パスは絶対パス（`/pwa-192x192.png`）

### iOSでインストールできない

**原因:** Safariでない、またはmanifest設定が不足
**解決策:** 
- Safariを使用
- `apple-touch-icon` を正しく設定
- `apple-mobile-web-app-capable` を追加

---

## チェックリスト

完成前に以下を確認：

- [ ] `vite-plugin-pwa` がインストールされている
- [ ] `vite.config.ts` にPWA設定を追加
- [ ] アイコン画像（192×192、512×512）を配置
- [ ] `index.html` にPWAメタタグを追加
- [ ] ビルドが正常に完了する（`npm run build`）
- [ ] デベロッパーツールでManifest確認
- [ ] デベロッパーツールでService Worker確認
- [ ] Vercelにデプロイ完了
- [ ] HTTPSでアクセス可能
- [ ] スマホでホーム画面に追加できる
- [ ] オフラインで動作する

---

## まとめ

これで、OptionListが完全なPWAになりました！

**達成したこと:**
✅ ホーム画面に追加可能
✅ アプリのような見た目
✅ オフラインで動作
✅ 自動更新対応
✅ iOS/Android両対応

**次のステップ:**
- ユーザーテスト
- パフォーマンス最適化
- プッシュ通知の検討（Phase 2以降）

頑張ってください！🎉
