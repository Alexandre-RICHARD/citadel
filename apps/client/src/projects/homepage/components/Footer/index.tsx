import { NavLink } from "react-router";

import { footerPages } from "../../content/footerPages";
import { buildHomepagePath } from "../../routing/buildHomepagePath";
import { GitHubMark } from "../GitHubMark";
import styles from "./footer.module.scss";

const REPOSITORY_URL = "https://github.com/Alexandre-RICHARD/citadel";

// Toujours en bas : le copyright, le dépôt du site, et les trois pages, en verre dépoli
export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer
			className={styles.footer}
			data-reveal="footer"
		>
			<span
				className={styles.copyright}
				data-reskin
			>
				© {currentYear} Alexandre Richard
			</span>
			<nav
				className={styles.links}
				aria-label="Liens du site"
			>
				<a
					className={styles.gitHub}
					href={REPOSITORY_URL}
					target="_blank"
					rel="noopener noreferrer"
					aria-label="Code source sur GitHub"
					title="Code source sur GitHub"
				>
					<GitHubMark />
				</a>
				{footerPages.map((page) => (
					<NavLink
						key={page.slug}
						to={buildHomepagePath(page.slug)}
						className={styles.link}
						data-reskin
					>
						{page.title}
					</NavLink>
				))}
			</nav>
		</footer>
	);
}
