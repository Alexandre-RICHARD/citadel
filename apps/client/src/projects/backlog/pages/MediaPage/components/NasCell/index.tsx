import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { MediaTypeEnum } from "@citadel/specs/src/projects/backlog/enum/mediaType.enum";
import { NasColumnEnum } from "@citadel/specs/src/projects/backlog/enum/nasColumn.enum";
import { NasSharingEnum } from "@citadel/specs/src/projects/backlog/enum/nasSharing.enum";
import { NasStorageEnum } from "@citadel/specs/src/projects/backlog/enum/nasStorage.enum";
import { TriangleAlert } from "lucide-react";

import type { NasDetailsFm } from "../../../../api/model/nas/nasDetailsFm.type";
import styles from "../../../../backlog.module.scss";
import { languageTagLabels } from "../../../../helper/label/languageTagLabels";
import { nasQualityLabels } from "../../../../helper/label/nasQualityLabels";
import { nasSharingLabels } from "../../../../helper/label/nasSharingLabels";
import { nasStorageLabels } from "../../../../helper/label/nasStorageLabels";
import { buildTmdbMediaUrl } from "../../../../helper/media/buildTmdbMediaUrl";
import { describeNasGap } from "../../../../helper/nas/describeNasGap";
import { formatSizeGb } from "../../../../helper/nas/formatSizeGb";
import nasStyles from "../../../../nas.module.scss";

const storageTones: Record<NasStorageEnum, string | undefined> = {
	[NasStorageEnum.NOT_TRACKED]: styles.toneGray,
	[NasStorageEnum.EXPECTED]: styles.toneAmber,
	[NasStorageEnum.DOWNLOADING]: styles.toneIris,
	[NasStorageEnum.PRESENT]: styles.toneTeal,
	[NasStorageEnum.IN_JELLYFIN]: styles.toneGreen,
};

const sharingTones: Record<NasSharingEnum, string | undefined> = {
	[NasSharingEnum.SEEDING]: styles.toneGreen,
	[NasSharingEnum.TRACKER_UNREACHABLE]: styles.toneAmber,
	[NasSharingEnum.ERROR]: styles.toneRed,
	[NasSharingEnum.NONE]: styles.toneGray,
};

const gbPerHourFormatter = new Intl.NumberFormat("fr-FR", {
	maximumFractionDigits: 1,
});

type Props = {
	column: Exclude<NasColumnEnum, NasColumnEnum.VERIFIED>;
	// null : la ligne n'a pas de colonnes du NAS (épisode spécial, ligne ajoutée à l'instant)
	nas: NasDetailsFm | null;
	// Pour les liens des écarts vers la fiche TMDB qu'ils citent
	mediaType: MediaTypeEnum;
};

/**
 * Une colonne relevée sur le NAS (§5), en lecture : la même pour un film, une série, une saison ou un épisode. Une
 * série et une saison comptent leurs fichiers : « Présent 18 / 26 », « VF 18 / 26 »
 */
export function NasCell({ column, nas, mediaType }: Props) {
	if (nas === null) return null;
	const isGroup = nas.episodeCount !== null;

	switch (column) {
		case NasColumnEnum.STORAGE: {
			const isPartial =
				isGroup && nas.fileCount > 0 && nas.fileCount < (nas.episodeCount ?? 0);
			const storage = isPartial ? NasStorageEnum.PRESENT : nas.storage;
			return (
				<span className={joinClassNames(styles.badge, storageTones[storage])}>
					{nasStorageLabels[storage]}
					{isPartial && (
						<span className={nasStyles.count}>
							{nas.fileCount} / {nas.episodeCount}
						</span>
					)}
				</span>
			);
		}
		case NasColumnEnum.JELLYFIN_COLLECTION:
			return nas.jellyfinCollection;
		case NasColumnEnum.SHARING:
			return nas.fileCount === 0 ? null : (
				<span
					className={joinClassNames(styles.badge, sharingTones[nas.sharing])}
				>
					{nasSharingLabels[nas.sharing]}
				</span>
			);
		case NasColumnEnum.TORRENTS:
			return nas.torrents.length === 0 ? null : (
				<span className={nasStyles.stack}>
					{nas.torrents.map(({ name, trackerName }) => (
						<span
							key={`${name}|${trackerName ?? ""}`}
							className={nasStyles.torrent}
							title={name}
						>
							{name}
							{trackerName !== null && (
								<span className={nasStyles.secondary}> · {trackerName}</span>
							)}
						</span>
					))}
				</span>
			);
		case NasColumnEnum.QUALITY:
			return nas.quality === null ? null : (
				<span className={styles.tag}>{nasQualityLabels[nas.quality]}</span>
			);
		case NasColumnEnum.LANGUAGES:
			return nas.languageTags.length === 0 ? null : (
				<span className={nasStyles.tags}>
					{nas.languageTags.map(({ tag, count }) => (
						<span
							key={tag}
							className={styles.tag}
						>
							{languageTagLabels[tag]}
							{isGroup && count < nas.fileCount && (
								<span className={nasStyles.count}>
									{count} / {nas.fileCount}
								</span>
							)}
						</span>
					))}
				</span>
			);
		case NasColumnEnum.SIZE:
			return nas.sizeBytes === null ? null : (
				<span className={styles.number}>{formatSizeGb(nas.sizeBytes)}</span>
			);
		case NasColumnEnum.GB_PER_HOUR:
			return nas.gbPerHour === null ? null : (
				<span className={styles.number}>
					{gbPerHourFormatter.format(nas.gbPerHour)}
				</span>
			);
		default:
			return nas.gaps.length === 0 ? null : (
				<span className={nasStyles.stack}>
					{nas.gaps.map((gap) => {
						const { text, tmdbId } = describeNasGap(gap);
						return (
							<span
								key={JSON.stringify(gap)}
								className={nasStyles.gap}
							>
								<TriangleAlert aria-hidden />
								{text}
								{tmdbId !== null && (
									<a
										className={styles.externalLink}
										href={buildTmdbMediaUrl(mediaType, tmdbId)}
										target="_blank"
										rel="noreferrer"
									>
										{tmdbId}
									</a>
								)}
							</span>
						);
					})}
				</span>
			);
	}
}
