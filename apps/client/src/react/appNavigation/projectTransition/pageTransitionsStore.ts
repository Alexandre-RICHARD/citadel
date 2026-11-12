import { readLocalStorage } from "@citadel/common/src/browser/storage/readLocalStorage";
import { writeLocalStorage } from "@citadel/common/src/browser/storage/writeLocalStorage";

import { PAGE_TRANSITIONS_STORAGE_KEY } from "./pageTransitionsStorageKey";

const listeners = new Set<() => void>();

// Le choix est lu par le routeur (qui joue les transitions) et écrit par le profil : deux endroits qui ne se
// connaissent pas, donc un petit magasin que les composants suivent avec useSyncExternalStore
export const pageTransitionsStore = {
	subscribe: (listener: () => void): (() => void) => {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	},

	// Le stockage peut contenir autre chose qu'un booléen (ancienne version, main) : seul `true` coupe les transitions
	isDisabled: (): boolean => {
		return readLocalStorage(PAGE_TRANSITIONS_STORAGE_KEY) === true;
	},

	setDisabled: (isDisabled: boolean): void => {
		writeLocalStorage(PAGE_TRANSITIONS_STORAGE_KEY, isDisabled);
		listeners.forEach((listener) => listener());
	},
};
