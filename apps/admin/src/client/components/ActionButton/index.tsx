import type { IconComponent } from "@citadel/design-system/src/types/iconComponent.type";

import styles from "./actionButton.module.scss";

type Props = {
	label: string;
	onClick: () => void;
	icon?: IconComponent;
	// primary : l'action principale ; danger : irréversible ; ghost : secondaire
	variant?: "primary" | "danger" | "ghost";
	disabled?: boolean;
};

// Un bouton avec son texte : les actions des sections (déployer, restaurer, publier…)
export function ActionButton({
	label,
	onClick,
	icon: Icon,
	variant = "ghost",
	disabled = false,
}: Props) {
	return (
		<button
			type="button"
			className={styles.actionButton}
			data-variant={variant}
			disabled={disabled}
			onClick={onClick}
		>
			{Icon ? (
				<Icon
					size={15}
					strokeWidth={2.25}
				/>
			) : null}
			{label}
		</button>
	);
}
