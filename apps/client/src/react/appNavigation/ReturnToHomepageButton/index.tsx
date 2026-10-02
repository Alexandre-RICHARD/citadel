import { Button } from "@citadel/design-system/src/atoms/Button";
import { useNavigate } from "react-router";

import { ProjectsEnum } from "../projects.enum";
import { projects } from "../projectsDictionary";
import styles from "./returnToHomepageButton.module.scss";

export function ReturnToHomepageButton() {
	const navigate = useNavigate();
	function handleReturnToHomepageClick() {
		void navigate(projects[ProjectsEnum.Homepage].path);
	}

	return (
		<div className={styles.returnToHomepageButtonContainer}>
			<Button
				label="🏠"
				onClick={handleReturnToHomepageClick}
			/>
		</div>
	);
}
