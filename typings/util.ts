/** Only typed keys, values can be anything */
export type OnlyKeys<T> = {
	[K in keyof T]: T[K] extends Record<string, unknown>
		? OnlyKeys<T[K]>
		: unknown
}

export type Nullable<T> = T | null

export type FunctionType<A extends unknown[] = unknown[], R = unknown> = (
	...args: A
) => R
