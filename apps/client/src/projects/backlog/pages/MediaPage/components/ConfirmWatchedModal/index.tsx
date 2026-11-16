import { Check, Eye, EyeOff } from "lucide-react";

import { useSetEpisodesWatched } from "../../../../api/media/useSetEpisodesWatched";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Modal } from "../../../../components/Modal";
import { describeWatchedPlan } from "../../../../helper/media/describeWatchedPlan";
import type { WatchedPlan } from "../../../../helper/media/watchedPlan.type";

type Props = {
	userMediaId: number;
	title: string;
	// Ce que nomme la case cliquée : « la série », « Saison 2 », « l'épisode 3 »
	subject: string;
	plan: Exclude<WatchedPlan, { kind: "direct" }>;
	onClose: () => void;
};

/**
 * Dialogue d'une case « Vu » qui touche plusieurs épisodes (§5) : cocher ou décocher une série ou une saison, ou un épisode
 * dont des précédents ne sont pas vus (des suivants sont vus), avec le choix de ne changer que lui
 */
export function ConfirmWatchedModal({
	userMediaId,
	title,
	subject,
	plan,
	onClose,
}: Props) {
	const setEpisodesWatched = useSetEpisodesWatched(userMediaId);
	const { isWatched } = plan.change;
	const { question, confirmLabel } = describeWatchedPlan(plan, subject);

	function apply(episodeIds: number[]) {
		setEpisodesWatched.mutate({ episodeIds, isWatched });
		onClose();
	}

	return (
		<Modal
			title={isWatched ? "Marquer comme vu" : "Marquer comme pas vu"}
			subtitle={title}
			icon={isWatched ? Eye : EyeOff}
			size={plan.kind === "extend" ? "md" : "sm"}
			actions={
				<>
					<Button onClick={onClose}>Annuler</Button>
					{plan.kind === "extend" && (
						<Button onClick={() => apply(plan.change.episodeIds)}>
							Seulement {subject}
						</Button>
					)}
					<Button
						variant="primary"
						icon={Check}
						onClick={() =>
							apply(
								plan.kind === "extend"
									? plan.extended.episodeIds
									: plan.change.episodeIds,
							)
						}
					>
						{confirmLabel}
					</Button>
				</>
			}
			onClose={onClose}
		>
			<p className={styles.modalQuestion}>{question}</p>
		</Modal>
	);
}
