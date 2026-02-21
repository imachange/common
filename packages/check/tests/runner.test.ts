import { execSync, spawnSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getConfigPath, getToolDefinition, runCheck } from '../src/runner.js';
import type { LanguageKey } from '../src/types.js';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(() => Buffer.from('1.0.0')),
  spawnSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);
const mockSpawnSync = vi.mocked(spawnSync);

describe('getToolDefinition', () => {
  it.each<LanguageKey>(['javascript', 'typescript', 'python', 'css', 'markdown'])(
    '%s のツール定義が存在する',
    (lang) => {
      const def = getToolDefinition(lang);
      expect(def).toBeDefined();
      expect(def.command).toBeTruthy();
      expect(def.installPackage).toBeTruthy();
      expect(def.lintArgs.length).toBeGreaterThan(0);
      expect(def.fixArgs.length).toBeGreaterThan(0);
    },
  );

  it('javascript と typescript は同じツール(biome)を使用する', () => {
    const jsDef = getToolDefinition('javascript');
    const tsDef = getToolDefinition('typescript');
    expect(jsDef.command).toBe(tsDef.command);
    expect(jsDef.installPackage).toBe(tsDef.installPackage);
  });
});

describe('getConfigPath', () => {
  it('biome.json の設定ファイルパスが存在する', () => {
    const path = getConfigPath('biome.json');
    expect(existsSync(path)).toBe(true);
  });

  it('ruff.json の設定ファイルパスが存在する', () => {
    const path = getConfigPath('ruff.json');
    expect(existsSync(path)).toBe(true);
  });

  it('stylelint.json の設定ファイルパスが存在する', () => {
    const path = getConfigPath('stylelint.json');
    expect(existsSync(path)).toBe(true);
  });

  it('markdownlint.json の設定ファイルパスが存在する', () => {
    const path = getConfigPath('markdownlint.json');
    expect(existsSync(path)).toBe(true);
  });
});

describe('runCheck', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // bootstrap内のisInstalled(execSync)がツールを検出済みとして振る舞うようにする
    mockExecSync.mockReturnValue(Buffer.from('1.0.0'));

    mockSpawnSync.mockReturnValue({
      status: 0,
      stdout: '',
      stderr: '',
      pid: 1,
      output: [],
      signal: null,
    });
  });

  it('lintモードでspawnSyncが正しい引数で呼ばれる (typescript)', () => {
    runCheck({ language: 'typescript', targets: ['src/'], fix: false });

    expect(mockSpawnSync).toHaveBeenCalledWith(
      'biome',
      expect.arrayContaining(['check', '--config-path']),
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });

  it('fixモードでspawnSyncが正しい引数で呼ばれる (typescript)', () => {
    runCheck({ language: 'typescript', targets: ['src/'], fix: true });

    expect(mockSpawnSync).toHaveBeenCalledWith(
      'biome',
      expect.arrayContaining(['check', '--write', '--config-path']),
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });

  it('fix オプション省略時はlintモードで動作する', () => {
    runCheck({ language: 'python', targets: ['src/'] });

    expect(mockSpawnSync).toHaveBeenCalledWith(
      'ruff',
      expect.arrayContaining(['check', '--config']),
      expect.objectContaining({ stdio: 'inherit' }),
    );
  });

  it('実行結果のexitCodeを正しく返す', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: 'lint errors',
      stderr: '',
      pid: 1,
      output: [],
      signal: null,
    });

    const result = runCheck({ language: 'typescript', targets: ['src/'] });
    expect(result.exitCode).toBe(1);
  });

  it('status が null の場合は exitCode を 1 として返す', () => {
    mockSpawnSync.mockReturnValueOnce({
      status: null,
      stdout: '',
      stderr: '',
      pid: 1,
      output: [],
      signal: null,
    });

    const result = runCheck({ language: 'css', targets: ['src/'] });
    expect(result.exitCode).toBe(1);
  });
});
