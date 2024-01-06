import { appendFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { Queue } from "../utils/queue";

/**
 *
 */
class Logger {
  private filePath: string;
  queue: Queue;
  constructor(filePath?: string) {
    if (!filePath) {
      this.filePath = path.resolve(__dirname, "quant.log");
    } else {
      this.filePath = filePath;
    }

    const _this = this;
    this.queue = new Queue();
    this.queue.process(function (job, done) {
      const file = _this.filePath;
      appendFile(file, JSON.stringify(job.data) + "\n").then(
        () => {
          //
          done();
        },
        (err) => {
          console.log(err);
          done();
        }
      );
    });
  }

  setFilePath = (filePath: string) => {
    this.filePath = filePath;
  };

  info = (msg: unknown) => {
    this.queue.add({
      time: moment().format("YYYY-MM-DD HH:mm:SS"),
      message: msg,
    });
  };
}

// Logger
export const logger = new Logger();
