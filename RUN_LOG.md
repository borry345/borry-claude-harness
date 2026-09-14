# 실행 로그 (하네스 자체 전용)

**범위(2026-09-14 정리, 이후 "에이전트만을 위한 범용 하네스" 원칙으로 확정)**: 이 파일은
**하네스 자체의 변경**만 기록한다 — 에이전트 신설/수정(`.claude/agents/*.md`), 정책·규칙 변경
(`ORCHESTRATION.md`/`CODING_GUIDE.md` 개정) 등. 특정 프로젝트의 기능 구현을 위한 에이전트
디스패치(구현/통합/테스트)는 여기 적지 않는다 — 그건 **이 하네스 폴더 바깥에 있는, 그 프로젝트
자신의 `RUN_LOG.md`**에 적는다. 판단 기준과 세부 규칙은 `ORCHESTRATION.md`의 "RUN_LOG.md 범위
규칙" 참고.

이전에는 이 파일에 프로젝트별 로그가 섞여 있었고(todo-cli, 로그 데이터 관리 PJT 등), 한때는
`todo-cli/`처럼 실제 프로젝트 폴더가 하네스 안에 들어와 있기도 했다. 전부 하네스 폴더 바깥으로
제거·이전 완료 — 이 하네스는 이제 프로젝트 인스턴스를 전혀 포함하지 않는다.

(정책 근거: `ORCHESTRATION.md`의 "루프/폭주 방지 정책" 참고)

## 형식

```
[YYYY-MM-DD HH:MM] 호출자 → 대상 에이전트 (대상: 작업명, 시도 N회차) — 사유
```

## 로그

[2026-09-14] PM → agent-builder (대상: tech-spec-writer 신설, 시도 1회차) — hollinone 프로젝트에서 발견된 gap(spec-writer가 코드를 못 읽어 기술 스펙 작성에 못 씀) 해소를 위해 신규 에이전트 정의 요청. 결과: `.claude/agents/tech-spec-writer.md` 작성 완료, 권한 Read/Grep/Glob/Write 부여(Edit·Bash 없음 — 읽기전용/미실행 제약), 웹 문서 접근이 필요하면 WebFetch 추가 여부를 PM이 재확인해야 함을 보고받음. ORCHESTRATION.md 팀 구조도·에이전트 등록표에 반영 완료.
[2026-09-14] PM — tester.md에 "회귀 우선" 규칙 추가(0단계: 기존 테스트 먼저 재실행 후 신규 테스트는 누적, 삭제 금지) — 사용자 승인, 하네스 리뷰 개선사항 #1 반영.
[2026-09-14] PM — RUN_LOG.md 범위 정리: 하네스 로그와 프로젝트별 로그를 분리(위 범위 설명 참고), ORCHESTRATION.md에 "RUN_LOG.md 범위 규칙" 신설 — 사용자 승인.
[2026-09-14] PM — 폴더/파일 구조 정리 1차(사용자 승인): 깨진 gitlink `1649641`(서브모듈 미등록, 빈 폴더) 제거 / `SPEC.md`(todo-cli 것)를 `todo-cli/SPEC.md`로 이동해 `RUN_LOG.md`와 위치 통일 / 코드가 이 워크스페이스에 없는 로그PJT 관련 파일(`SPEC_LOG_PJT.md`, `16-C-1-02.pdf`, `RUN_LOG_ARCHIVE.md`)을 `_archive/log-pjt/`로 통합 이동 + README 추가 / `HANDOFF.md`를 전면 재작성(기존 내용이 거의 전부 `pjt2/ppjt2`라는 다른 사본의 프로젝트 진행상황이었음 — ORCHESTRATION.md와 중복되는 일반 지식은 제거하고 하네스 레벨 정보만 남김, "완료된 프로젝트 SPEC도 매번 필수로 읽어라"던 잘못된 읽기 순서 수정) / `CODING_GUIDE.md` §6의 존재하지 않는 워크스페이스 경로 예시 문구 일반화.
[2026-09-14] PM — 폴더/파일 구조 정리 2차(사용자 확정: "구체적인 프로젝트가 아니라 에이전트만을 위한 하네스"): 1차에서 만든 `_archive/log-pjt/`를 완전히 삭제(원본이 `pjt2-master/pjt2/ppjt2`에 이미 있어 중복이었고, 범용 템플릿에 프로젝트 구체 내용을 남기지 않는다는 원칙과 배치됨) / `todo-cli/`(코드+SPEC.md+RUN_LOG.md 전체)도 동일 원칙으로 완전히 제거 — 첫 시험 운행 증빙은 `CHANGELOG.md`의 텍스트 요약만으로 충분, 실제 프로젝트 폴더가 하네스 안에 있을 필요 없음 / `ORCHESTRATION.md`·`CODING_GUIDE.md` 상단의 특정 프로젝트명(`ppjt2`) 하드코딩 문구를 전부 일반화 / `HANDOFF.md`·`ORCHESTRATION.md`(RUN_LOG.md 범위 규칙)를 "하네스는 프로젝트 폴더를 절대 포함하지 않는다"는 확정 원칙에 맞춰 재정리.
[2026-09-14] PM — 문서 네이밍·배치·작업트리 규칙 신설(사용자 요청: "md 문서가 다양한 이름/위치로 만들어지는 걸 방지"): `ORCHESTRATION.md`의 "RUN_LOG.md 범위 규칙"을 "문서 네이밍·배치·작업트리 규칙"으로 확장 — 표준 문서명 고정 표(SPEC.md/RUN_LOG.md/ORCHESTRATION.md 등, 변형 명명 금지) + 작업트리 확인 규칙(작업 완료 보고 전 `git status` 확인, `git add`는 관련분만) 추가. 팀 구조도의 `spec.md`/`tech_spec.md`(소문자, 파일 2개로 분리) 표기를 `SPEC.md` 단일 파일(spec-writer가 만들고 tech-spec-writer가 이어서 확장)로 정정 — `tech-spec-writer.md`의 기본 출력 파일명도 `TECH_SPEC.md` → `SPEC.md`로 수정.
[2026-09-14] PM — 위 항목 정정(사용자 질문 계기: "spec-writer와 tech-spec-writer가 같은 SPEC.md를 써도 되나?"): 단일 SPEC.md 공유는 파일 소유권 원칙(한 파일=한 소유자, todo-cli taskStore.js 사고가 근거) 위반이자, 두 에이전트 산출물 구조가 달라(tech-spec-writer만의 "기존 코드 구조 분석"/"신규 구현 함수 명세" 섹션) 병합 실수 위험이 있다고 판단해 재분리함 — `SPEC.md`(spec-writer 전용 소유)와 `TECH_SPEC.md`(tech-spec-writer 전용 소유, SPEC.md는 참조만) 두 파일 체제로 최종 확정. `ORCHESTRATION.md` 표/팀 구조도, `tech-spec-writer.md` 산출물 규약 전부 재수정. 이름은 여전히 고정(TECH_SPEC.md도 표준명 목록에 정식 등재) — "이름 통일"과 "파일 통합"은 별개 문제였음. 또한 "작업트리 확인 규칙"에 "하네스 저장소 git status에 프로젝트 문서가 보이면 배치 규칙 위반 신호"라는 교차 참조를 명시적으로 추가(기존엔 배치 규칙과 별개로만 존재해 연결이 안 돼 있었음).
