---
name: runlog-append
description: RUN_LOG.md(실행 일지)에 디스패치·비용·실패 이력과 결정 한 줄을 파일의 기존 개행을 보존하며 안전하게 덧붙인다. 결정의 전체 내용은 DECISIONS.md 항목으로 쓴다. PM이 한 라운드를 마치고 기록을 남길 때 사용한다.
---

# RUN_LOG 안전 append

`RUN_LOG.md`는 **실행 일지**(디스패치·비용·실패·사고·절차 위반)다. 결정의 현재 상태와 이유는
`DECISIONS.md`가 소유한다(2026-10-27 분리). 결정이 나면 RUN_LOG에는 **한 줄**(번호·요지·"PM 추천 →
사용자 변경" 여부)만 남기고, 결정·이유·버린 대안·반영 위치·변경 이력은 `DECISIONS.md`의 해당 항목에
`Edit`로 쓴다 — 항목을 지우지 않고 상태 변경은 날짜와 함께 덧붙인다. 두 파일 모두 PM만 쓴다 —
모든 서브에이전트 디스패치에 "RUN_LOG를 손대지 마세요"를 넣는다(길어서 읽히면 비용만 든다).

## 방법

셸 한 줄로 쓰지 말고 **스크립트 파일을 만들어 실행**한다. 본문에 백틱이 들어가면 bash가 명령
치환으로 먹는다(실제 사고). 스크립트는 Write 도구로 만드는 것이 가장 안전하다.

```python
import sys
sys.stdout.reconfigure(encoding="utf-8")

entry = (
    "[YYYY-MM-DD] PM — 한 줄 요지.\n"
    "본문. 결정이면 근거를, 실패면 증상과 원인을 적는다.\n"
)

with open("RUN_LOG.md", "r", encoding="utf-8", newline="") as f:
    cur = f.read()
crlf = cur.count("\r\n")
eol = "\r\n" if crlf >= cur.count("\n") - crlf else "\n"  # 파일의 기존 개행을 따른다 (프로젝트 RUN_LOG는 LF인 경우가 있다)
if not cur.endswith("\n"):
    cur += eol
with open("RUN_LOG.md", "w", encoding="utf-8", newline="") as f:
    f.write(cur + entry.replace("\n", eol))
```

`newline=""`가 핵심이다 — 없으면 Python이 개행을 임의로 변환한다.

## 쓴 뒤 반드시 검사

```python
b = open("RUN_LOG.md", "rb").read()
print("줄수:", b.count(b"\n"),
      "| CRLF:", b.count(b"\r\n"),
      "| 단독 LF:", b.count(b"\n") - b.count(b"\r\n"),
      "| 이중 CR:", b.count(b"\r\r"))
```

CRLF 파일이면 `단독 LF = 0`, LF 파일이면 `CRLF = 0`이어야 하고, `이중 CR = 0`은 항상이다. (2026-10-27:
이전 판은 CRLF를 강제해 LF인 프로젝트 RUN_LOG에 쓰면 개행이 섞였다.)

## 무엇을 남기는가

- **결정**: 한 줄 — 번호, 요지, "PM 추천 → 사용자 변경" 여부. 전체(결정·이유·대안·반영 위치)는 `DECISIONS.md`.
- **실패**: 증상 → 원인 → 조치.
- **PM 자신이 틀린 것은 반드시 남긴다.** 안 남기면 다음 세션이 같은 전제를 반복한다.
- **에이전트가 PM을 반박해 PM이 틀린 것으로 밝혀진 건**은 교훈이 가장 크다.
- 프로젝트가 아니라 **하네스 레벨 교훈**이면 하네스 쪽 `RUN_LOG.md`와 `DESIGN_NOTES.md`에도 남긴다.
