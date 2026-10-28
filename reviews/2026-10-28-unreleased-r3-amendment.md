# 릴리스 교차검증 r3-amendment — `[Unreleased]` 2026-10-27 추가분 (적용 단위)

**작성**: 2026-10-28, 변경을 만든 쪽. **4문서 중 3번째 — 새 논증 없음.** 다음은 검토자의 r4-signoff.
**적용 커밋**: 아직 없음(커밋은 사용자 승인 게이트, 사용자 복귀 뒤). 작업트리에 적용된 상태로 서명을 요청한다 — 서명은 작업트리 diff(`git diff 28df1c2`)를 대상으로 한다.
**설치본**: 설치 대상 6파일(ORCHESTRATION·HANDOFF·DESIGN_NOTES·tech-spec-writer·dispatch-implementer·runlog-append)은 뱀서라이크 프로젝트 루트에 cp 동기화, cmp 동일.

| # | r1 | 현재(28df1c2) | 개정(작업트리) | 근거 | 상태 |
|---|---|---|---|---|---|
| U1 | G1 | "TECH `5c.2b 구현자별 읽을 파일`"(ORCHESTRATION·dispatch 8번·CHANGELOG), tech-spec-writer 35행 "§5c.2b holds …", 5c 항목에 표 없음 | 세 곳 "TECH 5c의 구현자별 읽을 파일 표"; tech-spec-writer 5c 항목에 "per-implementer reading list(전체/시그니처만 구분, PM이 dispatch 8번에 붙여 넣음, 폴더 형태면 5c 파일)" 추가 | 하네스 원칙 "프로젝트에 종속되지 않는다"; 생산자 없는 참조 | 적용 |
| U2 | E | "`RUN_LOG.md`는 최신 항목 몇 개만 읽는다(…수만 토큰이다)." | 같은 괄호 안에 "최신은 파일 끝 — `Grep -n "^\[20" RUN_LOG.md`로 마지막 항목 행을 찾고 `Read`에 `offset`. offset 없는 Read는 처음부터" | 수단 없는 지시; memory 원문 "context, not enforced configuration" | 적용 |
| U3 | D | 분할 절차(바이트 보존·안내 2줄·재조립 검증·원본 제거) + 표준 배치 11개 파일명 + D1 서사 괄호 | 절차 → "방법·검증은 첫 적용 기록(뱀서라이크 RUN_LOG 2026-10-27), 두 번째 적용 때 스킬로"; 파일명 → "spec-writer·tech-spec-writer 정의의 Folder form 문단이 소유"; 서사 → 한 줄. tech-spec-writer 35행 파일 목록 완성(`00-header`·`01-overview`·`5.00` 보충) | `CLAUDE.md` "반복 절차" 자기 규칙; skills "grown into a procedure" | 적용 (608 → 606줄) |
| U4 | G2 | "뱀서라이크 D1/D2" 7곳(ORCHESTRATION 186·207, dispatch 104, CHANGELOG 25·26, HANDOFF 18, DESIGN_NOTES 63) | "뱀서라이크 `DECISIONS.md` 절차-D1/D2" | `indiv/DECISIONS.md` 10행 표기 규칙 | 적용 |
| U5 | B | 8번 블록 bullet 2개 | bullet 3: "프롬프트 지시(강제 아님). 자기 보고는 증거가 아니므로 transcript `subagents/agent-*.jsonl`의 `Read` file_path를 grep" | sub-agents.md 1161·1163행(curl 원문 재확인) | 적용 |
| U6 | G3 | HANDOFF "두 묶음 … ① ②", 갱신 10-20 | "세 묶음 … ③ 2026-10-27 추가분(… 교차검증 `reviews/2026-10-28-*`, r1 7건 반영)", 갱신 10-28 | 부트스트랩 자기 정합 | 적용 |
| U7 | G4 | 문서 표 "PM 전용 (결정 기록 …)", runlog-append "두 파일 모두 PM만 쓴다" | 둘 다 "최초 이관은 doc-writer에 맡길 수 있다(뱀서라이크 선례, 이관 뒤 PM이 모순 항목 확인)" | `indiv/RUN_LOG.md` 219·225행 | 적용 |
| U8 | G5 | "자기 기능 절 12행" 3곳, 근거 없음 | "자기 절(가장 짧은 5.x 절은 12행) … 분할 뒤 필수 읽기량 23~48%" + DECISIONS 절차-D1·RUN_LOG 2026-10-27 포인터 | `tech/5.16-state-hash.md` 14행(안내 2줄 제외 12), `indiv/RUN_LOG.md` 224행 | 적용 |
| U9 | G6 | 개행 감지 주석 | "빈 파일(0 대 0)은 CRLF — 프로젝트가 LF 관례면 첫 항목 전에 eol 직접 지정" 주석 추가 | r1 경계 지적 | 적용(선택 항목) |
| U10 | — | CHANGELOG `[Unreleased]` | "### 변경됨 (2026-10-28, … r1 반영)" 5항목(이식성·실행 수단·자기 규칙·자기 정합·다음 릴리스 이월) | 10-20 선례 | 적용 |
| — | A·C | — | 변경 없음 | r1 수용 | — |
| — | G7 | — | 변경 없음. CHANGELOG "다음 릴리스" 항목에 이월 표기, HANDOFF에는 r4 §2-③ 권고에 따라 서명 뒤 "구현 세션 전 `/agents` 확인" 1줄 추가 | 원인 미확인, 범위 밖 | 이월 |

**diff 요약(작업트리 vs `28df1c2`)**: 7파일 +34/−25(RUN_LOG 제외; 처음 +38로 적었던 것은 r4 §2-②의 지적대로 오기). 설치본 cmp 동일. 전부 CRLF 유지.
**검토자가 r4에서 볼 것**: 위 U1~U10이 r1 제안과 일치하는가, 새 논증이 섞이지 않았는가(U3의 tech-spec-writer 파일 목록 완성은 D 적용의 전제), 남은 "5c.2b"·"D1/D2" 표기가 CHANGELOG의 옛 표기 인용 1곳뿐인가.
