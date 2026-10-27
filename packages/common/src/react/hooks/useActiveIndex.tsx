import { useState } from "react";

/**
 * Résultat actif d'une liste parcourue au clavier depuis son champ (motif « combobox ») : ↓ et ↑ le déplacent, Entrée le
 * choisit. Il repart de zéro quand `resetKey` change (nouvelle recherche, autre filtre)
 */
export function useActiveIndex(resetKey: unknown) {
	const [activeIndex, setActiveIndex] = useState(-1);
	const [activeKey, setActiveKey] = useState(resetKey);
	if (resetKey !== activeKey) {
		setActiveKey(resetKey);
		setActiveIndex(-1);
	}
	return [activeIndex, setActiveIndex] as const;
}
