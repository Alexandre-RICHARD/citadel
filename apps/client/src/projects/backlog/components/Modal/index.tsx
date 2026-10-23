import { type LucideIcon, X } from "lucide-react";
import {
	type ReactNode,
	type RefObject,
	useEffect,
	useId,
	useRef,
} from "react";

import { getFocusableElements, joinClassNames } from "../../utils";
import { Button } from "../Button";
import styles from "./modal.module.scss";

type Props = {
	title: ReactNode;
	/** Sous le titre, en discret (ex. le jeu concerné) */
	subtitle?: ReactNode;
	icon?: LucideIcon | undefined;
	size?: "sm" | "md" | "lg";
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
	footerStart,
	actions,
	onClose,
	initialFocusRef,
	children,
}: Props) {
	const dialogRef = useRef<HTMLDivElement>(null);
	const titleId = useId();
	const subtitleId = useId();

	useEffect(() => {
		const dialog = dialogRef.current;
		const previouslyFocused =
			document.activeElement instanceof HTMLElement
				? document.activeElement
				: null;
		(initialFocusRef?.current ?? dialog)?.focus({ preventScroll: true });
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

		dialog?.addEventListener("keydown", trapFocus);
		return () => {
			dialog?.removeEventListener("keydown", trapFocus);
			root.style.overflow = previousOverflow;
			if (previouslyFocused?.isConnected === true) {
				previouslyFocused.focus({ preventScroll: true });
			}
		};
	}, [initialFocusRef]);

	return (
		<div className={styles.overlay}>
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
				<div className={styles.body}>{children}</div>
				<footer className={styles.footer}>
					{footerStart !== undefined && (
						<div className={styles.footerStart}>{footerStart}</div>
					)}
					<div className={styles.actions}>{actions}</div>
				</footer>
			</div>
		</div>
	);
}
