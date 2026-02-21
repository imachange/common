/**
 * 対応言語のキー
 */
export type LanguageKey =
  | 'javascript'
  | 'typescript'
  | 'python'
  | 'css'
  | 'markdown';

/**
 * サポートするツール名
 */
export type ToolName = 'biome' | 'ruff' | 'stylelint' | 'markdownlint-cli2';

/**
 * ツールの実行モード
 */
export type RunMode = 'lint' | 'fix';

/**
 * ツール定義
 */
export interface ToolDefinition {
  /** インストールに使用するnpmパッケージ名 */
  installPackage: string;
  /** 実行するCLIコマンド */
  command: string;
  /** lintモード時のデフォルト引数 */
  lintArgs: readonly string[];
  /** fixモード時のデフォルト引数 */
  fixArgs: readonly string[];
  /** このパッケージのconfigディレクトリからの設定ファイル名（省略可） */
  configFile?: string;
}

/**
 * check実行オプション
 */
export interface CheckOptions {
  /** 対象言語 */
  language: LanguageKey;
  /** 検査対象のパスまたはglobパターン */
  targets: string[];
  /** 自動修正モードを有効化するか */
  fix?: boolean;
}

/**
 * ツール実行結果
 */
export interface RunResult {
  /** 終了コード */
  exitCode: number;
  /** 標準出力 */
  stdout: string;
  /** 標準エラー出力 */
  stderr: string;
}
