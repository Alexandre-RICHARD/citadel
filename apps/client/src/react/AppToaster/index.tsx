import { Toaster } from "@citadel/design-system/src/organisms/Toaster";
import { useSyncExternalStore } from "react";

import { toastStore } from "../../common/toast/toastStore";

// À monter dans le Layout de chaque projet, sous son ThemeProvider, pour que les toasts prennent son thème
export function AppToaster() {
	const toasts = useSyncExternalStore(
		toastStore.subscribe,
		toastStore.getSnapshot,
	);

	return (
		<Toaster
			toasts={toasts}
			onDismiss={toastStore.dismiss}
		/>
	);
}
