/**
 * Converts all empty string values in the given object to `undefined`.
 *
 * @template T - The type of the input and output object.
 * @param {T} obj - The input object whose empty string values will be replaced.
 * @returns {T} A new object with empty string values replaced by `undefined`.
 */
export function emptyStringsToUndefined<T extends Record<string, any>>(obj: T): T {
	return Object.fromEntries(
		Object.entries(obj).map(([key, value]) => [key, value.trim() === '' ? undefined : value])
	) as T;
}
