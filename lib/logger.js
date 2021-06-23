class Logger {
  static print(type, ...args) {
    const e = new Error();
    const [,,,raw] = e.stack.replace(/  +/g, '').split('\n');
    const caller = raw.split('(').pop().split(')').shift();
    console[type](args, caller);
  }

  static log(...args) {
    this.print('log', ...args);
  }

  static error(...args) {
    this.print('error', ...args);
  }
}

export default Logger;
