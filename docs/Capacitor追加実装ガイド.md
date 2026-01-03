# Capacitor 追加 実装ガイド

既存のOptionListプロジェクトにCapacitorを追加する、ステップバイステップガイドです。

---

## 事前準備

### 必要な環境
- ✅ Mac（iOS開発必須）
- ✅ Node.js（v16以上）
- ✅ Xcode（App Storeから無料ダウンロード）
- ✅ Xcode Command Line Tools

### Xcode Command Line Toolsのインストール確認

```bash
# インストール確認
xcode-select -p

# インストールされていない場合
xcode-select --install
```

### プロジェクトのバックアップ

```bash
# 現在の状態をコミット
git add .
git commit -m "Capacitor追加前のバックアップ"

# 安全のため新しいブランチで作業
git checkout -b feature/capacitor-support
```

---

## Phase 1: Capacitorのインストール（10分）

### ステップ1-1: パッケージのインストール

```bash
# プロジェクトディレクトリに移動
cd /path/to/optionlist

# Capacitorをインストール
npm install @capacitor/core @capacitor/cli
```

### ステップ1-2: Capacitorの初期化

```bash
# Capacitor設定を初期化
npx cap init "OptionList" "com.yourname.optionlist" --web-dir=dist
```

**パラメータの説明:**
- `"OptionList"` - アプリ名
- `"com.yourname.optionlist"` - Bundle Identifier（重要！）
  - 形式: `com.あなたの名前.アプリ名`
  - 例: `com.tanaka.optionlist`
  - **後から変更が面倒なので慎重に決める**
- `--web-dir=dist` - Viteのビルド出力先

### ステップ1-3: iOS プラットフォームの追加

```bash
# iOS用のパッケージをインストール
npm install @capacitor/ios

# iOSプロジェクトを生成
npx cap add ios
```

**完了すると:**
- `ios/` フォルダが作成される
- `capacitor.config.ts` が作成される

---

## Phase 2: 設定ファイルの調整（15分）

### ステップ2-1: capacitor.config.ts の編集

```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.yourname.optionlist',
  appName: 'OptionList',
  webDir: 'dist',
  server: {
    androidScheme: 'https'
  },
  ios: {
    contentInset: 'always',
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 0
    }
  }
};

export default config;
```

### ステップ2-2: package.json にスクリプト追加

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    // Capacitor用スクリプトを追加
    "cap:sync": "npm run build && npx cap sync",
    "cap:sync:ios": "npm run build && npx cap sync ios",
    "cap:open:ios": "npx cap open ios",
    "cap:run:ios": "npm run cap:sync:ios && npm run cap:open:ios",
    
    // 将来的にAndroid用も追加可能
    "cap:sync:android": "npm run build && npx cap sync android",
    "cap:open:android": "npx cap open android"
  }
}
```

### ステップ2-3: .gitignore の更新

```gitignore
# 既存の内容に追加

# Capacitor
ios/App/Pods/
ios/App/App.xcworkspace/xcuserdata/
ios/App/*.xcodeproj/xcuserdata/
ios/App/*.xcodeproj/project.xcworkspace/xcuserdata/
ios/App/build/

android/app/build/
android/build/
android/.gradle/
android/.idea/
```

---

## Phase 3: iOS対応の調整（30分）

### ステップ3-1: Safe Area 対応

**src/index.css に追加:**

```css
/* Safe Area（ノッチ・ホームバー）対応 */
:root {
  --safe-area-inset-top: env(safe-area-inset-top);
  --safe-area-inset-right: env(safe-area-inset-right);
  --safe-area-inset-bottom: env(safe-area-inset-bottom);
  --safe-area-inset-left: env(safe-area-inset-left);
}

body {
  /* iOSのSafe Areaを考慮 */
  padding-top: var(--safe-area-inset-top);
  padding-bottom: var(--safe-area-inset-bottom);
}

/* タブナビゲーションの調整（下部固定の場合） */
.tab-navigation {
  padding-bottom: calc(var(--safe-area-inset-bottom) + 8px);
}
```

### ステップ3-2: ステータスバーのプラグイン追加

```bash
# ステータスバー制御用プラグイン
npm install @capacitor/status-bar
```

**src/App.tsx に追加:**

```typescript
import { StatusBar, Style } from '@capacitor/status-bar';
import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

function App() {
  useEffect(() => {
    // ネイティブプラットフォームの場合のみ
    if (Capacitor.isNativePlatform()) {
      // ステータスバーを明るい背景用に設定
      StatusBar.setStyle({ style: Style.Light });
      
      // iOS 15以降の半透明オーバーレイを無効化（オプション）
      StatusBar.setOverlaysWebView({ overlay: false });
    }
  }, []);

  return (
    // 既存のコード
  );
}

export default App;
```

### ステップ3-3: カメラ・写真ライブラリのプラグイン追加

```bash
# カメラ・写真用プラグイン
npm install @capacitor/camera
```

**src/hooks/useCamera.ts（新規作成）:**

```typescript
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Capacitor } from '@capacitor/core';

export function useCamera() {
  const isNative = Capacitor.isNativePlatform();

  const takePicture = async (): Promise<string | null> => {
    if (!isNative) {
      // Web版：従来のfile inputを使用
      return null; // コンポーネント側でfile inputを表示
    }

    try {
      const image = await Camera.getPhoto({
        quality: 80,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Prompt, // カメラor写真ライブラリを選択
      });

      return `data:image/jpeg;base64,${image.base64String}`;
    } catch (error) {
      console.error('カメラエラー:', error);
      return null;
    }
  };

  return { takePicture, isNative };
}
```

**使用例（コンポーネント内）:**

```typescript
import { useCamera } from '../hooks/useCamera';

function OptionDetailPage() {
  const { takePicture, isNative } = useCamera();

  const handleAddImage = async () => {
    if (isNative) {
      // ネイティブ：Capacitorのカメラプラグインを使用
      const imageData = await takePicture();
      if (imageData) {
        // 画像を保存
        saveImage(imageData);
      }
    } else {
      // Web：file inputを表示
      // 既存のロジック
    }
  };

  return (
    // JSX
  );
}
```

---

## Phase 4: 初回ビルド＆確認（15分）

### ステップ4-1: Webアプリをビルド

```bash
# 本番用ビルド
npm run build

# distフォルダが生成されることを確認
ls -la dist/
```

### ステップ4-2: iOSプロジェクトに同期

```bash
# ビルド結果をiOSプロジェクトに反映
npx cap sync ios
```

### ステップ4-3: Xcodeで開く

```bash
# Xcodeを起動
npx cap open ios
```

または便利なコマンド：

```bash
# ビルド → 同期 → Xcode起動を一発で
npm run cap:run:ios
```

### ステップ4-4: Xcodeでビルド＆実行

1. Xcodeが起動する
2. 上部のデバイス選択で「iPhone 15 Pro」などを選択
3. 再生ボタン（▶️）をクリック
4. シミュレーターでアプリが起動

**初回ビルドは時間がかかる（3〜5分）**

---

## Phase 5: Xcodeの基本設定（20分）

### ステップ5-1: Bundle Identifier の確認

1. 左側のプロジェクトナビゲータで「App」を選択
2. 「Signing & Capabilities」タブ
3. Bundle Identifier を確認: `com.yourname.optionlist`

### ステップ5-2: 開発チームの設定

1. 「Team」のドロップダウンで「Add an Account...」
2. Apple IDでサインイン
3. 自動で「Personal Team」が追加される

**注意:**
- App Store配布には Apple Developer Program（$99/年）が必要
- 開発・テストはPersonal Teamで無料

### ステップ5-3: Info.plist の編集

カメラ・写真ライブラリのアクセス許可説明を追加：

1. プロジェクトナビゲータで `Info.plist` を開く
2. 右クリック → 「Add Row」
3. 以下を追加：

| Key | Type | Value |
|-----|------|-------|
| Privacy - Camera Usage Description | String | やりたいことの写真を撮影するために使用します |
| Privacy - Photo Library Usage Description | String | やりたいことに画像を追加するために使用します |

---

## Phase 6: 動作確認（15分）

### チェックリスト

シミュレーターで以下を確認：

- [ ] アプリが起動する
- [ ] やりたいリストが表示される
- [ ] タブナビゲーションが動作する
- [ ] やりたいことを追加できる
- [ ] 画像の追加（カメラプラグイン）が動作する
- [ ] データがLocalStorageに保存される
- [ ] アプリを再起動してもデータが残る
- [ ] Safe Areaが正しく表示される（ノッチ対応）

### デバッグ方法

#### Xcodeのコンソール
- Xcode下部のコンソールでJavaScriptのログを確認
- `console.log()` の出力が表示される

#### Safari Web Inspector
1. Safariを開く
2. メニュー → 開発 → Simulator → localhost
3. Web Inspectorでデバッグ可能

---

## Phase 7: 開発ワークフロー

### 日常の開発フロー

```bash
# 1. Web版で開発（高速）
npm run dev
# ブラウザで確認しながらコード編集

# 2. iOS版で確認（iOS固有の調整時）
npm run cap:run:ios
# Xcodeでシミュレーター実行

# 3. コードを変更したら
# Xcodeで再ビルド（⌘ + R）
# または
npm run cap:sync:ios  # 再同期
```

### 推奨の開発手順

1. **新機能開発**: Web版で実装・テスト（ブラウザ）
2. **iOS確認**: 定期的にiOSシミュレーターで動作確認
3. **iOS固有調整**: Safe Area、ステータスバーなど
4. **実機テスト**: TestFlightで配布（Phase 2以降）

---

## トラブルシューティング

### 問題1: ビルドエラー「No such module 'Capacitor'」

**原因:** iOSプロジェクトが正しく同期されていない

**解決策:**
```bash
npx cap sync ios
```

### 問題2: 「Developer Mode disabled」

**原因:** iOS 16以降、実機テストには開発者モードが必要

**解決策:**
1. iPhone設定 → プライバシーとセキュリティ → 開発者モード
2. オンにして再起動

### 問題3: シミュレーターで白い画面

**原因:** ビルドされたファイルが反映されていない

**解決策:**
```bash
# 完全にクリーンビルド
rm -rf dist/
npm run build
npx cap sync ios
```

### 問題4: LocalStorageが動作しない

**原因:** CapacitorのLocalStorageは通常のブラウザと異なる場所に保存

**解決策:**
- 問題なし、正常動作
- データは `Library/WebKit/` 以下に保存される

---

## 次のステップ

Capacitor追加が完了したら：

1. **機能テスト**: すべての機能が動作するか確認
2. **iOS最適化**: Safe Area、ステータスバーの調整
3. **アイコン作成**: 1024×1024のアプリアイコン
4. **TestFlight配布**: 友人にテスト配布（オプション）
5. **App Store申請**: 準備が整ったら申請

---

## コマンド早見表

```bash
# 開発
npm run dev                    # Web版開発サーバー起動
npm run build                  # 本番ビルド

# Capacitor
npm run cap:sync               # すべてのプラットフォームに同期
npm run cap:sync:ios           # ビルド → iOS同期
npm run cap:open:ios           # Xcode起動
npm run cap:run:ios            # ビルド → 同期 → Xcode起動（便利）

# Git
git add .
git commit -m "Capacitor追加"
git push origin feature/capacitor-support
```

---

## まとめ

**所要時間: 約2時間**

Phase 1: インストール（10分）
Phase 2: 設定（15分）
Phase 3: iOS対応（30分）
Phase 4: ビルド（15分）
Phase 5: Xcode設定（20分）
Phase 6: 動作確認（15分）
Phase 7: ワークフロー理解（15分）

**完了すると:**
✅ Web版とiOS版が同じコードベース
✅ ブラウザとシミュレーターで動作確認可能
✅ App Storeリリースへの準備完了

お疲れ様でした！🎉
