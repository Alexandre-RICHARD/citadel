import { createToastStore } from "./createToastStore";

// Store unique de l'application, affiché par AppToaster
export const toastStore = createToastStore({
	durationMs: 6_000,
	maxToasts: 4,
});
