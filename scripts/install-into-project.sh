#!/bin/sh
# 하네스를 대상 프로젝트 루트에 설치(복사)한다.
#
# 왜 필요한가: 하네스는 프로젝트 루트에 있어야 (1) CLAUDE.md가 자동 로드되고,
# (2) .claude/settings.json의 git 승인 게이트가 활성화되고, (3) 체크포인트 스크립트가 존재한다.
# 하네스 폴더를 옆에 두고 다른 폴더에서 작업하면 이 셋이 전부 꺼진다(PJT4에서 실제로 발생).
#
# 사용법:
#   sh <하네스 폴더>/scripts/install-into-project.sh <프로젝트 루트> [--force]
#
# - 이미 있는 파일은 덮어쓰지 않고 건너뛴다(--force를 주면 덮어씀).
# - 프로젝트 전용 파일(RUN_LOG.md, SPEC.md 등)과 하네스 자체 이력(RUN_LOG.md, CHANGELOG.md, .git)은 복사하지 않는다.
# - .claude/settings.json은 사용자가 이미 자기 설정을 갖고 있을 수 있으므로 --force 없이는 절대 덮어쓰지 않는다.

set -e

FORCE=0
TARGET=""
for arg in "$@"; do
  case "$arg" in
    --force) FORCE=1 ;;
    -*) echo "알 수 없는 옵션: $arg" >&2; exit 2 ;;
    *) TARGET="$arg" ;;
  esac
done

if [ -z "$TARGET" ]; then
  echo "사용법: install-into-project.sh <프로젝트 루트> [--force]" >&2
  exit 2
fi

HARNESS=$(cd "$(dirname "$0")/.." && pwd)

if [ ! -d "$TARGET" ]; then
  echo "대상 폴더가 없습니다: $TARGET" >&2
  exit 2
fi
TARGET=$(cd "$TARGET" && pwd)

# 하네스 폴더 자신이나 그 내부에 설치하는 실수를 막는다.
case "$TARGET/" in
  "$HARNESS"/*) echo "대상이 하네스 폴더 자신(또는 그 안)입니다: $TARGET" >&2; exit 2 ;;
esac

COPIED=0
SKIPPED=0

# copy_one <하네스 기준 상대경로> — 대상에 이미 있으면 --force 없이는 건너뛴다.
copy_one() {
  rel="$1"
  src="$HARNESS/$rel"
  dst="$TARGET/$rel"
  if [ ! -f "$src" ]; then
    echo "  (원본 없음, 건너뜀) $rel"
    return 0
  fi
  if [ -e "$dst" ] && [ "$FORCE" -ne 1 ]; then
    echo "  건너뜀(이미 있음): $rel"
    SKIPPED=$((SKIPPED + 1))
    return 0
  fi
  mkdir -p "$(dirname "$dst")"
  cp "$src" "$dst"
  echo "  복사: $rel"
  COPIED=$((COPIED + 1))
}

echo "하네스: $HARNESS"
echo "대상  : $TARGET"
[ "$FORCE" -eq 1 ] && echo "모드  : --force (기존 파일 덮어씀)"
echo

# 루트 문서 (CLAUDE.md는 반드시 프로젝트 최상위 루트여야 자동 로드된다)
for f in CLAUDE.md HANDOFF.md ORCHESTRATION.md CODING_GUIDE.md DESIGN_NOTES.md; do
  copy_one "$f"
done

# 에이전트 정의
for f in "$HARNESS"/.claude/agents/*.md; do
  [ -f "$f" ] && copy_one ".claude/agents/$(basename "$f")"
done

# 스킬 (절차. ORCHESTRATION과 달리 필요할 때만 로드되므로 반복 절차는 여기에 둔다)
if [ -d "$HARNESS/.claude/skills" ]; then
  for d in "$HARNESS"/.claude/skills/*/; do
    [ -d "$d" ] && [ -f "$d/SKILL.md" ] && copy_one ".claude/skills/$(basename "$d")/SKILL.md"
  done
fi

# 권한 설정(git 승인 게이트) — 사용자의 기존 설정이 있으면 --force 없이는 건드리지 않는다(위 규칙).
copy_one ".claude/settings.json"

# 체크포인트 스크립트
copy_one "scripts/checkpoint-commit.sh"
if [ -f "$TARGET/scripts/checkpoint-commit.sh" ]; then
  chmod +x "$TARGET/scripts/checkpoint-commit.sh" 2>/dev/null || true
fi

echo
echo "완료: 복사 $COPIED개, 건너뜀 $SKIPPED개"

# 사후 점검 안내
if [ ! -d "$TARGET/.git" ]; then
  echo
  echo "주의: 대상이 git 저장소가 아닙니다. scripts/checkpoint-commit.sh와 git 승인 게이트는 git 저장소에서만 의미가 있습니다 (git init 필요)."
fi
if [ -e "$TARGET/.claude/settings.json" ] && [ "$SKIPPED" -gt 0 ]; then
  if ! cmp -s "$HARNESS/.claude/settings.json" "$TARGET/.claude/settings.json"; then
    echo
    echo "주의: 대상의 .claude/settings.json이 하네스 것과 다릅니다. git commit/tag/push/reset, npm install 등의 승인 게이트(permissions.ask)가 그 파일에 있는지 직접 확인하고 필요하면 병합하세요."
  fi
fi
echo
echo "다음 단계(PM): 프로젝트 루트에 이 프로젝트 전용 RUN_LOG.md, SPEC.md(필요시 PRD.md/TECH_SPEC.md)를 만든다. 하네스 문서는 프로젝트 내용을 담지 않는다."
