import type { GetTest } from "@specs/endpoint/test/getTest.endpoint";
import type { PostTest } from "@specs/endpoint/test/postTest.endpoint";
import { HttpMethodEnum } from "@specs/specUtils/httpMethod.enum";
import { useEffect } from "react";

import { Button } from "../../common/components/button/Button";
import { fetchHandler } from "../../common/helpers/fetch/handlerFetch";

export function Homepage() {
	useEffect(() => {
		(async () => {
			const response = await fetchHandler<PostTest>({
				url: "/test/unique/:id",
				method: HttpMethodEnum.POST,
				protected: true,
				pathParams: {
					id: "1",
				},
				queryParams: {
					possibility: "true",
				},
				body: {
					dateOfDay: new Date(),
					numero1: 21,
				},
			});
			console.log(response);
		})().catch((error) => console.log(error));
	}, []);

	useEffect(() => {
		(async () => {
			const response = await fetchHandler<GetTest>({
				url: "/test/get/:uuid",
				method: HttpMethodEnum.GET,
				protected: true,
				pathParams: {
					uuid: "b40",
				},
				queryParams: {
					getNode: "f",
				},
			});
			console.log(response);
		})().catch((error) => console.log(error));
	}, []);

	return (
		<>
			<p>Page d accueil</p>
			<Button label="bouton de ma page d'accueil" />
		</>
	);
}
