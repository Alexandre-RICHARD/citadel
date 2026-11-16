import { KeyRound, LockOpen } from "lucide-react";
import { type FormEvent, useRef, useState } from "react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import { useUnlockNas } from "../../../../api/nas/useUnlockNas";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import nasStyles from "../../../../nas.module.scss";

type Props = {
	onClose: () => void;
};

/**
 * Le mot de passe des médias (§3) : il ouvre le mode connecté pour 12 h sur cet appareil. Jamais celui de la console.
 * Cinq essais par quart d'heure
 */
export function UnlockNasModal({ onClose }: Props) {
	const unlockNas = useUnlockNas();
	const [password, setPassword] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);

	function submit(event: FormEvent<HTMLFormElement>) {
		event.preventDefault();
		unlockNas.mutate(password, { onSuccess: onClose });
	}

	return (
		<Modal
			title="Mode connecté"
			subtitle="Les colonnes du NAS : stockage, partage, qualité, langues, vérifié"
			icon={KeyRound}
			size="sm"
			initialFocusRef={inputRef}
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					<Button
						variant="primary"
						icon={LockOpen}
						isLoading={unlockNas.isPending}
						disabled={password === ""}
						onClick={() => {
							unlockNas.mutate(password, { onSuccess: onClose });
						}}
					>
						Déverrouiller
					</Button>
				</>
			}
			onClose={onClose}
		>
			<form
				className={nasStyles.unlockForm}
				onSubmit={submit}
			>
				<p className={styles.modalQuestion}>
					Le mot de passe des médias ouvre le mode connecté pour 12 heures sur
					cet appareil.
				</p>
				<input
					ref={inputRef}
					type="password"
					autoComplete="current-password"
					aria-label="Mot de passe des médias"
					placeholder="Mot de passe des médias"
					className={nasStyles.passwordField}
					value={password}
					onChange={(event) => setPassword(event.target.value)}
				/>
				{unlockNas.error !== null && (
					<p
						className={nasStyles.error}
						role="alert"
					>
						{buildFailureMessage(
							"déverrouiller",
							getErrorReason(unlockNas.error, {
								projectReasons: backlogErrorReasons,
							}),
						)}
					</p>
				)}
			</form>
		</Modal>
	);
}
