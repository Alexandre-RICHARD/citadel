import { getFocusableElements } from "@citadel/common/src/browser/dom/getFocusableElements";
import { type RefObject, useEffect, useRef, useState } from "react";

/**
 * Le tiroir des petits écrans : il s'ouvre sous la barre du bouton menu, bloque le défilement de la page et prend le
 * focus (sur la page en cours, sinon le premier lien). Échap ou un clic à côté le referme et rend le focus au bouton.
 * Repasser en grand écran le referme
 */
export function useDrawer(
	isEnabled: boolean,
	barRef: RefObject<HTMLElement | null>,
	drawerRef: RefObject<HTMLElement | null>,
) {
	const [isOpen, setIsOpen] = useState(false);
	const [top, setTop] = useState(0);
	const [wasEnabled, setWasEnabled] = useState(isEnabled);
	const burgerRef = useRef<HTMLButtonElement>(null);
	const isShown = isEnabled && isOpen;

	if (wasEnabled !== isEnabled) {
		setWasEnabled(isEnabled);
		setIsOpen(false);
	}

	function open(): void {
		setTop(barRef.current?.getBoundingClientRect().bottom ?? 0);
		setIsOpen(true);
	}

	function close({ returnFocus }: { returnFocus: boolean }): void {
		setIsOpen(false);
		if (returnFocus) burgerRef.current?.focus();
	}

	useEffect(() => {
		if (!isShown) return undefined;

		const drawer = drawerRef.current;
		const target =
			drawer?.querySelector<HTMLElement>('[aria-current="page"]') ??
			(drawer ? getFocusableElements(drawer)[0] : undefined);
		target?.focus();

		const root = document.documentElement;
		const previousOverflow = root.style.overflow;
		root.style.overflow = "hidden";

		function closeOnEscape(event: KeyboardEvent): void {
			if (event.key !== "Escape") return;
			setIsOpen(false);
			burgerRef.current?.focus();
		}
		document.addEventListener("keydown", closeOnEscape);

		return () => {
			root.style.overflow = previousOverflow;
			document.removeEventListener("keydown", closeOnEscape);
		};
	}, [isShown, drawerRef]);

	return {
		isDrawerOpen: isShown,
		drawerTop: top,
		burgerRef,
		toggleDrawer: () => (isShown ? close({ returnFocus: false }) : open()),
		closeDrawer: close,
	};
}
