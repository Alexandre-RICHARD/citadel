import type { Ref } from "react";

import styles from "./burgerButton.module.scss";

type Props = {
	isOpen: boolean;
	onToggle: () => void;
	openLabel?: string;
	closeLabel?: string;
	/** L'id de ce que le bouton ouvre (aria-controls) */
	controls?: string;
	ref?: Ref<HTMLButtonElement>;
};

/** Bouton de menu : trois traits qui se croisent en X quand le menu est ouvert */
export function BurgerButton({
	isOpen,
	onToggle,
	openLabel = "Ouvrir le menu",
	closeLabel = "Fermer le menu",
	controls,
	ref,
}: Props) {
	const label = isOpen ? closeLabel : openLabel;

	return (
		<button
			ref={ref}
			type="button"
			className={styles.burgerButton}
			onClick={onToggle}
			aria-expanded={isOpen}
			aria-controls={controls}
			aria-label={label}
			title={label}
			data-open={isOpen}
		>
			<span
				className={styles.lines}
				aria-hidden
			>
				<span />
				<span />
				<span />
			</span>
		</button>
	);
}
