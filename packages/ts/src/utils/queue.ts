interface TaskModel {
  data: unknown;
  executor?: ExecFn;
}

export type ExecFn = (task: TaskModel, done: () => void) => void;

export class Queue {
  tasks: TaskModel[];
  exec: ExecFn = (task: TaskModel, done: () => void) => {
    done();
  };
  constructor() {
    this.tasks = [];
  }

  add = (data: unknown, executor?: ExecFn) => {
    const _this = this;
    _this.tasks.push({ data, executor });
    if (_this.tasks.length === 1) {
      _this.runNext();
    }
  };

  runNext = () => {
    const _this = this;
    if (_this.tasks.length === 0) {
      return;
    }

    const task = _this.tasks[0];
    if (task.executor) {
      task.executor(task, _this.done);
    } else {
      _this.exec(task, _this.done);
    }
  };

  done = () => {
    const _this = this;
    _this.tasks.shift();
    _this.runNext();
  };

  process = (fn: ExecFn) => {
    const _this = this;
    _this.exec = fn;
  };
}
