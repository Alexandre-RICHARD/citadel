import { useNow } from "@citadel/common/src/react/hooks/useNow";
import { Hourglass } from "lucide-react";

import { formatWaitDelay } from "../../../../common/format/formatWaitDelay";
import styles from "./flowDeadline.module.scss";

type Props = {
	expiresAt: number;
	// Ce que le temps restant permet encore : « pour saisir le code »
	purpose: string;
	// Le délai dépassé, la page dit quoi faire
	onRestart: () => void;
};

const REFRESH_MS = 1000;

// Le temps qu'il reste au parcours, seconde par seconde ; à zéro, il faut recommencer
export function FlowDeadline({ expiresAt, purpose, onRestart }: Props) {
	const now = useNow(REFRESH_MS);
	const remainingMs = expiresAt - now;

	if (remainingMs <= 0)
		return (
			<div
				className={styles.expired}
				role="status"
			>
				<p>Le délai est dépassé : ce code et ce lien ne marchent plus.</p>
				<button
					type="button"
					className={styles.restart}
					onClick={onRestart}
				>
					Recommencer
				</button>
			</div>
		);

	return (
		<p className={styles.deadline}>
			<Hourglass aria-hidden />
			<span>
				Il vous reste <strong>{formatWaitDelay(remainingMs)}</strong> {purpose}.
			</span>
		</p>
	);
}
