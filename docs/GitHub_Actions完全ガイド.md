# GitHub Actions × Capacitor 完全ガイド

## 現在の状態 ✅

- ✅ Windows上でCapacitorセットアップ完了
- ✅ iOSプロジェクト生成完了
- ✅ GitHub Actions ワークフロー作成済み
- ✅ GitHubにコミット準備完了

---

## Phase 2: GitHub Actionsでビルド自動化

### ステップ1: GitHubにプッシュ

```powershell
git push origin main
```

これでGitHub Actionsが自動的に実行されます：
- ✅ Node.jsセットアップ
- ✅ 依存関係インストール
- ✅ Webアプリビルド
- ✅ iOSプロジェクトに同期

**確認方法:**
1. GitHubリポジトリを開く
2. 「Actions」タブをクリック
3. 「iOS Build」ワークフローを確認

---

## Phase 3: Apple Developer登録（$99/年）

### 必要なもの
- Apple ID
- クレジットカード
- $99/年（年間サブスクリプション）

### 手順
1. https://developer.apple.com にアクセス
2. 「Account」→「Join the Apple Developer Program」
3. 必要事項を入力して支払い
4. 承認まで1〜3日待つ

**承認後:**
- App Store Connect にアクセス可能
- 証明書の作成が可能

---

## Phase 4: 証明書の設定（初回のみ・Mac必要）

### オプションA: 友人のMacを借りる（推奨・無料）

**必要時間:** 1〜2時間

**作業内容:**
1. Xcodeをインストール
2. Apple IDでサインイン
3. 証明書とProvisioning Profileを作成
4. GitHub Secretsに登録

### オプションB: MacinCloudをレンタル（$2〜3）

https://www.macincloud.com/

**プラン:** Pay As You Go
**料金:** $1/時間
**必要時間:** 2〜3時間 = 約$2〜3

**手順:**
1. アカウント作成
2. Macインスタンスをレンタル
3. リモートデスクトップで接続
4. Xcodeで証明書を作成

### 証明書作成の詳細手順

Macで以下を実行：

```bash
# リポジトリをクローン
git clone https://github.com/あなたのユーザー名/optionlist.git
cd optionlist

# Xcodeでプロジェクトを開く
npx cap open ios
```

**Xcodeで:**
1. プロジェクトを選択 → Signing & Capabilities
2. Team: Apple IDでサインイン
3. Automatically manage signing にチェック
4. 証明書が自動生成される

**証明書をエクスポート:**
1. Keychain Access を開く
2. 証明書をエクスポート → .p12 ファイル
3. Base64に変換：
```bash
base64 -i certificate.p12 -o certificate.txt
```

**Provisioning Profileをダウンロード:**
1. https://developer.apple.com
2. Certificates, Identifiers & Profiles
3. Provisioning Profile をダウンロード
4. Base64に変換：
```bash
base64 -i profile.mobileprovision -o profile.txt
```

---

## Phase 5: GitHub Secretsに登録（Windows可能）

GitHubリポジトリで：

1. Settings → Secrets and variables → Actions
2. 以下のSecretsを追加：

| Name | Value |
|------|-------|
| `IOS_CERTIFICATE_BASE64` | certificate.txt の内容 |
| `IOS_CERTIFICATE_PASSWORD` | .p12 のパスワード |
| `IOS_PROVISIONING_PROFILE_BASE64` | profile.txt の内容 |
| `APP_STORE_CONNECT_API_KEY` | （後で追加） |

---

## Phase 6: GitHub Actionsワークフローの更新

`.github/workflows/ios-build.yml` のコメントアウト部分を有効化：

証明書設定後、自動ビルドとTestFlight配布が可能になります。

---

## Phase 7: TestFlightでテスト配布

**App Store Connectで:**
1. 新しいアプリを登録
2. Bundle ID: `com.optionlist.app`
3. TestFlightタブ
4. ビルドがアップロードされるのを待つ
5. テスターを招待

**友人にテストしてもらう:**
- TestFlightアプリをインストール
- 招待リンクから参加
- アプリをダウンロード＆テスト

---

## Phase 8: App Storeリリース（準備が整ったら）

1. スクリーンショット撮影（iPhone各サイズ）
2. アプリアイコン（1024×1024）
3. 説明文・プライバシーポリシー作成
4. App Store審査に提出
5. 承認まで1〜3日

---

## 日常の開発フロー

### コード修正 → 自動ビルド

```powershell
# 機能追加・バグ修正
git add .
git commit -m "新機能: ○○を追加"
git push origin main
```

→ GitHub Actions が自動実行
→ TestFlight に自動配布（設定後）

### Web版の確認

```powershell
npm run dev
# http://localhost:5173
```

### ブランチ戦略

```
main（本番）
  └── develop（開発中）
      └── feature/xxx（新機能）
```

---

## トラブルシューティング

### Q1: GitHub Actionsでビルドが失敗する

**原因:** package-lock.json がない

**解決策:**
```powershell
git add package-lock.json
git commit -m "Add package-lock.json"
git push
```

### Q2: 証明書エラー

**原因:** GitHub Secretsが正しく設定されていない

**解決策:**
- Base64エンコードを確認
- 改行を削除
- パスワードを確認

### Q3: TestFlightにアップロードできない

**原因:** Bundle Identifier が一致していない

**解決策:**
- App Store Connect と capacitor.config.ts で一致させる
- 現在: `com.optionlist.app`

---

## コスト概算

| 項目 | 金額 |
|------|------|
| Apple Developer Program | $99/年 |
| GitHub Actions（無料枠） | $0/月 |
| MacinCloud（初回のみ） | $0〜3 |
| **合計（初年度）** | **約$99〜102** |
| **合計（2年目以降）** | **$99/年** |

---

## 次のアクションアイテム

### 今すぐできること（Windows）

- [x] Capacitorセットアップ ✅
- [x] GitHub Actionsワークフロー作成 ✅
- [ ] GitHubにプッシュ
- [ ] GitHub Actionsの動作確認

### 後で必要なこと

- [ ] Apple Developer登録（$99）
- [ ] 証明書作成（Mac必要・1回のみ）
- [ ] GitHub Secretsに登録
- [ ] TestFlightテスト
- [ ] App Storeリリース

---

## まとめ

**あなたの環境（Windows）で:**
✅ 開発は100%可能
✅ ビルド自動化も可能
✅ 証明書作成のみMacが必要（初回・年1回）

**Mac不要の選択肢:**
- GitHub Actions（クラウドのMac）
- 証明書作成：友人のMac or MacinCloud（数時間）

**年間コスト:**
- $99のみ（Apple Developer）

次のステップに進みますか？
