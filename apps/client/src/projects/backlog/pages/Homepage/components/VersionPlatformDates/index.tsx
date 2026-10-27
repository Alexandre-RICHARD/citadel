import { formatShortIsoDate } from "@citadel/common/src/universal/date/formatShortIsoDate";

import type { VersionPlatformFm } from "../../../../api/model/versionPlatformFm.type";
import styles from "../../../../backlog.module.scss";

// Plateformes d'une version avec leur date de sortie, ex. « PS3 11/11/2011 · PC 11/11/2011 »
export function VersionPlatformDates({
	platforms,
}: {
	platforms: VersionPlatformFm[];
}) {
	return (
		<span className={styles.platformDates}>
			{platforms.map(({ platform, releaseDate }) => (
				<span
					key={platform.id}
					className={styles.platformDate}
				>
					<span className={styles.platform}>{platform.shortName}</span>
					<span className={styles.number}>
						{releaseDate === null
							? "date inconnue"
							: formatShortIsoDate(releaseDate)}
					</span>
				</span>
			))}
		</span>
	);
}
