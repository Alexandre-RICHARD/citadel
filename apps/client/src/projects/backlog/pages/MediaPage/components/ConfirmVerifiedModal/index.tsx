import { Check, ShieldCheck, ShieldOff } from "lucide-react";

import { useSetMediaVerified } from "../../../../api/nas/useSetMediaVerified";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import type { VerifiedPlan } from "../../../../helper/nas/verifiedPlan.type";

type Props = {
	userMediaId: number;
	title: string;
	// Ce que nomme la case cliquée : « la série », « Saison 2 »
	subject: string;
	plan: VerifiedPlan;
	onClose: () => void;
};

// Dialogue d'une case « Vérifié » qui touche plusieurs épisodes : cocher ou décocher une série ou une saison
export function ConfirmVerifiedModal({
	userMediaId,
	title,
	subject,
	plan,
	onClose,
}: Props) {
	const setMediaVerified = useSetMediaVerified(userMediaId);
	const count = plan.episodeIds.length;
	const verb = plan.isVerified ? "Cocher" : "Décocher";

	return (
		<Modal
			title={
				plan.isVerified ? "Marquer comme vérifié" : "Marquer comme pas vérifié"
			}
			subtitle={title}
			icon={plan.isVerified ? ShieldCheck : ShieldOff}
			size="sm"
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					<Button
						variant="primary"
						icon={Check}
						onClick={() => {
							setMediaVerified.mutate({
								episodeIds: plan.episodeIds,
								isVerified: plan.isVerified,
							});
							onClose();
						}}
					>
						{verb} les {count} épisodes
					</Button>
				</>
			}
			onClose={onClose}
		>
			<p className={styles.modalQuestion}>
				{plan.isVerified
					? `Cocher « Vérifié » sur les ${count} épisodes de ${subject} qui ont un seul fichier ?`
					: `Décocher « Vérifié » sur les ${count} épisodes vérifiés de ${subject} ?`}
			</p>
		</Modal>
	);
}
