---
name: runlog-append
description: RUN_LOG.md에 결정·이유·실패 이력을 CRLF를 보존하며 안전하게 덧붙인다. PM이 한 라운드를 마치고 기록을 남길 때 사용한다.
---

# RUN_LOG 안전 append

`RUN_LOG.md`는 `CLAUDE.md`가 지정한 **결정·이유·실패 이력의 유일한 소유자**다. PM만 쓴다 —
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
if not cur.endswith("\n"):
    cur += "\r\n"
with open("RUN_LOG.md", "w", encoding="utf-8", newline="") as f:
    f.write(cur + entry.replace("\n", "\r\n"))
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

`단독 LF = 0`, `이중 CR = 0`이어야 한다.

## 무엇을 남기는가

- **결정**: 무엇을, 왜. 사용자 결정이면 "PM 추천 → 사용자 변경" 여부를 같이 적는다.
- **실패**: 증상 → 원인 → 조치.
- **PM 자신이 틀린 것은 반드시 남긴다.** 안 남기면 다음 세션이 같은 전제를 반복한다.
- **에이전트가 PM을 반박해 PM이 틀린 것으로 밝혀진 건**은 교훈이 가장 크다.
- 프로젝트가 아니라 **하네스 레벨 교훈**이면 하네스 쪽 `RUN_LOG.md`와 `DESIGN_NOTES.md`에도 남긴다.
