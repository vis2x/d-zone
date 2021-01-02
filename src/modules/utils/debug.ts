import { BrowserLogger } from './logger'

/**
 * Debug objects only in development mode
 *
 * @param label - Label to be used in logs
 * @param object - Object to be debugged
 * @returns Proxy
 */
export function debug<O>(label: string, object: O) {
	if (process.env.NODE_ENV === 'production') return object
	else {
		const logger = new BrowserLogger(`Debug - ${label}`)

		return new Proxy(object as Record<string, unknown>, {
			get: function (target, prop) {
				const value = Reflect.get(target, prop)

				logger.log(`${label} - Get`, { value, prop })

				if (typeof value === 'function')
					return (...arg: unknown[]) => {
						const returnValue = value.bind(target)(...arg)
						logger.log(`${label} - Called`, {
							prop,
							arg,
							returnValue,
						})
					}
				else return value
			},

			set: function (target, prop, value) {
				logger.log(`${label} - Set`, { prop, value })

				return Reflect.set(target, prop, value)
			},
		}) as O
	}
}
