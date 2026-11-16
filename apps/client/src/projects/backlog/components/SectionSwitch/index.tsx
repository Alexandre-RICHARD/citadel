import { joinClassNames } from "@citadel/common/src/universal/string/joinClassNames";
import { Clapperboard, Gamepad2 } from "lucide-react";
import { NavLink } from "react-router";

import { BacklogPathEnum } from "../../routing/backlogPath.enum";
import segmentedStyles from "../SegmentedControl/segmentedControl.module.scss";
import styles from "./sectionSwitch.module.scss";

const SECTIONS = [
	{ path: BacklogPathEnum.GAMES, label: "Jeux", icon: Gamepad2 },
	{ path: BacklogPathEnum.MEDIA, label: "Films et séries", icon: Clapperboard },
] as const;

/**
 * Bascule entre les deux backlogs, dans la barre du haut : de vrais liens (nouvel onglet, copie de l'adresse), avec
 * l'allure d'un choix segmenté. Chaque backlog garde son tri et ses filtres dans sa propre URL
 */
export function SectionSwitch() {
	return (
		<nav
			aria-label="Backlog"
			className={segmentedStyles.group}
		>
			{SECTIONS.map(({ path, label, icon: Icon }) => (
				<NavLink
					key={path}
					to={path}
					className={({ isActive }) =>
						joinClassNames(
							segmentedStyles.option,
							styles.link,
							isActive && segmentedStyles.selected,
						)
					}
				>
					<Icon
						className={segmentedStyles.icon}
						aria-hidden
					/>
					{label}
				</NavLink>
			))}
		</nav>
	);
}
