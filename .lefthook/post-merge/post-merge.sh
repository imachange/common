#!/bin/sh

# 前回のコミットと現在のコミットの間で変更されたファイルを取得
# git diff --name-only HEAD@{1} HEAD はHEAD@{1}が常に存在するとは限らないため、
# git diff --name-only HEAD^ HEAD を使用するか、git show HEAD --name-only を利用する方が安全
CHANGED_FILES=$(git diff --name-only HEAD^ HEAD || true)

# 1. pnpm-lock.yaml が変更されたかチェック
if echo "$CHANGED_FILES" | grep -q 'pnpm-lock.yaml'; then
  echo "pnpm-lock.yaml が変更されました。依存関係をインストールします..."
  pnpm install
fi

# 2. lefthook.yml が変更されたかチェック
if echo "$CHANGED_FILES" | grep -q 'lefthook.yml'; then
  echo "lefthook.yml が変更されました。lefthook install を実行します..."
  # lefthookのフックを再インストールする
  pnpm lefthook install
fi

# 古いリモートトラッキングブランチを削除
git fetch --prune

# マージ済みのローカルブランチをリストアップ
# grep -v で特定のブランチ（main, master, developなど）を確実に除外
MERGED_BRANCHES=$(git branch --merged | grep -v '^\*' | grep -v ' main$' | grep -v ' master$' | grep -v ' develop$')

# 削除対象のブランチが存在する場合のみメッセージとコマンドを実行
if [ -n "$MERGED_BRANCHES" ]; then
  echo "以下のマージ済みローカルブランチを削除します:"
  echo "$MERGED_BRANCHES"

  # xargsではなく、while read を使用して安全にブランチを削除
  echo "$MERGED_BRANCHES" | while read -r branch; do
    # -d オプションで削除
    # ワークツリーで使われている場合はエラーになるが、それは許容する
    echo "Deleting branch: $branch"
    git branch -d "$branch"
  done
fi

