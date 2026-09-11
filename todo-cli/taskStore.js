'use strict';

/**
 * taskStore.js
 *
 * Data persistence + core task operations for the To-Do CLI (F1, F3, F4, F5).
 *
 * Task object shape (shared contract with the UI layer — do not rename):
 *   {
 *     title: string,            // one-line task title, required, non-empty
 *     done: boolean,            // completion state, defaults to false on creation
 *     dueDate: string | null,   // 'YYYY-MM-DD' or null if no due date was given
 *   }
 *
 * Tasks are stored as a JSON array in tasks.json, located next to this file
 * (resolved via __dirname, independent of process.cwd()).
 */

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, 'tasks.json');

// Matches YYYY-MM-DD with 4-digit year, 2-digit month, 2-digit day.
const DATE_FORMAT_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Validates that dateStr is a string in 'YYYY-MM-DD' format representing a
 * real calendar date (e.g. rejects 2024-02-30).
 */
function isValidDateString(dateStr) {
  if (typeof dateStr !== 'string' || !DATE_FORMAT_RE.test(dateStr)) {
    return false;
  }

  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const year = Number(yearStr);
  const month = Number(monthStr);
  const day = Number(dayStr);

  if (month < 1 || month > 12 || day < 1 || day > 31) {
    return false;
  }

  // Construct a UTC date and check it round-trips; this catches invalid
  // combinations like Feb 30, Apr 31, etc.
  const date = new Date(Date.UTC(year, month - 1, day));
  return (
    date.getUTCFullYear() === year &&
    date.getUTCMonth() === month - 1 &&
    date.getUTCDate() === day
  );
}

/**
 * Returns today's date as a 'YYYY-MM-DD' string in local time.
 */
function todayString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Reads the JSON data file and returns an array of task objects.
 * Creates the file with an empty array if it doesn't exist yet.
 */
function loadTasks() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, '[]', 'utf8');
    return [];
  }

  const raw = fs.readFileSync(DATA_FILE, 'utf8');
  if (!raw || !raw.trim()) {
    return [];
  }

  let parsed;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`할 일 데이터 파일(${DATA_FILE})을 읽는 중 오류가 발생했습니다: ${err.message}`);
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`할 일 데이터 파일(${DATA_FILE})의 형식이 올바르지 않습니다 (배열이 아님).`);
  }

  return parsed;
}

/**
 * Writes the given array back to the JSON data file.
 */
function saveTasks(tasks) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2), 'utf8');
}

/**
 * Validates title/dueDate and appends a new task to the given tasks array.
 * Does NOT persist to disk — caller decides when to call saveTasks().
 * Returns the updated tasks array.
 */
function addTask(tasks, title, dueDate) {
  if (typeof title !== 'string' || title.trim().length === 0) {
    throw new Error('할 일 제목은 비어 있을 수 없습니다.');
  }

  let normalizedDueDate = null;
  if (dueDate !== null && dueDate !== undefined && dueDate !== '') {
    if (!isValidDateString(dueDate)) {
      throw new Error(
        `마감일 형식이 올바르지 않습니다: '${dueDate}'. 'YYYY-MM-DD' 형식의 실제 존재하는 날짜를 입력하세요.`
      );
    }
    normalizedDueDate = dueDate;
  }

  const newTask = {
    title: title.trim(),
    done: false,
    dueDate: normalizedDueDate,
  };

  tasks.push(newTask);
  return tasks;
}

/**
 * Resolves a 1-based listNumber to a valid array index, throwing a clear
 * error if it's out of range or not a valid integer.
 */
function resolveIndex(tasks, listNumber) {
  const n = Number(listNumber);
  if (!Number.isInteger(n) || n < 1 || n > tasks.length) {
    throw new Error(`유효하지 않은 목록 번호입니다: '${listNumber}'.`);
  }
  return n - 1;
}

/**
 * Marks the task at the given 1-based listNumber as done.
 * Re-completing an already-done task is a no-op (not an error).
 * Returns the updated tasks array.
 */
function completeTask(tasks, listNumber) {
  const index = resolveIndex(tasks, listNumber);
  tasks[index].done = true;
  return tasks;
}

/**
 * Removes the task at the given 1-based listNumber, regardless of done
 * state. Returns the updated tasks array.
 */
function deleteTask(tasks, listNumber) {
  const index = resolveIndex(tasks, listNumber);
  tasks.splice(index, 1);
  return tasks;
}

/**
 * Returns true only if the task has a dueDate, that dueDate is strictly
 * before today's date (date-only comparison), and the task is not done.
 */
function isOverdue(task) {
  if (!task || !task.dueDate || task.done) {
    return false;
  }
  return task.dueDate < todayString();
}

module.exports = {
  loadTasks,
  saveTasks,
  addTask,
  completeTask,
  deleteTask,
  isOverdue,
};
