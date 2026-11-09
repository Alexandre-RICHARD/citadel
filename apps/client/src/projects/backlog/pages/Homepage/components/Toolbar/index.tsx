import { useIsScrolled } from "@citadel/common/src/react/hooks/useIsScrolled";
import { usePrefersReducedMotion } from "@citadel/common/src/react/hooks/usePrefersReducedMotion";
import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import {
	ArrowUp,
	Castle,
	Columns3,
	Gamepad2,
	LibraryBig,
	Lock,
	Moon,
	PencilLine,
	Sun,
	UserRound,
} from "lucide-react";
import type { RefObject } from "react";

import { buildReturnToHomepagePath } from "../../../../../../react/appNavigation/buildReturnToHomepagePath";
import { ProjectsEnum } from "../../../../../../react/appNavigation/projects.enum";
import { useProjectColorScheme } from "../../../../../../react/projectTheme/useProjectColorScheme";
import { AuthPathEnum } from "../../../../../auth/routing/authPath.enum";
import type { GameHitFm } from "../../../../api/model/gameHitFm.type";
import styles from "../../../../backlog.module.scss";
import { Button } from "../../../../components/Button";
import { LinkButton } from "../../../../components/LinkButton";
import { Tooltip } from "../../../../components/Tooltip";
import type { BacklogModal } from "../../backlogModal.type";
import { SearchBar } from "../SearchBar";

// Défilement à partir duquel « Remonter en haut » apparaît : l'en-tête du tableau a quitté l'écran
const SCROLL_TOP_THRESHOLD_PIXELS = 300;

type Props = {
	searchInputRef: RefObject<HTMLInputElement | null>;
	// Jeux en base hors backlog, comptés sur le bouton ; null tant que la vue d'ensemble n'est pas chargée
	outsideBacklogGameCount: number | null;
	isEditMode: boolean;
	onEditModeChange: (isEditMode: boolean) => void;
	onSelectHit: (hit: GameHitFm) => void;
	onOpenModal: (modal: BacklogModal) => void;
};

// Barre du haut : la recherche IGDB, l'ajout depuis la base, les colonnes, le mode édition, le thème, le profil et le retour à la
// Citadel
export function Toolbar({
	searchInputRef,
	outsideBacklogGameCount,
	isEditMode,
	onEditModeChange,
	onSelectHit,
	onOpenModal,
}: Props) {
	const { colorScheme, toggleColorScheme } = useProjectColorScheme(
		ProjectsEnum.Backlog,
	);
	// Le bouton de la barre fixe reste à sa place (il ne décale rien) mais ne se montre qu'une fois la page défilée
	const isScrolled = useIsScrolled(SCROLL_TOP_THRESHOLD_PIXELS);
	const prefersReducedMotion = usePrefersReducedMotion();
	const colorSchemeLabel = `Passer au thème ${colorScheme === ColorSchemeEnum.Dark ? "clair" : "sombre"}`;

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
				Ajouter un jeu depuis la Citadel
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
				<Button
					icon={ArrowUp}
					variant="ghost"
					ariaLabel="Remonter en haut"
					tooltip="Remonter en haut du tableau"
					tooltipPlacement="bottom"
					className={isScrolled ? undefined : styles.scrollTopHidden}
					onClick={() =>
						window.scrollTo({
							top: 0,
							behavior: prefersReducedMotion ? "instant" : "smooth",
						})
					}
				/>
				<Button
					icon={colorScheme === ColorSchemeEnum.Dark ? Moon : Sun}
					variant="ghost"
					ariaLabel={colorSchemeLabel}
					tooltip={colorSchemeLabel}
					tooltipPlacement="bottom"
					onClick={toggleColorScheme}
				/>
				<LinkButton
					to={AuthPathEnum.PROFILE}
					icon={UserRound}
					ariaLabel="Mon profil"
					tooltip="Mon profil"
					tooltipPlacement="bottom"
				/>
				<LinkButton
					to={buildReturnToHomepagePath(ProjectsEnum.Backlog)}
					icon={Castle}
					ariaLabel="Retour à la Citadel"
					tooltip="Retour à la Citadel"
					tooltipPlacement="bottom"
				/>
			</div>
		</header>
	);
}
