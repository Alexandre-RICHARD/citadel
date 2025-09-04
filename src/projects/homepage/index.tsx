import { useEffect } from "react";

import { Button } from "../../common/components/button/Button";
import { homepageApiClients } from "./homepage.apiClients";

export function Homepage() {
	async function fetch() {
		console.log(await homepageApiClients.getTest());
		console.log(await homepageApiClients.getTests());
	}

	useEffect(() => {
		fetch().catch(() => undefined);
	}, []);

	return (
		<>
			<p>Page d accueil</p>
			<Button label="bouton de ma page d'accueil" />
		</>
	);
}
