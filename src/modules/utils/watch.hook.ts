import { useEffect, useState } from 'react'
import { FunctionType, Nullable } from 'root/typings/util'

/**
 * Watch for change
 *
 * @param fn - Factory function
 * @param intervalMs - Interval time in milliseconds
 * @returns Previous and current value
 */
export function useWatch<R>(fn: FunctionType<never[], R>, intervalMs = 0) {
	const [value, setValue] = useState<{ prev: Nullable<R>; current: R }>({
		prev: null,
		current: fn(),
	})

	useEffect(() => {
		const interval = setInterval(
			() =>
				setValue((value) => ({
					prev: value.current,
					current: fn(),
				})),
			intervalMs
		)

		return () => clearInterval(interval)
	}, [])

	return value
}
