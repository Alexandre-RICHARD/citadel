import { useEffect } from "react";

import { Button } from "../../common/components/button/Button";
import { apitestFirstApiClients } from "./testFirst.apiClients";

export function FirstTest() {
	async function fetch() {
		console.log(await apitestFirstApiClients.getOtherTest());
		console.log(await apitestFirstApiClients.getOtherTests());
	}

	useEffect(() => {
		fetch().catch(() => undefined);
	}, []);

	return (
		<>
			<p>Projet 1</p>
			<Button label="bouton de test 1" />
		</>
	);
}
