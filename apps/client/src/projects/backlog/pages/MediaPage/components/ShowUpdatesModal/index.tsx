import { toggleArrayItem } from "@citadel/common/src/universal/array/toggleArrayItem";
import { pluralize } from "@citadel/common/src/universal/string/pluralize";
import { RefreshCw } from "lucide-react";
import { useState } from "react";

import { useApplyShowUpdates } from "../../../../api/media/useApplyShowUpdates";
import { useShowUpdates } from "../../../../api/media/useShowUpdates";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { Modal } from "../../../../components/Modal";
import { describeShowNews } from "../../../../helper/media/describeShowNews";
import { LoadingState } from "../../../Homepage/components/LoadingState";
import { ModalActions } from "../../../Homepage/components/ModalActions";

type Props = {
	onClose: () => void;
};

/**
 * « Récupérer les nouveautés des séries » (§7.3) : le serveur relit sur TMDB les séries en cours du backlog, puis le
 * récapitulatif montre celles qui ont du nouveau, toutes cochées ; « Valider » enregistre celles qui le restent
 */
export function ShowUpdatesModal({ onClose }: Props) {
	const { updates, error } = useShowUpdates();
	const [excludedIds, setExcludedIds] = useState<number[]>([]);
	const applyShowUpdates = useApplyShowUpdates();
	const chosenIds = (updates ?? [])
		.map(({ tmdbId }) => tmdbId)
		.filter((tmdbId) => !excludedIds.includes(tmdbId));

	return (
		<Modal
			title="Nouveautés des séries"
			subtitle="Les séries en cours du backlog, relues sur TMDB"
			icon={RefreshCw}
			actions={
				<ModalActions
					canValidate={chosenIds.length > 0}
					onCancel={onClose}
					onValidate={() => {
						applyShowUpdates.mutate({ tmdbIds: chosenIds });
						onClose();
					}}
				/>
			}
			onClose={onClose}
		>
			{updates === undefined ? (
				<LoadingState
					error={error}
					actionLabel="récupérer les nouveautés des séries"
				>
					Lecture des séries en cours sur TMDB…
				</LoadingState>
			) : updates.length === 0 ? (
				<p className={styles.modalIntro}>
					Aucune nouveauté : les séries en cours du backlog sont à jour.
				</p>
			) : (
				<div className={styles.formStack}>
					<p className={styles.modalIntro}>
						{pluralize(updates.length, "série")} en cours{" "}
						{updates.length > 1 ? "ont" : "a"} du nouveau sur TMDB. Les nouveaux
						épisodes arrivent pas vus.
					</p>
					<ul className={styles.choiceList}>
						{updates.map(
							({ tmdbId, title, newSeasonCount, newEpisodeCount }) => (
								<li
									key={tmdbId}
									className={styles.choiceItem}
								>
									<Checkbox
										checked={!excludedIds.includes(tmdbId)}
										label={title}
										description={describeShowNews(
											newSeasonCount,
											newEpisodeCount,
										)}
										onChange={() =>
											setExcludedIds((current) =>
												toggleArrayItem(current, tmdbId),
											)
										}
									/>
								</li>
							),
						)}
					</ul>
				</div>
			)}
		</Modal>
	);
}
