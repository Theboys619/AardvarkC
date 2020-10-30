import Parser, { Expression, Scope, Statement } from "./parser.ts";
import { LexerGrammar, Token } from "./types.ts";
import * as Path from "https://deno.land/std@0.65.0/path/mod.ts";
import { ADKError, ADKSyntaxError } from "./errors.ts";
import { resolve } from "./mods/fs.ts";

export class Prettier {
  spaces: number;
  level: number;

  str: string;

  constructor(spaces?: number, level?: number) {
    this.spaces = spaces ?? 2;
    this.level = level ?? 0;

    this.str = "";

    this.setup();
  }

  setup() {
    for (let i = 0; i < this.level; i++) {
      this.str += "  ";
    }
  }

  getString() {
    return this.str;
  }

  getLevel(): number {
    return this.level;
  }
}

export default class Transpiler {
  ast: Scope;
  grammar: LexerGrammar;
  filepath: string;

  isTop: boolean;

  mainIndex: number;
  code: string;

  constructor(parser: Parser) {
    this.ast = parser.ast;
    this.grammar = parser.grammar;
    this.filepath = parser.filepath;

    this.isTop = true;

    this.code = "";
    this.mainIndex = 0;
  }

  async defineLib(filepath: string) {
    const fullpath = Path.resolve(filepath);
    const data = new TextDecoder("utf8").decode(await Deno.readFile(fullpath));

    this.code += data + "\n\n\n";
  }

  async defineLibs(filepaths: string[]) {
    for (const filepath of filepaths) {
      const fullpath = resolve(filepath);
      const data = new TextDecoder("utf8").decode(await Deno.readFile(fullpath));

      this.code += data + "\n\n";
    }
  }

  transpile(expr: any = this.ast, spacing: Prettier = new Prettier(2, 1)) {
    const functions: { [x: string]: any } = {};
    const variables: Map<string, boolean> = new Map;

    function createScope(exp: Scope, spacing?: Prettier) {
      let code = "";

      const newSpacing = new Prettier(2, (spacing?.getLevel() ?? 0) + 1);

      if (exp.name == "main") {
        code = "int main(int argc, char** argv) {\n" + (spacing?.getString() ?? "");
        code += exp.block.map((value: string, index: number, array: any[]) => CPP(array[index], spacing)).join(";\n" + (spacing?.getString() ?? ""));
        code += ";\n};";
      } else {
        code = newSpacing.getString() + exp.block.map((value: string, index: number, array: any[]) => CPP(array[index], newSpacing)).join(";\n" + newSpacing.getString());
        code += ";\n" + (spacing?.getString() ?? "");
      }
      return code;
    }

    function createType(exp: any, spacing?: Prettier) {
      if (exp.type == "String")
        return "std::string(" + JSON.stringify(exp.value) + ")";
      return JSON.stringify(exp.value);
    }

    function createBinary(exp: any, spacing?: Prettier): string {
      return "(" + CPP(exp.left, spacing) + " " + exp.op + " " + CPP(exp.right, spacing) + ")";
    }

    function createIf(exp: Statement, spacing?: Prettier): string {
      let code = "if " + CPP(exp.value.condition, spacing) + " {\n"
        + CPP(exp.value.then, spacing)
        + "}";

      if (exp.value.else) code += " else " + CPP(exp.value.else, spacing);

      return code;
    }

    function createIdentifier(exp: Token, spacing?: Prettier): string {
      return exp.value;
    }

    function createAssign(exp: Expression, spacing?: Prettier): string {
      if (variables.has(exp.left.value))
        return `${exp.left.value} ${exp.op} ${CPP(exp.right)}`;
      else
        variables.set(exp.left.value, true);

      return `Dynamic ${exp.left.value} ${exp.op} ${CPP(exp.right, spacing)}`;
    }

    function createFunc(exp: Statement, spacing?: Prettier): string {
      const name = exp.value.name.value;

      functions[name] = `Dynamic ${name}(${exp.value.parameters.length > 0
          ? "Dynamic "
          : ""}${exp.value.parameters.map((value: string, index: number, array: any[]) => CPP(array[index], new Prettier(2, 0))).join(", ")}) {\n${CPP(exp.value.scope, new Prettier(2, 0))}};`;

      return "";
    }

    function createFuncCall(exp: Statement, spacing?: Prettier): string {
      const { name, args } = exp.value;

      return `${name.value}(${args.map((value: string, index: number, array: any[]) => CPP(array[index], spacing)).join(", ")})`;
    }

    function createReturn(exp: Statement, spacing?: Prettier): string {
      return `return ${CPP(exp.value, spacing)}`;
    }

    function CPP(exp: any, spacing?: any): string {
      switch (exp.type) {
        case "String":
        case "Number":
        case "Boolean":
          return createType(exp, spacing);
  
        case "Scope":
          return createScope(exp, spacing);
  
        case "Assign":
          return createAssign(exp, spacing);
  
        case "Identifier":
          return createIdentifier(exp, spacing);
  
        // case "Increment":
        //   // TODO
        //   break;
  
        // case "Decrement":
        //   // TODO
        //   break;
  
        case "Function":
          return createFunc(exp, spacing);
  
        case "FunctionCall":
          return createFuncCall(exp, spacing);
  
        case "Return":
          return createReturn(exp, spacing);
  
        case "Binary":
          return createBinary(exp, spacing);
  
        case "If":
          return createIf(exp, spacing);
  
        // case "AccessProp":
        //   // TODO
        //   break;
  
        // case "Interface":
        //   // TODO
        //   break;
  
        // case "ForLoop":
        //   // TODO
        //   break;
        default: {
          // TODO
          return "";
        }
      }
    }
    
    let code = CPP(expr, spacing);
    let functionCode = "";

    for (const name in functions) {
      functionCode = functions[name];
    }

    functionCode += "\n\n" + code;
    functionCode = this.code + functionCode;

    return functionCode.replace(/\s+\;/g, "");
  }
}