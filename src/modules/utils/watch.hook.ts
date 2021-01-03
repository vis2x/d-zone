import { useEffect, useState } from 'react'
import { FunctionType, Nullable } from 'root/typings/util'

/**
 * Watch for change
 *
 * @param fn - Factory function
 * @returns Previous and current value
 */
export function useWatch<R>(fn: FunctionType<never[], R>) {
	const [value, setValue] = useState<{ prev: Nullable<R>; current: R }>({
		prev: null,
		current: fn(),
	})

	useEffect(() => {
		setInterval(
			() =>
				setValue((value) => ({
					prev: value.current,
					current: fn(),
				})),
			0
		)
	}, [])

	return value
}
