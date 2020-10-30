// Dependencies
import * as Path from "https://deno.land/std/path/mod.ts";
import { LexerGrammar } from "./src/types.ts";

// Custom Modules
import formatArgs, { Args } from "./src/mods/args.ts";
import { readFile, writeFile } from "./src/mods/fs.ts";

import { ADKFileNotFound } from "./src/errors.ts";
import Lexer from "./src/lexer.ts";
import Parser from "./src/parser.ts";
import Transpiler from "./src/transpiler.ts";

// Other Stuff
async function runFile(args: Args, fileName: string) {
  const debug: number = parseInt(args.getArg("--debug") || "0");
  const resolvedFile: string = Path.resolve(fileName);
  const fileNoExt = fileName.replace(/\.[a-zA-Z]*$/, "");

  // console.log(fileName, resolvedFile);

  const input = await readFile(resolvedFile);
  if (!input)
    throw new ADKFileNotFound(`Could not find file: '${fileName}'`);

  const grammar: LexerGrammar = {
    Ignore: [
      ";",
      "\n"
    ],
    Whitespace: [
      " ",
      "\t",
      "\r"
    ],

    InlineComment: "//",
    BlockComment: [
      "/",
      "\\"
    ],

    Keywords: ["True", "False", "funct", "if", "while", "return"],
    Operators: ["=", "==", "!=", "+=", "<", ">", "<=", ">="],
    BinOperators: ["*", "/", "%", "+", "-"],

    Datatypes: [],
    Delimiters: ["(", ")", "{", "}", ",", ".", ":", ";"],

    Digits: "0123456789",
    Strings: ["\"", "\'"],
    Special: ["$", "#", "_"]
  };

  const lexer = new Lexer(input, resolvedFile, grammar);
  const tokens = lexer.tokenize();

  if (debug > 0)
    console.log(tokens);

  const parser = new Parser(lexer);
  // parser.defineModules(["stdio.adk"]);

  const ast = parser.parse();

  if (debug > 0)
    console.log(ast.block);

  const transpiler = new Transpiler(parser);
  await transpiler.defineLibs(["./src/builtIns/langCPP.cpp", "./src/builtIns/stdio.cpp"]);

  const code = transpiler.transpile();

  if (debug > 0)
    console.log(code);

  await writeFile(Path.resolve(`./${fileNoExt}.cpp`), code);
}


// Main Function
function main(argc: number, argv: string[]) {
  const args = formatArgs(argv);

  if (args.hasArg("run")) {
    const fileName = args.getArg(args.indexOf("run") + 1)
    runFile(args, fileName);
  }
}

// Bootstrapping
if (import.meta.main) {
  main(Deno.args.length, [...Deno.args]);
}