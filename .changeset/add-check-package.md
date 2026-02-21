---
"@imachange/check": minor
---

`packages/check` パッケージを新規追加。

多言語対応のLint/Format統合ラッパーツール。

- `src/types.ts`: 型定義（LanguageKey、ToolDefinition、CheckOptions、RunResult）
- `src/bootstrap.ts`: ツール未インストール時の `pnpm add -D` による遅延インストールロジック
- `src/runner.ts`: `node:child_process` を用いた CLI ツール呼び出しコアロジック
- `src/index.ts`: CLI エントリポイント（`imachange-check --lang <language> [--fix] <targets...>`）
- `config/biome.json`: JS/TS 用 Biome 設定
- `config/ruff.json`: Python 用 Ruff 設定
- `config/stylelint.json`: CSS 用 Stylelint 設定
- `config/markdownlint.json`: Markdown 用 markdownlint 設定
