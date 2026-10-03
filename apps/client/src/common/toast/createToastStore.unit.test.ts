import { ToastVariantEnum } from "@citadel/design-system/src/organisms/Toaster/toastVariant.enum";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { createToastStore } from "./createToastStore";

const DURATION_MS = 5_000;

function createStore(maxToasts = 3) {
	return createToastStore({ durationMs: DURATION_MS, maxToasts });
}

describe("createToastStore.ts", () => {
	beforeEach(() => {
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe("adding toasts", () => {
		it("SHOULD list the toast with a generated id", () => {
			// Arrange
			const store = createStore();

			// Act
			const id = store.push({
				variant: ToastVariantEnum.INFO,
				message: "Les données ont été mises à jour.",
			});

			// Assert
			expect(store.getSnapshot()).toStrictEqual([
				{
					id,
					variant: ToastVariantEnum.INFO,
					message: "Les données ont été mises à jour.",
				},
			]);
		});

		it("SHOULD drop the oldest toasts WHEN the maximum is exceeded", () => {
			// Arrange
			const store = createStore(2);

			// Act
			["First", "Second", "Third"].forEach((message) =>
				store.push({ variant: ToastVariantEnum.INFO, message }),
			);

			// Assert
			expect(store.getSnapshot().map(({ message }) => message)).toStrictEqual([
				"Second",
				"Third",
			]);
		});

		it("SHOULD notify the subscribers WHEN the list changes, until they unsubscribe", () => {
			// Arrange
			const store = createStore();
			const listener = vi.fn();
			const unsubscribe = store.subscribe(listener);

			// Act
			const id = store.push({ variant: ToastVariantEnum.INFO, message: "A" });
			store.dismiss(id);
			unsubscribe();
			store.push({ variant: ToastVariantEnum.INFO, message: "B" });

			// Assert
			expect(listener).toHaveBeenCalledTimes(2);
		});
	});

	describe("closing toasts", () => {
		it("SHOULD remove the toast after its duration WHEN it has no action", () => {
			// Arrange
			const store = createStore();
			store.push({ variant: ToastVariantEnum.SUCCESS, message: "Connecté" });

			// Act
			vi.advanceTimersByTime(DURATION_MS);

			// Assert
			expect(store.getSnapshot()).toStrictEqual([]);
		});

		it("SHOULD keep the toast until the user acts WHEN it has an action", () => {
			// Arrange
			const store = createStore();
			store.push({
				variant: ToastVariantEnum.ERROR,
				message: "Impossible d'ajouter la mort : le serveur est injoignable.",
				action: { label: "Réessayer", onClick: vi.fn() },
			});

			// Act
			vi.advanceTimersByTime(DURATION_MS * 10);

			// Assert
			expect(store.getSnapshot()).toHaveLength(1);
		});

		it("SHOULD close the toast before running its action WHEN the action is clicked", () => {
			// Arrange
			const store = createStore();
			let toastsDuringAction: unknown;
			store.push({
				variant: ToastVariantEnum.ERROR,
				message: "Impossible d'ajouter la mort : le serveur est injoignable.",
				action: {
					label: "Réessayer",
					onClick: () => {
						toastsDuringAction = store.getSnapshot();
					},
				},
			});

			// Act
			store.getSnapshot()[0]?.action?.onClick();

			// Assert
			expect(toastsDuringAction).toStrictEqual([]);
		});

		it("SHOULD remove the toast at once WHEN it is dismissed", () => {
			// Arrange
			const store = createStore();
			const id = store.push({ variant: ToastVariantEnum.INFO, message: "A" });

			// Act
			store.dismiss(id);

			// Assert
			expect(store.getSnapshot()).toStrictEqual([]);
		});

		it("SHOULD notify nobody WHEN the dismissed toast is already gone", () => {
			// Arrange
			const store = createStore();
			const listener = vi.fn();
			store.subscribe(listener);

			// Act
			store.dismiss("unknown-id");

			// Assert
			expect(listener).not.toHaveBeenCalled();
		});
	});
});
