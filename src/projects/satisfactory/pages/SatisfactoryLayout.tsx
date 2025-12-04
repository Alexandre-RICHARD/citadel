import { Outlet } from "react-router";

import { DefaultReturnToHomepageButton } from "../../appNavigation/defaultReturnToHomepageButton.tsx/DefaultReturnToHomepageButton";
import styles from "./satisfactoryLayout.module.scss";

export function SatisfactoryLayout() {
	return (
		<>
			<DefaultReturnToHomepageButton />
			<div className={styles.satisfactoryProjectContainer}>
				<Outlet />
			</div>
		</>
	);
}
