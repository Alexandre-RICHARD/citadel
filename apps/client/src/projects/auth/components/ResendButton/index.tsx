import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { RotateCw } from "lucide-react";

import { formatWaitDelay } from "../../../../common/format/formatWaitDelay";
import styles from "./resendButton.module.scss";

type Props = {
	// null : un nouvel email peut être demandé tout de suite
	availableAt: number | null;
	isPending: boolean;
	onResend: () => void;
	// « Renvoyer l'email » par défaut ; « Recevoir un code par email » quand aucun n'est encore parti
	label?: string;
	// Plus aucun email ne part aujourd'hui
	isDisabled?: boolean;
};

const REFRESH_MS = 1000;

// Demande un email, grisé avec son compte à rebours tant que le délai entre deux emails n'est pas passé
export function ResendButton({
	availableAt,
	isPending,
	onResend,
	label = "Renvoyer l’email",
	isDisabled = false,
}: Props) {
	const now = useNow(REFRESH_MS);
	const waitMs = availableAt === null ? 0 : availableAt - now;
	const isWaiting = waitMs > 0;

	return (
		<button
			type="button"
			className={styles.button}
			disabled={isWaiting || isPending || isDisabled}
			onClick={onResend}
		>
			<RotateCw aria-hidden />
			{isPending
				? "Envoi…"
				: isWaiting
					? `${label} (${formatWaitDelay(waitMs)})`
					: label}
		</button>
	);
}
