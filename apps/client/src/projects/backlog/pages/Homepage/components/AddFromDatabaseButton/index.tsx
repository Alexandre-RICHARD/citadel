import { LibraryBig } from "lucide-react";

import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";

type Props = {
	// Jeux en base hors backlog, comptés sur le bouton ; null tant que la vue d'ensemble n'est pas chargée
	outsideBacklogGameCount: number | null;
	onClick: () => void;
};

// « Ajouter un jeu depuis la Citadel » : les jeux déjà en base, sans passer par IGDB
export function AddFromDatabaseButton({
	outsideBacklogGameCount,
	onClick,
}: Props) {
	return (
		<Button
			icon={LibraryBig}
			tooltip={
				outsideBacklogGameCount === 0
					? "Tous les jeux de la base sont dans le backlog"
					: "Ajouter au backlog un jeu déjà en base, sans IGDB"
			}
			tooltipPlacement="bottom"
			disabled={outsideBacklogGameCount === 0}
			onClick={onClick}
		>
			Ajouter un jeu depuis la Citadel
			{outsideBacklogGameCount !== null && (
				<span className={styles.countBadge}>{outsideBacklogGameCount}</span>
			)}
		</Button>
	);
}
