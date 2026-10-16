---
name: eol-audit
description: Windows/Git Bash 환경에서 파일의 줄바꿈(CRLF/LF)을 바이트 단위로 정확히 검사하고 변환한다. git의 autocrlf 경고를 해석할 때, 문서나 코드를 편집한 뒤 개행이 바뀌지 않았는지 확인할 때 사용한다.
---

# 줄바꿈 바이트 감사

## 먼저 알아야 할 것 — 셸 도구는 거짓말을 한다

이 환경에서 **다음은 전부 틀린 답을 낸다**:

- `grep -c $'\r' file` — 파일에 따라 CR을 잘못 센다
- `tr -cd '\r' < file | wc -c` — 같은 문제
- `sed -i 's/\r$//' file` — 텍스트 모드라 `\r$` 앵커가 매치되지 않아 **조용히 실패**한다

실제로 이 때문에 한 문서를 LF로, 다른 문서를 CRLF로 **각각 오판**했다.
**반드시 Python 바이트 모드로 검사한다.**

## 검사 스크립트

```python
import os, sys
sys.stdout.reconfigure(encoding="utf-8")   # cp949 콘솔에서 한글·em-dash가 깨진다

def audit(path):
    b = open(path, "rb").read()
    crlf = b.count(b"\r\n")
    lf   = b.count(b"\n") - crlf
    cr   = b.count(b"\r") - crlf          # 고립 CR (손상 신호)
    dcr  = b.count(b"\r\r")              # 이중 CR — 변환을 두 번 먹인 손상
    kind = "CRLF" if crlf and not lf else ("LF" if lf and not crlf else "MIXED")
    return crlf, lf, cr, dcr, kind

for root, _, names in os.walk("."):
    if any(s in root for s in (".git", "node_modules")):
        continue
    for n in names:
        p = os.path.join(root, n)
        crlf, lf, cr, dcr, kind = audit(p)
        if kind == "MIXED" or cr or dcr:
            print("%-60s CRLF=%-5d LF=%-5d 고립CR=%-3d 이중CR=%-3d %s" % (p, crlf, lf, cr, dcr, kind))
```

## autocrlf 해석 — 경고를 결함으로 오인하지 말 것

`core.autocrlf=true`이면:

- **커밋 시 전부 LF로 정규화**된다 → **저장소 내용은 이미 균일**하다
- **체크아웃 시 CRLF로 변환**된다 → 작업트리는 CRLF가 된다
- `git diff`의 `LF will be replaced by CRLF` 경고는 **파일 문제가 아니라 autocrlf 잡음**이다

확인: `git config core.autocrlf` / `git ls-files --eol <path>` (`i/` = index, `w/` = worktree)

**따라서 작업트리의 파일 간 CRLF·LF 불일치는 커밋 내용에 영향이 없다.** 통일하려고 파일 전체를
건드리면 "주석만 바뀜" 같은 최소 diff 조건이 깨진다 — **한 파일 안의 혼재만 고치고 파일 간
불일치는 그대로 둔다.**

## 변환

```python
b = open(p, "rb").read()
b = b.replace(b"\r\n", b"\n").replace(b"\n", b"\r\n")   # 먼저 정규화해야 이중 CR이 안 생긴다
open(p, "wb").write(b)
```

**정규화를 먼저 하지 않으면 이중 CR이 생긴다.** 변환 후 반드시 위 검사로 `이중CR=0`을 확인한다.

## 한글 본문을 쓸 때

셸 heredoc + 유니코드 이스케이프로 한글을 쓰면 글자가 깨진다(실제 사고). **Edit/Write 도구로 직접
쓰거나** Python 스크립트를 파일로 저장해 실행한다. 셸 한 줄 `python -c "..."` 안에 백틱이 들어가면
bash가 명령 치환으로 먹고, 스크립트 본문에 삼중따옴표가 들어가면 제너레이터 문자열이 조기 종료된다
— 둘 다 실제로 났다. **Write 도구로 스크립트 파일을 만든 뒤 실행하는 것이 가장 안전하다.**
