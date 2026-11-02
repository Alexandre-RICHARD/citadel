import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { RotateCw } from "lucide-react";

import { formatWaitDelay } from "../../../../common/format/formatWaitDelay";
import styles from "./resendButton.module.scss";

type Props = {
	// null : un nouvel email peut être demandé tout de suite
	availableAt: number | null;
	isPending: boolean;
	onResend: () => void;
};

const REFRESH_MS = 1000;

// « Renvoyer l'email », grisé avec son compte à rebours tant que le délai entre deux mails n'est pas passé
export function ResendButton({ availableAt, isPending, onResend }: Props) {
	const now = useNow(REFRESH_MS);
	const waitMs = availableAt === null ? 0 : availableAt - now;
	const isWaiting = waitMs > 0;

	return (
		<button
			type="button"
			className={styles.button}
			disabled={isWaiting || isPending}
			onClick={onResend}
		>
			<RotateCw aria-hidden />
			{isPending
				? "Envoi…"
				: isWaiting
					? `Renvoyer l’email (${formatWaitDelay(waitMs)})`
					: "Renvoyer l’email"}
		</button>
	);
}
