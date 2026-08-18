import { Outlet } from "react-router";

import { Navigation } from "../Navigation/Navigation";
import styles from "./satisfactoryLayout.module.scss";

export function SatisfactoryLayout() {
	return (
		<>
			<Navigation />
			<div className={styles.satisfctoryLayoutContent}>
				<Outlet />
			</div>
		</>
	);
}
