import { LexerGrammar, Token, Precedence } from "./types.ts";
import { ADKError, ADKSyntaxError } from "./errors.ts";
import Lexer from "./lexer.ts";

import * as fs from "https://deno.land/std@0.69.0/fs/mod.ts";
import * as Path from "https://deno.land/std@0.63.0/path/mod.ts";

import { isOfAny } from "./mods/reduce.ts";
import { readFile, resolve } from "./mods/fs.ts";

const { os } = Deno.build;

const PREC: Precedence = {
	"=": 1,

	"&": 2,
	"^": 3, "xor": 3,

	"and": 4, "&&": 4,
	"or": 5, "||": 5,

	"<": 7, ">": 7, "<=": 7, ">=": 7, "==": 7, "!=": 7,

	"+": 10, "-": 10,
	"*": 20, "/": 20, "%": 20,
};

export class Expression {
	type!: string;

	left!: any;
	op!: string;
	right?: any;

	constructor(
		type: string,
		left: any,
		op: string = "none",
		right?: any
	) {
		Object.assign(
			this, {
				type,
				left,
				op,
				right
			}
		);
	}
}

export class Statement {
	type: string;
	value: any;

	constructor(type: string, value: any = {}) {
		this.type = type;
		this.value = value;
	}
};

export class Scope {
	type: string;
	name: string;
	block: any[];

	constructor(name: string = "Scope", block: any[] = []) {
		this.type = "Scope";
		this.name = name;
		this.block = block;
	}
}

// the 'p' before methods stands for parse
// the '$' before methods stands for parse if matches and return the parsed data or return the token back

export default class Parser { // Modify the parser as you please
	lexer?: Lexer;
	tokens!: Token[];
	grammar!: LexerGrammar;
  filepath!: string;
	input!: string;
	lines!: string[];

	curTok!: Token;
	pos!: number;

	ast!: Scope;
	libs!: Record<string, {
		filepath: string,
		filename: string
	}>;

	constructor(lexer?: Lexer) {
		Object.assign(
			this, {
				lexer,
				tokens: lexer ?.tokens ?? [],
				grammar: lexer ?.grammar ?? {},
        filepath: lexer ?.filepath ?? "Unknown",
				input: lexer ?.input ?? "",
				lines: lexer ?.input ? lexer.input.split("\n") : [],

				curTok: lexer ?.tokens[0] ?? {},
				pos: 0,

				ast: new Scope("main"),
				libs: {}
			}
		);
	}

	addNewToken(type: string, value: any) {
		this.tokens.splice(this.pos, 0, {
			type,
			value,
			index: 0,
			line: 0
		});
		++this.pos;

		this.advance(-1);
	}

	advance(num: number = 1): Token { // Get the next token 
		this.pos += num;
		this.curTok = this.tokens[this.pos];

		return this.curTok;
	}

	peek(num: number = 1): Token { // Peek the next token or previous
		return this.tokens[this.pos + num];
	}

	defineModule(filepath: string, filename: string) {
		this.libs[filename.replace(/\..+$/, "")] = {
			filename,
			filepath
		}
  }
  
  defineModules(filenames: string[]) {
    for (const filename of filenames) {
			const path = resolve(`./modules/${filename}`);
			
			this.libs[filename.replace(/\..+$/, "")] = {
				filename,
				filepath: path
			};
    }
  }

	// Helping hand methods //

	constructNull(): Token {
		const {
			index,
			line
		} = this.peek(-1);
		return {
			type: "Null",
			value: null,
			index,
			line
		};
	}

	isKeyword(
		value?: string,
		peek?: Token
	): boolean {
		if (peek) {
			return peek.type == "Keyword"
				&& (!value || peek.value == value);
		}

		return this.curTok.type == "Keyword"
			&& (!value || this.curTok.value == value);
	}

	isDatatype(
		value?: string,
		peek?: Token
	): boolean {
		if (peek) {
			return peek.type == "Datatype" && (!value || peek.value == value);
		}

		return this.curTok.type == "Datatype" && (!value || this.curTok.value == value);
	}

	isIdentifier(
		value?: string,
		peek?: Token
	): boolean {
		if (peek) {
			return peek.type == "Identifier" && (!value || peek.value == value);
		}

		return this.curTok.type == "Identifier" && (!value || this.curTok.value == value);
	}

	isDelimiter(
		value?: string,
		peek?: Token
	): boolean {
		if (peek) {
			return peek.type == "Delimiter" && (!value || peek.value == value);
		}

		return this.curTok.type == "Delimiter" && (!value || this.curTok.value == value);
	}

	isOperator(value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == "Operator" && (!value || peek.value == value);
		}

		return this.curTok.type == "Operator" && (!value || this.curTok.value == value);
	}

	isBinOperator(value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == "BinOperator" && (!value || peek.value == value);
		}

		return this.curTok.type == "BinOperator" && (!value || this.curTok.value == value);
	}

	isNumber(value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == "Number" && (!value || peek.value == value);
		}

		return this.curTok.type == "Number" && (!value || this.curTok.value == value);
	}

	isString(value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == "String" && (!value || peek.value == value);
		}

		return this.curTok.type == "String" && (!value || this.curTok.value == value);
	}

	isLinebreak(value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == "Linebreak" && (!value || peek.value == value);
		}

		return this.curTok.type == "Linebreak" && (!value || this.curTok.value == value);
	}

	isCustom(type: string, value?: string, peek?: Token): boolean {
		if (peek) {
			return peek.type == type && (!value || peek.value == value);
		}

		return this.curTok.type == type && (!value || this.curTok.value == value);
	}

	isIgnore(peek?: Token): boolean {
		if (peek) {
			return this.grammar.Ignore.includes(peek.value);
		}

		return this.grammar.Ignore.includes(this.curTok.value);
	}

	isEOF(): boolean {
		return this.curTok.type == "EOF";
	}

	// Pretty much like expecting something, EX: skipOver("if")
	// If the curTok is not an if Statement throw an error
	skipOver(
		value?: string[] | string,
		type?: string, // = ""
		required?: boolean
	): void {
		let currentValue = "";
		let index = 0;

		const nextInput = (): any => {

			if (typeof value === "undefined") {
				if (type && this.isCustom(type, currentValue)) {
					this.advance();
				}

				return nextInput();
			}

			currentValue = Array.isArray(value)
				? value[index++]
				: value ?? "";

			if (
				index < value.length
				&& this.isKeyword(currentValue) ||
				isOfAny(
					this,
					<const>[
						"isIdentifier",
						"isDatatype",
						"isString",
						"isNumber",
						"isBinOperator",
						"isOperator",
						"isDelimiter",
						"isLinebreak"
					],
					currentValue
				)
			) {
				return this.advance();
			} else {
				if (required
					&& Array.isArray(value)
					&& index > value.length
				) {
					new ADKSyntaxError(`Invalid token '${this.curTok.value}' expected '${value.join("', '")}'`)
				} else if (required && typeof value == "string") {
					new ADKSyntaxError(`Invalid token '${this.curTok.value}' expected '${currentValue}'`);
				}

				nextInput();
			}
		}

		nextInput();
	}

	pDelimiters(
		start: string[] | string,
		end: string,
		separator: string[] | string,
		parser: Function
	): any[] {
		const values = [];
		let isFirst = true;

		this.skipOver(start);
		if (this.isIgnore()) this.advance();

		while (!this.isEOF()) {

			if (this.isDelimiter(end)) {
				break;
			} else if (isFirst) {
				isFirst = false;
			} else {
				this.skipOver(separator);
			}

			if (this.isDelimiter(end)) {
				break;
			}

			const value = parser.call(this, []);

			if (value) {
				values.push(value);
			}

		}
		this.skipOver(end);

		return values;
	}

	$isCall(exprCb: Function): Statement | Token {
		const expression: Statement | Token = exprCb();

		return this.isDelimiter("(", this.peek()) ? this.pCall(expression as Token) : expression;
	}

	pBinary(left: any, prec: number): any {
		const op = this.curTok;

		if (this.isBinOperator() || this.isOperator()) {
      const newPrec = PREC[op.value];
      
			if (newPrec > prec) {
				this.advance();

				const assignments = ["=", "+=", "-=", "*=", "/=", "%="];

				const type = assignments.includes(op.value)
					? "Assign"
					: "Binary";


				return this.pBinary(new Expression(type, left, op.value, this.pBinary(this.pAll(), newPrec)), prec);
			}
		}

		return left;
	}

	pCall(functionName: Token): Statement {
    this.advance(); // advance over the identifier
    
    const funcCall = new Statement("FunctionCall");
		const args = this.pDelimiters("(", ")", ",", this.pExpression);
		
		funcCall.value = {
      name: functionName,
      args
    };

		if (this.isDelimiter(".")) {
			this.advance();
			funcCall.value.dotOp = this.pExpression();
		}

    return funcCall;
	}

	// pVariable(): Statement {
	// 	// TODO
	// }

	// pRedefine(): Statement {
	// 	// TODO
	// }

	pInclude(value: string, dirToken: Token): Statement {
		const builtinMod = this.libs.hasOwnProperty(value);
		const decoder =  new TextDecoder("utf-8");

		let file = !value.includes(".adk") ? value + ".adk" : value;
		let filepath = Path.resolve(file);

		if (builtinMod) {
			const { filename: bifilename, filepath: bifilepath } = this.libs[value];
			const isCPP = bifilepath.endsWith(".cpp");

			if (isCPP) {
				this.advance();
				const stmt = new Statement("CPPSnippet", decoder.decode(Deno.readFileSync(bifilepath)));
				//TODO
				return stmt;
			}

			file = bifilename;
			filepath = bifilepath;
		}

		const data = decoder.decode(Deno.readFileSync(filepath));

		const lexer = new Lexer(data, filepath, this.grammar);
		const newtokens = lexer.tokenize();
		newtokens.splice(newtokens.length - 1, 1); // Remove EOF Token

		this.tokens.splice(this.pos, 1); // Remove directive
		this.tokens.splice(this.pos, 0, ...newtokens);

		this.curTok = this.tokens[this.pos];

		// TODO

		return this.pAll();
	}

	pDirective() {
		const directiveTok = this.curTok;
		const { value } = directiveTok;
		const lineInfo = this.lines[directiveTok.line - 1];

		if (!value.includes(" ")) new ADKSyntaxError("Expected a space after directive!" + `\n${lineInfo}`);

		const directive: string = value.trim().split(" ")[0];
		const dirValue: string  = value.trim().split(" ")[1];
		
		if (directive == "include") return this.pInclude(dirValue, directiveTok);

		new ADKSyntaxError("JUST FOR TESTING" + `\n${lineInfo}`);
	}

	pSnippet(): Statement {
		let snippetType = "CPPSnippet";

		const CPPSnippet = new Statement(snippetType, this.curTok);
		this.advance();

		return CPPSnippet;
	}

	pFunction(): Statement {
    this.skipOver("funct");

    const func = new Statement("Function");
    const functionName = this.curTok;
    if (!this.isIdentifier()) new ADKSyntaxError(`Invalid token '${this.curTok.value}' at line ${this.curTok.line + 1}\n${this.lines[this.curTok.line]}`);
    this.advance();

    const parameters = this.pDelimiters("(", ")", ",", this.pExpression);
		const scope = new Scope(functionName.value, this.pDelimiters("{", "}", this.grammar.Ignore, this.pExpression));

    func.value = {
      name: functionName,
      parameters,
      scope
    };

    return func;
  }

	pIf(): Statement | void {
		this.skipOver("if");

		const ifStatement = new Statement("If");
		const condition = this.pExpression();

		ifStatement.value = {
			condition,
			then: new Scope(undefined, this.pDelimiters("{", "}", this.grammar.Ignore, this.pExpression))
		};

		if (this.isKeyword("else")) {
			this.skipOver("else");

			if (this.isKeyword("if")) {
				ifStatement.value.else = this.pIf();
			} else {
				ifStatement.value.else = new Scope(undefined, this.pDelimiters("{", "}", this.grammar.Ignore, this.pExpression))
			}
		}

		return ifStatement;
	}

	pReturn(): Statement {
		this.skipOver("return");

		let returnVal: {} = this.curTok;
		if (this.isIgnore())
			returnVal = this.constructNull();
		else
			returnVal = this.pExpression();


		return new Statement("Return", returnVal);
	}

	pBoolean(): Statement {
		const tok = this.curTok;
		this.advance();

		return new Statement("Boolean", tok.value == "True" ? true : false);
	}

	pAll(): Statement {
		return this.$isCall(() => {

			if (this.isDelimiter("(")) { // Expressions (2 + 2) * 5 or (thing == thing)
				this.skipOver("(");
				const expr = this.pExpression();
				this.skipOver(")");

				return expr;
			}

			if (this.isCustom("Directive"))
				return this.pDirective();

			if (this.isKeyword("if"))
				return this.pIf();

			if (this.isKeyword("funct"))
				return this.pFunction();

			if (this.isKeyword("return")) 
				return this.pReturn();

			if (this.isKeyword("True") || this.isKeyword("False"))
				return this.pBoolean();

			const oldTok = this.curTok;

			if (this.isNumber() || this.isString()) {
				this.advance();

				return oldTok;
			}

			if (this.isIdentifier()) {
				if (!this.isDelimiter("(", this.peek()))
					this.advance();

				const Identifier: { [x: string]: any } = {
					...oldTok,
				}

				if (this.isDelimiter(".")) {
					this.advance();
					Identifier.dotOp = this.pExpression();
				}

				return Identifier;
			}

			if (this.isIgnore()) {
				return oldTok;
			}

			new ADKSyntaxError(`Unexpected '${this.curTok.type}:${this.curTok.value}' at line ${this.curTok.line + 1}\n${this.lines[this.curTok.line]}`)

		});
	}

	pExpression(): Statement | Expression | Scope | Token {
		return this.$isCall(() => {
			return this.pBinary(this.pAll(), 0);
		});
	}

	parse(lexer?: Lexer) {
		if (!this.lexer && !lexer) {
			throw new Error("To parse please provide a lexer!");
		}

		if (lexer) {
			Object.assign(
				this, {
					lexer,
					tokens: lexer.tokens,
					grammar: lexer.grammar,

					curTok: lexer.tokens[0],
					pos: 0,

					ast: new Scope("main"),
					libs: {}
				}
			);
		}

		while (this.curTok != null && !this.isEOF()) {
			const expr = this.pExpression();
			if (expr && !this.isIgnore(expr as Token)) {
				this.ast.block.push(expr);
			}

			if (!this.isEOF()) {
				this.skipOver(this.grammar.Ignore, undefined, false);
			}
		}

		return this.ast;
	}
};