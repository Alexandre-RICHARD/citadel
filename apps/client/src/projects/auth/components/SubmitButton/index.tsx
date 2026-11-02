import { useNow } from "@citadel/common/src/react/hooks/useNow";
import type { ReactNode } from "react";

import { formatWaitDelay } from "../../../../common/format/formatWaitDelay";
import styles from "./submitButton.module.scss";

type Props = {
	label: string;
	pendingLabel: string;
	icon: ReactNode;
	isPending: boolean;
	// Une limite atteinte (délai entre deux essais, serveur occupé) : le bouton attend jusque-là, compte à rebours compris
	waitUntil: number | null;
	isDisabled?: boolean;
};

const REFRESH_MS = 1000;

// Le bouton qui envoie le formulaire : « Envoi… » pendant la requête, « Patiente 12 s » pendant une attente imposée
export function SubmitButton({
	label,
	pendingLabel,
	icon,
	isPending,
	waitUntil,
	isDisabled = false,
}: Props) {
	const now = useNow(waitUntil === null ? null : REFRESH_MS);
	const waitMs = waitUntil === null ? 0 : waitUntil - now;
	const isWaiting = waitMs > 0;

	return (
		<button
			type="submit"
			className={styles.button}
			disabled={isPending || isWaiting || isDisabled}
		>
			<span>
				{isPending
					? pendingLabel
					: isWaiting
						? `Patiente ${formatWaitDelay(waitMs)}`
						: label}
			</span>
			{icon}
		</button>
	);
}
