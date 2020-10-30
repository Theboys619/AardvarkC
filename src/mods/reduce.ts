// This is by xxpertHacker used in a lang of ours called Encode

export default <T extends object>(
	methods: readonly(keyof T)[],
		mapFn: (
			previousValue: keyof T,
			currentValue: keyof T,
			currentIndex: number,
			array: readonly (keyof T)[]
	) => keyof T
) => methods.reduce(mapFn);

export const isOfAny = <T extends object, H> (
	self: T,
		methods: readonly(keyof T)[],
			value: H
) => methods.reduce(
	(prev: keyof T, key: keyof T): keyof T => prev || (<Function><unknown>self[key])(value),
	false as unknown as keyof T
);