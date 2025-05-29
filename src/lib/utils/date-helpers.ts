import { browser } from '$app/environment';
import { DateFormatter } from '@internationalized/date';

/**
 * Formats a date according to the specified locale and options
 *
 * @param date - The date to format
 * @param locale - The locale to use for formatting (e.g., 'en-US', 'de-DE')
 * @param options - Optional Intl.DateTimeFormatOptions for customizing the format
 * @returns The formatted date string
 */
export function formatDate(
	date: Date,
	locale: string,
	options?: Intl.DateTimeFormatOptions
): string {
	const dateFormatter = new DateFormatter(locale, options);
	return dateFormatter.format(date);
}

/**
 * Gets the user's locale from the browser
 *
 * Falls back to 'en-US' if the browser locale cannot be determined.
 *
 * @returns The user's locale string (e.g., 'en-US', 'fr-FR')
 */
export function getUserLocale(): string {
	if (!browser || !navigator || (!('language' in navigator) && !('languages' in navigator)))
		return 'en-US';
	return (
		navigator.language ||
		(navigator.languages && navigator.languages.length > 0 ? navigator.languages[0] : 'en-US')
	);
}

/**
 * Checks if a given date is in the past (UTC)
 *
 * @param date - The date to check
 * @returns True if the date is in the past, false otherwise
 */
export function isDateInPast(date: Date): boolean {
	const now = new Date();
	return now.getTime() > date.getTime();
}
