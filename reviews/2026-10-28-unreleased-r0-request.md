# 릴리스 교차검증 요청 — `[Unreleased]` 2026-10-27 추가분

**작성**: 2026-10-28, 변경을 만든 쪽(뱀서라이크 `indiv/` PM 세션).
**성격**: 4문서(검토 → 응답 → 적용 단위 개정안 → 서명) **바깥의 요청서**다. 검토 대상과 앵커를 넘기는
인계이며 4문서 상한에 세지 않는다. 검토자는 이 문서를 읽고 **r1-review**를 쓴다.

## 1. 검토 대상

하네스 커밋 `28df1c2`(2026-10-28 푸시, 작업은 2026-10-27)가 `[Unreleased]`에 더한 것 13파일. 그 아래
`1d565d1`(README 신설, 10-22)과 10-20 교차검증 반영분은 **대상이 아니다**.

| # | 변경 | 위치 |
|---|---|---|
| 1 | 결정 기록 분리 — 프로젝트별 `DECISIONS.md`(주제별·갱신형)와 `RUN_LOG.md`(실행 일지·append-only)의 역할 분리, "결정 확정 → 같은 턴에 DECISIONS 갱신 + RUN_LOG 한 줄 + 소유 문서 개정" | `ORCHESTRATION.md` 문서 표 DECISIONS 행·배치 규칙·PM 행동 규칙·"끊기 전 점검"·"새 세션 읽기 순서", `HANDOFF.md`, `CLAUDE.md` "기억과 연속성" 행 |
| 2 | 기획 문서 분할(선택) — 기능 10개 이상 또는 수용 기준 100개 이상이면 `SPEC.md` → `spec/`, `TECH_SPEC.md` → `tech/`로 제목 단위 바이트 보존 분할. 소유 에이전트는 README 색인과 "구현자별 읽을 파일"만 채운다 | `ORCHESTRATION.md` "기획 문서 분할 (2026-10-27 신설, 선택)", 문서 표 SPEC/TECH 행, `CODING_GUIDE.md` 2곳, `CLAUDE.md` "사용자와 프로젝트 맥락" 행 |
| 3 | 에이전트 정의의 폴더 형태 — spec-writer·tech-spec-writer가 파일 하나 대신 폴더를 소유, tester가 `spec/F<nn>` 파일을 읽음 | `.claude/agents/spec-writer.md`, `tech-spec-writer.md`, `tester.md` |
| 4 | `dispatch-implementer` 8번 블록 "읽기 범위" — 디스패치 프롬프트에 읽을 파일 목록을 넣고, 목록 밖 문서를 열었으면 보고하게 한다. RUN_LOG는 주지 않는다 | `.claude/skills/dispatch-implementer/SKILL.md` "## 8. 읽기 범위" |
| 5 | `runlog-append` 개행 자동 감지 — CRLF 강제를 버리고 대상 파일의 다수 개행을 따른다 | `.claude/skills/runlog-append/SKILL.md` |
| 6 | `plan-review`의 결정 출처 — "`DECISIONS.md` <번호> 항목, 없으면 RUN_LOG" | `.claude/skills/plan-review/SKILL.md` 프롬프트 골격 |
| 7 | `DESIGN_NOTES.md` 1·4번 메모, `CHANGELOG.md` `[Unreleased]` "추가됨 (2026-10-27)" | 각 파일 |

## 2. 검토자가 봐 주었으면 하는 것 (공식 문서 기준)

- **A. 소유권이 프롬프트 수준이라는 점의 서술 (#3).** 폴더 소유("`spec/`만 수정한다")는 정의 파일의
  지시이지 기술적 강제가 아니다. 공식 문서의 `permissions` 규칙이 `Edit(spec/**)` 같은 경로 패턴을
  지원하므로 deny/allow로 소유권을 기술적으로 강제할 수 있는지, 그렇다면 정의에 그 선택지를 한 줄
  적어야 하는지 판단해 달라. 작성자는 10-20 r3에서 "읽기 전용"에 같은 결론(프롬프트 지시임을 명시)을
  받았으므로 이번에도 같은 표기 원칙을 따랐다고 본다.
- **B. "읽기 범위" 블록의 보고 의무 (#4).** 서브에이전트에게 "목록 밖 문서를 열었으면 보고하라"고
  시킨다. 서브에이전트가 자기 도구 호출 이력을 정확히 보고할 수 있다는 공식 근거는 없다. 이 블록을
  "프롬프트 지시, PM이 신뢰하지 않음"으로 표기해야 하는지, 아니면 `Read` 경로를 `permissions.deny`로
  막는 쪽을 적어야 하는지 판단해 달라.
- **C. 스킬 프론트매터 (#4·#5·#6).** 세 스킬을 고쳤다. `name`·`description` 외 필드와 설명 길이가
  공식 스킬 규격에 아직 맞는지 확인해 달라. 특히 `runlog-append`의 description을 바꿨다.
- **D. `ORCHESTRATION.md` 줄 수.** 10-20 교차검증 뒤 절차를 스킬로 옮겨 줄였는데, 이번에 "기획 문서
  분할" 문단과 DECISIONS 관련 문장이 더해졌다. 현재 **608줄**이다(10-20 종결 시점보다 늘었다). "기획 문서 분할"의
  분할 절차(스크립트 방식·재조립 검증)가 ORCHESTRATION이 아니라 스킬로 가야 하는 *절차*인지 판단해
  달라. 작성자 의견: 지금은 트리거·배치 규칙만 적었고 절차는 적지 않았으므로 스킬 분리는 두 번째
  사용 때 한다.
- **E. CLAUDE.md "기억과 연속성" 행의 읽기 지시 (#1).** "RUN_LOG는 최신 항목부터, 전체를 읽지
  않는다"를 적었다. 세션 시작 시 자동 로드되는 것은 CLAUDE.md뿐이고 나머지는 PM이 읽는 것이므로
  이 지시가 작동하는 위치가 맞는지 확인해 달라.

## 3. 작성자가 이미 아는 약점 (다시 찾을 필요 없음)

- 전부 **시험 전**이다. 분할과 DECISIONS.md는 뱀서라이크에서 1회 적용됐지만 그 상태로 구현 세션을
  돌린 적은 없다. 태그 보류.
- 분할 트리거 임계(기능 10개·수용 기준 100개)는 plan-review 트리거를 재사용한 값이고, 그 값은 PJT4
  1건 근거의 잠정값이다.
- "읽기 범위" 효과 수치(필수 행 수 23~48%)는 tech-spec-writer 보고를 PM이 표본만 확인한 것이다.
- `install-into-project.sh --force`가 `settings.json`을 덮는 문제는 이번에 고치지 않았다(cp로 우회).
- 하네스 레벨 `DECISIONS.md`(하네스 자신의 결정 기록) 분리는 미결이다(`DESIGN_NOTES.md` 1번).

## 4. 앵커

| 대상 | 위치 |
|---|---|
| 결정 기록 분리 | `ORCHESTRATION.md` 문서 표 `DECISIONS.md` 행, "프로젝트별 `DECISIONS.md`" 항목, PM 행동 규칙 "확정 → `DECISIONS.md` 항목 갱신" |
| 기획 문서 분할 | `ORCHESTRATION.md` "**기획 문서 분할 (2026-10-27 신설, 선택)**" |
| 읽기 범위 | `.claude/skills/dispatch-implementer/SKILL.md` "## 8. 읽기 범위 (2026-10-27 신설)" |
| 경위·수치 | 하네스 `RUN_LOG.md` 2026-10-27 항목, 뱀서라이크 `indiv/RUN_LOG.md` 2026-10-27 항목 3건, `indiv/DECISIONS.md` "절차-D1"·"절차-D2" |
| 변경 요약 | `CHANGELOG.md` `[Unreleased]` "### 추가됨 (2026-10-27, 뱀서라이크 운행 중 — 미시험)" |

## 5. 절차 상기

- 검토자는 **r1-review**를 쓴다. 작성자는 **r2-response**, 그다음 **r3-amendment**, 마지막
  **r4-signoff**. 3번째 문서부터 새 논증 금지. 서명 뒤 새 사실은 다음 릴리스로.
- 공식 문서 인용 시 "알려진 한계"의 검증 방법론 5줄을 따른다.
