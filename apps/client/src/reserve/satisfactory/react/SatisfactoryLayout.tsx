import { Outlet } from "react-router";

import { Footer } from "./components/Footer";
import { SideBarNavigation } from "./components/SideBarNavigation";
import styles from "./satisfactoryLayout.module.scss";

export function SatisfactoryLayout() {
	return (
		<>
			<SideBarNavigation />
			<div className={styles.satisfactoryAppContainer}>
				<main className={styles.mainContainer}>
					<Outlet />
				</main>
				<div className={styles.footerContainer}>
					<Footer />
				</div>
			</div>
		</>
	);
}
