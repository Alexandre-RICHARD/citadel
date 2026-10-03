import { ThemeProvider } from "@citadel/design-system/src/theme/ThemeProvider";
import { Outlet } from "react-router";

import { AppToaster } from "../../../../react/AppToaster";
import { gameDeathCounterTheme } from "../../theme";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<ThemeProvider theme={gameDeathCounterTheme}>
			<div className={styles.gameDeathCounterLayout}>
				<Outlet />
			</div>
			<AppToaster />
		</ThemeProvider>
	);
}
