import { appendFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { Queue } from "../utils/queue";

/**
 *
 */
class Logger {
  private filePath: string | undefined;
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
      if (file) {
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
      } else {
        console.log(`Logger ${file} do not exist`);
      }
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
