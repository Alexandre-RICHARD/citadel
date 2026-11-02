import { NavLink } from "react-router";

import { externalLinks } from "../../../../common/links/externalLinks";
import { footerPages } from "../../content/footerPages";
import { buildHomepagePath } from "../../routing/buildHomepagePath";
import { GitHubMark } from "../GitHubMark";
import styles from "./footer.module.scss";

// Toujours en bas : le copyright, le dépôt du site, et ses pages (dont Contact), en verre dépoli
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
					href={externalLinks.repository}
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
