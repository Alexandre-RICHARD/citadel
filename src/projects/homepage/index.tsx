import { useEffect } from "react";

import { Button } from "../../common/components/button/Button";
import { homepageApiClients } from "./homepage.apiClients";

export function Homepage() {
	useEffect(() => {
		async function fetchData() {
			try {
				const [one, all] = await Promise.all([
					homepageApiClients.getTest(),
					homepageApiClients.getTests(),
				]);
				// eslint-disable-next-line no-console
				console.log({ one, all });
			} catch (err) {
				if (!(err instanceof DOMException && err.name === "AbortError")) {
					console.error("Erreur API homepage:", err);
				}
			}
		}

		fetchData().catch(() => {});
	}, []);

	return (
		<>
			<p>Page d accueil</p>
			<Button label="bouton de ma page d'accueil" />
		</>
	);
}
