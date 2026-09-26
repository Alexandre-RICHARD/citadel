import { useTranslation } from "../../../../react/hook/useTranslation.tsx";
import { translations } from "./translations.ts";

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
