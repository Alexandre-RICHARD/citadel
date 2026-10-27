// Aléatoire reproductible (générateur de Park-Miller) : la même graine redonne la même suite, entre 0 et 1
export function createSeededRandom(seed: number): () => number {
	let state = seed;
	return () => {
		state = (state * 16807) % 2147483647;
		return (state - 1) / 2147483646;
	};
}
