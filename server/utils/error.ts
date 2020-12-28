/**
 * Handle errors throughtout App
 *
 * @param error - Error
 */
export function handleError(error: Error) {
	console.error(error)

	if (error instanceof AppError && error.isOperational) return
	else process.exit(1)
}

/**
 * App Error - Used for representing internal errors
 *
 * @see {@link https://github.com/goldbergyoni/nodebestpractices/blob/master/sections/errorhandling/useonlythebuiltinerror.md}
 */
export class AppError extends Error {
	public readonly name: string
	public readonly isOperational: boolean

	constructor(name: string, description: string, isOperational: boolean) {
		super(description)

		Object.setPrototypeOf(this, new.target.prototype) // restore prototype chain

		this.name = name
		this.isOperational = isOperational

		// Works only on V8
		Error.captureStackTrace(this)
	}
}
