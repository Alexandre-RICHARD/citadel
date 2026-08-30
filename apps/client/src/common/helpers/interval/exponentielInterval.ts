export function exponentielInterval(
	baseDelay: number,
	attempt: number,
	factor = 2,
	maxDelay?: number,
) {
	const baseDelayInSeconds = baseDelay * 1_000;

	if (attempt === 1) return baseDelayInSeconds;
	const calculatedDelay = factor ** attempt * baseDelayInSeconds;

	if (maxDelay) {
		const maxDelayInSeconds = maxDelay * 1_000;
		return Math.min(calculatedDelay, maxDelayInSeconds);
	}

	return calculatedDelay;
}
