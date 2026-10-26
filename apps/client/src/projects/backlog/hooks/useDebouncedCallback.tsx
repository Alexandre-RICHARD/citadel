import { useCallback, useEffect, useRef } from "react";

// La fonction, appelée une fois la frappe arrêtée depuis `delayMs` avec les derniers arguments : une requête par saisie
export function useDebouncedCallback<Args extends unknown[]>(
	callback: (...args: Args) => void,
	delayMs: number,
): (...args: Args) => void {
	const timerRef = useRef<number | undefined>(undefined);
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	});

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	return useCallback(
		(...args: Args) => {
			window.clearTimeout(timerRef.current);
			timerRef.current = window.setTimeout(
				() => callbackRef.current(...args),
				delayMs,
			);
		},
		[delayMs],
	);
}
