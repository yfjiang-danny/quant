import { appendFile } from "fs/promises";
import moment from "moment";
import path from "path";
import { logRootPath } from "../common/paths";
import { Queue } from "../utils/queue";

/**
 *
 */
export class Logger {
  private filePath: string | undefined;
  queue: Queue;
  constructor(filePath?: string) {
    if (!filePath) {
      this.filePath = path.resolve(logRootPath, "quant.log");
    } else {
      this.filePath = filePath;
    }

    const _this = this;
    this.queue = new Queue();
    this.queue.process(function (job, done) {
      const file = (job.data as any).output || _this.filePath;

      delete (job.data as any).output;

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

  info = (msg: unknown, output?: string) => {
    this.queue.add({
      time: moment().format("YYYY-MM-DD HH:mm:SS"),
      message: msg,
      output,
    });
  };
}

// Logger
export const logger = new Logger();
