import { Token, LexerGrammar } from "./types.ts";
import { ADKInvalidCharacter } from "./errors.ts";

export default class Lexer {
	input!: string;
	filepath!: string;
	grammar!: LexerGrammar;

	tokens: Token[] = [];
	char!: string;

	pos = 0;
	index = 0;
	line = 1;

	constructor(
		input: string,
		filepath: string,
		grammar: LexerGrammar
	) {
		Object.assign(
			this, {
				input,
				filepath,
				grammar,

				char: input[0]
			}
		);
	}

	skip(num = 1): string {
		return this.char = this.input[this.pos += num];
	}

	advance(num = 1) {
		this.index += num;
		return this.char = this.input[this.pos += num];
	}

	peek(num = 1) {
		return this.input[this.pos + num];
	}

	isWhitespace(char = this.char) {
		return this.grammar.Whitespace.includes(char);
	}

	isLinebreak(char = this.char) {
		return char === '\n';
	}

	isLetter(char = this.char): boolean {
		return /[a-zA-Z]/.test(char);
	}

	isNumber(char = this.char) {
		return char === "-"
			&& this.grammar.Digits.includes(this.peek())
			|| this.grammar.Digits.includes(char);
	}

	isString(char = this.char) {
		return this.grammar.Strings.includes(char);
	}

	isOperator(char = this.char) {
		return (
			this.grammar.Operators.includes(char)
			|| this.grammar.Operators.includes(char + this.peek())
			|| this.grammar.Operators.includes(char + this.peek() + this.peek())
		);
	}

	isBinOperator(char = this.char) {
		return this.grammar.BinOperators.includes(char);
	}

	isDelimiter(char = this.char) {
		return this.grammar.Delimiters.includes(char);
	}

	isSpecial(special?: string, char = this.char) {
		if (special)
			return this.grammar.Special.includes(special) && (char == special);
		return this.grammar.Special.includes(char);
	}

	isIdentifier(char = this.char) {
		return this.isLetter(char)
			|| this.isNumber(char)
			|| this.isSpecial(char);
	}

	isSnippet(char = this.char) {
		return char === '`'
			&& this.peek() === '`'
			&& this.peek(2) === '`';
	}

	isInlineComment(char = this.char) {
		let i = 0;
		let str = "";
		const { InlineComment } = this.grammar;
		for (const letter of InlineComment) {
			if (letter === this.peek(i)) {
				str += letter;
				++i;
			}
		}

		return {
			match: str === InlineComment,
			length: InlineComment.length
		};
	}

	isBlockComment(index = 0) {
		let i = 0;
		let str = "";
		for (const letter of this.grammar.BlockComment[index]) {
			if (letter === this.peek(i)) {
				str += letter;
				++i;
			}
		}

		const temp = this.grammar.BlockComment[index];

		return {
			match: str === temp,
			length: temp.length
		};
	}

	tokenize(): Token[] {
		while (this.char != undefined) {
			const lastPos = this.pos;

			if (this.isLinebreak()) {
				if (!this.isWhitespace()) {
					this.tokens.push({
						type: "Linebreak",
						value: "\n",
						index: this.index,
						line: this.line
					});
				}

				this.advance();

				++this.line;
				this.index = 0;
			}

			if (this.isWhitespace()) {
				this.advance();
			}

			if (this.isSnippet()) {
				this.advance(3);
				let code = "";

				while (this.char != null && !this.isSnippet()) {
					code += this.char;
					this.advance();
				}

				this.tokens.push({
					type: "CPPSnippet",
					value: code,
					index: this.index,
					line: this.line
				});
				this.advance(3);
			}

			if (this.isInlineComment().match) {
				const { length } = this.isInlineComment();

				this.skip(length);

				while (this.char != null && !this.isLinebreak()) {
					this.skip();
				}
			}

			if (this.isBlockComment().match) {
				const lengthStart = this.isBlockComment().length;

				const lengthEnd = this.isBlockComment(1).length;

				this.advance(lengthStart);

				while (this.char != null && !this.isBlockComment(1).match) {
					this.advance();
				}

				this.advance(lengthEnd);
			}

			if (this.isSpecial("#")) {
				let value = "";
				const index = this.index;
				const line = this.line;
				value += this.advance();

				while (this.char !== undefined && !this.isLinebreak()) {
					const char = this.advance();
					if (char !== undefined && !this.isLinebreak())
						value += char;
				}

				this.tokens.push({
					type: "Directive",
					value,
					index,
					line
				});
			}

			if (this.isOperator()) {
				const {
					index,
					line
				} = this;


				let op = this.char;

				while (this.isOperator(op + this.peek()) && this.char != null) {
					this.advance();
					op += this.char;
				}

				this.tokens.push({
					type: "Operator",
					value: op,
					index,
					line
				});

				this.advance();
			} else if (this.isBinOperator()) {
				this.tokens.push({
					type: "BinOperator",
					value: this.char,
					index: this.index,
					line: this.line
				});

				this.advance();
			}

			if (this.isNumber()) {
				let str = this.char;
				const {
					index,
					line
				} = this;

				this.advance();

				while (this.char != null && this.isNumber()) {
					str += this.char;
					this.advance();
				}

				if (this.char == "." && this.isNumber(this.peek())) {
					str += this.char;
					this.advance();
					while (this.char != null && this.isNumber()) {
						str += this.char;
						this.advance();
					}
				}

				this.tokens.push({
					type: "Number",
					value: Number.parseFloat(str),
					index,
					line
				});
			}

			if (this.isString()) {
				let value = "";
				let {
					index,
					line
				} = this;

				this.advance();

				while (this.char != null && !this.isString()) {
					value += this.char;
					this.advance();
				}

				this.tokens.push({
					type: "String",
					value,
					index,
					line
				});

				this.advance();
			}

			if (this.isDelimiter()) {
				this.tokens.push({
					type: "Delimiter",
					value: this.char,
					index: this.index,
					line: this.line
				});

				this.advance();
			}

			if (this.isLetter()) {
        if (this.char === undefined) break;

				let value = "";
				const {
					index,
					line
				} = this;

				while (this.char != null && this.isIdentifier()) {
					value += this.char;
					this.advance();
				}

				const type =
					this.grammar.Datatypes.includes(value)
						? "Datatype"
						: (this.grammar.Keywords.includes(value)
							? "Keyword"
							: (this.isOperator(value)
								? "Operator"
								: (this.isBinOperator(value)
									? "Operator"
									: "Identifier"
								)
							)
						);

				this.tokens.push({
					type,
					value,
					index,
					line
				});
			}

			if (lastPos == this.pos) {
				new ADKInvalidCharacter(`Invalid character '${this.char}' at line ${this.line}, index ${this.index}`);
			}
		}

		this.tokens.push({
			type: "EOF",
			value: "EOF",
			index: 0,
			line: this.line + 1
		});

		return this.tokens;
	}
};