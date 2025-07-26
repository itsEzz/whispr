export type PasswordComponent =
	| {
			isValidPassword: () => boolean;
			getErrors: () => string[] | undefined;
	  }
	| undefined;
