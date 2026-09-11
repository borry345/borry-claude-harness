#!/bin/sh
# 체크포인트 커밋 전용 스크립트.
# team-lead가 통합·검증 직후 안전망(롤백 지점)으로 자동 실행한다 — 사용자 상의 불필요.
# "의미있는" 커밋/태그(기능 완성, 정책 변경 등)는 이 스크립트를 쓰지 않고, PM이
# 사용자와 상의한 뒤 직접 `git commit`을 실행한다 (그건 permissions에서 별도로 승인 필요하게 걸려있음).
#
# 사용법: scripts/checkpoint-commit.sh "설명 메시지"

set -e

if [ -z "$1" ]; then
  echo "사용법: checkpoint-commit.sh \"설명 메시지\"" >&2
  exit 1
fi

git add -A
git commit -m "checkpoint: $1" --no-verify
