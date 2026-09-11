# 세션 인수인계 (Handoff)

`pjt2/ppjt2`를 프로젝트 루트로 새 세션을 열었다면 **이 문서를 제일 먼저 읽는다.** 여기 없는 배경
지식(팀 구조, 정책, 코딩 규칙)은 아래 문서에 이미 다 있으니 중복하지 않는다 — 순서대로 읽으면 됨:
`ORCHESTRATION.md` → `CODING_GUIDE.md` → `SPEC.md` → `RUN_LOG.md` → `CHANGELOG.md`.

이 문서는 **그 문서들에 없는, 세션이 바뀌면 끊기는 것들만** 담는다.

## 지금 당장 확인해야 할 미해결 과제

**네이티브 서브에이전트 인식 여부 검증** (2026-09-11에 시작, 이 재시작의 직접적인 이유)

이전 세션(`pjt2-master`를 루트로 시작)에서는 `.claude/agents/*.md`에 team-lead·tester 등을
정의해뒀어도 harness가 네이티브 서브에이전트로 인식하지 못했다 — `subagent_type: "tester"`로
직접 호출하면 `Agent type 'tester' not found. Available agents: claude, claude-code-guide,
Explore, general-purpose, Plan, statusline-setup` 에러가 실제로 떴다. 원인 추정: 세션이 시작된
프로젝트 루트가 `pjt2-master`였고, 에이전트 정의는 그 하위 `pjt2/ppjt2/.claude/agents/`에 있어서
스캔 범위 밖이었을 것.

**이번엔 `pjt2/ppjt2` 자체를 루트로 새로 켰으니, 순서대로 확인한다:**

1. 사용 가능한 에이전트 목록에 `agent-builder`, `doc-writer`, `spec-writer`, `team-lead`,
   `tester`가 뜨는지 확인 (직접 `subagent_type: "tester"`로 호출해보면 가장 확실).
2. **뜬다면**: `tools:` frontmatter가 실제로 기술 강제되는지 검증 — 예를 들어 `tester`에게
   아무 파일이나 Edit을 시도시켜서 거부되는지 확인. 확인되면:
   - 지금까지 `general-purpose` + "역할 정의 파일을 따르라" 프롬프트로 우회 호출하던 방식을
     전부 `subagent_type: "<이름>"` 직접 호출로 전환한다.
   - `ORCHESTRATION.md`의 "알려진 한계" 섹션(team-lead → tester 위임 우회 방식 관련 서술)을
     갱신한다 — 더 이상 우회가 필요 없어졌다는 사실과, tools 제한이 이제 진짜 기술 강제라는 점.
   - `team-lead.md`/`tester.md` 등 각 에이전트 정의 파일의 "Agent 도구로 general-purpose를
     불러 역할을 따르게 하라"는 취지의 문구가 있다면 정리한다.
3. **안 된다면**: 이전 세션에서 논의했던 차선책 — PreToolUse 훅 + `.claude/active-role` 상태
   파일로 "지금 어떤 역할이 실행 중인지"를 기록하고 Edit 등을 역할별로 막는 방식 — 을 검토한다.
   완벽한 기술 강제는 아니고(전역 상태라 병렬 실행 시 꼬일 수 있음), 알고 쓰는 차선책이라는 점을
   `ORCHESTRATION.md`에 명시할 것.

## 잊으면 안 되는 사용자 규칙 (세션이 바뀌면 자동으로 안 넘어옴)

- **git commit/tag/push는 항상 사용자와 상의한 뒤 결정한다.** PM(현재 세션)이 결과물을
  만들었다고 해서 임의로 커밋하지 않는다. 이미 `.claude/settings.json`의 `permissions.ask`로
  기술적으로도 강제돼 있지만(`ORCHESTRATION.md` 참고), 이 원칙 자체를 잊지 말 것 — 예전에 이걸
  임의로 해석해서 사용자를 놀라게 한 적이 있다("엥? git commit 했어요?").
- **예외**: `scripts/checkpoint-commit.sh`를 통한 체크포인트 커밋은 team-lead가 통합·검증
  직후 자동으로 실행해도 된다 (상의 불필요, 롤백 안전망 목적).
- **git 히스토리를 쓰는 주체는 PM(메인 세션)뿐이다.** team-lead 등 서브에이전트는 체크포인트
  스크립트 외의 git write 명령을 직접 실행하지 않는다.

## 참고: 이전 세션의 Claude 메모리는 자동으로 안 넘어옴

`pjt2-master`를 루트로 했던 이전 세션에서 저장해둔 메모리(예: git 커밋 상의 규칙)는 프로젝트
경로가 달라서 새 세션(`pjt2/ppjt2` 루트)에 자동으로 안 보일 수 있다. 이 문서와
`ORCHESTRATION.md`가 그 역할을 대신한다 — 필요하면 이 문서 내용을 새 세션에서 다시 메모리로
저장해도 된다.
