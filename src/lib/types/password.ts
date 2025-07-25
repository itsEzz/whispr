export interface PasswordOptions {
	upperCaseRequired: boolean;
	lowerCaseRequired: boolean;
	numberRequired: boolean;
	specialCharacterRequired: boolean;
	minLength: number;
	maxLength: number;
}

export type PasswordComponent =
	| {
			isValidPassword: () => boolean;
			getErrors: () => string[] | undefined;
	  }
	| undefined;
