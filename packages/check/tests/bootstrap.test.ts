import { execSync } from 'node:child_process';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { bootstrap, isInstalled } from '../src/bootstrap.js';
import type { ToolDefinition } from '../src/types.js';

vi.mock('node:child_process', () => ({
  execSync: vi.fn(),
  spawnSync: vi.fn(),
}));

const mockExecSync = vi.mocked(execSync);

const dummyTool: ToolDefinition = {
  installPackage: 'dummy-tool',
  command: 'dummy',
  lintArgs: ['check'],
  fixArgs: ['check', '--fix'],
};

describe('isInstalled', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('コマンドが実行可能な場合はtrueを返す', () => {
    mockExecSync.mockReturnValueOnce(Buffer.from('1.0.0'));
    expect(isInstalled('dummy')).toBe(true);
    expect(mockExecSync).toHaveBeenCalledWith('dummy --version', { stdio: 'ignore' });
  });

  it('コマンドが見つからない場合はfalseを返す', () => {
    mockExecSync.mockImplementationOnce(() => {
      throw new Error('command not found');
    });
    expect(isInstalled('notexist')).toBe(false);
  });
});

describe('bootstrap', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('ツールがインストール済みの場合はpnpm addを呼ばない', async () => {
    const { spawnSync } = await import('node:child_process');
    const mockSpawnSync = vi.mocked(spawnSync);

    // isInstalled が true を返すようにする
    mockExecSync.mockReturnValueOnce(Buffer.from('1.0.0'));

    bootstrap(dummyTool);

    expect(mockSpawnSync).not.toHaveBeenCalled();
  });

  it('ツールが未インストールの場合はpnpm addを実行する', async () => {
    const { spawnSync } = await import('node:child_process');
    const mockSpawnSync = vi.mocked(spawnSync);

    // isInstalled が false を返すようにする
    mockExecSync.mockImplementationOnce(() => {
      throw new Error('command not found');
    });

    mockSpawnSync.mockReturnValueOnce({
      status: 0,
      stdout: '',
      stderr: '',
      pid: 1,
      output: [],
      signal: null,
    });

    bootstrap(dummyTool);

    expect(mockSpawnSync).toHaveBeenCalledWith(
      'pnpm',
      ['add', '-D', dummyTool.installPackage],
      { stdio: 'inherit', encoding: 'utf-8' },
    );
  });

  it('pnpm addが失敗した場合はエラーをスローする', async () => {
    const { spawnSync } = await import('node:child_process');
    const mockSpawnSync = vi.mocked(spawnSync);

    // isInstalled が false を返すようにする
    mockExecSync.mockImplementationOnce(() => {
      throw new Error('command not found');
    });

    mockSpawnSync.mockReturnValueOnce({
      status: 1,
      stdout: '',
      stderr: 'error',
      pid: 1,
      output: [],
      signal: null,
    });

    expect(() => bootstrap(dummyTool)).toThrow(
      `"${dummyTool.installPackage}" のインストールに失敗しました`,
    );
  });
});
