import type { LucideIcon } from "lucide-react";

import styles from "./calendar.module.scss";

type Props = {
	label: string;
	icon: LucideIcon;
	onClick: () => void;
};

// Flèche d'une ligne d'en-tête du calendrier : le focus reste sur le jour, la souris seule s'en sert
export function NavButton({ label, icon: Icon, onClick }: Props) {
	return (
		<button
			type="button"
			tabIndex={-1}
			className={styles.navButton}
			aria-label={label}
			onClick={onClick}
		>
			<Icon aria-hidden />
		</button>
	);
}
