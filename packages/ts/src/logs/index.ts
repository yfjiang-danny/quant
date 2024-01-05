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

    const file = this.filePath;
    this.queue = new Queue();
    this.queue.process(function (job, done) {
      appendFile(file, JSON.stringify(job.data)).then(
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

  info(msg: unknown) {
    this.queue.add({
      time: moment().format("YYYY-MM-DD HH:mm:SS"),
      message: msg,
    });
  }
}

// Logger
export const logger = new Logger();
