import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import type { ReactNode } from "react";

import type { TmdbHitFm } from "../../../../api/model/media/tmdbHitFm.type";
import styles from "../../../../backlog.module.scss";
import { mediaTypeLabels } from "../../../../helper/label/mediaTypeLabels";
import { MediaThumbnail } from "../MediaThumbnail";
import { MediaTypeIcon } from "../MediaTypeIcon";

type Props = {
	id: string;
	hit: TmdbHitFm;
	isActive: boolean;
	// À droite de la ligne, ex. « Dans le backlog »
	badge: ReactNode;
	onHover: () => void;
	onSelect: (hit: TmdbHitFm) => void;
};

// Une ligne de résultat TMDB : affiche, titres, année, film ou série
export function TmdbSearchResultOption({
	id,
	hit,
	isActive,
	badge,
	onHover,
	onSelect,
}: Props) {
	return (
		// eslint-disable-next-line jsx-a11y/click-events-have-key-events -- le clavier passe par le champ de la liste (combobox)
		<li
			id={id}
			role="option"
			aria-selected={isActive}
			tabIndex={-1}
			className={joinClassNames(styles.result, isActive && styles.activeResult)}
			onPointerMove={() => {
				if (!isActive) onHover();
			}}
			onClick={() => onSelect(hit)}
		>
			<MediaThumbnail
				path={hit.posterPath}
				size="sm"
			/>
			<span className={styles.resultText}>
				<span className={styles.resultName}>
					<strong>{hit.title}</strong>
					{hit.releaseYear !== null && (
						<span className={styles.resultYear}>{hit.releaseYear}</span>
					)}
				</span>
				{hit.originalTitle !== null && (
					<span className={styles.secondaryName}>{hit.originalTitle}</span>
				)}
				<span className={styles.resultMeta}>
					<MediaTypeIcon mediaType={hit.mediaType} />
					{mediaTypeLabels[hit.mediaType]}
				</span>
			</span>
			{badge}
		</li>
	);
}
