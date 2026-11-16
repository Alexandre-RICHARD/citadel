import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { Eye } from "lucide-react";

import { useLoadShowSeasons } from "../../../../api/media/useLoadShowSeasons";
import { useSetEpisodesWatched } from "../../../../api/media/useSetEpisodesWatched";
import { useUpdateUserMedia } from "../../../../api/media/useUpdateUserMedia";
import styles from "../../../../backlog.module.scss";
import { Checkbox } from "../../../../components/Checkbox";
import { planWatchedChange } from "../../../../helper/media/planWatchedChange";
import type { WatchedTarget } from "../../../../helper/media/watchedTarget.type";
import mediaStyles from "../../../../media.module.scss";
import type { MediaTableControls } from "../../mediaTableControls.type";
import { useMediaMode } from "../../useMediaMode";

type Props = {
	userMediaId: number;
	// Le titre du film ou de la série, pour les dialogues
	title: string;
	// null : la case d'un film ; sinon celle de la série, d'une saison ou d'un épisode
	target: WatchedTarget | null;
	// Ce que nomme la case dans un dialogue : « la série », « Saison 2 », « l'épisode 3 »
	subject: string;
	isWatched: boolean;
	// Série et saison : leurs épisodes diffusés vus, « 12 / 26 » ; null pour un film ou un épisode
	progress: { watchedCount: number; airedCount: number } | null;
	isDisabled: boolean;
	table: MediaTableControls;
};

/**
 * Case « Vu » (§5) : en lecture seule, un œil quand c'est vu, sinon « 12 / 26 » ; en mode édition, une case. Sur une série,
 * ses saisons sont lues pour savoir quoi cocher, et toute action qui touche plusieurs épisodes passe par un dialogue
 */
export function WatchedCell({
	userMediaId,
	title,
	target,
	subject,
	isWatched,
	progress,
	isDisabled,
	table,
}: Props) {
	const updateUserMedia = useUpdateUserMedia(userMediaId, "watched");
	const setEpisodesWatched = useSetEpisodesWatched(userMediaId);
	const loadShowSeasons = useLoadShowSeasons(useMediaMode().nas !== null);
	const progressText =
		progress === null || progress.airedCount === 0 || isWatched ? null : (
			<span
				className={joinClassNames(
					mediaStyles.progress,
					progress.watchedCount === 0 && styles.zeroValue,
				)}
			>
				{progress.watchedCount} / {progress.airedCount}
			</span>
		);

	async function toggle(): Promise<void> {
		if (target === null) {
			updateUserMedia.mutate({ isWatched: !isWatched });
			return;
		}
		const plan = planWatchedChange(
			await loadShowSeasons(userMediaId),
			target,
			isWatched,
		);
		if (plan === null) return;
		if (plan.kind === "direct") setEpisodesWatched.mutate(plan.change);
		else
			table.openModal({
				kind: "confirmWatched",
				userMediaId,
				title,
				subject,
				plan,
			});
	}

	if (!table.isEditMode)
		return isWatched ? (
			<span
				className={joinClassNames(styles.booleanMark, mediaStyles.watchedMark)}
				role="img"
				aria-label="Vu"
			>
				<Eye aria-hidden />
			</span>
		) : (
			progressText
		);
	return (
		<span className={mediaStyles.watchedCell}>
			<Checkbox
				checked={isWatched}
				ariaLabel={`Vu : ${subject}`}
				size="sm"
				disabled={
					isDisabled ||
					updateUserMedia.isPending ||
					setEpisodesWatched.isPending ||
					(progress !== null && progress.airedCount === 0)
				}
				tooltip={
					progress !== null && progress.airedCount === 0
						? "Aucun épisode diffusé"
						: null
				}
				className={styles.cellCheckbox}
				onChange={() => {
					void toggle();
				}}
			/>
			{progressText}
		</span>
	);
}
