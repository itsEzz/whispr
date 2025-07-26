import { zxcvbn, zxcvbnOptions } from '@zxcvbn-ts/core';
import * as zxcvbnCommonPackage from '@zxcvbn-ts/language-common';
import * as zxcvbnEnPackage from '@zxcvbn-ts/language-en';
import XRegExp from 'xregexp';

export const upperCaseRegex: RegExp = XRegExp('.*\\p{Lu}.*');
export const lowerCaseRegex: RegExp = XRegExp('\\p{Ll}');
export const numberRegex: RegExp = XRegExp('\\p{N}');
export const specialCharacterRegex: RegExp = XRegExp('[\\p{P}\\p{S}]');

export function getPasswordStrength(password: string): {
	score: number;
	label: string;
	barColor: string;
	textColor: string;
	hasLowercase: boolean;
	hasUppercase: boolean;
	hasNumber: boolean;
	hasSpecial: boolean;
	feedback: string[];
} {
	if (!password) {
		return {
			score: 0,
			label: 'No password',
			barColor: 'bg-muted',
			textColor: 'text-muted-foreground',
			hasLowercase: false,
			hasUppercase: false,
			hasNumber: false,
			hasSpecial: false,
			feedback: []
		};
	}

	zxcvbnOptions.setOptions({
		dictionary: {
			...zxcvbnCommonPackage.dictionary,
			...zxcvbnEnPackage.dictionary
		},
		graphs: zxcvbnCommonPackage.adjacencyGraphs,
		translations: zxcvbnEnPackage.translations
	});
	const result = zxcvbn(password);

	const hasLowercase = lowerCaseRegex.test(password);
	const hasUppercase = upperCaseRegex.test(password);
	const hasNumber = numberRegex.test(password);
	const hasSpecial = specialCharacterRegex.test(password);

	const scoreDetails = [
		{
			label: 'Very Weak',
			barColor: 'bg-destructive',
			textColor: 'text-destructive'
		},
		{
			label: 'Weak',
			barColor: 'bg-orange-600 dark:bg-orange-500',
			textColor: 'text-orange-600 dark:text-orange-500'
		},
		{
			label: 'Fair',
			barColor: 'bg-yellow-600 dark:bg-yellow-500',
			textColor: 'text-yellow-600 dark:text-yellow-500'
		},
		{
			label: 'Good',
			barColor: 'bg-emerald-600 dark:bg-emerald-500',
			textColor: 'text-emerald-600 dark:text-emerald-500'
		},
		{
			label: 'Strong',
			barColor: 'bg-green-600 dark:bg-green-500',
			textColor: 'text-green-600 dark:text-green-500'
		}
	];

	return {
		score: result.score,
		label: scoreDetails[result.score].label || 'Very Weak',
		barColor: scoreDetails[result.score].barColor || 'bg-destructive',
		textColor: scoreDetails[result.score].textColor || 'text-destructive',

		hasLowercase,
		hasUppercase,
		hasNumber,
		hasSpecial,
		feedback: result.feedback.suggestions
	};
}
