import styles from "./header.module.scss";
import { HeaderLogo } from "./headerLogo/HeaderLogo";

export function Header() {
	return (
		<header className={styles.headerContainer}>
			<HeaderLogo />
			<h1 className={styles.header}>
				{`Découvrez les projets d'Alexandre RICHARD`}
			</h1>
			<div />
		</header>
	);
}
