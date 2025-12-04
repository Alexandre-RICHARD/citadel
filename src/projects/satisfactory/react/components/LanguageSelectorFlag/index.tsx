import React from "react";

import { type CountryEnum } from "../../../nexus/enums/country.enum";

type PropsType = {
	country: CountryEnum;
};

export function LanguageSelectorFlag({
	country,
}: PropsType): React.JSX.Element {
	return (
		<img
			alt={`Country flag of ${country}`}
			src={
				new URL(
					`/src/assets/images/languagesFlags/${country}.png`,
					import.meta.url,
				).href
			}
		/>
	);
}
