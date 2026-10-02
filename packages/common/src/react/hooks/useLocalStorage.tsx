import { useEffect, useState } from "react";

function readStoredValue<T>(storageKey: string, defaultValue: T): T {
	try {
		const storedValue = localStorage.getItem(storageKey);
		if (storedValue === null) return defaultValue;
		return (JSON.parse(storedValue) as T | null) ?? defaultValue;
	} catch {
		// Valeur corrompue ou stockage inaccessible : on repart de la valeur par défaut
		return defaultValue;
	}
}

// TODO Refléchir si ça vaut mieux de laisser en Hook ou de passer en helper
export function useLocalStorage<T>(storageKey: string, defaultValue: T) {
	const [value, setValue] = useState<T>(() =>
		readStoredValue(storageKey, defaultValue),
	);

	useEffect(() => {
		localStorage.setItem(storageKey, JSON.stringify(value));
	}, [value, storageKey]);

	return {
		value,
		setValue,
	};
}
