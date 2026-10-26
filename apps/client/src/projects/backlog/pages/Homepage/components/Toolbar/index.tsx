import { Columns3, Gamepad2, LibraryBig, Lock, PencilLine } from "lucide-react";
import type { RefObject } from "react";

import type { GameHitFm } from "../../../../api/model/gameHitFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { Tooltip } from "../../../../components/Tooltip";
import { joinClassNames } from "../../../../helper/dom/joinClassNames";
import type { BacklogModal } from "../../backlogModal.type";
import { SearchBar } from "../SearchBar";

type Props = {
	searchInputRef: RefObject<HTMLInputElement | null>;
	// Jeux en base hors backlog, comptés sur « Ma base » ; null tant que la vue d'ensemble n'est pas chargée
	outsideBacklogGameCount: number | null;
	isEditMode: boolean;
	onEditModeChange: (isEditMode: boolean) => void;
	onSelectHit: (hit: GameHitFm) => void;
	onOpenModal: (modal: BacklogModal) => void;
};

// Barre du haut : la recherche IGDB, « Ma base », les colonnes et le mode édition
export function Toolbar({
	searchInputRef,
	outsideBacklogGameCount,
	isEditMode,
	onEditModeChange,
	onSelectHit,
	onOpenModal,
}: Props) {
	return (
		<header className={styles.toolbar}>
			<div className={styles.brand}>
				<span className={styles.brandMark}>
					<Gamepad2 aria-hidden />
				</span>
				<h1 className={styles.title}>Backlog</h1>
			</div>
			<SearchBar
				inputRef={searchInputRef}
				onSelect={onSelectHit}
			/>
			<Button
				icon={LibraryBig}
				tooltip={
					outsideBacklogGameCount === 0
						? "Tous les jeux de la base sont dans le backlog"
						: "Ajouter au backlog un jeu déjà en base, sans IGDB"
				}
				tooltipPlacement="bottom"
				disabled={outsideBacklogGameCount === 0}
				onClick={() => onOpenModal({ kind: "addFromDatabase" })}
			>
				Ma base
				{outsideBacklogGameCount !== null && (
					<span className={styles.countBadge}>{outsideBacklogGameCount}</span>
				)}
			</Button>
			<div className={styles.toolbarEnd}>
				<Button
					icon={Columns3}
					tooltip="Visibilité et ordre des colonnes"
					tooltipPlacement="bottom"
					onClick={() => onOpenModal({ kind: "editColumns" })}
				>
					Colonnes
				</Button>
				{/* Bouton fixe du mode édition : le tableau est en lecture seule par défaut */}
				<Tooltip
					content={
						isEditMode
							? "Repasser en lecture seule (retour automatique après 1 minute sans activité)"
							: "Passer en édition"
					}
					placement="bottom"
				>
					<button
						type="button"
						role="switch"
						aria-checked={isEditMode}
						className={joinClassNames(
							styles.editToggle,
							isEditMode && styles.editToggleOn,
						)}
						onClick={() => onEditModeChange(!isEditMode)}
					>
						{isEditMode ? <PencilLine aria-hidden /> : <Lock aria-hidden />}
						Édition
						<span
							className={styles.editToggleTrack}
							aria-hidden
						/>
					</button>
				</Tooltip>
			</div>
		</header>
	);
}
