import { useTranslation } from "@citadel/common/src/react/hooks/useTranslation";

import { translations } from "./translations";

export function TranslationTest() {
	const t = useTranslation(translations);

	return (
		<>
			<p>{t.a}</p>
			<p>{t.b(2)}</p>
			<p>{t.c("oui maman")}</p>
		</>
	);
}
