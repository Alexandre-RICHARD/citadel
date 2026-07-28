import { Outlet } from "react-router";

import styles from "./gameDeathCounterLayout.module.scss";

export function GameDeathCounterLayout() {
	return (
		<div className={styles.gameDeathCounterLayout}>
			<Outlet />
		</div>
	);
}
