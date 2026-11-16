import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";

import type { NasDetailsFm } from "../../../../api/model/nas/nasDetailsFm.type";
import styles from "../../../../backlog.module.scss";
import { formatDuration } from "../../../../helper/format/formatDuration";
import nasStyles from "../../../../nas.module.scss";

type Props = {
	// La durée de TMDB (série, saison : la somme de leurs épisodes)
	runtimeMinutes: number | null;
	// Mode connecté : la durée réelle du fichier d'un film ou d'un épisode
	nas: NasDetailsFm | null;
};

/**
 * Durée (§5). En mode connecté, quand un fichier existe, sa durée réelle est dessus, en évidence, et celle de TMDB
 * dessous ; celle du fichier passe en alerte quand elle s'écarte de plus de 7 min 30 et que le fichier n'est pas vérifié
 */
export function RuntimeCell({ runtimeMinutes, nas }: Props) {
	const fileMinutes = nas?.episodeCount === null ? nas.fileMinutes : null;
	if (fileMinutes === null)
		return runtimeMinutes === null ? null : (
			<span className={styles.number}>{formatDuration(runtimeMinutes)}</span>
		);
	return (
		<span className={nasStyles.stack}>
			<span
				className={joinClassNames(
					styles.number,
					nas?.isRuntimeMismatch === true && nasStyles.runtimeAlert,
				)}
				title={
					nas?.isRuntimeMismatch === true
						? "La durée du fichier s’écarte de celle de TMDB : version longue, autre montage ?"
						: undefined
				}
			>
				{formatDuration(Math.round(fileMinutes))}
			</span>
			{runtimeMinutes !== null && (
				<span className={joinClassNames(styles.number, nasStyles.secondary)}>
					{formatDuration(runtimeMinutes)}
				</span>
			)}
		</span>
	);
}
