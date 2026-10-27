import { useEffect, useState } from "react";

import { readLocalStorage } from "../../browser/storage/readLocalStorage.ts";
import { writeLocalStorage } from "../../browser/storage/writeLocalStorage.ts";

/**
 * Comme useState, mais la valeur est gardée dans le localStorage du navigateur.
 * `sanitize` reçoit la valeur relue (undefined s'il n'y en a pas) et rend une valeur valide : le stockage peut contenir
 * une ancienne version ou avoir été modifié à la main
 */
export function useLocalStorage<Value>(
	key: string,
	sanitize: (stored: unknown) => Value,
): [Value, (value: Value) => void] {
	const [value, setValue] = useState<Value>(() =>
		sanitize(readLocalStorage(key)),
	);
	useEffect(() => {
		writeLocalStorage(key, value);
	}, [key, value]);
	return [value, setValue];
}
