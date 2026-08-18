import { Outlet } from "react-router";

import { Navigation } from "../Navigation";
import styles from "./layout.module.scss";

export function Layout() {
	return (
		<>
			<Navigation />
			<div className={styles.satisfctoryLayoutContent}>
				<Outlet />
			</div>
		</>
	);
}
