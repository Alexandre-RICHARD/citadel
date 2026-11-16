import { FunnelX, ListFilter } from "lucide-react";

import styles from "../../backlog.module.scss";
import { Button } from "../Button";

type Props = {
	hasFilters: boolean;
	onClearFilters: () => void;
};

// Première case de la ligne des filtres : une icône, ou le bouton qui les retire tous dès qu'un filtre est actif
export function ClearFiltersCell({ hasFilters, onClearFilters }: Props) {
	return (
		<th
			className={styles.expandCell}
			aria-label="Filtres"
		>
			{hasFilters ? (
				<Button
					icon={FunnelX}
					variant="ghost"
					size="sm"
					ariaLabel="Effacer tous les filtres"
					tooltip="Effacer tous les filtres"
					tooltipPlacement="right"
					className={styles.clearFiltersButton}
					onClick={onClearFilters}
				/>
			) : (
				<ListFilter
					className={styles.filterRowIcon}
					aria-hidden
				/>
			)}
		</th>
	);
}
