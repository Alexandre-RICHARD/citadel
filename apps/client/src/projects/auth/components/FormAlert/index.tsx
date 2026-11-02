import { CircleAlert, Info } from "lucide-react";
import type { ReactNode } from "react";

import styles from "./formAlert.module.scss";

type Props = {
	tone: "error" | "info";
	children: ReactNode;
	// Un échec passager (serveur injoignable) : la même action peut être relancée telle quelle
	onRetry?: (() => void) | undefined;
};

// Un message dans la page, au-dessus du bouton : un échec à lire, ou une information sur l'étape
export function FormAlert({ tone, children, onRetry }: Props) {
	return (
		<div
			className={styles.alert}
			data-tone={tone}
			role={tone === "error" ? "alert" : "status"}
		>
			{tone === "error" ? <CircleAlert aria-hidden /> : <Info aria-hidden />}
			<div className={styles.content}>{children}</div>
			{onRetry !== undefined && (
				<button
					type="button"
					className={styles.retry}
					onClick={onRetry}
				>
					Réessayer
				</button>
			)}
		</div>
	);
}
