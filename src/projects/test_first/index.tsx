import { useEffect } from "react";

import { Button } from "../../common/components/button/Button";
import { testFirstApiClients } from "./testFirst.apiClients";

export function FirstTest() {
	useEffect(() => {
		async function fetchData() {
			try {
				const [one, all] = await Promise.all([
					testFirstApiClients.getOtherTest(),
					testFirstApiClients.getOtherTests(),
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
			<p>Projet 1</p>
			<Button label="bouton de test 1" />
		</>
	);
}
