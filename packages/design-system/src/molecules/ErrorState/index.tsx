import styles from "./errorState.module.scss";

type Props = {
	message: string;
	onRetry?: (() => void) | undefined;
	retryLabel?: string;
};

export function ErrorState({
	message,
	onRetry,
	retryLabel = "Réessayer",
}: Props) {
	return (
		<div
			className={styles.errorState}
			role="alert"
		>
			<p className={styles.message}>{message}</p>
			{onRetry ? (
				<button
					type="button"
					className={styles.retry}
					onClick={onRetry}
				>
					{retryLabel}
				</button>
			) : null}
		</div>
	);
}
