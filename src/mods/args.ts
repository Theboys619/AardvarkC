export class Args {
  args: { [x: string]: string };
  argIndex: { [x: string]: string };
  argNames: { [x: string]: number };

  length: number;

  constructor() {
    this.args = {};
    this.argIndex = {};
    this.argNames = {};

    this.length = 0;
  }

  addArg(arg: string, value: any): Args {
    this.args[arg] = value;
    this.argIndex[this.length] = arg;
    this.argNames[arg] = this.length;
    ++this.length;

    return this;
  }

  hasArg(arg: string | number): boolean {
    if (typeof arg == "number") {
      return this.argIndex.hasOwnProperty(arg);
    } else {
      return this.args.hasOwnProperty(arg);
    }
  }

  getArg(arg: string | number): string {
    if (this.hasArg(arg)) {
      if (typeof arg == "string") {
        return this.args[arg];
      } else if (typeof arg == "number") {
        return this.args[this.argIndex[arg]];
      }
    }
      
    return "";
  }

  indexOf(arg: string): number {
    if (!this.hasArg(arg)) return -1;

    return this.argNames[arg];
  }
}

export default function formatArgs(argv: string[]): Args {
  const args = new Args();

  for (const arg of argv) {
    let value: string = "1";
    if (arg.includes("=")) value = arg.split("=")[1];
    else if (!arg.includes("--")) value = arg;

    args.addArg(arg.replace(/=.*/, ""), value);
  }

  return args;
}