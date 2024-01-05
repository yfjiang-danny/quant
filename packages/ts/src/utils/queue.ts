interface TaskModel {
  data: unknown;
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

  add = (data: unknown) => {
    this.tasks.push({ data });
    if (this.tasks.length === 1) {
      this.runNext();
    }
  };

  runNext = () => {
    if (this.tasks.length === 0) {
      return;
    }

    const task = this.tasks[0];
    this.exec(task, this.done);
  };

  done = () => {
    this.tasks.shift();
    this.runNext();
  };

  process = (fn: ExecFn) => {
    this.exec = fn;
  };
}
