# @imachange/common

個人アカウント全体の開発基盤を支える TypeScript モノレポです。
プロジェクトの標準化、自動化、および再利用可能なボイラープレートを管理します。

## 🚀 クイックスタート

このリポジトリは **GitHub Codespaces** での開発を前提としています。

1. GitHub 上で `Code` -> `Codespaces` -> `Create codespace on main` をクリック。
2. 環境が立ち上がると、自動的に `pnpm install` と `Lefthook` のセットアップが完了します。
3. すぐに開発を開始できます。

## 📦 パッケージ構成

- `packages/check`: 多言語対応の Lint/Format 統合ラッパーツール（今後追加予定）。
- `packages/common`: 各プロジェクトで共通利用する TypeScript ユーティリティ（今後追加予定）。
- `packages/templates`: 新規リポジトリ用のボイラープレート群（今後追加予定）。

## 🛠️ テクノロジースタック

- **Runtime**: Node.js 20 (LTS)
- **Package Manager**: pnpm (Workspaces)
- **Module System**: Native ESM
- **Git Hooks**: Lefthook
- **Versioning**: Changesets
- **Security**: Gitleaks

## 📜 開発規約

### コミットメッセージ
以下の日本語フォーマットを厳格に守ってください。
`型(範囲): 絵文字 メッセージ (#チケット番号)`

**型（漢字2文字）:**
- `機能`: 新機能 / `修正`: バグ修正 / `文書`: ドキュメント / `整理`: リファクタ / `試験`: テスト / `環境`: 基盤・CI / `取消`: Revert

**例:** `機能(check): ✨ Python用の検査ルールを追加 (#42)`

### 開発の進め方
1. `種別: 基盤` などのラベルが付いた Issue を確認する。
2. 修正後は `pnpm changeset` を実行して、変更記録を作成する。
3. GitHub Copilot への指示は、常に日本語で行ってください（`.github/copilot-instructions.md` に詳細な指示が定義されています）。
