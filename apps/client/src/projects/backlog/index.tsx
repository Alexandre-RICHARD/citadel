import { useEffect } from "react";

import styles from "./backlog.module.scss";

export function Backlog() {
	// Phase 0 : test du proxy IGDB, résultat dans la console
	useEffect(() => {
		fetch("/igdb/games", { method: "POST", body: "fields name; limit 1;" })
			.then((response) => response.json())
			// eslint-disable-next-line no-console
			.then((games: unknown) => console.log("Test proxy IGDB :", games))
			.catch((error: unknown) => {
				console.error("Test proxy IGDB en échec :", error);
			});
	}, []);

	return <main className={styles.page} />;
}
