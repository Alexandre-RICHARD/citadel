import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { Outlet } from "react-router";

import { AppToaster } from "../../../../react/AppToaster";
import { QueryErrorBoundary } from "../../../../react/QueryErrorBoundary";
import { gameDeathCounterErrorReasons } from "../../api/gameDeathCounterErrorReasons";
import { gameDeathCounterTheme } from "../../theme";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<ThemeProvider theme={gameDeathCounterTheme}>
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
		</ThemeProvider>
	);
}
