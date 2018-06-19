const getPriority = (level: string): number => {
  switch (level) {
    case "verbose":
      return 1;
    case "warning":
      return 2;
    case "error":
      return 3;
    default:
      return -1;
  }
};
export class Logger {
  logLevel: string = "";
  setLevel(level: string) {
    this.logLevel = level;
  }
  log(level: string, message: string) {
    const messagePriority = getPriority(level);
    const loggerPriority = getPriority(this.logLevel);
    if (messagePriority >= loggerPriority) {
      if (level === "error") {
        console.error(message);
      } else if (level === "warning") {
        console.warn(message);
      } else {
        console.log(message);
      }
    }
  }
}
