import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import {
	type ReactNode,
	type RefObject,
	useCallback,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";
import { createPortal } from "react-dom";

import type { PopoverPlacement } from "../Popover/popoverPlacement.type";
import { usePopover } from "../Popover/usePopover";
import styles from "./tooltip.module.scss";

type Props = {
	/** Vide (`null`, `""`…) : pas de bulle, l'élément s'affiche seul */
	content: ReactNode;
	placement?: PopoverPlacement;
	/** Bulle explicative longue, à plusieurs lignes */
	isWide?: boolean;
	/** Classe de l'enveloppe, pour la caler dans sa mise en page (largeur pleine…) */
	className?: string | undefined;
	children: ReactNode;
};

/** Au survol, la bulle attend un peu pour ne pas clignoter au passage de la souris ; au clavier, elle apparaît tout de suite */
const hoverDelayMs = 400;

/** Une bulle explicative reste le temps de passer la souris de l'élément à la bulle, espace qui les sépare compris */
const leaveGraceMs = 250;

function TooltipBubble({
	anchorRef,
	placement,
	id,
	isWide,
	children,
}: {
	anchorRef: RefObject<HTMLSpanElement | null>;
	placement: PopoverPlacement;
	id: string;
	isWide: boolean;
	children: ReactNode;
}) {
	const bubbleRef = useRef<HTMLDivElement>(null);
	usePopover({
		anchorRef,
		panelRef: bubbleRef,
		placement,
		offset: 6,
		matchAnchorWidth: false,
	});

	return createPortal(
		<div
			ref={bubbleRef}
			id={id}
			role="tooltip"
			className={joinClassNames(styles.bubble, isWide && styles.wideBubble)}
		>
			{children}
		</div>,
		document.body,
	);
}

/**
 * Info-bulle maison : remplace l'attribut `title`, au survol comme au clavier (focus visible).
 * Elle enveloppe son élément dans une balise en ligne ; un bouton désactivé laisse passer le survol à l'enveloppe.
 * L'enveloppe reste là même sans texte : l'élément ne change pas de place quand une bulle apparaît (un popover ancré dessus le suit).
 */
export function Tooltip({
	content,
	placement = "top",
	isWide = false,
	className,
	children,
}: Props) {
	const anchorRef = useRef<HTMLSpanElement>(null);
	const timerRef = useRef(0);
	const [isOpen, setIsOpen] = useState(false);
	const id = useId();
	const hasContent =
		content !== null &&
		content !== undefined &&
		content !== false &&
		content !== "";

	useEffect(() => () => window.clearTimeout(timerRef.current), []);

	// Un clic dans une bulle explicative (pour en sélectionner le texte) ne la ferme pas
	const isInsideKeptBubble = useCallback(
		(target: EventTarget | null) =>
			isWide &&
			target instanceof Node &&
			(document.getElementById(id)?.contains(target) ?? false),
		[isWide, id],
	);

	// Ouverte, elle se ferme au défilement, au clic et avec Échap
	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}
		function close() {
			setIsOpen(false);
		}
		function closeOnPointerDown(event: PointerEvent) {
			if (!isInsideKeptBubble(event.target)) {
				close();
			}
		}
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape") {
				close();
			}
		}
		window.addEventListener("scroll", close, { capture: true, passive: true });
		window.addEventListener("pointerdown", closeOnPointerDown, {
			capture: true,
		});
		window.addEventListener("keydown", closeOnEscape, { capture: true });
		return () => {
			window.removeEventListener("scroll", close, { capture: true });
			window.removeEventListener("pointerdown", closeOnPointerDown, {
				capture: true,
			});
			window.removeEventListener("keydown", closeOnEscape, { capture: true });
		};
	}, [isOpen, isInsideKeptBubble]);

	function show(delayMs: number) {
		window.clearTimeout(timerRef.current);
		// Déjà ouverte (la souris revient de la bulle) : rien à rouvrir
		if (hasContent && !isOpen) {
			timerRef.current = window.setTimeout(() => setIsOpen(true), delayMs);
		}
	}

	function hide() {
		window.clearTimeout(timerRef.current);
		setIsOpen(false);
	}

	// La bulle est dans le body, mais ses événements remontent à l'enveloppe par l'arbre React : la rejoindre ne compte
	// pas comme quitter l'élément. Une bulle explicative se ferme avec un délai, annulé si la souris la rejoint
	function leave() {
		if (!(isWide && isOpen)) {
			hide();
			return;
		}
		window.clearTimeout(timerRef.current);
		timerRef.current = window.setTimeout(hide, leaveGraceMs);
	}

	return (
		<span
			ref={anchorRef}
			className={joinClassNames(styles.anchor, className)}
			onPointerEnter={(event) => {
				if (event.pointerType !== "touch") {
					show(hoverDelayMs);
				}
			}}
			onPointerLeave={leave}
			// Un clic annule aussi la bulle en attente : elle ne réapparaît pas après coup
			onPointerDown={(event) => {
				if (!isInsideKeptBubble(event.target)) {
					hide();
				}
			}}
			onFocus={(event) => {
				if (event.target.matches(":focus-visible")) {
					show(0);
				}
			}}
			onBlur={hide}
		>
			{children}
			{isOpen && hasContent && (
				<TooltipBubble
					anchorRef={anchorRef}
					placement={placement}
					id={id}
					isWide={isWide}
				>
					{content}
				</TooltipBubble>
			)}
		</span>
	);
}
