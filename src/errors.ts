export class ADKError {
	readonly msg!: string;
	readonly errorname!: string;

	constructor(
		msg: string,
		errorname = "ENCError"
	) {
		Object.assign(
			this, {
				msg,
				errorname
			}
		);

		this.throw();
	}

	throw() {
		console.error(
			"%s: %s",
			this.errorname,
			this.msg
		);

		Deno.exit(1);
	}
};

// Some code from xxpertHacker he refined lots of the code
const Warning = (errorname: string) => class extends ADKError {
	constructor(msg: string) {
		super(msg, errorname);
	}
};

export const ADKSyntaxError = Warning("ADKSyntaxError");
export const ADKInvalidCharacter = Warning("ADKInvalidCharacter");
export const ADKFileNotFound = Warning("ADKFileNotFound");