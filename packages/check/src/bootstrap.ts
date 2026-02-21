import { execSync, spawnSync } from 'node:child_process';
import type { ToolDefinition } from './types.js';

/**
 * 指定ツールがシステムにインストール済みかを確認する。
 * 未インストールの場合は `pnpm add -D` で自動インストールを行う（Bootstrapロジック）。
 */
export function bootstrap(tool: ToolDefinition): void {
  if (isInstalled(tool.command)) {
    return;
  }

  console.log(
    `[imachange-check] "${tool.command}" が見つかりません。インストールを開始します: ${tool.installPackage}`,
  );

  const result = spawnSync(
    'pnpm',
    ['add', '-D', tool.installPackage],
    { stdio: 'inherit', encoding: 'utf-8' },
  );

  if (result.status !== 0) {
    throw new Error(
      `[imachange-check] "${tool.installPackage}" のインストールに失敗しました (終了コード: ${result.status ?? 'unknown'})`,
    );
  }
}

/**
 * コマンドが実行可能かどうかを確認する。
 */
export function isInstalled(command: string): boolean {
  try {
    execSync(`${command} --version`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
