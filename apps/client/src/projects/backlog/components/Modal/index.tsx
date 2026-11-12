import { getFocusableElements } from "@citadel/common/src/browser/dom/getFocusableElements";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { type LucideIcon, Maximize2, Minus, X } from "lucide-react";
import {
	type ReactNode,
	type RefObject,
	useContext,
	useEffect,
	useId,
	useRef,
	useState,
} from "react";

import { getTwoButtonsNeighbor } from "../../helper/dom/getTwoButtonsNeighbor";
import { Button } from "../Button";
import styles from "./modal.module.scss";
import { ModalMinimizeContext } from "./modalMinimizeContext";

type Props = {
	title: ReactNode;
	/** Sous le titre, en discret (ex. le jeu concerné) */
	subtitle?: ReactNode;
	icon?: LucideIcon | undefined;
	size?: "sm" | "md" | "lg";
	/** Bouton « Réduire » : la fenêtre se range en bandeau en haut de la page, sans rien perdre de sa saisie */
	canMinimize?: boolean;
	/** Pied de fenêtre, à gauche des boutons (ex. « Ajouter à mon backlog ») */
	footerStart?: ReactNode;
	actions: ReactNode;
	/** Bouton ✕ : comme « Annuler » */
	onClose: () => void;
	/** Champ à focaliser à l'ouverture ; sinon la fenêtre elle-même, Tab mène à son premier champ */
	initialFocusRef?: RefObject<HTMLElement | null> | undefined;
	children: ReactNode;
};

/**
 * Fenêtre modale : le focus y reste enfermé (Tab boucle sur ses champs), il revient à l'élément d'origine à la fermeture,
 * et la page dessous ne défile plus. Échap est géré par la page, qui ferme la modale comme « Annuler » (section 8).
 */
export function Modal({
	title,
	subtitle,
	icon: Icon,
	size = "md",
	canMinimize = false,
	footerStart,
	actions,
	onClose,
	initialFocusRef,
	children,
}: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const subtitleId = useId();
	const onCloseRef = useRef(onClose);
	const originFocusRef = useRef<HTMLElement | null>(null);
	const bodyRef = useRef<HTMLDivElement>(null);
	const footerRef = useRef<HTMLElement>(null);
	const [isMinimized, setIsMinimized] = useState(false);
	const isMinimizedRef = useRef(false);
	const reportMinimized = useContext(ModalMinimizeContext);

	useEffect(() => {
		onCloseRef.current = onClose;
	});

	/** Échap ferme la fenêtre comme « Annuler » ; une liste ou un calendrier ouvert dedans se ferme d'abord et arrête l'événement */
	useEffect(() => {
		function closeOnEscape(event: KeyboardEvent) {
			if (event.key === "Escape" && !isMinimizedRef.current) {
				onCloseRef.current();
			}
		}
		window.addEventListener("keydown", closeOnEscape);
		return () => window.removeEventListener("keydown", closeOnEscape);
	}, []);

	/** L'élément d'où la fenêtre s'est ouverte récupère le focus à sa fermeture, et la page sait qu'elle n'est plus réduite */
	useEffect(() => {
		originFocusRef.current =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		return () => {
			reportMinimized(false);
			if (originFocusRef.current?.isConnected === true)
				originFocusRef.current.focus({ preventScroll: true });
		};
	}, [reportMinimized]);

	/** Réduite, la fenêtre ne verrouille plus ni le défilement ni le focus : la page reprend la main */
	useEffect(() => {
		const dialog = dialogRef.current;
		if (isMinimized) return undefined;
		/** Fenêtre sans champ (confirmation) : les boutons de son pied, sinon null */
		function getConfirmationButtons(): HTMLElement[] | null {
			const body = bodyRef.current;
			const footer = footerRef.current;
			if (
				body === null ||
				footer === null ||
				getFocusableElements(body).length > 0
			)
				return null;
			return getFocusableElements(footer);
		}

		// Une confirmation s'ouvre sur « Annuler » (le premier bouton) : Entrée valide ce qui a le focus, ← → choisissent
		(
			initialFocusRef?.current ??
			getConfirmationButtons()?.at(0) ??
			dialog
		)?.focus({ preventScroll: true });
		const root = document.documentElement;
		const previousOverflow = root.style.overflow;
		root.style.overflow = "hidden";

		/** Tab et Maj+Tab bouclent sur les champs de la fenêtre (les panneaux en portail gèrent leur propre Tab) */
		function trapFocus(event: KeyboardEvent) {
			if (event.key !== "Tab" || dialog === null) {
				return;
			}
			const focusable = getFocusableElements(dialog);
			const first = focusable.at(0);
			const last = focusable.at(-1);
			if (first === undefined || last === undefined) {
				event.preventDefault();
				return;
			}
			const active = document.activeElement;
			const isOutside = active === dialog || !dialog.contains(active);
			if (event.shiftKey && (active === first || isOutside)) {
				event.preventDefault();
				last.focus();
			} else if (!event.shiftKey && (active === last || isOutside)) {
				event.preventDefault();
				first.focus();
			}
		}

		/** Une fenêtre sans champ, avec seulement deux boutons (confirmation) : ← et → passent de l'un à l'autre */
		function moveBetweenTwoButtons(event: KeyboardEvent) {
			const buttons = getConfirmationButtons();
			if (buttons === null) return;
			const neighbor = getTwoButtonsNeighbor(buttons, event.key);
			if (neighbor === null) return;
			event.preventDefault();
			neighbor.focus();
		}

		dialog?.addEventListener("keydown", trapFocus);
		dialog?.addEventListener("keydown", moveBetweenTwoButtons);
		return () => {
			dialog?.removeEventListener("keydown", trapFocus);
			dialog?.removeEventListener("keydown", moveBetweenTwoButtons);
			root.style.overflow = previousOverflow;
		};
	}, [initialFocusRef, isMinimized]);

	function changeMinimized(nextIsMinimized: boolean) {
		isMinimizedRef.current = nextIsMinimized;
		setIsMinimized(nextIsMinimized);
		reportMinimized(nextIsMinimized);
		if (nextIsMinimized) originFocusRef.current?.focus({ preventScroll: true });
	}

	return (
		<>
			{isMinimized && (
				<button
					type="button"
					className={styles.minimizedBar}
					aria-label="Rouvrir la fenêtre"
					onClick={() => changeMinimized(false)}
				>
					{Icon !== undefined && <Icon aria-hidden />}
					<span className={styles.minimizedTitle}>{title}</span>
					{subtitle !== undefined && (
						<span className={styles.minimizedSubtitle}>{subtitle}</span>
					)}
					<Maximize2 aria-hidden />
				</button>
			)}
			<div
				className={joinClassNames(styles.overlay, isMinimized && styles.hidden)}
			>
				<div
					ref={dialogRef}
					className={joinClassNames(styles.dialog, styles[size])}
					role="dialog"
					aria-modal="true"
					// Le sous-titre (souvent le jeu concerné) complète le nom de la fenêtre
					aria-labelledby={
						subtitle === undefined ? titleId : `${titleId} ${subtitleId}`
					}
					tabIndex={-1}
				>
					<header className={styles.header}>
						{Icon !== undefined && (
							<span className={styles.headerIcon}>
								<Icon aria-hidden />
							</span>
						)}
						<div className={styles.headings}>
							<h2
								id={titleId}
								className={styles.title}
							>
								{title}
							</h2>
							{subtitle !== undefined && (
								<p
									id={subtitleId}
									className={styles.subtitle}
								>
									{subtitle}
								</p>
							)}
						</div>
						{canMinimize && (
							<Button
								icon={Minus}
								variant="ghost"
								size="sm"
								ariaLabel="Réduire"
								tooltip="Réduire : reprendre la page, la saisie est gardée"
								tooltipPlacement="bottom"
								onClick={() => changeMinimized(true)}
							/>
						)}
						<Button
							icon={X}
							variant="ghost"
							size="sm"
							ariaLabel="Fermer"
							tooltip="Fermer (Échap)"
							tooltipPlacement="bottom"
							onClick={onClose}
						/>
					</header>
					<div
						ref={bodyRef}
						className={styles.body}
					>
						{children}
					</div>
					<footer
						ref={footerRef}
						className={styles.footer}
					>
						{footerStart !== undefined && (
							<div className={styles.footerStart}>{footerStart}</div>
						)}
						<div className={styles.actions}>{actions}</div>
					</footer>
				</div>
			</div>
		</>
	);
}
