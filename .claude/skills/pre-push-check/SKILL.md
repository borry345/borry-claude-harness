---
name: pre-push-check
description: 원격에 푸시하기 전에 시크릿 유출, 빌드 산출물 혼입, 원격 상태를 점검한다. git push 직전이나 의미있는 커밋을 만들기 전에 사용한다.
---

# 푸시 전 점검

푸시는 되돌리기 어렵고 외부에 반영된다. `ORCHESTRATION.md` "PM 행동 규칙"의 실행판이다.

## 1. 원격 상태 먼저 (강제 푸시 금지)

```bash
git fetch origin
git rev-parse --verify origin/main 2>/dev/null || echo "origin/main 없음 — 최초 푸시"
git status -sb | head -2
```

원격이 앞서 있으면 **강제 푸시하지 않고** 히스토리를 보존하는 방식(머지)을 쓴다.
원격 `main`이 이미 팀원 머지로 앞서 있던 적이 있다.

## 1-b. 스크래치가 디스크에 남아 있는지 (커밋 여부와 다른 질문)

```bash
ls -d .scratch 2>/dev/null && du -sh .scratch
```

**비어 있어야 한다.** 아래 2·6번은 "커밋·스테이징에 섞였는지"만 보므로, `.gitignore`된 스크래치는
그 점검을 **통과하면서 디스크에 남는다** — PJT5에서 133MB와 실제 시크릿 파일 8벌이 그렇게 남았다.
조립이 끝났으면 `team-lead.md`의 제거 의무대로 지워져 있어야 하고, 남아 있으면 PM이 지운다.

## 2. 스테이징에 금지 대상이 섞였는지

```bash
git diff --cached --name-only | grep -E "^(dist/|build/|\.scratch/|node_modules/)|(^|/)env\.js$"
```

**정규식 끝을 고정하라.** `env\.js`만 쓰면 커밋해야 하는 템플릿 `env.js.example`이 잡힌다
(실제로 오탐했다).

## 3. 추적 파일 시크릿 스캔

```bash
git ls-files | while read f; do
  [ -f "$f" ] && grep -lniE "AIza[0-9A-Za-z_-]{20,}|-----BEGIN" "$f"
done
```

**걸린 것은 하나씩 눈으로 확인한다.** 흔한 오탐: 테스트 플레이스홀더, 런타임 조회(키 이름만
있고 값은 없는 경우).

## 4. 빌드 산출물에 값이 인라인됐는지

번들러가 설정을 평문으로 구워 넣었는지 본다. **키 이름만 나와야 정상**이고 값이 나오면 실패다.

```bash
grep -coE "AIza[0-9A-Za-z_-]{20,}" dist/assets/*.js       # 0이어야 함
grep -oE "[A-Z_]*API_KEY|KAKAO_[A-Z_]+" dist/assets/*.js | sort | uniq -c   # 이름만
git check-ignore -v dist/env.js                           # 무시되는지
```

`.gitignore`의 `env.js` 패턴에 **슬래시가 없으면 어느 깊이에서든** 매치되므로 `dist/env.js`도
보호된다. 빌드가 `emptyOutDir`로 매번 지우고 다시 만든다면, 산출물이 존재한다는 것 자체가
복사 훅이 돌았다는 증거다(타임스탬프가 오래돼 보여도 Windows의 복사 API가 수정 시각을 보존한다).

## 5. 스크린샷·첨부를 커밋한다면

이미지에 개발자도구나 콘솔이 찍혔으면 키가 보일 수 있다. 다만 **사용자가 이미 확인했다고 하면
다시 열지 않는다** — 토큰만 쓴다.

## 6. 푸시 후

```bash
git ls-tree -r origin/main --name-only | grep -E "(^|/)env\.js$|^dist/|^\.scratch/|/node_modules/"
```

비어 있어야 한다. 여기서도 **끝 고정**을 잊지 말 것.
