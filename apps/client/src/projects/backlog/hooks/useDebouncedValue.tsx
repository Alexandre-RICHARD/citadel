import { useEffect, useState } from "react";

// La valeur, une fois la frappe arrêtée depuis `delayMs` : une requête par saisie, pas par touche
export function useDebouncedValue<Value>(value: Value, delayMs: number): Value {
	const [debouncedValue, setDebouncedValue] = useState(value);
	useEffect(() => {
		const timer = window.setTimeout(() => setDebouncedValue(value), delayMs);
		return () => window.clearTimeout(timer);
	}, [value, delayMs]);
	return debouncedValue;
}
