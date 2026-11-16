import { CircleAlert, ExternalLink } from "lucide-react";

import { buildFailureMessage } from "../../../../../../common/api/error/buildFailureMessage";
import { getErrorReason } from "../../../../../../common/api/error/getErrorReason";
import { backlogErrorReasons } from "../../../../api/backlogErrorReasons";
import type { ForgottenMediaFm } from "../../../../api/model/nas/forgottenMediaFm.type";
import { useForgottenMedia } from "../../../../api/nas/useForgottenMedia";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Spinner } from "../../../../components/Spinner";
import { nasToolLabels } from "../../../../helper/label/nasToolLabels";
import { formatSizeGb } from "../../../../helper/nas/formatSizeGb";
import nasStyles from "../../../../nas.module.scss";
import type { MediaTableControls } from "../../mediaTableControls.type";

// Les endroits où il est : « Sonarr · disque 24 fichiers, 30 Go · Jellyfin · 4 torrents »
function describePlaces(media: ForgottenMediaFm): string {
	return [
		media.trackedBy === null ? null : nasToolLabels[media.trackedBy],
		media.fileCount === 0
			? null
			: `disque ${media.fileCount} ${media.fileCount > 1 ? "fichiers" : "fichier"}, ${formatSizeGb(media.sizeBytes)}`,
		media.isInJellyfin ? "Jellyfin" : null,
		media.torrentCount === 0
			? null
			: `${media.torrentCount} ${media.torrentCount > 1 ? "torrents" : "torrent"}`,
	]
		.filter((place) => place !== null)
		.join(" · ");
}

type Props = {
	table: MediaTableControls;
};

/**
 * Les médias oubliés (§5) : ce que le NAS contient sans être dans le backlog, une ligne par média. Un bouton ouvre sa
 * fiche TMDB pour l'ajouter ; ceux qu'aucun outil ne relie à TMDB sont listés par leur chemin
 */
export function ForgottenMediaPanel({ table }: Props) {
	const { forgottenMedia, error } = useForgottenMedia();

	if (error !== null)
		return (
			<p className={nasStyles.forgotten}>
				<span className={styles.inlineStatus}>
					<CircleAlert aria-hidden />
					{buildFailureMessage(
						"lire les médias oubliés",
						getErrorReason(error, { projectReasons: backlogErrorReasons }),
					)}
				</span>
			</p>
		);
	if (forgottenMedia === undefined)
		return (
			<p className={nasStyles.forgotten}>
				<span className={styles.inlineStatus}>
					<Spinner />
					Recherche des médias oubliés…
				</span>
			</p>
		);
	if (forgottenMedia.length === 0) return null;
	return (
		<details className={nasStyles.forgotten}>
			<summary>
				{forgottenMedia.length}{" "}
				{forgottenMedia.length > 1
					? "médias sur le NAS absents du backlog"
					: "média sur le NAS absent du backlog"}
			</summary>
			<ul className={nasStyles.forgottenList}>
				{forgottenMedia.map((media) => {
					const { tmdbId, mediaType } = media;
					return (
						<li
							key={tmdbId === null ? media.path : `${mediaType}-${tmdbId}`}
							className={nasStyles.forgottenItem}
						>
							<span className={nasStyles.stack}>
								<span className={nasStyles.forgottenName}>
									{media.title ?? media.path}
									{media.year !== null && ` (${media.year})`}
								</span>
								<span className={nasStyles.forgottenPlaces}>
									{describePlaces(media)}
								</span>
							</span>
							{tmdbId !== null && mediaType !== null && (
								<Button
									icon={ExternalLink}
									size="sm"
									onClick={() =>
										table.openModal({ kind: "addMedia", mediaType, tmdbId })
									}
								>
									Ouvrir la fiche
								</Button>
							)}
						</li>
					);
				})}
			</ul>
		</details>
	);
}
