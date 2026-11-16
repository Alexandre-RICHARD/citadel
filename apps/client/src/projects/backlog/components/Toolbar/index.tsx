import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { ColorSchemeEnum } from "@citadel/design-system/src/theme/colorScheme/colorScheme.enum";
import {
	Castle,
	Columns3,
	Gamepad2,
	Lock,
	Moon,
	PencilLine,
	Sun,
	UserRound,
} from "lucide-react";
import type { ReactNode } from "react";

import { buildReturnToHomepagePath } from "../../../../react/appNavigation/buildReturnToHomepagePath";
import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { useProjectColorScheme } from "../../../../react/projectTheme/useProjectColorScheme";
import { AuthPathEnum } from "../../../auth/routing/authPath.enum";
import styles from "../../backlog.module.scss";
import { Button } from "../Button";
import { LinkButton } from "../LinkButton";
import { SectionSwitch } from "../SectionSwitch";
import { Tooltip } from "../Tooltip";

type Props = {
	// La recherche du backlog affiché (IGDB pour les jeux, TMDB pour les films et séries)
	search: ReactNode;
	// Les boutons propres au backlog affiché, après la recherche
	actions: ReactNode;
	isEditMode: boolean;
	onEditModeChange: (isEditMode: boolean) => void;
	onOpenColumns: () => void;
};

/**
 * Barre du haut, commune aux deux backlogs : la bascule jeux / films et séries, la recherche et les boutons du backlog
 * affiché, puis les colonnes, le mode édition, le thème, le profil et le retour à la Citadel
 */
export function Toolbar({
	search,
	actions,
	isEditMode,
	onEditModeChange,
	onOpenColumns,
}: Props) {
	const { colorScheme, toggleColorScheme } = useProjectColorScheme(
		ProjectsEnum.Backlog,
	);
	const colorSchemeLabel = `Passer au thème ${colorScheme === ColorSchemeEnum.Dark ? "clair" : "sombre"}`;

	return (
		<header className={styles.toolbar}>
			<div className={styles.brand}>
				<span className={styles.brandMark}>
					<Gamepad2 aria-hidden />
				</span>
				<h1 className={styles.title}>Backlog</h1>
			</div>
			<SectionSwitch />
			{search}
			{actions}
			<div className={styles.toolbarEnd}>
				<Button
					icon={Columns3}
					tooltip="Visibilité et ordre des colonnes"
					tooltipPlacement="bottom"
					onClick={onOpenColumns}
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
