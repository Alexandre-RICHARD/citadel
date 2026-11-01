import { X } from "lucide-react";

import styles from "../siteBanner.module.scss";

type Props = {
	emoji: string;
	message: string;
	onClose: () => void;
};

// Un bandeau : son emoji, son message, et sa croix, seul moyen de le fermer
export function BannerItem({ emoji, message, onClose }: Props) {
	return (
		<div
			className={styles.siteBanner}
			role="status"
		>
			<span
				className={styles.emoji}
				aria-hidden
			>
				{emoji}
			</span>
			<p className={styles.message}>{message}</p>
			<button
				type="button"
				className={styles.close}
				aria-label="Fermer le bandeau"
				onClick={onClose}
			>
				<X size={16} />
			</button>
		</div>
	);
}
