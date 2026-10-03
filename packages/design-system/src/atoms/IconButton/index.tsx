import type { IconComponent } from "../../types/iconComponent.type";
import styles from "./iconButton.module.scss";

type Props = {
	icon: IconComponent;
	label: string;
	onClick: () => void;
	variant?: "ghost" | "primary" | "accent" | "destructive";
	size?: "sm" | "md";
	pressed?: boolean;
	// Action indisponible : mutation déjà en cours, saisie invalide…
	disabled?: boolean;
};

export function IconButton({
	icon: Icon,
	label,
	onClick,
	variant = "ghost",
	size = "md",
	pressed,
	disabled = false,
}: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			disabled={disabled}
			aria-label={label}
			aria-pressed={pressed}
			title={label}
			className={styles.iconButton}
			data-variant={variant}
			data-size={size}
		>
			<Icon
				size={size === "sm" ? 15 : 17}
				strokeWidth={2.25}
			/>
		</button>
	);
}
