// index.js — 대화형 메뉴 진입점 (F2 목록 조회, F6 마감일 초과 강조 표시 포함)
// 실행: node index.js
// 프로그램 실행 시 메뉴가 표시되고, 사용자가 종료를 선택할 때까지 계속 대화형으로 동작한다.

const readline = require('readline');
const {
  loadTasks,
  saveTasks,
  addTask,
  completeTask,
  deleteTask,
  isOverdue,
} = require('./taskStore');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: process.stdin.isTTY === true,
});

// NOTE: rl.question()'s callback/Promise API has a known race when the
// input stream is not an interactive TTY (piped/redirected input, as used
// by automated tests): several buffered lines can arrive in the same
// synchronous read, and by the time an `await`-deferred continuation calls
// rl.question() again, readline has already moved past the next line and
// the callback never fires (the process hangs). Reading through the
// async-iterator protocol instead pulls lines on demand and is race-free
// for both TTY and non-TTY input.
const lineIterator = rl[Symbol.asyncIterator]();

async function ask(question) {
  process.stdout.write(question);
  const { value, done } = await lineIterator.next();
  if (done) {
    // Input stream ended (EOF / stdin closed) — nothing more to read.
    console.log('\n입력이 종료되어 프로그램을 종료합니다.');
    rl.close();
    process.exit(0);
  }
  return value;
}

const MENU_TEXT = `
===== 할 일 관리 =====
1. 추가
2. 목록 보기
3. 완료 처리
4. 삭제
5. 종료
=======================
`;

// F2: 할 일 목록 조회 (+ F6: 마감일 초과 항목 강조 표시)
function printTaskList(tasks) {
  if (!tasks || tasks.length === 0) {
    console.log('할 일이 없습니다.');
    return;
  }
  tasks.forEach((task, idx) => {
    const num = idx + 1;
    const status = task.done ? '[완료]' : '[미완료]';
    const due = task.dueDate ? task.dueDate : '';
    const overdueLabel = isOverdue(task) ? ' [지연]' : '';
    // 예: 1. [미완료] 우유 사기 (마감일: 2026-09-01) [지연]
    let line = `${num}. ${status} ${task.title}`;
    line += due ? ` (마감일: ${due})` : ' (마감일: 없음)';
    line += overdueLabel;
    console.log(line);
  });
}

async function handleAdd(tasks) {
  const title = (await ask('제목을 입력하세요: ')).trim();
  if (title === '') {
    console.log('오류: 제목은 비어 있을 수 없습니다.');
    return tasks;
  }
  const dueDateRaw = (await ask('마감일을 입력하세요 (YYYY-MM-DD, 없으면 엔터): ')).trim();
  const dueDate = dueDateRaw === '' ? null : dueDateRaw;
  try {
    const updated = addTask(tasks, title, dueDate);
    saveTasks(updated);
    console.log('할 일이 추가되었습니다.');
    return updated;
  } catch (err) {
    console.log(`오류: ${err.message}`);
    return tasks;
  }
}

async function handleList(tasks) {
  printTaskList(tasks);
  return tasks;
}

async function handleComplete(tasks) {
  const numRaw = (await ask('완료 처리할 목록 번호를 입력하세요: ')).trim();
  const num = Number(numRaw);
  try {
    if (!Number.isInteger(num)) {
      throw new Error('목록 번호는 정수여야 합니다.');
    }
    const updated = completeTask(tasks, num);
    saveTasks(updated);
    console.log('완료 처리되었습니다.');
    return updated;
  } catch (err) {
    console.log(`오류: ${err.message}`);
    return tasks;
  }
}

async function handleDelete(tasks) {
  const numRaw = (await ask('삭제할 목록 번호를 입력하세요: ')).trim();
  const num = Number(numRaw);
  try {
    if (!Number.isInteger(num)) {
      throw new Error('목록 번호는 정수여야 합니다.');
    }
    const updated = deleteTask(tasks, num);
    saveTasks(updated);
    console.log('삭제되었습니다.');
    return updated;
  } catch (err) {
    console.log(`오류: ${err.message}`);
    return tasks;
  }
}

async function mainLoop() {
  let tasks = loadTasks();

  // eslint-disable-next-line no-constant-condition
  while (true) {
    console.log(MENU_TEXT);
    const choice = (await ask('메뉴를 선택하세요: ')).trim();

    switch (choice) {
      case '1':
        tasks = await handleAdd(tasks);
        break;
      case '2':
        tasks = await handleList(tasks);
        break;
      case '3':
        tasks = await handleComplete(tasks);
        break;
      case '4':
        tasks = await handleDelete(tasks);
        break;
      case '5':
        console.log('프로그램을 종료합니다.');
        rl.close();
        return;
      default:
        console.log('올바른 메뉴 번호를 입력하세요 (1-5).');
    }
  }
}

mainLoop().catch((err) => {
  console.error('예기치 않은 오류가 발생했습니다:', err.message);
  rl.close();
  process.exitCode = 1;
});
