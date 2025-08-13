#!/bin/bash

set -e

if [ -z "$GITHUB_TOKEN" ] || [ -z "$GH_REPO_NAME" ] || [ -z "$BRANCH_NAME" ]; then
  echo "Error: Required environment variables are not set."
  exit 1
fi

git fetch origin main:main

# --- 動的コンテンツ生成 ---

COMMIT_LOG=$(git log origin/main..."$BRANCH_NAME" --pretty=format:'%B' | grep -viE '^(WIP|Draft|Revert):' || echo "")
CLOSING_ISSUES=$(echo "$COMMIT_LOG" | grep -iE '(close|closes|closed|fix|fixes|fixed|resolve|resolves|resolved) #[0-9]+' | grep -o '#[0-9]\+' | sort -u || echo "")
ALL_ISSUES=$(echo "$COMMIT_LOG" | grep -o '#[0-9]\+' | sort -u || echo "")
if [[ -n "$CLOSING_ISSUES" ]]; then
  RELATED_ISSUES=$(comm -23 <(echo "$ALL_ISSUES" | sort) <(echo "$CLOSING_ISSUES" | sort) || echo "")
else
  RELATED_ISSUES="$ALL_ISSUES"
fi

CHANGES=$(git log origin/main..."$BRANCH_NAME" --pretty=format:'- %s' | grep -viE '^(WIP|Draft|Revert):' || echo "- 変更内容がありません")

# 関連Issueセクション
DYNAMIC_ISSUE_SECTION_CONTENT="## 関連Issue"$'\n'
if [[ -n "$CLOSING_ISSUES$RELATED_ISSUES" ]]; then
  if [[ -n "$CLOSING_ISSUES" ]]; then
    while read -r issue; do
      [[ -n "$issue" ]] && DYNAMIC_ISSUE_SECTION_CONTENT+="- $issue"$'\n'
    done <<< "$CLOSING_ISSUES"
  fi
  if [[ -n "$RELATED_ISSUES" ]]; then
    while read -r issue; do
      [[ -n "$issue" ]] && DYNAMIC_ISSUE_SECTION_CONTENT+="- $issue"$'\n'
    done <<< "$RELATED_ISSUES"
  fi
else
  DYNAMIC_ISSUE_SECTION_CONTENT+="- 関連するIssueはありません"$'\n'
fi

# 変更内容セクション
DYNAMIC_CHANGES_SECTION_CONTENT="## 変更内容"$'\n'"$CHANGES"

PR_TITLE_GENERATED=$(git log origin/main..."$BRANCH_NAME" --reverse --pretty=format:%s | grep -viE '^(WIP|Draft|Revert):' | head -n 1 || echo "")
if [[ -z "$PR_TITLE_GENERATED" ]]; then
  PR_TITLE_GENERATED="feat: $BRANCH_NAME の変更をマージ"
fi

PR_INFO=$(gh pr list --head "$BRANCH_NAME" --state open --json number,title,body -q '.[0]' || echo "")
PR_BODY_FINAL_FILE="$RUNNER_TEMP/pr_body.txt"

if [[ -n "$PR_INFO" ]]; then
  PR_NUMBER=$(echo "$PR_INFO" | jq -r '.number')
  PR_TITLE_EXISTING=$(echo "$PR_INFO" | jq -r '.title')
  PR_BODY_EXISTING=$(echo "$PR_INFO" | jq -r '.body')
  echo "$PR_BODY_EXISTING" > "$PR_BODY_FINAL_FILE"

  # --- 関連Issueと変更内容 セクションを見出しごと完全削除 ---
  sed -i '/^## 関連Issue\(\r\)\?$/,/^## /{ /^## /!d; /^## 関連Issue\(\r\)\?$/d; }' "$PR_BODY_FINAL_FILE"
  sed -i '/^## 変更内容\(\r\)\?$/,/^## /{ /^## /!d; /^## 変更内容\(\r\)\?$/d; }' "$PR_BODY_FINAL_FILE"

  # --- ファイル末尾に新しい内容を必ず追記 ---
  echo -e "\n$DYNAMIC_ISSUE_SECTION_CONTENT" >> "$PR_BODY_FINAL_FILE"
  echo -e "\n$DYNAMIC_CHANGES_SECTION_CONTENT" >> "$PR_BODY_FINAL_FILE"

  if [[ "$PR_TITLE_EXISTING" == "$PR_TITLE_GENERATED" ]]; then
    gh pr edit "$PR_NUMBER" --title "$PR_TITLE_GENERATED" --body-file "$PR_BODY_FINAL_FILE"
  else
    gh pr edit "$PR_NUMBER" --body-file "$PR_BODY_FINAL_FILE"
  fi
else
  echo "PRが存在しないため、新規作成します。"
  PR_TEMPLATE_PATH=".github/PULL_REQUEST_TEMPLATE/pull_request_template.md"
  if [ ! -f "$PR_TEMPLATE_PATH" ]; then
    echo "Error: PR template file not found at $PR_TEMPLATE_PATH"
    exit 1
  fi
  cp "$PR_TEMPLATE_PATH" "$PR_BODY_FINAL_FILE"
  sed -i '/^## 関連Issue\(\r\)\?$/,/^## /{ /^## /!d; /^## 関連Issue\(\r\)\?$/d; }' "$PR_BODY_FINAL_FILE"
  sed -i '/^## 変更内容\(\r\)\?$/,/^## /{ /^## /!d; /^## 変更内容\(\r\)\?$/d; }' "$PR_BODY_FINAL_FILE"
  echo -e "\n$DYNAMIC_ISSUE_SECTION_CONTENT" >> "$PR_BODY_FINAL_FILE"
  echo -e "\n$DYNAMIC_CHANGES_SECTION_CONTENT" >> "$PR_BODY_FINAL_FILE"
  gh pr create --head "$BRANCH_NAME" --base main --title "$PR_TITLE_GENERATED" --body-file "$PR_BODY_FINAL_FILE" --draft
fi