import {
	type KeyboardEvent,
	type ReactNode,
	type RefObject,
	useEffect,
	useRef,
} from "react";
import { createPortal } from "react-dom";

import { getFocusableElements, joinClassNames } from "../../utils";
import styles from "./popover.module.scss";
import type { PopoverPlacement } from "./popoverPlacement.type";
import { usePopover } from "./usePopover";

type Props = {
	/** L'élément contre lequel le panneau s'ouvre */
	anchorRef: RefObject<HTMLElement | null>;
	placement?: PopoverPlacement;
	/** Écart avec l'ancre, en pixels */
	offset?: number;
	/** Le panneau est au moins aussi large que l'ancre (listes déroulantes) */
	matchAnchorWidth?: boolean;
	/** Clic à côté du panneau et de l'ancre ; absent quand le parent gère lui-même les clics à côté */
	onClickOutside?: (() => void) | undefined;
	onKeyDown?: ((event: KeyboardEvent<HTMLDivElement>) => void) | undefined;
	/** Focus à l'ouverture : le premier élément focalisable du panneau, ou le panneau lui-même */
	focusOnOpen?: "first" | "panel" | "none";
	/** À la fermeture, le focus resté dans le panneau revient à l'ancre */
	returnsFocus?: boolean;
	role?: "dialog" | undefined;
	ariaLabel?: string | undefined;
	id?: string | undefined;
	className?: string | undefined;
	children: ReactNode;
};

/**
 * Panneau flottant rendu dans un portail, placé contre son ancre (sous elle par défaut, au-dessus s'il manque de place).
 * Il n'existe que monté : le parent l'affiche quand il est ouvert. Il porte `data-popover`, comme ses ancres dans le tableau :
 * un clic dedans ne ferme pas le popover ou le menu ouvert de la page.
 */
export function Popover({
	anchorRef,
	placement = "bottom-start",
	offset = 6,
	matchAnchorWidth = false,
	onClickOutside,
	onKeyDown,
	focusOnOpen = "none",
	returnsFocus = false,
	role,
	ariaLabel,
	id,
	className,
	children,
}: Props) {
	const panelRef = useRef<HTMLDivElement>(null);
	// Un clic dans le panneau, ou dans un panneau ouvert depuis lui (lui aussi en portail), n'est pas un clic à côté
	const isPointerInsideRef = useRef(false);
	usePopover({ anchorRef, panelRef, placement, offset, matchAnchorWidth });

	useEffect(() => {
		if (onClickOutside === undefined) {
			return undefined;
		}
		const closeOnClickOutside = onClickOutside;
		function handlePointerDown(event: PointerEvent) {
			const isInside =
				isPointerInsideRef.current ||
				(event.target instanceof Node &&
					anchorRef.current?.contains(event.target) === true);
			isPointerInsideRef.current = false;
			if (!isInside) {
				closeOnClickOutside();
			}
		}
		document.addEventListener("pointerdown", handlePointerDown);
		return () => document.removeEventListener("pointerdown", handlePointerDown);
	}, [anchorRef, onClickOutside]);

	useEffect(() => {
		const panel = panelRef.current;
		const anchor = anchorRef.current;
		if (panel !== null && focusOnOpen !== "none") {
			const target =
				focusOnOpen === "first"
					? (getFocusableElements(panel).at(0) ?? panel)
					: panel;
			target.focus({ preventScroll: true });
		}
		return () => {
			// Panneau retiré (Échap, choix fait) : le focus, perdu avec lui, revient à l'ancre
			const active = document.activeElement;
			if (
				returnsFocus &&
				anchor?.isConnected === true &&
				(active === null ||
					active === document.body ||
					panel?.contains(active) === true)
			) {
				anchor.focus({ preventScroll: true });
			}
		};
	}, [anchorRef, focusOnOpen, returnsFocus]);

	return createPortal(
		<div
			ref={panelRef}
			className={joinClassNames(styles.panel, className)}
			role={role}
			aria-label={ariaLabel}
			id={id}
			tabIndex={-1}
			data-popover
			onPointerDownCapture={() => {
				isPointerInsideRef.current = true;
			}}
			onKeyDown={onKeyDown}
		>
			{children}
		</div>,
		document.body,
	);
}
