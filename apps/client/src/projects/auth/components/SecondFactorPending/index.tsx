import { ShieldCheck } from "lucide-react";

import { useAbandonFlow } from "../../api/flow/useAbandonFlow";
import { AuthCard } from "../AuthCard";
import { FormAlert } from "../FormAlert";
import styles from "./secondFactorPending.module.scss";

// L'étape « second facteur » d'un compte protégé par une double authentification : son formulaire arrive avec la
// double authentification elle-même. D'ici là, aucun compte ne peut en avoir une
export function SecondFactorPending() {
	const abandon = useAbandonFlow();

	return (
		<AuthCard
			icon={<ShieldCheck />}
			title="Double authentification"
			lead="Ton compte est protégé par une double authentification."
		>
			<div className={styles.content}>
				<FormAlert tone="info">
					Cette étape n’est pas encore disponible sur le site.
				</FormAlert>
				<button
					type="button"
					className={styles.restart}
					onClick={() => abandon.mutate()}
					disabled={abandon.isPending}
				>
					Recommencer
				</button>
			</div>
		</AuthCard>
	);
}
