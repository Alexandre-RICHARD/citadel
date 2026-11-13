import type { MeFm } from "../../../../api/model/meFm.type";
import styles from "./navigationUser.module.scss";

type Props = {
	me: MeFm;
	// Menu réduit : l'initiale seule
	isWide: boolean;
};

// En tête du menu du profil : l'initiale du pseudo affiché, puis ce pseudo et le pseudo quand le menu est large
export function NavigationUser({ me, isWide }: Props) {
	return (
		<div
			className={styles.user}
			title={isWide ? undefined : me.displayName}
		>
			<span
				className={styles.avatar}
				aria-hidden
			>
				{me.displayName.charAt(0).toUpperCase()}
			</span>
			<span className={styles.names}>
				<strong>{me.displayName}</strong>
				<span>@{me.username}</span>
			</span>
		</div>
	);
}
