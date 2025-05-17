class PasswordGenerator {
	private readonly RANDOM_BATCH_SIZE: number = 256;
	private readonly MAX_RECURSION_COUNT: number = 200;
	private readonly lowercase: string = 'abcdefghijklmnopqrstuvwxyz';
	private readonly uppercase: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
	private readonly numbers: string = '0123456789';
	private readonly specialCharacters: string = '!@#$%^&*()+_-=}{[]|:;"/?.><,`~\'';
	private readonly similarCharacters: RegExp = /[ilLI|`oO0]/g;
	private readonly passwordRules: { name: string; rule: RegExp }[] = [
		{ name: 'lowercase', rule: /[a-z]/ },
		{ name: 'uppercase', rule: /[A-Z]/ },
		{ name: 'numbers', rule: /[0-9]/ },
		{ name: 'specialCharacters', rule: /[!@#$%^&*()+_\-=}{[\]|:;"/?.><,`~]/ }
	];
	private randIndex?: number;
	private randArray?: Uint8Array;
	private recursionCount: number = 0;

	private getNextRandomValue(): number {
		if (!this.randIndex || !this.randArray || this.randIndex >= this.randArray.length) {
			this.randIndex = 0;
			this.randArray = window.crypto.getRandomValues(new Uint8Array(this.RANDOM_BATCH_SIZE));
		}

		const result: number = this.randArray[this.randIndex];
		this.randIndex++;
		return result;
	}

	private randomNumber(max: number): number {
		let randomNumber: number = this.getNextRandomValue();
		while (randomNumber >= 256 - (256 % max)) {
			randomNumber = this.getNextRandomValue();
		}

		return randomNumber % max;
	}

	generate(
		pwLength: number,
		options: {
			lowercase: boolean;
			uppercase: boolean;
			numbers: boolean;
			specialCharacters: boolean;
		} = { lowercase: true, uppercase: true, numbers: true, specialCharacters: true }
	): string {
		if (pwLength < 4) throw new Error('Password length must be at least 4 characters');
		if (Object.values(options).filter(Boolean).length === 0) {
			throw new Error('At least one character type must be selected');
		}

		let password: string = '';
		let charset: string = '';
		const { lowercase, uppercase, numbers, specialCharacters } = options;

		if (lowercase) charset += this.lowercase;
		if (uppercase) charset += this.uppercase;
		if (numbers) charset += this.numbers;
		if (specialCharacters) charset += this.specialCharacters;

		charset = charset.replace(this.similarCharacters, '');

		for (let i = 0; i < pwLength; i++) {
			password += charset[this.randomNumber(charset.length)];
		}

		const isValidPassword: boolean = this.passwordRules.every((rule) => {
			if (options[rule.name as keyof typeof options] == false) return true;
			return rule.rule.test(password);
		});

		if (!isValidPassword) {
			if (this.recursionCount >= this.MAX_RECURSION_COUNT)
				throw new Error('Password generation failed');
			this.recursionCount++;
			return this.generate(pwLength, options);
		}

		this.recursionCount = 0;
		return password;
	}
}

export const passwordGenerator = new PasswordGenerator();
