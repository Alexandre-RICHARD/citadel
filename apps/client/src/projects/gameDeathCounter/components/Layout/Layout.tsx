import { Outlet } from "react-router";

import { ProjectsEnum } from "../../../../react/appNavigation/projects.enum";
import { AppToaster } from "../../../../react/AppToaster";
import { ProjectThemeProvider } from "../../../../react/projectTheme/ProjectThemeProvider";
import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { gameDeathCounterErrorReasons } from "../../api/gameDeathCounterErrorReasons";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<ProjectThemeProvider project={ProjectsEnum.GameDeathCount}>
			<div className={styles.gameDeathCounterLayout}>
				{/* Dernier filet : une erreur qu'aucune zone n'a attrapée remplace la page, pas toute l'application */}
				<QueryErrorBoundary
					actionLabel="afficher la page"
					errorReasons={gameDeathCounterErrorReasons}
				>
					<Outlet />
				</QueryErrorBoundary>
			</div>
			<AppToaster />
		</ProjectThemeProvider>
	);
}
