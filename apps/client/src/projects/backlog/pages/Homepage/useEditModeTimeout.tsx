import { useEffect } from "react";

import { isEditingCell } from "../../helper/dom/isEditingCell";
import { UiDelayEnum } from "../../helper/timing/uiDelay.enum";

// Toute action de l'utilisateur relance le minuteur d'inactivité du mode édition
const ACTIVITY_EVENTS = [
	"pointerdown",
	"pointermove",
	"keydown",
	"wheel",
	"scroll",
	"touchstart",
] as const;

const CHECK_INTERVAL_MS = 1000;

/**
 * Mode édition : retour en lecture seule après 1 minute d'inactivité (cahier des charges, §9). Une cellule en cours
 * d'édition suspend le minuteur, une modale ouverte aussi (`isPaused`)
 */
export function useEditModeTimeout(
	isEditMode: boolean,
	isPaused: boolean,
	onTimeout: () => void,
): void {
	useEffect(() => {
		if (!isEditMode || isPaused) return undefined;
		let lastActivityAt = Date.now();
		function recordActivity() {
			lastActivityAt = Date.now();
		}
		const timer = window.setInterval(() => {
			if (isEditingCell()) lastActivityAt = Date.now();
			else if (
				Date.now() - lastActivityAt >=
				Number(UiDelayEnum.EDIT_MODE_IDLE)
			)
				onTimeout();
		}, CHECK_INTERVAL_MS);
		for (const eventName of ACTIVITY_EVENTS)
			window.addEventListener(eventName, recordActivity, { passive: true });
		return () => {
			window.clearInterval(timer);
			for (const eventName of ACTIVITY_EVENTS)
				window.removeEventListener(eventName, recordActivity);
		};
	}, [isEditMode, isPaused, onTimeout]);
}
