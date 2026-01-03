# Capacitor版 開発戦略ガイド

## プロジェクト構成の選択肢

Capacitor版を「裏で進める」場合、2つの戦略があります。

---

## 戦略1: モノレポ構成（推奨）⭐

### 概要
**1つのプロジェクトでWeb版とアプリ版を管理**

```
optionlist/                    ← 1つのリポジトリ
├── src/                       ← 共通のソースコード
│   ├── components/
│   ├── pages/
│   └── hooks/
├── public/
├── ios/                       ← Capacitorで自動生成
│   └── App/
├── android/                   ← 将来的に追加可能
│   └── app/
├── package.json
├── vite.config.ts
├── capacitor.config.ts        ← Capacitor設定
└── README.md
```

### メリット
✅ **コードの完全共有**
   - Web版もアプリ版も同じコード
   - 一度の修正で両方に反映
   
✅ **メンテナンスが楽**
   - 1つのリポジトリで管理
   - バグ修正が簡単
   
✅ **開発効率が高い**
   - Web版で開発・テスト
   - アプリ版にすぐ反映

✅ **Gitの履歴が統一**
   - 変更履歴が一元管理
   - ブランチ管理が簡単

### デメリット
❌ **プロジェクトサイズが大きくなる**
   - ただし、OptionListは小規模なので問題なし

❌ **ios/フォルダがGit管理される**
   - `.gitignore`で一部除外すればOK

---

## 戦略2: 別リポジトリ構成

### 概要
**Web版とアプリ版を完全に分離**

```
optionlist-web/                ← Web版リポジトリ
├── src/
├── public/
└── package.json

optionlist-app/                ← アプリ版リポジトリ
├── src/                       ← Web版からコピー
├── public/
├── ios/
├── android/
└── capacitor.config.ts
```

### メリット
✅ **完全に独立**
   - Web版とアプリ版が干渉しない
   
✅ **デプロイ設定が別**
   - Vercel（Web）とXcode（App）を分離

### デメリット
❌ **コードの二重管理**
   - 修正のたびに2つのリポジトリを更新
   - バグ修正が2倍の工数
   
❌ **同期が大変**
   - Web版の変更をアプリ版に反映し忘れる
   - バージョン管理が複雑

---

## 推奨：モノレポ構成

**OptionListの場合、圧倒的にモノレポ構成が有利です。**

### 理由
1. **Capacitorの設計思想**に合致
   - Capacitorは「Webアプリをラップする」ツール
   - 同じコードベースを前提としている

2. **コード共有が簡単**
   - Webで開発 → ビルド → iOSで確認
   - この流れが非常にスムーズ

3. **小規模プロジェクト**
   - OptionListは大規模アプリではない
   - モノレポのデメリットがほぼない

---

## モノレポ構成の実装手順

### ステップ1: 現在のプロジェクトにCapacitorを追加

**プロジェクトをコピーする必要はありません。**
既存のプロジェクトにCapacitorを追加するだけです。

```bash
# 現在のプロジェクトディレクトリで実行
cd optionlist

# Capacitorをインストール
npm install @capacitor/core @capacitor/cli

# Capacitor初期化
npx cap init "OptionList" "com.yourname.optionlist" --web-dir=dist

# iOSプラットフォームを追加
npm install @capacitor/ios
npx cap add ios
```

これで、既存プロジェクトに`ios/`フォルダが追加されます。

---

### ステップ2: .gitignoreの更新

`ios/`フォルダの一部はGit管理から除外します。

```gitignore
# .gitignore に追加

# Capacitor
ios/App/Pods/
ios/App/App.xcworkspace/xcuserdata/
ios/App/*.xcodeproj/xcuserdata/
ios/App/*.xcodeproj/project.xcworkspace/xcuserdata/
android/app/build/
android/build/
android/.gradle/
```

**ポイント:**
- `ios/App/App.xcodeproj/` は Git管理する
- ビルド成果物やユーザー設定は除外

---

### ステップ3: package.jsonにスクリプト追加

開発を楽にするためのコマンドを追加：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    
    // Capacitor用のコマンドを追加
    "cap:sync": "npm run build && npx cap sync",
    "cap:ios": "npm run cap:sync && npx cap open ios",
    "cap:android": "npm run cap:sync && npx cap open android"
  }
}
```

**使い方:**
- `npm run cap:ios` - ビルド → iOSプロジェクトをXcodeで開く
- `npm run cap:sync` - ビルド → iOSプロジェクトに同期

---

### ステップ4: ブランチ戦略

Git のブランチで Web版とアプリ版を管理：

```
main (本番)
  ├── develop (開発中)
  │   ├── feature/new-feature (新機能)
  │   └── feature/ios-support (iOS対応)
  └── release/v1.0.0 (リリース準備)
```

**推奨の進め方:**
1. `main` - Web版の安定版
2. `develop` - 開発中
3. `feature/ios-support` - iOS対応用ブランチ

iOS対応が完了したら `develop` にマージ。

---

### ステップ5: 開発フロー

#### Web版の開発
```bash
# 通常の開発
npm run dev

# ブラウザで確認
# http://localhost:5173
```

#### iOS版の確認
```bash
# ビルド & iOSプロジェクトに反映 & Xcodeを開く
npm run cap:ios

# Xcodeで実行
# シミュレーターまたは実機で確認
```

**ポイント:**
- 普段はブラウザで開発（高速）
- iOS固有の調整が必要な時だけXcodeを使う

---

## ディレクトリ構成の全体像

```
optionlist/
├── .docs/                          ← プロジェクト資料
│   ├── PWA化手順書.md
│   ├── AppStoreリリース手順.md
│   └── OptionList_Specification_Final.md
│
├── src/                            ← 共通ソースコード
│   ├── components/
│   │   └── TabNavigation.tsx
│   ├── pages/
│   │   ├── PendingListPage.tsx
│   │   ├── SuggestionsPage.tsx
│   │   └── CompletedListPage.tsx
│   ├── hooks/
│   │   ├── useOptions.ts
│   │   └── useNotes.ts
│   ├── App.tsx
│   └── main.tsx
│
├── public/                         ← 静的ファイル
│   ├── pwa-192x192.png
│   ├── pwa-512x512.png
│   └── suggestions.json
│
├── ios/                            ← Capacitorで自動生成
│   └── App/
│       ├── App/
│       │   ├── AppDelegate.swift
│       │   └── Assets.xcassets/
│       └── App.xcodeproj/
│
├── dist/                           ← ビルド成果物（自動生成）
│
├── package.json
├── vite.config.ts
├── capacitor.config.ts             ← Capacitor設定
├── tsconfig.json
└── .gitignore
```

---

## Web版とアプリ版の違いへの対応

### プラットフォーム判定

一部の機能でWeb版とアプリ版で挙動を変えたい場合：

```typescript
import { Capacitor } from '@capacitor/core';

function MyComponent() {
  const isNative = Capacitor.isNativePlatform();
  const platform = Capacitor.getPlatform(); // 'ios', 'android', 'web'
  
  return (
    <div>
      {isNative ? (
        <button>ネイティブカメラを起動</button>
      ) : (
        <input type="file" accept="image/*" />
      )}
    </div>
  );
}
```

### 環境変数での切り替え

```typescript
// vite.config.ts
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify('1.0.0'),
    __IS_NATIVE__: process.env.CAPACITOR === 'true'
  }
});
```

---

## デプロイ戦略

### Web版（Vercel）
```bash
# mainブランチにプッシュ → Vercel自動デプロイ
git push origin main
```

### iOS版（Xcode）
```bash
# ビルド
npm run build

# iOSプロジェクトに同期
npx cap sync ios

# Xcodeで開いてArchive
npx cap open ios
```

---

## チェックリスト：モノレポ構成の準備

開始前に確認：

- [ ] 既存プロジェクトのバックアップを取る
- [ ] Gitでコミット済み（変更を保存）
- [ ] `package.json` がある
- [ ] `vite.config.ts` がある
- [ ] Node.jsがインストール済み
- [ ] Macを使用している（iOS開発必須）

---

## よくある質問

### Q1: プロジェクトが重くなりませんか？

**A:** OptionList程度の規模なら問題ありません。
- `ios/`フォルダは数MB程度
- ビルド時間もほとんど変わらない

### Q2: Web版だけデプロイできますか？

**A:** できます。
- Vercelは`dist/`フォルダだけデプロイ
- `ios/`フォルダは無視される

### Q3: 既存のプロジェクトを壊さずに試せますか？

**A:** できます。
- まず新しいブランチを作成
- そこでCapacitorを追加
- 問題があれば元のブランチに戻せる

```bash
# 安全に試す方法
git checkout -b feature/ios-support
npm install @capacitor/core @capacitor/cli
# ... Capacitor設定
# 問題があれば
git checkout main
```

---

## まとめ

**モノレポ構成が最適な理由:**

1. ✅ **コードの完全共有** - 一度の修正で両方に反映
2. ✅ **Capacitorの設計思想** - そもそもこれが想定された使い方
3. ✅ **開発効率** - Webで開発、アプリで確認
4. ✅ **メンテナンス性** - 1つのリポジトリで管理

**次のステップ:**
1. 現在のプロジェクトのバックアップ
2. 新しいブランチ作成（`feature/ios-support`）
3. Capacitorインストール
4. iOS対応を進める

プロジェクトをコピーする必要はありません。
既存のプロジェクトにCapacitorを追加するだけでOKです！
