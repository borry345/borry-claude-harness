# 하네스 재설계 노트 (차기 버전 구상)

**이 문서는 확정된 정책이 아니다.** 현재 하네스를 운영하며 발견한 패턴을 바탕으로 "처음부터
다시 설계한다면 어떻게 할 것인가"를 정리한 아이디어 모음이다. 여기 적힌 항목은 실제로 채택하려면
각각 별도로 실험·합의를 거쳐야 하며, `ORCHESTRATION.md`/`CODING_GUIDE.md`처럼 지금 이 하네스가
따르는 규칙이 아니다.

(2026-09-18, 사용자 질문 "지금 이 하네스로 새로운 하네스를 만든다면 어떻게 설계할 것인가"에 대한
답을 정리)

**상태 표기 규칙**: 각 항목은 `미착수` / `진행중` / `완료` / `보류` 중 하나로 표시한다. 이
문서는 `HANDOFF.md`처럼 **큐레이션된 스냅샷**이라 상태가 바뀌면 이 자리에서 직접 덮어쓴다.
항목이 실제로 `완료`가 되는 시점에만 `RUN_LOG.md`에 한 줄을 남긴다(구상 단계까지 RUN_LOG에
올리면, 실행된 것과 구상 중인 것이 같은 로그에 섞여 구분이 안 된다).

## 이어갈 것 — 이미 검증된 원칙

이 섹션은 상태 추적 대상이 아니다(이미 지금 하네스에 적용돼 있는 원칙).

1. **단일 통제축(PM)**: 팀 구성(어떤 에이전트가 존재하는지) 변경 권한을 PM 한 곳에만 둔다.
   다른 에이전트끼리 직접 통신해 새 에이전트를 만들거나 요청을 주고받게 하지 않는다 — 그 순간
   등록표가 여러 곳에서 따로 갱신되며 깨진다.
2. **파일 소유권 + 스크래치 디렉터리 격리**: `todo-cli` 시험 운행에서 실제로 발생한 `taskStore.js`
   동시 write 경합 사고가 근거. "프롬프트로 부탁"이 아니라 "최종 공유 경로에 애초에 아무도 동시에
   못 쓰게" 만드는 방향 자체는 유효하다.
3. **소프트 제약보다 기술적 강제를 우선한다**: `.claude/settings.json`의 `git commit/tag/push/reset`
   ask-gate는 프롬프트 규칙보다 훨씬 안정적으로 작동했다(우회된 적 없음). 반면 파일 소유권 규칙은
   여전히 프롬프트 기반 소프트 제약이라 "알려진 한계"에 남아있다 — 이 격차가 아래 3번 항목으로
   이어진다.
4. **PRD 단계는 "항상"이 아니라 "규모 기반 분기"로 결정한다** (2026-09-18, 사용자 문제제기 —
   "자연어를 바로 기능 명세서로 만들고 PRD를 안 거친다" — 계기로 검토 후 채택, `ORCHESTRATION.md`
   "PRD 분기 기준"에 실제 반영됨). 검토한 두 옵션:
   - **완전 분리(모든 프로젝트에 PRD→확인→스펙 2단계 고정)**: fail-early(방향 오류를 세부 요구사항
     쓰기 전에 거름), 문서 정체성 분리라는 이득이 있지만, **비용이 프로젝트 규모와 무관하게
     고정으로 붙는다** — 작은 요청에도 라운드트립·에이전트 호출이 강제됨. 이 하네스의 실제 사용
     이력(todo-cli 등 소규모 프로젝트 다수)을 보면 이 비용이 이득보다 큰 경우가 더 많았을 것으로
     판단.
   - **통합(spec-writer 산출물에 목표/비목표 섹션만 추가)**: 비용은 낮지만 fail-late(방향 오류가
     기능별 수용기준까지 다 쓰인 뒤에야 드러남) 위험이 남음.
   - **채택한 절충안 — 규모 기반 분기**: PM이 프로젝트 규모/모호성을 판단해, 크거나 불확실할 때만
     spec-writer를 PRD 모드로 먼저 호출(`PRD.md`) → 확인 → 스펙 모드(`SPEC.md`)로 이어감. 비용이
     "필요한 만큼만" 발생하므로 완전 분리 대비 기대값상 우위. 새 에이전트 대신 기존 spec-writer를
     2-모드로 확장해 "필요한 최소치로 시작" 원칙도 지킴.
   - **채택 후 드러난 위험과 대응**: (a) `PRD.md`/`SPEC.md`가 별도 LLM 호출이라 기능 ID가 어긋날
     위험 → spec-writer.md에 ID 불변 규칙 강제 + PM이 SPEC.md 완성 직후 직접 대조하는 책임 명문화.
     (b) `PRD.md`가 스코프 변경 후 방치돼 `SPEC.md`와 어긋날 위험(신선도) → `PRD.md`를 착수
     시점의 1회성 스냅샷으로 선언하고 이후 절대 재갱신하지 않음(`HANDOFF.md`/`RUN_LOG.md` 분리와
     같은 논리) — 동기화 부담 자체를 제거.
   - **이 판단이 다음 하네스에도 이어질 원칙인 이유**: "완전 분리 vs 통합"류의 문제가 또 나오면,
     "비용이 규모 무관 고정인가, 이득이 특정 상황에만 발생하는가"를 먼저 따져보고 비대칭이면
     분기형으로 가는 게 기대값상 유리하다는 일반 원칙으로 재사용 가능.

## 처음부터 다르게 할 것 (상태 추적 대상)

1. **[미착수] 문서를 만들기 전에 "append-only 기록인가, 큐레이션된 스냅샷인가"부터 정한다.**
   근거: `HANDOFF.md`(원래 세션 브리핑용 스냅샷)가 시간이 지나며 `RUN_LOG.md`(append-only
   결정 기록)와 같은 내용(결정 요약)을 중복해서 담게 된 사례(2026-09-18 정리). 문서를 처음 만들
   때 이 질문에 먼저 답하고 표에 박아두면, 뒤늦게 책임을 재분리하는 작업을 반복하지 않아도 된다.
   문서 이름이 여러 형태로 변형되던 과거 사고(`SPEC.md`→`SPEC_LOG_PJT.md`,
   `RUN_LOG.md`→`RUN_LOG_ARCHIVE.md`)도 같은 뿌리 — "이 문서의 정체성이 뭔지" 초기에 안 정했던
   결과.
2. **[미착수] `CLAUDE.md`를 나중에 붙이지 않고 처음부터 진입점으로 설계한다.** 이번엔 문서
   여러 개를 먼저 만들고 나중에 지도(`CLAUDE.md`)를 얹는 순서였다. 자동 로드되는 문서를 루트로
   두고 나머지 문서를 그 밑의 가지로 설계하면, 새 세션이 "뭘 읽어야 하는지 깜빡할 수 있다"는
   문제 자체가 처음부터 구조적으로 방지된다.
3. **[미착수] 파일 소유권을 스크래치 디렉터리보다 한 단계 더 강하게 — git worktree 검토.**
   지금은 "team-lead가 스크래치 디렉터리에서 최종 경로로 복사해 조립"하는 수작업 단계가 있다.
   구현 에이전트마다 실제 git worktree를 주면 조립 단계 자체가 줄고, 격리도 파일시스템 레벨로
   더 강해진다. (Claude Code 환경에 이미 `EnterWorktree`/`ExitWorktree` 도구가 있어 실험 가능.)
   트레이드오프(브랜치 관리 오버헤드, worktree 정리 책임)는 아직 검증 안 됨.
   (2026-10-06 부분 시험: PJT4 비교 실험에서 하네스 구현·단일 세션 구현을 서로 다른 worktree에서 돌려 **A/B 격리에는** 문제없이 동작했다. **구현자별 격리**에 쓰는 시험은 아직 안 했으므로 상태는 `미착수`로 유지.)
4. **[미착수] `RUN_LOG.md` 항목에 태그를 구조화한다.** 지금은 자유 텍스트라 "이게 디스패치
   로그인지 결정 기록인지 실패 기록인지"가 문장 내용으로만 구분된다. `[dispatch]`/`[decision]`/
   `[blocked]` 같은 태그를 항목 앞에 붙이면, 실패 사례만·결정 사항만 grep으로 걸러보기 쉬워진다.

## 우선순위

- 3번(git worktree)이 가장 실험이 필요한 항목 — 실제로 시도해보지 않으면 오버헤드 대비 이득을
  확신하기 어렵다.
- 1·2·4번은 비교적 바로 적용 가능한 구조적 결정이다.

## PJT5 중 발견된 백로그 (2026-10-15 추가 — PJT5 종료 후 반영 예정)

사용자 지시로 이번엔 **Edit 도구 추가만** 적용했고(완료: spec-writer·tech-spec-writer·doc-writer·
agent-builder에 Edit 부여 + "기존 파일 수정은 Edit, Write는 신규 생성만" 규칙 명문화), 아래는
다음으로 넘긴 항목이다.

### B1. PreToolUse 훅으로 파일 소유권을 기술적으로 강제

지금까지 `ORCHESTRATION.md`는 파일 소유권을 "소프트 제약"으로 포기해두었는데, 2026-10-15 조사에서
**Claude의 도구 경로에 한해 실제 강제 경로가 있다**는 것이 공식 문서로 확인됐다. 서브에이전트
프런트매터의 `hooks:` 필드에 `PreToolUse` 훅을 `matcher: "Edit|Write"`로 걸고, 훅 스크립트가
stdin으로 받은 JSON의 `tool_input.file_path`가 그 에이전트의 소유 파일인지 검사해 **exit code
2로 차단**한다. 훅은 **그 서브에이전트에만** 적용되므로, 에이전트별로 다른 소유 경로를 줄 수 있다.
공식 문서의 `db-reader` 예시가 같은 메커니즘으로 Bash SQL 쓰기를 막는다 — 단 그 예시는
`matcher: "Bash"` + `.tool_input.command`이고, **`Edit|Write` + `file_path` 조합은 공식 예시가
없는 유추**이므로 도입 전에 1회 실측한다(2026-10-16 한정 추가).

**이것은 "유일한 완전 강제"가 아니다**(2026-10-16 정정). 훅은 **Claude의 도구 호출만** 막는다.
하위 프로세스(Python·Node 스크립트)가 파일을 직접 여는 경로는 훅으로 막히지 않으며, 공식 문서가
그 용도로 지목하는 것은 **sandbox**다("For OS-level enforcement that blocks all processes from
accessing a path, enable the sandbox"). 따라서 선택지는 ① `permissions.deny`(도구 + Claude Code가
인식하는 Bash 파일 명령까지) ② 이 훅(에이전트별 경로 제한) ③ sandbox(OS 수준)의 **세 단계**이며,
B1은 그중 중간이다. sandbox는 이 하네스에서 아직 써 본 적이 없다.

- **이득**: 파일 소유권 원칙이 처음으로 프롬프트 의존에서 벗어난다. PJT4에서 실제로 났던 경합
  사고(`taskStore.js` 동시 write)와 같은 부류를 사전 차단할 수 있다.
- **함정 (도입 시 반드시 처리)**: 프로젝트 레벨 `.claude/agents/` 파일의 프런트매터 훅은 **그
  폴더의 workspace trust를 수락해야 실행된다.** 수락 전에는 에이전트는 정상 동작하고 **훅만 조용히
  건너뛰어진다**(디버그 로그에만 에러). 즉 "걸어뒀다고 믿었는데 안 걸린" 상태가 가능하므로, 세션
  시작 체크리스트에 "훅이 실제로 동작하는지 1회 확인"을 넣어야 한다. `~/.claude/agents/`의 사용자
  레벨 정의는 이 단계가 필요 없고, `-p` 세션은 trusted로 간주되지 않는다.
- **추가 작업**: 검사 스크립트를 새로 만들어야 하고, 이 하네스는 Windows에서 돌아가므로 PowerShell
  변형(`shell: powershell`)이 필요하다. 소유권 맵을 스크립트가 읽을 수 있는 형식(예: JSON)으로
  둘지도 결정해야 한다 — 지금은 `TECH_SPEC.md` 본문의 표로만 존재한다.

### B2. revfactory/harness의 도구 부여 관례 조사

`ORCHESTRATION.md` "모델 지정 규칙"이 이 하네스를 비교 대상으로 인용하고 있으나 **가져온 것은
모델 배치뿐**이고, 도구 부여(특히 문서 생산 에이전트에 Write/Edit를 어떻게 주는지) 관례는 확인한
적이 없다. 2026-10-15에 조사한 것은 공식 Claude Code 문서와 VoltAgent 컬렉션 두 곳이다.

참고로 그때 확인된 외부 기준선:

| 출처 | 문서/쓰기 에이전트 도구 구성 |
|---|---|
| 공식 문서 `debugger` 예시 | `Read, Edit, Bash, Grep, Glob` — **Edit만 있고 Write 없음**("기존 파일 수정이 일이면 Edit") |
| 공식 문서 `code-reviewer` 예시 | `Read, Grep, Glob, Bash` — Edit·Write 둘 다 제외 |
| VoltAgent(161+ 서브에이전트) 관례 | read-only: `Read, Grep, Glob` / code writers: `Read, Write, Edit, Bash, Glob, Grep` / **documentation: `Read, Write, Edit, Glob, Grep, WebFetch, WebSearch`** / research: `Read, Grep, Glob, WebFetch, WebSearch` |

VoltAgent 쪽 문서 에이전트에는 `WebFetch`/`WebSearch`가 들어 있는데, 우리 doc-writer는 "스스로
조사하지 않는다"가 설계 의도이므로(위 "조사와 문서화는 분리한다") **의도적 차이로 유지**한다.

### B3. tester의 Write-only 구성 재검토

tester는 `Read, Edit, Write, Bash, Glob, Grep`이 아니라 `Read, Write, Bash, Glob, Grep`이다. 신규
테스트 파일 작성은 Write로 충분하지만, PJT4에서 tester가 **기존 테스트의 단언을 갱신**해야 하는
상황이 실제로 있었다(그때는 team-lead가 대신 처리). 같은 Write-전체덮어쓰기 위험이 테스트 파일에도
있으므로 Edit 부여를 검토한다. 다만 tester가 소스를 고치지 못하게 막는 것은 별개 문제이고(현재도
소프트 제약), B1의 훅과 함께 다루는 것이 자연스럽다.

### B4. `plan-review`를 `context: fork` + `agent: <읽기 전용 커스텀>` + `background: false` 스킬로 (2026-10-20 추가, 미실측)

2026-10-20 릴리스 교차검증(r1 §2-E)에서 나온 설계안이다. 공식 skills 문서에는 `context: fork`가
있다 — "Claude Code starts a new subagent of the type set in the `agent` field and gives it the skill
content as its prompt. The subagent doesn't see your conversation history" / `background: false`는
"wait for the forked subagent's result in the turn that invoked the skill". 그리고 sub-agents 문서는
"For a skill with `context: fork`, Claude Code follows the rules in Run skills in a subagent instead,
**whether or not fork mode is on**"이라고 적는다.

기대 효과 셋 — **전부 미실측**:
1. "맥락 없는 독립 검토자"가 프롬프트 약속이 아니라 **공식 메커니즘으로 보장**된다.
2. `agent:`에 `tools: Read, Grep, Glob`만 둔 커스텀 정의를 지정하면 검토자가 **진짜 읽기 전용**이
   된다(지금은 `general-purpose`라 전체 도구).
3. **fork mode가 켜진 세션에서도 포그라운드 대기**가 된다 — 이 하네스가 두 번 데인 자리다.

도입 전 1회 실측할 것: ① 대화 이력 격리가 실제로 되는지 ② 커스텀 `agent:`의 `tools:`가 적용되는지
(네이티브 노출 여부와 얽혀 있을 수 있다) ③ `background: false`로 같은 턴에 결과가 돌아오는지.
**등재만 하고 도입은 하지 않는다**(이 하네스의 관례 — 문서에 적는 것과 도입은 분리).
