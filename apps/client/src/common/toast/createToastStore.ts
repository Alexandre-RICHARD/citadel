import { generateUuid } from "@citadel/common/src/universal/uuid/generateUuid";
import type { ToastItem } from "@citadel/design-system/src/organisms/Toaster/toastItem.type";

type ToastInput = Omit<ToastItem, "id">;

type Options = {
	// Durée d'affichage d'un toast sans action
	durationMs: number;
	// Au-delà, les plus anciens disparaissent
	maxToasts: number;
};

// Store hors React : une mutation peut ajouter un toast depuis ses callbacks. Se lit avec useSyncExternalStore
export function createToastStore({ durationMs, maxToasts }: Options) {
	let toasts: readonly ToastItem[] = [];
	const listeners = new Set<() => void>();
	const timers = new Map<string, ReturnType<typeof setTimeout>>();

	function emit(): void {
		listeners.forEach((listener) => listener());
	}

	function clearTimer(id: string): void {
		clearTimeout(timers.get(id));
		timers.delete(id);
	}

	function dismiss(id: string): void {
		clearTimer(id);
		const remainingToasts = toasts.filter((toast) => toast.id !== id);
		if (remainingToasts.length === toasts.length) return;
		toasts = remainingToasts;
		emit();
	}

	function push({ action, ...toast }: ToastInput): string {
		const id = generateUuid();
		const item: ToastItem = {
			...toast,
			id,
			// Agir ferme le toast : « Réessayer » ne reste pas affiché pendant que la requête repart
			...(action && {
				action: {
					label: action.label,
					onClick: () => {
						dismiss(id);
						action.onClick();
					},
				},
			}),
		};

		const overflow = Math.max(toasts.length + 1 - maxToasts, 0);
		toasts.slice(0, overflow).forEach((evicted) => clearTimer(evicted.id));
		toasts = [...toasts.slice(overflow), item];

		// Un toast avec action reste jusqu'à ce que l'utilisateur agisse ou le ferme
		if (!action)
			timers.set(
				id,
				setTimeout(() => dismiss(id), durationMs),
			);

		emit();
		return id;
	}

	function subscribe(listener: () => void): () => void {
		listeners.add(listener);
		return () => {
			listeners.delete(listener);
		};
	}

	function getSnapshot(): readonly ToastItem[] {
		return toasts;
	}

	// Fonctions et non méthodes : elles se passent telles quelles à useSyncExternalStore ou à un onClick
	return { push, dismiss, subscribe, getSnapshot };
}
