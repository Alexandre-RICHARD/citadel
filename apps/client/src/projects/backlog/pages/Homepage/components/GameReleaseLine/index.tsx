import { CalendarDays, ExternalLink } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { ReleaseDateLabel } from "../ReleaseDateLabel";

type Props = {
	firstReleaseDate: string | null;
	isCancelled: boolean;
	igdbUrl: string;
};

// La date de sortie du jeu et le lien vers sa fiche IGDB, pour reconnaître le jeu dans une modale
export function GameReleaseLine({
	firstReleaseDate,
	isCancelled,
	igdbUrl,
}: Props) {
	return (
		<p className={styles.previewMeta}>
			<span className={styles.previewRelease}>
				<CalendarDays aria-hidden />
				Sortie :
				<ReleaseDateLabel
					date={firstReleaseDate}
					isCancelled={isCancelled}
				/>
			</span>
			<a
				className={styles.externalLink}
				href={igdbUrl}
				target="_blank"
				rel="noreferrer"
			>
				Ouvrir sur IGDB
				<ExternalLink aria-hidden />
			</a>
		</p>
	);
}
