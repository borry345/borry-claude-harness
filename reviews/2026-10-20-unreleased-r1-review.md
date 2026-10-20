# 릴리스 교차검증 r1-review — `[Unreleased]` 2026-10-20 추가분 (`f763d5a`·`cb995b3`)

**작성**: 2026-10-20, 검토자 측 PM 세션(이 하네스 폴더에서 연 세션, 모델 fable). 변경을 만든 쪽이 아니다.
**선행**: `reviews/2026-10-20-unreleased-r0-request.md`(요청서, 4문서 바깥). **이 문서가 4문서 중 1번째**다.
**상태**: 제안이며 **아무것도 반영하지 않았다.** 다음은 작성자 측의 r2-response.
**기준**: `ORCHESTRATION.md` "릴리스 교차검증 상한"과 "알려진 한계"의 공식 문서 인용 검증 방법 5줄.

**이 문서는 필수 읽기가 아니다.** 확정 결과는 `CHANGELOG.md`·`RUN_LOG.md`가 소유한다.

---

## 0. 범위와 방법

| | 값 |
|---|---|
| 검토 대상 | `git diff f322b87..cb995b3` 전량(요약이 아니라 diff 원문). 파일 6개: `ORCHESTRATION.md` +22, `CODING_GUIDE.md`, `CHANGELOG.md`, `HANDOFF.md`, `CLAUDE.md`, `RUN_LOG.md` |
| 대상 아님 | `v0.2.2` 본체와 10-16 반영분(`8eae594`·`449da51`·`f322b87`). 다시 열지 않았다. 단 **그 범위의 서술이 이번 추가분의 전제로 쓰인 곳**(검토자 "읽기 전용"의 근거, HANDOFF의 fork mode 관찰법)은 전제가 맞는지만 봤다 |
| 공식 문서 | sub-agents / skills / permissions / cli-reference. **두 수단으로 받았다** — ① `WebFetch`(요약기 경유, 100,000자 절단) ② `curl`로 받은 `.md` 원문을 `grep`(절단 없음). "없음" 판정은 전부 ②의 전문 grep으로 확정했다(방법론 ②·③) |
| 저장소 증거 | `git show <커밋>:ORCHESTRATION.md \| wc -l`, Python 바이트 검사(CRLF/LF), 하네스 `RUN_LOG.md` 2026-10-20 항목 3건, 뱀서라이크 `indiv/RUN_LOG.md` 2026-10-16 항목(159·165·167·169·171행) |
| 세션 관측 | 이 세션의 Agent 도구 파라미터와 `subagent_type` 목록을 직접 봤다(§4). 문서가 아니라 관측이므로 따로 표시한다 |

수신 범위(방법론 ①): sub-agents 109,246자(WebFetch 0~100,000 + 100,000~끝 원문 수신, curl 원문 109,250바이트 전문 grep) / skills 109,870자(WebFetch 0~100,000 + 꼬리 원문, curl 109,922바이트 전문 grep) / permissions 83,847자(WebFetch 전량 원문 수신, curl 동일 크기) / cli-reference 전량.

---

## 1. 공식과 일치하는 것 (확인 사항 — 반박 대상 아님)

| 항목 | 공식 근거 | 비고 |
|---|---|---|
| `general-purpose`는 도구 제한이 없다 | sub-agents 빌트인 표: "General-purpose … **Tools**: every tool available to subagents" | 요청서 A의 전제가 맞다 — "정의 파일이 없는 빌트인"이라서가 아니라 **정의상 전체 도구**다 |
| `Explore`·`Plan`은 Write·Edit가 막힌 빌트인 | "**Tools**: read-only tools; Write and Edit are denied" (둘 다 같은 문구) | 단 `Bash`는 남는다(§2-A) |
| 빌트인 서브에이전트는 부모의 권한 규칙을 상속한다 | sub-agents: "Each inherits the parent conversation's permission rules; most run with a restricted tool set." / Bash deny 규칙은 "applies to the main conversation and to subagents" | `permissions.deny`가 서브에이전트에도 걸린다는 전제 성립 |
| 백그라운드 서브에이전트의 빌트인 도구 20종 목록 | sub-agents "Available tools" 두 번째 필터: `Read, Grep, Glob, LSP, Bash, PowerShell, Edit, Write, NotebookEdit, WebFetch, WebSearch, TodoWrite, Skill, ToolSearch, EnterWorktree, ExitWorktree, Monitor, TaskStop, SendMessage, Artifact` + `SubagentHandback` | 2026-10-15 수신본과 **동일**. 요청서 B의 `WebFetch`·`Read`·`Grep`은 전부 남는다 |
| `Edit(경로)` deny가 Bash 파일 명령·리다이렉션까지 덮고, 하위 프로세스는 못 막는다 | permissions Warning: "Read and Edit deny rules apply to Claude's built-in file tools, to file commands Claude Code recognizes in Bash, such as `cat`, `head`, `tail`, `sed`, and `tee`, and to the targets of Bash redirections … They don't apply to … arbitrary subprocesses" | 10-16 반영분 그대로 |
| "CLAUDE.md 절차 → 스킬" 원칙 | skills: "Create a skill when you keep pasting the same instructions, checklist, or multi-step procedure into chat, **or when a section of CLAUDE.md has grown into a procedure rather than a fact.** Unlike CLAUDE.md content, a skill's body loads only when it's used" | `CLAUDE.md` "반복 절차" 행의 근거가 공식 문장 그대로다. E의 판단 기준 |
| 스킬 본문 상한 | skills: "Keep `SKILL.md` under 500 lines. Move detailed reference material to separate files." | 기존 5종 53~96줄, 여유 충분 |
| `-p` 실행도 "세션"이다 | cli-reference `--continue`: "Skips **sessions created with `claude -p`** or the Agent SDK"; sub-agents: "**Subagents work within a single session.** To run many independent sessions in parallel … see background agents" | C의 근거(§2-C) |

---

## 2. 요청서 질문 A~E

### A. 검토자의 "읽기 전용"이 프롬프트 지시일 뿐이라는 서술 — **서술은 맞고, 괄호 안의 근거가 틀렸다**

- **대상**: `ORCHESTRATION.md` "기획 문서 독립 검토" **검토자** 항목 — "(우회 경로에서 `tools:`는 적용되지 않는다 — "알려진 한계")". `CHANGELOG.md` `[Unreleased]` 같은 항목의 "(우회 경로 `tools:` 미적용)"도 같다.
- **주장**: "`general-purpose` + 프롬프트"의 읽기 전용이 기술적 강제가 아닌 것은 **사실**이다. 그러나 이유는 "우회 경로라서 `tools:`가 무시되기 때문"이 아니다 — `general-purpose`에는 무시될 `tools:`가 **애초에 없고**, 공식 정의가 "every tool available to subagents"다. 10-16의 실측(우회 경로에서 정의 파일의 `tools:`가 무시됨)은 **커스텀 정의를 우회로 부를 때**의 사실이고, 여기엔 커스텀 정의 자체가 없다.
- **증거**: 뱀서라이크 `indiv/RUN_LOG.md` 2026-10-16 항목 — 같은 세션의 spec-writer(165행)·tech-spec-writer(136·167행) 디스패치가 모두 **"네이티브 `subagent_type`"** 로 기록돼 있다. 즉 그 세션은 우회 경로가 아니었고, 검토자를 `general-purpose`로 부른 것은 **선택**이었다. "우회 경로라서"라는 근거는 그 세션의 실제 조건과도 어긋난다.
- **영향**: 결론(검토 뒤 `git status` 확인)은 유지된다. 틀린 것은 이유 한 구절이고, 이 구절이 남으면 다음 세션이 "네이티브 타입이 보이면 강제된다"는 잘못된 역추론을 한다(네이티브여도 `general-purpose`는 전체 도구다).
- **"`permissions.deny`로 `Edit(SPEC.md)` 등을 걸어 기술적으로 막을 수 있다"는 대안을 적어야 하는가** — **적지 않는 쪽을 권한다.** 가능은 하다(상속 + Bash 파일 명령·리다이렉션까지 적용). 그러나 `permissions.deny`는 **세션 전체·모든 서브에이전트**에 걸리므로, 같은 세션에서 spec-writer가 `SPEC.md`를 개정하는 바로 다음 단계를 막는다. 검토 단계마다 `settings.json`을 켜고 끄는 것은 이 하네스가 "조용히 안 걸린" 실패를 두 종류 아는 안전장치 운용 방식과 맞지 않는다.
- **기술적 강제가 필요하면 쓸 수 있는 것은 다른 둘이다** (제안 문구에 짧게 넣을 것):
  1. **커스텀 정의 `tools: Read, Grep, Glob`** — 네이티브 경로에서 `tools:`는 강제된다(2026-10-15 실측, `No such tool available: Edit`). `Bash`를 빼면 리다이렉션·`tee` 경로도 없어 **진짜 읽기 전용**이다. 뱀서라이크 세션처럼 네이티브 타입이 노출된 환경에서만 유효하고, 우회 경로에서는 지금과 같은 소프트 제약으로 떨어진다. 정의 파일 1개(`agent-builder`로 생성)가 든다.
  2. **빌트인 `Explore`** — Write·Edit가 공식적으로 막혀 있고 빌트인이라 경로 문제가 없다. 그러나 **`Bash`가 남는다**(이 세션의 도구 목록: "All tools except Agent, Artifact, …, Edit, Write, NotebookEdit"). 즉 `tee`·`>`가 열려 있고, 시스템 프롬프트가 "reads excerpts rather than whole files … it locates code; it doesn't review or audit it"로 **검색용**이라 세 문서를 통독하는 검토에 맞지 않는다. **검토자로는 부적합**.
- **제안**: 검토자 항목의 괄호를 다음으로 교체 — "(`general-purpose`는 공식 정의상 전체 도구를 가진다 — 정의 파일이 없으므로 `tools:`로 깎을 것도 없다. 네이티브 타입이 노출된 세션이라면 `tools: Read, Grep, Glob`만 둔 커스텀 정의로 기술적 강제가 가능하다 — 도입은 보류)". `CHANGELOG` 항목의 "(우회 경로 `tools:` 미적용)"도 "(`general-purpose`는 전체 도구)"로.
- **교차검증**: curl 원문 `raw/sub-agents.md`에서 빌트인 표의 General-purpose 행 확인. `indiv/RUN_LOG.md` 165·167행의 "네이티브 `subagent_type`" 문구 확인.

### B. 백그라운드 검토자의 도구 목록 — **영향 없음 확인. 단 "제거되는 것"의 서술이 두 군데 부정확**

- **확인**: `WebFetch`·`Read`·`Grep`·`Glob`·`Bash`·`WebSearch` 모두 백그라운드 목록에 있다(§1 표). 보고만 하는 검토자에겐 영향이 없다. **B의 결론은 그대로.**
- **부정확 1 — `AskUserQuestion`은 백그라운드라서 빠지는 것이 아니다.** 공식 "Available tools"의 **첫 번째 필터**("removes these tools, even when listed in the `tools` field")가 **모든 서브에이전트**에서 `AskUserQuestion`·`EnterPlanMode`·`EndConversation`·`ScheduleWakeup`·`WaitForMcpServers`·`Workflow`를 빼고, `ExitPlanMode`는 `permissionMode: plan`이 아니면 뺀다. 포그라운드도 같다. 하네스의 "서브에이전트는 사용자에게 직접 못 묻는다는 전제가 백그라운드에서 **특히** 사실"(알려진 한계, 10-15)은 과소 서술이다 — **항상** 사실이다.
- **부정확 2 — `Agent`는 "제거"가 아니라 "깊이 상한을 따른다."** 첫 필터 원문: "`Agent`, when the subagent is at the depth limit; in a fork the tool stays listed but returns an error". 그리고 §1049행 "Let subagents spawn their own subagents": "**By default, a subagent can spawn subagents of its own, up to three layers below the main conversation.**" 즉 2026-10-20 현재 공식 문서는 **중첩 호출을 기본 지원**한다고 적는다. 이는 10-08·10-16의 "중첩 호출 지원이 버전마다 바뀌어 왔고 공식 안내도 메인 대화에서 연달아 호출하라" 서술(대상 아님)과 어긋나는 **새 사실**이다. 하네스의 결정(에이전트가 에이전트를 부르는 구조를 전제하지 않는다)은 공개 관행·실사용 근거로 그대로 서도, 근거 중 "공식 안내" 부분은 다음 교차검증에서 재확인해야 한다.
- **영향(이번 범위)**: 요청서 B의 문장 "`AskUserQuestion`·`Agent`가 제거된다"는 기획 문서 독립 검토 절에는 들어가지 않았으므로 **r3 적용 단위는 없다**. 위 두 건은 10-15 서술(대상 아님)의 정정 후보로 **다음 릴리스로 미룬다**(상한 규칙).
- **교차검증**: `raw/sub-agents.md` 435행(첫 필터의 `Agent` 항목), 1049~1051행(깊이 상한), 두 번째 필터 문단.

### C. 대조표 "수행 주체"의 "다른 PM 세션" — **그대로 둔다. "컨텍스트"로 바꾸지 않는다**

- **공식 용례**: "session"은 인터랙티브(`claude`), `-p`("sessions created with `claude -p`"), 백그라운드 세션(`claude --bg`), 클라우드 세션을 모두 가리키는 상위 단위다. 반면 서브에이전트는 "**Subagents work within a single session**"이고 "its own context window"를 가질 뿐 세션이 아니다.
- **판정**: "다른 PM 세션"은 공식 용어와 정합하며 **서브에이전트를 정확히 배제**한다 — 이것이 의도다(검토자는 `CLAUDE.md`를 자동 로드하고, `WebFetch`로 공식 문서를 받고, 상한에서 사용자에게 물을 수 있어야 한다. 서브에이전트는 `AskUserQuestion`이 첫 필터에서 빠져 마지막 조건을 못 한다). `-p` 비대화 세션은 포함된다 — 공식이 세션이라 부르고, `CLAUDE.md`도 읽는다(`--bare`가 아니면).
- **"다른 PM 컨텍스트"로 바꾸면 오히려 나빠진다**: 공식이 서브에이전트를 "own context window"로 설명하므로 "컨텍스트"는 서브에이전트까지 포함하는 말이 되어, 10-16에 분리해 둔 "기획 문서 독립 검토(서브에이전트)"와 "릴리스 교차검증(세션)"의 주체 구분이 흐려진다.
- **제안**: 변경 없음. 굳이 보강한다면 대조표 각주 한 줄 — "세션 = 공식 용례의 session(인터랙티브·`-p`·백그라운드). 서브에이전트는 세션이 아니다." 선택 사항.
- **교차검증**: cli-reference `--continue` 행, `raw/sub-agents.md` "Subagents work within a single session" Note.

### D. PM 행동 규칙 #2와 "끊기 전 점검 1번"의 중복 — **중복 아님. 둘 다 둔다**

| | 끊기 전 점검 1번 | PM 행동 규칙 #2 (신설) |
|---|---|---|
| 경계 | **세션** 경계(끊기 직전) | **문서 파이프라인** 경계(결정 확정 직후, 다음 문서 디스패치 전) |
| 검사 성격 | 상태 점검 — "모두 문서에 있는가" | 행동 시점 — "같은 턴에 개정을 디스패치한다" |
| 막는 실패 | 새 세션이 대화에만 있던 결정을 모른다 | 같은 세션 안에서 TECH_SPEC이 낡은 SPEC을 입력으로 쓴다 |
| 발현 사례 | PJT4 | 뱀서라이크 SPEC 3회차 이후 확정 4건 |

뱀서라이크 사례는 **세션을 끊지 않았는데** 발생했다 — 1번만 있었으면 잡히지 않는 구멍이다. 공식 문서로 판정할 사항은 아니며 논리 판단이다. "실행 라운드에서 얻은 규칙"의 마지막 항목("TECH_SPEC이 SPEC에 없는 상태를 신설하지 않는지")은 방향이 반대(TECH → SPEC)라 역시 별개다.

- **제안**: 합치지 않는다. 다만 #2의 **서사가 길다**(400기 즉사, 결정 4건의 이름) — 10-16에 A6("실행 라운드" 39 → 18줄)에서 세운 선례대로 **규칙 한 줄 + RUN_LOG 포인터**로 줄일 수 있다(E와 묶어서).

### E. `ORCHESTRATION.md` 비대화와 절차의 스킬 이전 — **옮기는 쪽에 동의. 단 수치 정정과 범위 한정**

- **수치 정정**: 요청서의 "577줄"은 `f763d5a` 시점이다. `cb995b3`(대조표 +9줄)로 **586줄**이 됐다(`git show cb995b3:ORCHESTRATION.md | wc -l` = 586, 작업트리 바이트 검사 CRLF 586 / 단독 LF 0). 10-16 이후 추이: 561 → 564(`f322b87`) → 577 → **586**.
- **공식 기준**: §1의 skills 문장이 정확히 이 경우다 — "a section of CLAUDE.md has grown into a procedure rather than a fact." `ORCHESTRATION.md`는 `CLAUDE.md`가 "항상 읽는다"로 지정한 파일이므로 같은 기준이 적용된다. 점검 축 4개·보고 형식·처리 순서·비용 수치는 "어떻게"(절차)이고, 트리거·검토자 조건·2라운드 상한·대조표는 "왜/언제"(원칙·사실)다.
- **제안 — 분할선**:
  - **남긴다**(ORCHESTRATION, 목표 6~7줄): "왜" 문단을 2~3줄로 축약(22건·0건의 대비 + `RUN_LOG` 2026-10-20 포인터) / 시점 / 트리거 / 검토자(A의 정정 문구 반영, 마지막 문장 "이름이 비슷한 다른 두 절차와…"는 **대조표가 소유하므로 삭제** — `cb995b3`가 같은 커밋에서 둘 다 넣어 중복이 생겼다) / 2라운드 상한 / "절차는 `plan-review` 스킬".
  - **옮긴다**(`.claude/skills/plan-review/SKILL.md`): 점검 축 4개 상세, 보고 형식, 처리 순서(선별 → 소유 에이전트 개정 → 범위 좁힌 2차의 세 항목), 비용 기준, 그리고 디스패치 프롬프트 골격(지금은 산문에만 있고 프롬프트 형태가 없다 — `dispatch-implementer`와 같은 구조로).
  - **같이 줄인다**: PM 행동 규칙 #2의 서사(D 참고).
  - 예상: 586 → 약 568~572줄. **크지 않다.** 10-16의 기록대로 비대화의 주범은 절차가 아니라 "알려진 한계"에 쌓인 사실·측정 기록(약 107줄)이고, 그쪽은 이번 대상이 아니다. 이번 이전은 "절차를 ORCHESTRATION에 더 쌓지 말라"는 자기 규칙 위반을 바로잡는 의미가 더 크다.
- **설계안 1건(미실측 — r3 적용 단위가 아니라 `DESIGN_NOTES.md` 후보)**: 공식 skills에는 `context: fork` + `agent` + `background: false`가 있다. "Claude Code starts a new subagent of the type set in the `agent` field and gives it the skill content as its prompt. **The subagent doesn't see your conversation history**" / "Despite the name, a skill with `context: fork` doesn't run in a fork of the current conversation" / `background`: "Set to `false` to wait for the forked subagent's result in the turn that invoked the skill". 그리고 sub-agents: "For a skill with `context: fork`, Claude Code follows the rules in Run skills in a subagent instead, **whether or not fork mode is on**." 즉 `plan-review` 스킬을 이 형태로 만들면 ① "맥락 없는 독립"이 공식 메커니즘으로 보장되고 ② `agent:`에 A-1의 읽기 전용 커스텀 정의를 지정할 수 있으며 ③ **fork mode가 켜진 세션에서도 포그라운드 대기**가 된다 — 이 하네스가 두 번 데인 자리다. 세 가지 전부 **미실측**이므로 문서에 적되 도입은 1회 실측 뒤에 한다(이 하네스의 관례).
- **교차검증**: `raw/skills.md` 11행(절차 → 스킬), 556행(500줄), 791·794행(`context: fork`), 853행(`agent` 필드), `background` 행; `raw/sub-agents.md`의 "whether or not fork mode is on".

---

## 3. 그 밖의 어긋남

### F1. HANDOFF의 fork mode 관찰법이 인용하는 공식 문장이 현재 페이지에 없다 (대상 #5, **확인 권장**)

- **대상**: `HANDOFF.md` "지금 상태" 신설 줄 — "Agent 도구에 `run_in_background` 파라미터가 있는지 본다 — 없으면 fork mode가 켜진 세션이라 포그라운드를 요청할 수 없다(`ORCHESTRATION.md` "알려진 한계")". 포인터가 가리키는 10-16 서술(대상 아님)은 공식 인용 "Claude Code also **removes the Agent tool's `run_in_background` parameter**, so Claude can't ask for the foreground"에 기댄다.
- **공식 근거(2026-10-20)**: curl 원문 109,250바이트 전문 grep — `run_in_background` **0건**, "can't ask for the foreground" **0건**, "off by default" **0건**. WebFetch 요약기도 세 번 모두 "not present". 현재 문장은 1271행: "While fork mode is on, Claude also can't wait for a subagent in interactive terminal, VS Code, or desktop sessions on your machine. **Fork mode is on by default from Claude Code v2.1.302**, and in an interactive terminal session from v2.1.232."
- **판정**: 10-16 인용은 그 시점 페이지의 문장이었을 가능성이 크고(버전 번호까지 정확히 적혀 있다) 오판이 아니다. 그러나 페이지가 바뀌었다 — ① 파라미터 제거 문장이 사라졌고 ② "-p·SDK는 기본 off"가 **v2.1.302부터는 어디서나 기본 on**으로 바뀌었다. 방법론 U5("날짜가 지나면 재확인")가 실제로 발현한 첫 사례다.
- **세션 관측(§4)**: 이 세션에는 `run_in_background`가 **있고**, `subagent_type` 목록에 `fork`가 **없다** — "파라미터 유무로 fork mode를 안다"는 관찰법 자체는 정황상 아직 작동한다. 다만 근거가 "공식 문장"에서 "실측 관찰"로 내려간다.
- **제안**: HANDOFF 줄은 유지하되 근거 표기를 바꾼다 — "(관찰법 — 공식 문서의 파라미터 제거 문장은 2026-10-20 현재 페이지에서 사라졌고, 이 세션 실측으로만 유지)". `ORCHESTRATION.md` fork mode 항목의 인용 문장 정정과 v2.1.302 기본값 변경은 **대상 밖이므로 다음 릴리스 교차검증 첫 항목으로** 넘긴다(상한 규칙). 이 문서 §7에 기록해 두었다.
- **교차검증**: 다른 머신 또는 다른 날짜에 `curl -sL https://code.claude.com/docs/en/sub-agents.md | grep -c run_in_background`. 이 세션의 Agent 도구 스키마에 파라미터가 있는지 — `ListAgents`가 아니라 도구 정의 자체를 본다.

### F2. 대조표 "릴리스 교차검증" 행의 시점 "하네스 릴리스 뒤" (대상 #3, **정보**)

이번 왕복 자체가 **태그 전** `[Unreleased]`를 대상으로 하므로 "릴리스 뒤"는 글자 그대로는 맞지 않는다. "릴리스 커밋 또는 `[Unreleased]` 묶음이 쌓인 뒤"가 실제 운용과 맞다. 공식 문서 사항이 아니라 자기 문서 정합이다. 한 구절 수정.

### F3. 검토자 항목의 삼중 대조 문장 중복 (대상 #1·#3, **정보**)

`cb995b3`가 대조표를 넣으면서 검토자 항목 끝의 "이름이 비슷한 다른 두 절차와 대상이 다르다 — …" 문장을 남겨 **같은 내용이 두 곳**에 있다. 대조표가 소유자이므로 검토자 항목 쪽을 지운다(E의 분할에 포함).

### F4. `CODING_GUIDE.md` §2.2 (대상 #4) — 공식 Claude Code 문서로 검증할 대상이 아니다

규칙 내용(`I` 접두사, `_camelCase` private 필드, `const` PascalCase, `Async` 접미사, 파일명 = 주 클래스명)은 .NET 관례와 Unity의 MonoBehaviour 제약에 부합한다는 **상식 수준 확인**만 했다. 작성자가 §3에서 밝힌 대로 코드가 한 줄도 없는 상태의 규칙이므로 판정은 뱀서라이크 구현 세션의 몫이다. 병합 처리(§2 머리말의 공통 원칙 1줄로 통합, Vue/React 예외를 §2.1 안으로)는 diff로 확인했고 내용 손실이 없다.

---

## 4. 세션 관측 (문서가 아니라 이 세션에서 본 것)

| 관측 | 값 | 함의 |
|---|---|---|
| 커스텀 `subagent_type` 노출 | **네이티브로 전부 노출** — `agent-builder`, `doc-writer`, `spec-writer`, `team-lead`, `tech-spec-writer`, `tester` (+ `claude`, `claude-code-guide`, `Explore`, `general-purpose`, `Plan`, `statusline-setup`) | 10-08의 "하네스 폴더 세션에는 안 떴다"와 반대. "세션마다 실제 목록을 본다"는 규칙이 맞고, 환경 의존성은 여전히 미규명 |
| Agent 도구 `run_in_background` | **있음** | F1 참고 |
| `fork` 타입 | 목록에 **없음** | fork mode off 정황(공식: "Claude can start a fork on its own while fork mode is on") |
| `Explore`의 도구 | "All tools except Agent, Artifact, …, Edit, Write, NotebookEdit" — **`Bash` 포함** | A-2의 근거 |
| 하네스 작업트리 | `ORCHESTRATION.md` CRLF 586 / 단독 LF 0 / 이중 CR 0, `reviews/*.md` 8종 전부 CRLF(블롭은 LF) | 이 문서도 같은 관례로 저장 |

---

## 5. 근거 추적 ("근거가 RUN_LOG에 있는가")

| 주장 | 위치 | 판정 |
|---|---|---|
| 1차 검토 22건 / 2차 5건 / 2라운드 | 뱀서라이크 `indiv/RUN_LOG.md` 159행(1차 디스패치), 165·167행(SPEC 4회차·TECH 2회차), 169행(2차), 171행(5회차·3회차); 하네스 `RUN_LOG.md` 2026-10-20 2번째 항목 | **있다** |
| 236K·8분 / 266K·6분 | 하네스 `RUN_LOG.md` 2026-10-20 2번째 항목 | 있다 — 1회 실측(작성자 §3 자인). 수치 자체는 재산출하지 않았다 |
| SPEC 3회차 이후 확정 4건이 TECH로 넘어감 | `indiv/RUN_LOG.md` 132·134·138·140행(Q40·Q41·D17·D3 확정)이 136행(TECH 1회차 디스패치) 앞뒤에 있다 | **있다** — 순서가 로그에 그대로 보인다 |
| 뱀서라이크 세션이 네이티브 타입을 썼다 | `indiv/RUN_LOG.md` 136·165·167행 "네이티브 `subagent_type`" | 있다 — A의 증거 |
| §2.2 신설 경위 | 하네스 `RUN_LOG.md` 2026-10-10 1번째 항목 | 있다 |

---

## 6. 판정과 적용 단위 제안 (r3에서 "현재/개정/근거/상태"로 옮길 후보)

**이번 추가분은 공식 기준에서 어긋난 곳이 적다.** 새로 인용한 공식 문장은 없고(§1·E의 인용은 내가 추가한 것), 절차·규칙은 로그로 추적된다. 결함은 **근거 한 구절(A)**, **낡아진 인용 하나(F1)**, **중복 한 문장(F3)**, 그리고 작성자가 스스로 지적한 **구조 위반(E)** 이다.

| 순위 | 항목 | 성격 | 범위 |
|---|---|---|---|
| 1 | **A** — 검토자 항목·CHANGELOG의 "(우회 경로 `tools:` 미적용)" → "(`general-purpose`는 전체 도구)" + 기술적 강제 선택지 1줄 | 근거 오류 | ORCHESTRATION 1구절, CHANGELOG 1구절 |
| 2 | **E + D + F3** — 점검 축·보고 형식·처리·비용을 `plan-review` 스킬로, 검토자 항목 중복 문장 삭제, PM 행동 규칙 #2 서사 축약 | 구조 | ORCHESTRATION −14~18줄, 스킬 1개 신설, `CLAUDE.md` "반복 절차" 행에 스킬명 추가, `install-into-project.sh`는 이미 `skills/`를 복사하므로 변경 없음 |
| 3 | **F1** — HANDOFF 줄의 근거 표기를 "관찰법"으로 | 낡은 인용 | HANDOFF 1구절 |
| 4 | **F2** — 대조표 시점 구절 | 자기 정합 | ORCHESTRATION 1구절 |
| — | **C**, **D** | 변경 없음 | — |
| 다음 릴리스 | fork mode 인용 정정·v2.1.302 기본값 / 첫 필터(`AskUserQuestion` 상시 제거, `Agent` 깊이 상한) / 중첩 호출 기본 지원 서술 / `context: fork` 설계안 실측 | 대상 밖 또는 미실측 | §7 |

전부 시험 전 변경이므로 `[Unreleased]`에 쓰고 태그는 다음 운행 뒤. 번호는 PATCH 후보(새 에이전트 없음 — A-1의 커스텀 정의를 **만든다면** 그때 MINOR 여부를 다시 본다).

---

## 7. 내가 확인하지 못한 것 / 다음 릴리스로 넘기는 것

- **U1. 10-16 인용이 그 시점 페이지에 실재했는지는 확인할 수 없다.** 과거 버전 페이지를 받을 수단이 없다. 버전 번호(v2.1.232)까지 적힌 인용이라 오판보다 **페이지 개정**으로 본다. 어느 쪽이든 현재 페이지 기준 정정은 필요하다.
- **U2. `context: fork` + `agent: <커스텀>` + `background: false`의 세 효과는 전부 미실측이다.** 특히 커스텀 `agent:`가 우회 경로 없이 정의 파일의 `tools:`를 적용하는지는 네이티브 노출 여부와 얽혀 있을 수 있다.
- **U3. 이 세션의 fork mode 상태는 정황(파라미터 존재, `fork` 타입 부재)이지 확정이 아니다.** `CLAUDE_CODE_FORK_SUBAGENT`를 이 세션에서 읽지 않았다.
- **U4. 중첩 호출 "three layers" 서술이 하네스가 실측한 "포그라운드 대기 불가"와 어떤 관계인지 보지 않았다.** 깊이 지원과 대기 보장은 별개일 수 있다. 대상 밖.
- **U5. 비용 수치(236K/266K)는 재산출하지 않았다.** 로그에 있는지만 봤다.
- **U6. 공식 문서는 2026-10-20 스냅샷이다.** 이번에 실제로 페이지가 바뀐 것을 봤으므로, 다음 교차검증은 **먼저 `curl` 원문을 받아 이전 인용을 전부 grep**하는 것으로 시작하는 편이 낫다(방법론 ④의 확장 — "받아둔 수신본에 재질의"를 "새 수신본에 옛 인용을 재질의"로).

---

## 8. 출처 (2026-10-20 수신)

| 페이지 | URL | 수신 |
|---|---|---|
| Subagents | https://code.claude.com/docs/en/sub-agents | WebFetch 109,246자(0~100,000 요약 3회 + 100,000~끝 원문 1회) / curl `.md` 109,250바이트 전문 grep |
| Skills | https://code.claude.com/docs/en/skills | WebFetch 109,870자(0~100,000 요약 2회 + 100,000~끝 원문 1회) / curl `.md` 109,922바이트 전문 grep |
| Configure permissions | https://code.claude.com/docs/en/permissions | WebFetch 83,847자 전량 원문 수신 / curl `.md` 83,847바이트 |
| CLI reference | https://code.claude.com/docs/en/cli-reference | WebFetch 전량 원문 수신(절단 없음) |

원문 파일은 검토자 세션 스크래치(`raw/sub-agents.md`, `raw/skills.md`, `raw/permissions.md`)에 있으며 저장소에 넣지 않았다. 본문에 적은 행 번호는 그 `.md` 원문 기준이다.

검토 대상 커밋: `f322b87` → `f763d5a` → `cb995b3`. 저장소 실측 명령: `git diff f322b87..cb995b3`, `git show <커밋>:ORCHESTRATION.md | wc -l`, Python 바이트 검사, `grep -n "^\[2026-10-16" ../RUN_LOG.md`.
