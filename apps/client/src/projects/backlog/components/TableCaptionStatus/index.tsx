import { type FilterModeEnum } from "@citadel/specs/src/projects/backlog/enum/filterMode.enum";
import { FunnelX, ListFilter, PencilLine } from "lucide-react";

import styles from "../../backlog.module.scss";
import { FilterModeToggle } from "../../pages/Homepage/components/FilterModeToggle";
import { Button } from "../Button";
import { Spinner } from "../Spinner";

type Props = {
	filterCount: number;
	filterMode: FilterModeEnum;
	isStale: boolean;
	isEditMode: boolean;
	onFilterModeChange: (filterMode: FilterModeEnum) => void;
	onClearFilters: () => void;
};

/**
 * Fin du résumé en haut d'un tableau, commune aux deux backlogs : les filtres actifs (combinaison, réinitialisation), la
 * relecture en cours et le mode édition
 */
export function TableCaptionStatus({
	filterCount,
	filterMode,
	isStale,
	isEditMode,
	onFilterModeChange,
	onClearFilters,
}: Props) {
	return (
		<>
			{filterCount > 0 && (
				<span className={styles.captionFilters}>
					<ListFilter aria-hidden />
					{filterCount > 1 ? `${filterCount} filtres actifs` : "1 filtre actif"}
					{filterCount > 1 && (
						<FilterModeToggle
							value={filterMode}
							onChange={onFilterModeChange}
						/>
					)}
					<Button
						icon={FunnelX}
						variant="ghost"
						size="sm"
						tooltip="Retirer tous les filtres d'un coup"
						onClick={onClearFilters}
					>
						Réinitialiser les filtres
					</Button>
				</span>
			)}
			{isStale && (
				<span className={styles.captionFilters}>
					<Spinner />
					Mise à jour…
				</span>
			)}
			{isEditMode && (
				<span className={styles.editModeTag}>
					<PencilLine aria-hidden />
					Mode édition
					<span className={styles.editModeHint}>
						retour en lecture seule après 1 min sans activité
					</span>
				</span>
			)}
		</>
	);
}
