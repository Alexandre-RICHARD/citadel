import { AppContainer } from "../../react/AppContainer";
import { projects } from "../../react/appNavigation/projects.dictionnary";
import { Footer } from "./footer/Footer";
import { Header } from "./header/Header";
import styles from "./homepage.module.scss";
import { ProjectsShowcase } from "./projectsShowcase/ProjectsShowcase";

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
