#!/usr/bin/env node
import { runCheck } from './runner.js';
import type { CheckOptions, LanguageKey } from './types.js';

const SUPPORTED_LANGUAGES: ReadonlySet<LanguageKey> = new Set<LanguageKey>([
  'javascript',
  'typescript',
  'python',
  'css',
  'markdown',
]);

/**
 * CLIエントリポイント
 *
 * 使い方:
 *   imachange-check --lang <language> [--fix] <targets...>
 *
 * 例:
 *   imachange-check --lang typescript src/
 *   imachange-check --lang python --fix src/
 */
function main(): void {
  const args = process.argv.slice(2);

  const langIndex = args.indexOf('--lang');
  if (langIndex === -1 || langIndex + 1 >= args.length) {
    console.error(
      '[imachange-check] エラー: --lang <language> オプションが必要です。',
    );
    console.error(
      `対応言語: ${[...SUPPORTED_LANGUAGES].join(', ')}`,
    );
    process.exit(1);
  }

  const language = args[langIndex + 1] as string;
  if (!SUPPORTED_LANGUAGES.has(language as LanguageKey)) {
    console.error(
      `[imachange-check] エラー: 未対応の言語です: "${language}"`,
    );
    console.error(
      `対応言語: ${[...SUPPORTED_LANGUAGES].join(', ')}`,
    );
    process.exit(1);
  }

  const fix = args.includes('--fix');

  const targets = args.filter(
    (arg, i) =>
      arg !== '--lang' &&
      arg !== '--fix' &&
      args[i - 1] !== '--lang',
  );

  if (targets.length === 0) {
    console.error(
      '[imachange-check] エラー: 検査対象のパスを1つ以上指定してください。',
    );
    process.exit(1);
  }

  const options: CheckOptions = {
    language: language as LanguageKey,
    targets,
    fix,
  };

  const result = runCheck(options);
  process.exit(result.exitCode);
}

export { runCheck } from './runner.js';
export { bootstrap, isInstalled } from './bootstrap.js';
export type { CheckOptions, LanguageKey, RunResult, ToolDefinition } from './types.js';

main();
