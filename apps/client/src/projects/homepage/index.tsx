import { AppContainer } from "../../react/AppContainer";
import { projects } from "../../react/appNavigation/projectsDictionary";
import { Footer } from "./Footer";
import { Header } from "./Header";
import styles from "./homepage.module.scss";
import { ProjectsShowcase } from "./ProjectsShowcase";

export function Homepage() {
	const projectsInList = Object.values(projects);

	return (
		<AppContainer>
			<div className={styles.homepage}>
				<Header />
				<ProjectsShowcase projects={projectsInList} />
				<Footer />
			</div>
		</AppContainer>
	);
}
