/**
 * Converts a numeric length value into a human-readable string format.
 *
 * This function formats large numbers by using abbreviated units (k for thousands, M for millions)
 * to make them more readable in user interfaces. Numbers are rounded to one decimal place when
 * abbreviated.
 *
 * @param length - The numeric length to format (typically character count or byte size)
 * @returns A formatted string representation of the length
 */
export function getReadableContentLength(length: number): string {
	if (length < 1000) {
		return length.toString();
	} else if (length < 1000000) {
		return (length / 1000).toFixed(1) + 'k';
	} else {
		return (length / 1000000).toFixed(1) + 'M';
	}
}
