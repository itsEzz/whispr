/**
 * Represents a successful operation result
 * @template T The type of the successful data
 */
type Success<T> = {
	data: T;
	error?: never;
};

/**
 * Represents a failed operation result
 * @template E The type of the error
 */
type Failure<E> = {
	data?: never;
	error: E;
};

/**
 * Union type representing either a successful or failed operation result
 * @template T The type of the successful data
 * @template E The type of the error, defaults to Error
 */
type Result<T, E = Error> = Success<T> | Failure<E>;

/**
 * Represents a value that might be a Promise or a direct value
 * @template T The type of the value
 */
type MaybePromise<T> = T | Promise<T>;

/**
 * Type guard to check if a result represents a successful operation
 *
 * @template T The type of the successful data
 * @template E The type of the error
 * @param result The result to check
 * @returns True if the result represents a successful operation
 */
export const isSuccess = <T, E>(result: Result<T, E>): result is Success<T> => {
	return 'data' in result;
};

/**
 * Type guard to check if a result represents a failed operation
 *
 * @template T The type of the successful data
 * @template E The type of the error
 * @param result The result to check
 * @returns True if the result represents a failed operation
 */
export const isError = <T, E>(result: Result<T, E>): result is Failure<E> => {
	return 'error' in result;
};

/**
 * Infer the return type of tryCatch based on the input type
 * If the input is a Promise<T>, the output is Promise<Result<T, E>>
 * If the input is a function returning Promise<T>, the output is Promise<Result<T, E>>
 * If the input is a function returning T, the output is Result<T, E>
 */
type TryCatchReturn<T, E, F> =
	F extends Promise<infer U>
		? Promise<Result<U, E>>
		: F extends () => Promise<infer U>
			? Promise<Result<U, E>>
			: F extends () => infer U
				? Result<U, E>
				: never;

/**
 * Safely executes a function or awaits a promise, capturing any errors
 *
 * This utility provides a consistent way to handle both synchronous and asynchronous
 * operations that might throw errors. It returns a Result object that can be checked
 * with isSuccess or isError.
 *
 * @template T The type of the successful result
 * @template E The type of the error, defaults to unknown
 * @template F The type of the function or promise
 * @param arg The function to execute or promise to await
 * @param handler Optional error handler or 'throw' to rethrow errors
 * @param cleanup Optional function to run after completion (in finally block)
 * @returns A Result object or Promise<Result> containing either data or error
 */
export function tryCatch<
	T,
	E = unknown,
	F extends Promise<T> | (() => MaybePromise<T>) = Promise<T> | (() => MaybePromise<T>)
>(arg: F, handler?: ((error: E) => void) | 'throw', cleanup?: () => void): TryCatchReturn<T, E, F> {
	if (typeof arg === 'function') {
		try {
			const result = (arg as () => MaybePromise<T>)();
			if (result instanceof Promise) {
				return result
					.then((data) => ({ data }))
					.catch((error) => {
						if (handler === 'throw') throw error;
						if (handler) handler(error as E);
						return { error: error as E };
					})
					.finally(cleanup) as TryCatchReturn<T, E, F>;
			}
			const successResponse = { data: result };
			cleanup?.();
			return successResponse as TryCatchReturn<T, E, F>;
		} catch (error) {
			if (handler === 'throw') throw error;
			if (handler) handler(error as E);
			cleanup?.();
			return { error: error as E } as TryCatchReturn<T, E, F>;
		}
	}

	return (arg as Promise<T>)
		.then((data) => ({ data }))
		.catch((error) => {
			if (handler === 'throw') throw error;
			if (handler) handler(error as E);
			return { error: error as E };
		})
		.finally(cleanup) as TryCatchReturn<T, E, F>;
}
