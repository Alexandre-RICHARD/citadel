import { Outlet } from "react-router";

import styles from "./layout.module.scss";

export function Layout() {
	return (
		<div className={styles.gameDeathCounterLayout}>
			<Outlet />
		</div>
	);
}
