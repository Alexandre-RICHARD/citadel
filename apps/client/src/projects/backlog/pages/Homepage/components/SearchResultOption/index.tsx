import { CornerDownRight } from "lucide-react";
import type { ReactNode } from "react";

import type { GameHitFm } from "../../../../api/model/gameHitFm.type";
import styles from "../../../../backlog.module.scss";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import { Thumbnail } from "../Thumbnail";

// La liste n'affiche que les 3 premières plateformes, puis le nombre restant
const SHOWN_PLATFORM_COUNT = 3;

type Props = {
	id: string;
	hit: GameHitFm;
	isActive: boolean;
	// À droite de la ligne, ex. « Déjà en base »
	badge: ReactNode;
	onHover: () => void;
	onSelect: (hit: GameHitFm) => void;
};

// Une ligne de résultat : miniature, noms, année, plateformes, « via … »
export function SearchResultOption({
	id,
	hit,
	isActive,
	badge,
	onHover,
	onSelect,
}: Props) {
	const shownPlatformNames = hit.platformNames.slice(0, SHOWN_PLATFORM_COUNT);
	const hiddenPlatformCount =
		hit.platformNames.length - shownPlatformNames.length;

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
			<Thumbnail imageId={hit.coverImageId} />
			<span className={styles.resultText}>
				<span className={styles.resultName}>
					<strong>{hit.frenchName ?? hit.name}</strong>
					{hit.releaseYear !== null && (
						<span className={styles.resultYear}>{hit.releaseYear}</span>
					)}
				</span>
				{hit.frenchName !== null && (
					<span className={styles.secondaryName}>{hit.name}</span>
				)}
				{(shownPlatformNames.length > 0 || hit.matchedName !== null) && (
					<span className={styles.resultMeta}>
						{shownPlatformNames.map((platformName) => (
							<span
								key={platformName}
								className={styles.platform}
							>
								{platformName}
							</span>
						))}
						{hiddenPlatformCount > 0 && (
							<span className={styles.morePlatforms}>
								+{hiddenPlatformCount}
							</span>
						)}
						{/* Trouvé par une autre fiche que la sienne : édition, bundle, DLC… */}
						{hit.matchedName !== null && (
							<span className={styles.matchedName}>
								<CornerDownRight aria-hidden />
								via « {hit.matchedName} »
							</span>
						)}
					</span>
				)}
			</span>
			{badge}
		</li>
	);
}
