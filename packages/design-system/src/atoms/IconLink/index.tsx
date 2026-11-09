import { isPlainLeftClick } from "@citadel/common/src/browser/events/isPlainLeftClick";

import type { IconComponent } from "../../types/iconComponent.type";
import styles from "../IconButton/iconButton.module.scss";

type Props = {
	icon: IconComponent;
	label: string;
	/** Destination : un vrai lien, donc nouvel onglet, clic molette et copie de l'adresse fonctionnent */
	href: string;
	/** Appelé au clic simple à la place du chargement de la page : navigation dans l'application (le design system ne connaît pas le routeur) */
	onNavigate: () => void;
	size?: "sm" | "md";
};

/** Lien-icône : l'allure d'un `IconButton` ghost, pour une destination plutôt qu'une action */
export function IconLink({
	icon: Icon,
	label,
	href,
	onNavigate,
	size = "md",
}: Props) {
	return (
		<a
			href={href}
			onClick={(event) => {
				if (!isPlainLeftClick(event)) return;
				event.preventDefault();
				onNavigate();
			}}
			aria-label={label}
			title={label}
			className={styles.iconButton}
			data-variant="ghost"
			data-size={size}
		>
			<Icon
				size={size === "sm" ? 15 : 17}
				strokeWidth={2.25}
			/>
		</a>
	);
}
