import type { LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

import styles from "./iconButton.module.scss";

type Props = {
	icon: ForwardRefExoticComponent<
		Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
	>;
	label: string;
	onClick: () => void;
	variant?: "gold" | "gold-active" | "ghost" | "danger" | "ember";
	size?: "sm" | "md";
};

export function IconButton({
	icon: Icon,
	label,
	onClick,
	variant = "ghost",
	size = "md",
}: Props) {
	return (
		<button
			type="button"
			onClick={onClick}
			aria-label={label}
			title={label}
			className={`${styles.iconButton} icon-btn--${size}`}
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
