import { spawnSync } from 'node:child_process';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { bootstrap } from './bootstrap.js';
import type {
  CheckOptions,
  LanguageKey,
  RunMode,
  RunResult,
  ToolDefinition,
} from './types.js';

/** このパッケージのconfigディレクトリへのパス */
const CONFIG_DIR = fileURLToPath(new URL('../config', import.meta.url));

/**
 * 言語ごとのツール定義マップ
 */
const TOOL_MAP: Record<LanguageKey, ToolDefinition> = {
  javascript: {
    installPackage: '@biomejs/biome',
    command: 'biome',
    lintArgs: ['check', '--config-path'],
    fixArgs: ['check', '--write', '--config-path'],
    configFile: 'biome.json',
  },
  typescript: {
    installPackage: '@biomejs/biome',
    command: 'biome',
    lintArgs: ['check', '--config-path'],
    fixArgs: ['check', '--write', '--config-path'],
    configFile: 'biome.json',
  },
  python: {
    installPackage: 'ruff',
    command: 'ruff',
    lintArgs: ['check', '--config'],
    fixArgs: ['check', '--fix', '--config'],
    configFile: 'ruff.json',
  },
  css: {
    installPackage: 'stylelint',
    command: 'stylelint',
    lintArgs: ['--config'],
    fixArgs: ['--fix', '--config'],
    configFile: 'stylelint.json',
  },
  markdown: {
    installPackage: 'markdownlint-cli2',
    command: 'markdownlint-cli2',
    lintArgs: ['--config'],
    fixArgs: ['--fix', '--config'],
    configFile: 'markdownlint.json',
  },
};

/**
 * 指定言語に対応するツール定義を返す。
 */
export function getToolDefinition(language: LanguageKey): ToolDefinition {
  return TOOL_MAP[language];
}

/**
 * 設定ファイルの絶対パスを返す。
 */
export function getConfigPath(configFile: string): string {
  return join(CONFIG_DIR, configFile);
}

/**
 * 指定した言語のLint/Formatツールを実行する。
 *
 * @param options - 実行オプション
 * @returns ツールの実行結果
 */
export function runCheck(options: CheckOptions): RunResult {
  const { language, targets, fix = false } = options;
  const tool = getToolDefinition(language);

  bootstrap(tool);

  const mode: RunMode = fix ? 'fix' : 'lint';
  const modeArgs = fix ? [...tool.fixArgs] : [...tool.lintArgs];

  const args: string[] = [];

  if (tool.configFile !== undefined) {
    const configPath = getConfigPath(tool.configFile);
    args.push(...modeArgs, configPath);
  } else {
    args.push(...modeArgs);
  }

  args.push(...targets);

  const result = spawnSync(tool.command, args, {
    stdio: 'inherit',
    encoding: 'utf-8',
  });

  const exitCode = result.status ?? 1;

  return {
    exitCode,
    stdout: result.stdout ?? '',
    stderr: result.stderr ?? '',
  };
}
