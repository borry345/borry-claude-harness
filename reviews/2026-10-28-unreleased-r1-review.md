# 릴리스 교차검증 r1-review — `[Unreleased]` 2026-10-27 추가분 (`28df1c2`)

**작성**: 2026-10-28, 검토자 측 PM 세션(이 하네스 폴더에서 연 세션, 모델 opus). 변경을 만든 쪽이 아니다.
**선행**: `reviews/2026-10-28-unreleased-r0-request.md`(요청서, 4문서 바깥). **이 문서가 4문서 중 1번째**다.
**상태**: 제안이며 **아무것도 반영하지 않았다.** 이 파일 외에는 만들거나 고친 것이 없다. 다음은 작성자 측의 r2-response.
**기준**: `ORCHESTRATION.md` "릴리스 교차검증 상한 — 4문서"와 "알려진 한계"의 공식 문서 인용 검증 방법 5줄.
**사용자 부재**: 질문하지 않고 판단을 적었다. 확신이 없는 것은 "보류"로 두고 확인할 것을 적었다.

**이 문서는 필수 읽기가 아니다.** 확정 결과는 `CHANGELOG.md`·`RUN_LOG.md`가 소유한다.

---

## 0. 범위와 방법

| | 값 |
|---|---|
| 검토 대상 | `git diff 1d565d1 28df1c2` 전량(diff 원문). 13파일, +98 −28. `ORCHESTRATION.md` +29 −7 |
| 대상 아님 | `1d565d1`(README)와 그 아래 10-20 반영분. 다시 열지 않았다. 단 이번 변경이 **전제로 쓰는** 기존 서술(ORCHESTRATION 473행 "소유권은 소프트 제약", 504행 "`file_path` 차단 미검증")은 전제가 맞는지만 봤다 |
| 공식 문서 | permissions / memory / skills / sub-agents / hooks (URL은 §8) |
| 수신 수단 | **curl은 이 세션에서 승인 게이트에 걸려 쓰지 못했다**(사용자 부재). 전부 `WebFetch` 한 수단이다. 단 permissions·memory는 **요약기를 거치지 않은 원문이 파일로 저장**됐다(88.6KB·54KB, "truncated" 0건 — 전문 grep 가능). skills·sub-agents·hooks는 요약기 경유이며 **셋 다 절단 표시**가 있었다 |
| 방법론 적용 | ② 이번 판정의 "없음" 주장은 **원문 전량을 받은 permissions·memory와 저장소 파일에만** 했다. 요약기 경유 페이지(skills·sub-agents·hooks)에서는 "있음"만 인용했다. ③ 한 수단이므로 요약기 경유 인용은 **한쪽 확인**으로 센다(§7 U1) |
| 저장소 증거 | `git show <커밋>:ORCHESTRATION.md \| wc -l`·`wc -c`, `.claude/agents/*.md`·스킬 3종 프런트매터, 하네스 `RUN_LOG.md` 2026-10-27 항목, 뱀서라이크 `indiv/RUN_LOG.md` 216~227행, `indiv/DECISIONS.md` 10행·100~101행·1596~1611행 |
| 세션 관측 | 이 세션의 Agent 도구 `subagent_type` 목록, 자동 로드된 CLAUDE.md, 서브에이전트 transcript 파일(§4) |

---

## 1. 공식과 일치하는 것 (확인 사항 — 반박 대상 아님)

| 항목 | 공식 근거 (인용) | 비고 |
|---|---|---|
| `Edit(spec/**)` 같은 경로 패턴은 공식 문법이다 | permissions(원문): "Read and Edit rules both use gitignore pattern syntax with four distinct pattern types" / "**Deny and ask rules**: `Read(secrets/**)` matches a directory named `secrets` at any depth under the current directory" | 요청서 A의 전제 성립. deny는 **어느 깊이의 `spec/`이든** 잡는다 |
| `Write(경로)` 규칙은 매치되지 않는다 | permissions(원문): "If you write a path rule for `Write`, `NotebookEdit`, `Glob`, or legacy `MultiEdit`, Claude Code accepts the rule but never matches a read or edit against it. Use `Edit(docs/**)` in place of `Write(docs/**)`" | 소유권을 규칙으로 쓴다면 `Edit(...)`여야 한다 |
| Read/Edit deny는 Bash 파일 명령·리다이렉션까지, 하위 프로세스는 못 막는다 | permissions(원문) Warning: "…to file commands Claude Code recognizes in Bash, such as `cat`, `head`, `tail`, `sed`, and `tee`, and to the targets of Bash redirections … They don't apply to … arbitrary subprocesses" | 10-16 서술 그대로, 변동 없음 |
| 권한 규칙은 프롬프트가 아니라 하네스가 강제한다 | permissions(원문): "Permission rules are enforced by Claude Code, not by the model. Instructions in your prompt or `CLAUDE.md` shape what Claude tries to do, but they don't change what Claude Code allows." | A·B의 "프롬프트 지시" 표기 원칙의 공식 근거 |
| CLAUDE.md는 강제 설정이 아니다 | memory(원문): "Claude treats them as context, not enforced configuration. To block an action regardless of what Claude decides, use a PreToolUse hook instead." | E의 판정 기준 |
| 스킬 description 상한 | skills(요약기, 표 원문 인용): "the combined `description` and `when_to_use` text is truncated at 1,536 characters in the skill listing" | C의 기준 |
| 스킬 본문 상한 / 절차 → 스킬 | skills: "Keep `SKILL.md` under 500 lines." / "…or when a section of CLAUDE.md has grown into a procedure rather than a fact." | 10-20 r1 인용과 **동일 문장 재확인** (U6 권고 이행) |

---

## 2. 요청서 질문 A~E

### A. 폴더 소유권이 프롬프트 수준이라는 점 (#3) — **수용. `permissions.deny` 선택지는 정의에 적지 않는다**

- **사실**: `Edit(spec/**)` deny는 공식 문법이고 Bash 파일 명령·리다이렉션까지 덮는다(§1). 그러나 permissions(원문)에는 **규칙을 특정 서브에이전트에만 거는 문법이 없다** — 전수 확인: 원문에서 "subagent"가 나오는 곳은 `Agent(AgentName)` 규칙 절(591~597행, *어떤 서브에이전트를 부를 수 있는가*)과 trust 표(797·798행)뿐이다. 따라서 `Edit(spec/**)` deny는 **spec-writer 자신과 PM까지** 막는다. 10-20 r1 §2-A가 `Edit(SPEC.md)`에 대해 낸 결론("다음 단계의 소유자를 막는다")과 같은 구조이고, 폴더라고 달라지지 않는다.
- **판정**: 정의 파일에 "deny로 강제할 수 있다"를 한 줄 넣으면 **잘못된 선택지를 안내하게 된다.** 소유권이 소프트 제약이라는 일반 서술은 이미 `ORCHESTRATION.md` "알려진 한계"(473행, "파일 소유권 원칙도 마찬가지로 소프트 제약")에 있고, 폴더 형태 문단은 그 원칙의 적용 대상만 넓혔다. 정의마다 다시 적을 필요는 없다. **현재 표기 수용.**
- **새 사실 1건 (적용 단위가 아니라 다음 릴리스·`DESIGN_NOTES.md` B1 후보)**: 서브에이전트별 경로 강제가 가능한 공식 경로가 하나 더 있다.
  - hooks(요약기, 원문 인용): "Hooks from settings files, managed policy settings, and plugins also run inside subagents. When a subagent calls a tool, tool events such as `PreToolUse` and `PostToolUse` fire the same configured hooks as in the main conversation, and the input carries the `agent_id` and `agent_type` common input fields that identify the subagent." / "`agent_type` … Present when the session uses `--agent` or the hook fires inside a subagent."
  - permissions(원문) trust 표 795행: settings 파일의 **Hooks**는 부모 폴더만 trust했을 때도, `-p`에서도 **"Used"**. 반면 797행: **서브에이전트 프런트매터 훅은 "Not used, and no dialog is offered"**.
  - 함의: B1(프런트매터 `hooks:`로 소유권 강제)은 trust 조건에 걸려 "조용히 안 걸리는" 위험이 있었는데, **`settings.json`의 `PreToolUse` 훅이 `agent_type`으로 분기**하면 그 위험이 없다. 단 ① 우회 경로(`general-purpose` + 정의 따르라)에서는 `agent_type`이 `general-purpose`라 spec-writer와 tech-spec-writer를 구별하지 못한다 — **네이티브 경로 한정** ② `tool_input.file_path`는 여전히 미검증(504행, 이번 hooks 수신은 그 절 전에 절단됐다) ③ 미실측. 도입 판단은 다음 릴리스.

### B. "읽기 범위" 블록의 보고 의무 (#4) — **수정 필요 (1줄). `Read` deny는 쓰지 않는다**

- **보고의 신뢰성**: 공식 문서에 서브에이전트가 자기 도구 호출 이력을 정확히 보고한다는 보장은 **없다**(요약기 경유라 "없음"을 전수로 확정하지 못함 — 보장 문장을 찾지 못했다). 그러나 **확인 수단은 공식으로 있다**: sub-agents(요약기, 원문 인용) "Subagent transcripts persist independently of the main conversation" / "find IDs in the transcript files at `~/.claude/projects/{project}/{sessionId}/subagents/`. Each transcript is stored as `agent-{agentId}.jsonl`." 이 세션에서 실측했다(§4): 뱀서라이크 세션 `7233dcc7…/subagents/`에 transcript 13개, `"name":"Read","input":{"file_path"` 169건. 즉 **PM이 자기 보고를 믿을 필요 없이 grep으로 열람 파일을 재현할 수 있다.** 이것은 `dispatch-implementer` "디스패치 후 PM이 하는 일"의 "보고를 그대로 믿지 않는다. 수치를 직접 재현한다"와 같은 원칙이다.
- **`permissions.deny`로 `Read`를 막는 쪽은 부적합하다**: ① 규칙이 서브에이전트별로 걸리지 않으므로(A) 구현자마다 다른 목록을 강제할 수 없다 ② 목록 밖 문서를 PM·tester·다른 구현자도 못 읽게 된다 ③ 이 블록의 목적은 **비용 절감과 목록 결함 발견**이지 보안 경계가 아니다 — 열어야 했다는 보고가 오히려 원하는 신호다.
- **제안** (8번 블록 코드 블록 아래 bullet 1줄 추가): "- 이 목록은 **프롬프트 지시**다(강제 아님). '목록 밖을 열었다'는 자기 보고는 증거가 아니므로, 범위 준수를 확인해야 할 때는 transcript(`~/.claude/projects/<프로젝트>/<세션>/subagents/agent-*.jsonl`)에서 `Read`의 `file_path`를 grep한다."
- **교차검증**: 다른 세션에서 `grep -o '"file_path":"[^"]*"' agent-*.jsonl | sort -u`로 한 디스패치의 열람 목록을 뽑아 보고와 대조. transcript 경로 문구는 curl 원문으로 재확인(§7 U1).

### C. 스킬 프런트매터 (#4·#5·#6) — **수용**

| 스킬 | 프런트매터 필드 | description 길이 | 판정 |
|---|---|---|---|
| `runlog-append` (description 변경) | `name`, `description` | 약 120자 | 1,536자 상한의 1할 미만 |
| `dispatch-implementer` (본문만 변경) | `name`, `description` | 약 125자 | 변경 없음 |
| `plan-review` (본문만 변경) | `name`, `description` | 약 140자 | 변경 없음 |

- 공식 프런트매터 표(skills)에서 `name`은 "No"(필수 아님, 기본값 디렉터리 이름), `description`은 "Recommended". 세 스킬 모두 `name`이 디렉터리 이름과 같고 소문자·하이픈이다. `name`·`description` 외 필드는 **없다**(세 파일 1~4행 전수 확인).
- 본문 길이: `dispatch-implementer` 113줄, `runlog-append` 59줄 — 500줄 권장 한참 아래.
- `runlog-append` 새 description은 키 사용처("RUN_LOG.md에 … 덧붙인다")가 앞에 있어 "Put the key use case first"에 맞다. 다만 설명에 `DECISIONS.md` 쓰기를 넣었는데 스킬 본문은 DECISIONS를 **어떻게** 쓰는지(개행 보존)는 다루지 않는다 — 기능 서술과 본문이 어긋나진 않으나(본문 8~12행이 "`Edit`로 쓴다"고 적음) "결정의 전체 내용은 DECISIONS.md 항목으로 쓴다"는 이 스킬의 행위가 아니라 안내다. 현 상태 수용.

### D. `ORCHESTRATION.md` 줄 수와 "기획 문서 분할"의 위치 — **수정 필요. 작성자 전제 "절차는 적지 않았다"가 일부 틀리다**

- **수치 확인**: `git show 28df1c2:ORCHESTRATION.md | wc -l` = **608**(요청서와 일치). 그런데 줄 수는 10-20 이동 효과를 가린다 — **바이트**로 보면:

  | 커밋 | 줄 | 바이트 |
  |---|---|---|
  | `cb995b3` (10-20 이동 전) | 586 | 74,402 |
  | `970b61a` (plan-review로 이동 후) | 586 | 72,025 (−2,377) |
  | `28df1c2` (이번) | 608 | **75,451** (+3,426) |

  10-20에 줄인 양을 **전부 되돌리고 그 위로 1,049바이트를 더 얹었다.** 요청서의 "10-20 종결 시점보다 늘었다"는 맞지만, "줄였다"는 줄 수로는 보이지 않았던 것이다(586 → 586).
- **"절차를 적지 않았다"의 검토**: 추가된 "기획 문서 분할" 문단(176~187행, 12줄)에는 **절차가 이미 들어 있다** — "PM 스크립트로 **바이트 보존**(각 파일 맨 앞 안내 2줄만 추가, 안내를 뺀 재조립이 원본과 동일함을 검증한 뒤 원본 제거)". 이것은 "어떻게"다. 또 **표준 배치 11개 파일명**은 spec-writer·tech-spec-writer 정의의 폴더 형태 문단과 **중복**이다(두 정의가 소유자로서 이미 적는다).
- **공식 기준**: skills "a section of CLAUDE.md has grown into a procedure rather than a fact" — ORCHESTRATION은 `CLAUDE.md`가 "항상 읽는다"로 지정해 사실상 같은 비용으로 매 세션 전량 로드된다. 참고로 memory(원문)의 "target under 200 lines per CLAUDE.md file. Longer files consume more context and reduce adherence"는 **CLAUDE.md·`@import`에 대한 문장**이고 ORCHESTRATION은 `@import`가 아니라 PM이 Read로 읽으므로 직접 적용되지 않는다 — 근거로는 쓰지 않는다.
- **"두 번째 사용 때 스킬로" 원칙**: 스킬 신설을 미루는 것은 동의한다(1회 적용, 미시험). 그러나 미루는 동안 **절차를 ORCHESTRATION에 두는 것**은 `CLAUDE.md` "반복 절차" 행의 자기 규칙("절차를 `ORCHESTRATION.md`에 더 쌓지 말고")과 어긋난다. 절차는 이미 `indiv/RUN_LOG.md` 217·222행과 `indiv/DECISIONS.md` 절차-D1에 있으므로 **포인터로 충분하다.**
- **제안** (적용 단위 후보, 약 −5줄·−900바이트):
  - "분할은 PM 스크립트로 **바이트 보존**(…원본 제거)으로 하고" → "분할은 PM 스크립트로 바이트 보존한다(방법·검증은 첫 적용 기록 — 뱀서라이크 `RUN_LOG.md` 2026-10-27, 두 번째 적용 때 스킬로 뺀다)".
  - "표준 배치: …" 11개 파일명 문장 삭제 → "표준 배치는 spec-writer·tech-spec-writer 정의의 Folder form 문단이 소유한다".
  - 근거 문장의 괄호(PM 추천 → 사용자 반문 → 뒤집음)는 10-20 r1 §2-D의 선례(서사 → 규칙 한 줄 + 포인터)대로 축약 가능.

### E. CLAUDE.md "기억과 연속성" 행의 읽기 지시 (#1) — **수정 필요. 위치는 맞고, 실행 방법이 빠졌다**

- **위치**: memory(원문) "CLAUDE.md and CLAUDE.local.md files in the directory hierarchy above the working directory are loaded at launch." / "Claude gets the whole of each CLAUDE.md file that loads at launch, as long as the file is 4 MiB or smaller." — 세션 시작 시 PM이 **아무것도 읽기 전에** 컨텍스트에 있는 곳은 CLAUDE.md이므로, "RUN_LOG 전체를 읽지 마라"가 작동하려면 **여기 있어야 한다**. HANDOFF·ORCHESTRATION의 같은 지시는 PM이 그 파일을 읽은 뒤에야 보인다. **위치 판정: 맞다.** 단 memory "context, not enforced configuration"이므로 소프트 지시다.
- **요청서 전제 정정**: "세션 시작 시 자동 로드되는 것은 CLAUDE.md뿐"은 정확하지 않다. memory(원문): CLAUDE.md와 auto memory는 "Both are loaded at the start of every conversation"(MEMORY.md는 "first 200 lines or 25KB"), `paths` 없는 `.claude/rules/*.md`도 "loaded at launch". 하네스는 rules를 쓰지 않으므로 이번 판정에는 영향 없다.
- **빠진 것 — "최신 항목부터"를 어떻게 읽는가**: `RUN_LOG.md`는 append-only라 **최신이 파일 끝**이다. 그런데 Read 도구는 기본으로 **앞에서부터** 읽는다(이 세션의 Read 도구 정의: "Reads up to 2000 lines by default" — 공식 문서가 아니라 세션 관측). 뱀서라이크 RUN_LOG는 227행·115KB라 2,000행 기본 한도에 안 걸리므로, offset 없이 Read하면 **지시와 반대로 처음부터 전량**(35~40K 토큰)을 받는다. 즉 지시가 실행 수단 없이 의도만 적었다. 하네스 RUN_LOG도 84행에 줄당 수백 자라 같은 구조다.
- **제안**: CLAUDE.md 행은 그대로 두고(지도라 길게 쓰지 않는다), 수단은 **방법을 소유하는 쪽**인 `ORCHESTRATION.md` "새 세션 시작" 문장에 괄호로 한 구절: "(`Grep -n "^\[20" RUN_LOG.md`로 마지막 항목 행 번호를 찾고 `Read`에 `offset`을 준다 — offset 없는 Read는 처음부터 읽는다)". 이로써 CLAUDE.md·HANDOFF·ORCHESTRATION 세 곳에 같은 지시가 있는 중복도 "의도는 CLAUDE.md, 방법은 ORCHESTRATION"으로 역할이 갈린다.
- **세션 관측(정보)**: 이 세션은 `borry-claude-harness/`에서 열렸는데 상위 `indiv/CLAUDE.md`(설치본)와 하네스 `CLAUDE.md`가 **둘 다** 로드됐다(위 memory 문장대로 상위 디렉터리 로드). 내용이 같아 지도 표가 두 번 들어온다. 하네스 폴더를 프로젝트 하위에 두고 세션을 여는 운용에서만 생기는 비용이며 이번 범위 밖이다.

---

## 3. 그 밖의 어긋남 (diff에서 찾은 것)

### G1. "TECH 5c.2b 구현자별 읽을 파일"을 생산하는 쪽의 정의가 없다 (#2·#3·#4) — **수정 필요**

- **참조하는 곳 3개**: `ORCHESTRATION.md` "기획 문서 분할"("소유 에이전트는 … TECH `5c.2b 구현자별 읽을 파일` 표만 채운다"), `tech-spec-writer.md` 폴더 형태 문단("`tech/5c-ownership-contracts.md` §5c.2b holds the per-implementer reading list"), `dispatch-implementer` 8번 블록("필수: <TECH 5c.2b … 표의 해당 행을 그대로>").
- **정의하는 곳 0개**: `tech-spec-writer.md`의 섹션 목록 5c(44행)는 "one single owner per file, per-implementer name prefixes, the shared function signatures …, recommended dispatch order"이고 **읽을 파일 표가 없다**. "5c.2b"라는 하위 번호는 뱀서라이크 TECH_SPEC의 절 번호다(`indiv/RUN_LOG.md` 224행 "5c.2b 구현자별 읽을 파일 표 13행 신설"). 또 5c는 "only when the PM asks for it"이다.
- **영향**: 다음 프로젝트의 tech-spec-writer는 정의대로 쓰면 5c.2b를 만들지 않고, 8번 블록의 "필수" 행을 채울 원천이 없다. 단일 파일 프로젝트에서는 더 그렇다(8번 블록 bullet은 "절 제목으로 범위를 준다"만 적는다). 하네스 원칙("프로젝트에 종속되지 않는다")에 비추어 **프로젝트의 절 번호가 하네스 규칙에 새어 들어온** 경우다.
- **제안**: `tech-spec-writer.md` 5c 항목에 "…, and a **per-implementer reading list** (files/sections each implementer must read in full vs. signatures only) — the PM pastes its rows into `dispatch-implementer` block 8" 한 구절. 세 참조처의 "5c.2b"는 "5c의 구현자별 읽을 파일 표"로 바꾼다(번호 고정 해제).

### G2. "뱀서라이크 D1·D2" 표기가 그 프로젝트의 번호 체계와 충돌한다 (#1·#2) — **수정 필요**

- `indiv/DECISIONS.md` 10행: "D = TECH 기본값 번호(단, 2026-10-27의 D1·D2는 문서 절차 결정이므로 **"절차-D1"·"절차-D2"**로 표기)". 실제로 D 계열 TECH 기본값이 있다(75행 `D3`, 450행 `D10`, 574행 `D14`, 1159행 `D17`).
- 하네스 쪽은 "뱀서라이크 D1/D2"로 7곳에 적었다(전수 grep, `reviews/` 제외; 원문은 "6곳"으로 오기 — 검토자 요약의 자인에 따라 작성자가 r1 CRLF 변환 때 정정): `ORCHESTRATION.md` 186·207행, `dispatch-implementer/SKILL.md` 104행, `CHANGELOG.md` 25·26행, `HANDOFF.md` 18행, `DESIGN_NOTES.md` 63행(7곳).
- **영향**: 다음 세션이 근거를 따라가 `DECISIONS.md`에서 "D1"을 찾으면 TECH 기본값 계열로 간다. 프로젝트가 이관하면서 일부러 바꾼 이름을 하네스가 옛 이름으로 인용한다.
- **제안**: 7곳 모두 "뱀서라이크 `DECISIONS.md` 절차-D1/절차-D2"로.

### G3. `HANDOFF.md` "지금 상태"가 이번 묶음을 모른다 (#1) — **수정 필요**

- `28df1c2`는 HANDOFF 상단 문단(17~23행)을 고쳤지만 "지금 상태 (최종 갱신: **2026-10-20**)" 27행은 그대로 "`[Unreleased]`에 **두 묶음**이 쌓여 있다(① … ②…)"이다. 실제로는 세 번째 묶음(2026-10-27 추가분)이 있고 `CHANGELOG.md`에는 들어갔다.
- **영향**: HANDOFF는 "항상 가장 먼저 읽는" 부트스트랩이다. 새 세션이 `[Unreleased]` 범위를 두 묶음으로 오인한다. 공식 문서 사항이 아니라 자기 정합이다.
- **제안**: 27행에 "③ 2026-10-27 뱀서라이크 운행 중 추가(DECISIONS 분리, 기획 문서 분할, 읽기 범위, runlog-append 개행 감지 — 교차검증 `reviews/2026-10-28-*`)"를 더하고 갱신일을 고친다.

### G4. `DECISIONS.md` "PM 전용"과 실제 이관 경위가 어긋난다 (#1) — **수정 필요 (1구절)**

- 문서 표: "`DECISIONS.md` | **PM 전용**". `runlog-append` 본문: "두 파일 모두 PM만 쓴다".
- 실제: `indiv/RUN_LOG.md` 219·225행 — **doc-writer**(opus, 192,828토큰)가 RUN_LOG를 읽고 `DECISIONS.md` 1,634행을 만들었다. 이관은 일회성이고 그 뒤 갱신은 PM이라는 해석이 가능하지만 문서에는 그 구분이 없다.
- **영향**: 다음 프로젝트에서 분리를 도입할 때 PM이 규칙을 지키려고 1,600행 이관을 직접 하거나, 반대로 doc-writer에 맡긴 것을 규칙 위반으로 오인한다.
- **제안**: 문서 표 셀을 "PM 전용(기존 RUN_LOG에서의 **최초 이관**은 doc-writer에 맡길 수 있다 — 뱀서라이크 선례, 이관 뒤 PM이 모순 항목을 확인)"으로. 같은 225행이 이관 중 RUN_LOG 내부 모순 7건을 찾았다고 적고 있어, "이관 뒤 PM 확인"은 근거가 있다.

### G5. "자기 기능 절 12행" 수치의 근거가 RUN_LOG에 없다 (#2·#4) — **보류**

- 이 수치는 `ORCHESTRATION.md` 185행, `dispatch-implementer` 103행, `CHANGELOG.md` 26행에 쓰였다. `indiv/RUN_LOG.md`·`indiv/DECISIONS.md`에서 "12행"·"12줄"을 grep — **0건**(두 파일 전수). "2,028행"은 224행에 있다.
- 공식 문서로 검증할 대상이 아니므로 기준은 "근거가 RUN_LOG에 있는가"이고, **없다.** 다만 수치가 틀렸다는 증거도 없다(뱀서라이크 `tech/` 파일에서 직접 셀 수 있다).
- **확인할 것**: 작성자가 어느 기능 절을 센 값인지 RUN_LOG에 한 줄 남기거나, 근거 없이 쓰지 말고 224행에 있는 "필수 행 수 23~48%"로 바꾼다. 어느 쪽이든 r2에서 작성자가 정한다.

### G6. `runlog-append` 개행 감지 로직 (#5) — **수용 (주석 1건 선택)**

- `crlf >= (총 LF − crlf)`이면 CRLF. 다수결이고 동률은 CRLF다. CRLF·LF 단일 파일에서는 정확하다.
- 경계: **빈 파일·새 파일**(0 대 0)이면 CRLF를 고른다. 새 프로젝트 RUN_LOG의 첫 항목이 CRLF로 박히고 이후 다수결이 그것을 따른다. 프로젝트가 LF 관례(`.gitattributes` `eol=lf` 등)면 첫 항목에서 갈린다. 실제 피해는 `git`의 autocrlf 정규화 여부에 달려 있어 단정하지 않는다.
- 제안(선택): 주석에 "빈 파일은 CRLF — 프로젝트가 LF면 첫 항목 전에 `eol`을 직접 지정"을 덧붙인다. 검사 문단의 "CRLF 파일이면 … LF 파일이면 …" 판정 기준은 정확하다.

### G7. 이 세션에서 `tester`가 네이티브 타입으로 노출되지 않았다 — **보류 (범위 밖)**

- 이 세션 `subagent_type` 목록: `agent-builder`, `doc-writer`, `spec-writer`, `team-lead`, `tech-spec-writer` (+빌트인). **`tester`만 없다.** 10-20 r1 §4는 같은 폴더 세션에서 `tester`를 포함한 6개 전부 노출을 기록했다.
- 6개 정의 중 `skills:` 필드가 있는 것은 `tester.md`뿐이다(`skills: baseline-handoff`, `f322b87` 추가 — 10-20 이전). `28df1c2`는 tester의 본문 1줄만 바꿨고 프런트매터는 그대로다. **이번 커밋이 원인이라는 증거는 없다.**
- 확인할 것: 다른 세션에서 `/agents` 목록 확인, 또는 `skills:` 줄을 임시로 뺀 사본으로 노출 여부 비교. 노출되지 않는 세션에서 tester를 우회 경로로 부르면 `tools:` 제한이 사라진다("알려진 한계" 412행) — 운행에 영향이 있으므로 다음 릴리스 첫 확인 항목으로 넘긴다.

---

## 4. 세션 관측 (문서가 아니라 이 세션에서 본 것)

| 관측 | 값 | 함의 |
|---|---|---|
| 커스텀 `subagent_type` 노출 | `agent-builder`, `doc-writer`, `spec-writer`, `team-lead`, `tech-spec-writer` — **`tester` 없음** | G7 |
| 자동 로드된 CLAUDE.md | `indiv/CLAUDE.md`와 `indiv/borry-claude-harness/CLAUDE.md` 둘 다(내용 동일) | E 마지막 bullet |
| 서브에이전트 transcript | `~/.claude/projects/C--Users-SSAFY-Desktop-borry-indiv/7233dcc7-…/subagents/agent-*.jsonl` 13개, `Read` 호출 `file_path` 169건 | B — PM이 열람 파일을 재현할 수 있다 |
| curl / python | 승인 게이트에 걸림(사용자 부재로 실행 못 함) | §0 수신 수단, 이 문서의 개행 미검사(§8) |

---

## 5. 근거 추적 ("근거가 RUN_LOG에 있는가")

| 주장 (하네스 문서) | 위치 | 판정 |
|---|---|---|
| 결정 46건 | `indiv/RUN_LOG.md` 225행 "Q 46" | 있다 (Q 계열 46. 전체 항목은 158) |
| Q10이 세 항목에 분산 | 218행, `DECISIONS.md` 1608행 | 있다 |
| 147K 토큰 / 115KB·35~40K 토큰 | 218행, `DECISIONS.md` 1608행 | 있다 |
| 2,028행 TECH_SPEC | 224행 | 있다 |
| 자기 기능 절 **12행** | — | **없다** (G5) |
| 구현자 10명 | 224행 D1 효과 목록 10개 | 있다 (5c.2b 표는 13행 — 같은 수가 아님에 유의) |
| PM 추천 → 사용자 반문 → 뒤집음(D1) | 217행 | 있다 |
| 첫 실행 단언 실패(`### 5.0` 정규식) | 222행 | 있다 — 하네스 문서에는 쓰이지 않았다. 스킬로 뺄 때 기준선 후보 |
| 하네스 11파일 수정·cp 동기화 | 226행, 하네스 `RUN_LOG.md` 2026-10-27 | 있다 (커밋 13파일 = 11 + CHANGELOG + RUN_LOG) |
| "읽기 범위" 효과 23~48% | 224행 | 있다 — 작성자 §3 자인대로 표본 확인. 재산출하지 않았다 |

---

## 6. 판정과 적용 단위 제안 (r3에서 "현재/개정/근거/상태"로 옮길 후보)

**공식 문서와 정면으로 어긋난 서술은 없다.** 이번 묶음은 새 공식 인용을 하지 않았고, 질문 A·C는 공식 기준으로 현 상태가 맞다. 결함은 ① **다른 프로젝트에서 재현되지 않는 참조**(G1 5c.2b, G2 D1/D2 명칭) ② **실행 수단이 빠진 지시**(E) ③ **자기 규칙 위반**(D — 절차가 ORCHESTRATION에, 10-20 감량분 전부 환원) ④ 자기 정합(G3·G4)이다.

| 순위 | 항목 | 판정 | 성격 | 범위 |
|---|---|---|---|---|
| 1 | **G1** — 5c 구현자별 읽을 파일 표를 tech-spec-writer 정의에 넣고 "5c.2b" 번호 고정 해제 | 수정 필요 | 하네스 이식성 | 정의 1구절, 참조 3곳 |
| 2 | **E** — "새 세션 시작"에 RUN_LOG 끝부터 읽는 수단(Grep → Read offset) | 수정 필요 | 실행 불가 지시 | ORCHESTRATION 1구절 |
| 3 | **D** — 분할 절차 구절을 RUN_LOG 포인터로, 표준 배치는 정의 파일 소유로 | 수정 필요 | 구조 | ORCHESTRATION 약 −5줄 |
| 4 | **G2** — "뱀서라이크 D1/D2" → "절차-D1/D2" | 수정 필요 | 참조 오류 | 7곳 |
| 5 | **B** — 8번 블록에 "프롬프트 지시 + transcript로 확인" 1줄 | 수정 필요 | 표기 | 스킬 1줄 |
| 6 | **G3** — HANDOFF "지금 상태"에 세 번째 묶음 | 수정 필요 | 자기 정합 | HANDOFF 1구절 |
| 7 | **G4** — DECISIONS "PM 전용"에 최초 이관 예외 | 수정 필요 | 자기 정합 | ORCHESTRATION 1셀 |
| — | **A**, **C**, **G6**, 나머지 diff(#1 본체·#6 plan-review·CODING_GUIDE·DESIGN_NOTES·CHANGELOG), §5 근거 | 수용 | — | 변경 없음 (G6 주석은 선택) |
| — | **G5**(12행 근거), **G7**(tester 미노출) | 보류 | 확인 필요 | §3 |
| 다음 릴리스 | settings `PreToolUse` + `agent_type` 경로 강제(A 새 사실) / tester 미노출 원인(G7) / 10-20에서 넘긴 fork mode 인용 정정 등 | — | 대상 밖 또는 미실측 | §7 |

**집계: 수용 5 (A, C, G6, 나머지 diff, §5 근거) / 수정 필요 7 (B, D, E, G1, G2, G3, G4) / 보류 2 (G5, G7).**

전부 시험 전 변경이므로 `[Unreleased]`에 두고 태그는 운행 뒤. 새 에이전트·새 스킬이 없으므로 번호는 10-20 판단(PATCH 후보)을 바꾸지 않는다.

---

## 7. 내가 확인하지 못한 것 / 다음 릴리스로 넘기는 것

- **U1. 한 수단 확인.** curl이 막혀 `WebFetch`만 썼다. permissions·memory는 원문 전량(절단 표시 0건)이라 전문 grep을 했지만, skills·sub-agents·hooks는 요약기 경유 + 절단이다. 그쪽에서 인용한 문장(transcript 경로, `agent_type`, 1,536자, 500줄)은 "있음" 주장이라 방법론 ②상 성립하지만, ③·⑤에 따라 **한쪽 확인**으로 센다. r2 작성자는 curl 원문으로 `grep -n "agent_type" hooks.md`, `grep -n "subagents/" sub-agents.md`를 재확인할 것.
- **U2. 10-20 r1이 인용한 sub-agents의 "Each inherits the parent conversation's permission rules" 문장을 이번에 다시 찾지 못했다.** 요약기가 "inherit" 질의에 이 문장을 돌려주지 않았다 — 절단 때문인지 페이지 개정인지 모른다. A의 결론(deny는 세션 전체에 걸린다)은 permissions 원문에 서브에이전트별 범위 문법이 없다는 것으로 서므로 영향은 없다. 그러나 10-20 U6처럼 **옛 인용의 실재를 새 수신본으로 재확인**해야 할 항목이다.
- **U3. `tool_input.file_path`의 `PreToolUse` 입력 스키마**는 hooks 수신이 그 절 전에 잘려 이번에도 미검증이다(ORCHESTRATION 504행 상태 유지).
- **U4. `tester` 미노출(G7)의 원인**은 보지 않았다. 
- **U5. 비용·효과 수치**(147K, 35~40K, 23~48%)는 로그에 있는지만 봤고 재산출하지 않았다.
- **U6. 이 문서의 개행**: 하네스 `reviews/*.md`는 작업트리 CRLF 관례(10-20 r1 §4)인데, 이 세션은 python·변환 명령이 승인 게이트에 걸려 바이트 검사와 변환을 하지 못했다. Write 도구로 저장했으므로 **LF일 가능성이 크다.** 커밋 전에 PM이 `eol-audit`로 확인할 것.

---

## 8. 출처 (2026-10-28 수신)

| 페이지 | URL | 수신 |
|---|---|---|
| Configure permissions | https://code.claude.com/docs/en/permissions.md | WebFetch, 원문 그대로 파일 저장 88.6KB, 절단 표시 0건 — 전문 grep. 인용 행 번호는 이 수신본 기준(339~362, 366~420, 591~597, 789~800) |
| How Claude remembers your project | https://code.claude.com/docs/en/memory.md | WebFetch, 원문 그대로 파일 저장 54KB, 절단 표시 0건 — 전문 grep(31, 64, 88, 102~112, 547~555, 621~653행) |
| Skills | https://code.claude.com/docs/en/skills.md | WebFetch 요약기 경유, 약 100,000자에서 절단. 프런트매터 표·인용 4문장은 절단점 앞 |
| Create custom subagents | https://code.claude.com/docs/en/sub-agents.md | WebFetch 요약기 경유 2회(요약 1회 + 원문 인용 질의 1회), 199,847자 보고·절단 |
| Hooks reference | https://code.claude.com/docs/en/hooks.md | WebFetch 요약기 경유 1회, 절단. `agent_id`/`agent_type` 문장은 절단점 앞, `PreToolUse` 입력 스키마는 뒤 |

검토 대상 커밋: `1d565d1` → `28df1c2`. 저장소 실측 명령: `git show --stat 28df1c2`, `git diff 1d565d1 28df1c2`, `git show <커밋>:ORCHESTRATION.md | wc -l`·`wc -c`(`cb995b3`·`970b61a`·`28df1c2`), `git diff --numstat`, `git log -S"skills: baseline-handoff" -- .claude/agents/tester.md`, `indiv/RUN_LOG.md`·`indiv/DECISIONS.md` grep.
