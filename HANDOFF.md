# 세션 인수인계 (Handoff)

`pjt2/ppjt2`를 프로젝트 루트로 새 세션을 열었다면 **이 문서를 제일 먼저 읽는다.** 여기 없는 배경
지식(팀 구조, 정책, 코딩 규칙)은 아래 문서에 이미 다 있으니 중복하지 않는다 — 순서대로 읽으면 됨:
`ORCHESTRATION.md` → `CODING_GUIDE.md` → `SPEC.md`(todo-cli, 완료됨) / `SPEC_LOG_PJT.md`(로그 관리 PJT, 진행 중) → `RUN_LOG.md` → `CHANGELOG.md`.

이 문서는 **그 문서들에 없는, 세션이 바뀌면 끊기는 것들만** 담는다.

## 지금 진행 중인 작업: 로그 데이터 관리 PJT (2026-09-11)

사용자 요청: 기존 인포테인먼트(`pjt2/1649641/`)에 Setting 버튼을 추가하고, SSAFY 관통 PJT2 공식 명세서(`16-C-1-02.pdf`) 필수 기능을 충족하는 로그 데이터 관리 웹(`pjt2/1649641-pjt2/`)을 신설·연동. 스펙은 `SPEC_LOG_PJT.md`(F200~F207)에 정리되어 있고, 미확정 사항 10개는 전부 PM의 MVP 기본 결정으로 해소됨(§5).

**현재 상태 (이 시점까지 완료·커밋됨)**:
- implementer-A/B/C 세 구현 에이전트(배타적 경로: `1649641/`, `1649641-pjt2/{index,upload,styles,app,upload,env.example}`, `1649641-pjt2/functions+firebase설정`)가 각자 작업 완료.
- team-lead가 통합(env.js 실값 생성, 계약 대조, 스타일 검토) + tester 위임 검증까지 완료 — **F200~F207 전부 1차 PASS**, coverage gap 없음, 3-strikes 없음.
- **git 커밋 `632f5d5`**(`pjt2/ppjt2` 저장소)로 이미 체크포인트됨: `checkpoint: F200~F207 통합 및 tester 검증 완료...`. 세션이 끊겨도 이 시점까지는 완전히 복구 가능.
- `SPEC_LOG_PJT.md` §7에 구현 현황·통합 노트·tester 관찰사항이 전부 기록되어 있음.

**⚠️ 저장소 토폴로지 문제 발견 및 조치 완료 (17:XX)**: checkpoint 커밋(`632f5d5`)은 `pjt2/1649641-pjt2/`(ppjt2 git 바깥, 형제 폴더)를 전혀 커버하지 못했었음 — 거기 담긴 건 SPEC/RUN_LOG 문서뿐이었고 실제 앱 코드 18개 파일은 무방비 상태였음. **조치: `pjt2/1649641-pjt2/`에 별도 git 저장소를 새로 init하고 커밋 `ac513b9`로 안전망 확보함**(env.js는 제외, .gitignore 처리). 다음 세션은 이 별도 저장소를 원격에 연결할지 사용자와 상의할 것.
- 참고: `pjt2/ppjt2/1649641/`, `pjt2/ppjt2/1649641-pjt2/`(ppjt2 내부에 중첩된 옛날 스텁/빈 폴더, 실제 작업물 아님)가 여전히 남아있고 632f5d5에 gitlink로 혼란스럽게 딸려 들어가 있음 — 아직 정리 안 함, 필요시 다음 세션이 사용자와 상의해 정리.

**2026-09-11 저녁 업데이트 — 아래 항목 완료됨**:
- `pjt2/1649641-pjt2/`에 별도 git 저장소 init 완료, 커밋 `ac513b9`(초기 구현) + `30599b2`(Node 20 런타임 수정).
- `pjt2/1649641`의 Setting 버튼 변경을 커밋(`c44bcd5`)하고, 사용자 지시대로 **원격을 새 PJT2 저장소로 교체**(`https://lab.ssafy.com/s16/a20/20260911-pjt-2/1649641.git`, 기존 `20260730-pjt-1` 저장소는 건드리지 않음) — 그 저장소의 기본 템플릿 README와 `--allow-unrelated-histories`로 병합(README는 기존 프로젝트 문서를 유지, merge 커밋 `2957b01`) 후 push 완료.
- **Firebase Functions 배포 완료**: `firebase deploy --only functions:processRawLogs --project pjt2-c3b41` 성공 (`asia-northeast3`). Node 18 런타임이 decommission되어 20으로 올려야 했음(`functions/package.json`). 프로젝트에 원래 있던 무관한 `helloWorld` 함수는 손대지 않기 위해 `--only functions:processRawLogs`로 범위를 좁혀 배포(전체 `--only functions`로 하면 helloWorld 삭제 확인을 요구해서 중단시켰음).
- ppjt2 내부의 옛날 스텁(`ppjt2/1649641`, `ppjt2/1649641-pjt2`)은 사용자 요청으로 **정리하지 않고 그대로 둠**.

**아직 안 끝난 것 (다음 세션이 이어서 할 일)**:
1. 아래 2건은 team-lead/tester가 "실패는 아니지만 PM 확인 필요"로 보고한 경계 케이스 — 사용자와 상의해서 그대로 둘지 고칠지 결정 필요(SPEC_LOG_PJT.md §7 참고):
   - CODING_GUIDE §3 위반: `app.js`/`upload.js` 코드 주석이 한국어(규칙은 영어). team-lead가 최소수정원칙 때문에 임의로 안 고침.
   - `parseLog.js`의 음수 필터가 `-0`을 걸러내지 못함(스펙 미명시 극단 케이스).
2. team-lead 완료 보고 후 정책상 doc-writer로 사용자용 요약/사용법 문서를 만드는 단계가 남아있음(ORCHESTRATION.md 참고) — 아직 호출 안 함.
3. 실제 브라우저 종단 간 스모크 테스트(파일 업로드 → 실시간 화면 반영 확인)는 이 harness 환경(브라우저 자동화 없음)에서 못 했음 — Functions는 이미 배포됐으니 사용자가 직접 `1649641-pjt2/upload.html`에서 로그 파일을 올려보고 `index.html`에서 확인해보는 게 필요.
4. `pjt2/1649641-pjt2/`, `pjt2/1649641`(새 원격) 둘 다 아직 실제 GitLab으로 **push까지는 완료했지만, ppjt2 자체 저장소와는 별개**라는 점 계속 유의(이 harness 프로젝트의 git 작업과 혼동 금지).

## 네이티브 서브에이전트 인식 — 최종 확인됨 (더 이상 미해결 아님)

이전엔 "루트가 `pjt2-master`여서 스캔 범위 밖이었을 수 있다"는 가설이 있었으나, **`pjt2/ppjt2` 자체를 루트로 연 이번 세션에서도 여전히 `team-lead`/`tester`/`spec-writer`/`doc-writer`/`agent-builder`가 Agent 도구의 네이티브 `subagent_type`으로 뜨지 않음을 재확인했다**(뜨는 건 `claude`, `claude-code-guide`, `Explore`, `general-purpose`, `Plan`, `statusline-setup`뿐). 즉 루트 위치는 원인이 아니었다 — 이 harness는 애초에 `.claude/agents/*.md`의 커스텀 이름을 네이티브 서브에이전트 타입으로 지원하지 않는 것으로 최종 결론.

**앞으로도 계속** `subagent_type: "general-purpose"` + "`.claude/agents/<이름>.md` 정의를 그대로 따르라"는 프롬프트 우회 방식을 표준 호출법으로 쓴다(`ORCHESTRATION.md`의 "알려진 한계" 섹션과 일치, 추가 검증 불필요).

## 잊으면 안 되는 사용자 규칙 (세션이 바뀌면 자동으로 안 넘어옴)

- **git commit/tag/push는 항상 사용자와 상의한 뒤 결정한다.** PM(현재 세션)이 결과물을 
  만들었다고 해서 임의로 커밋하지 않는다. 이미 `.claude/settings.json`의 `permissions.ask`로
  기술적으로도 강제돼 있지만(`ORCHESTRATION.md` 참고), 이 원칙 자체를 잊지 말 것.
- **예외**: `scripts/checkpoint-commit.sh`를 통한 체크포인트 커밋은 team-lead가 통합·검증
  직후 자동으로 실행해도 된다 (상의 불필요, 롤백 안전망 목적) — 이번 라운드도 이 방식으로 `632f5d5` 커밋됨.
- **git 히스토리를 쓰는 주체는 PM(메인 세션)뿐이다.** team-lead 등 서브에이전트는 체크포인트
  스크립트 외의 git write 명령을 직접 실행하지 않는다.
- **`pjt2/1649641`은 `ppjt2`와 별개의 독립 git 저장소다** (원격: `lab.ssafy.com/s16/a20/20260730-pjt-1/1649641.git`). 이번 로그 관리 PJT 작업으로 그 안의 `index.html`을 직접 수정했지만(사용자 승인 — "직접 수정해도 된다"), 커밋은 아직 안 했고 별도로 사용자와 상의해서 그 저장소에서 진행해야 한다.

## 참고: 이전 세션의 Claude 메모리는 자동으로 안 넘어옴

`pjt2-master`를 루트로 했던 이전 세션에서 저장해둔 메모리(예: git 커밋 상의 규칙)는 프로젝트
경로가 달라서 새 세션(`pjt2/ppjt2` 루트)에 자동으로 안 보일 수 있다. 이 문서와
`ORCHESTRATION.md`가 그 역할을 대신한다 — 필요하면 이 문서 내용을 새 세션에서 다시 메모리로
저장해도 된다.
