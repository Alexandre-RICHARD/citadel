import { Route, Routes } from "react-router";

import { AppContainer } from "../AppContainer";
import { TranslationsContext } from "./toRework/nexus/react/contexts/translations/Translations.context";
import { TranslationProvider } from "./toRework/nexus/react/contexts/translations/Translations.provider";
import { FactoryLineCalculator } from "./toRework/react/pages/FactoryLineCalculator";
import { FRMAllMachines } from "./toRework/react/pages/FRMAllMachines";
import { Homepage } from "./toRework/react/pages/Homepage";
import { NotFound } from "./toRework/react/pages/NotFound";
import { RecipesList } from "./toRework/react/pages/RecipesList";
import { SatisfactoryLayout } from "./toRework/react/SatisfactoryLayout";
import { useCombinedStore } from "./toRework/store/combined.store";

export function SatisfactoryPage() {
	const language = useCombinedStore((state) => state.language);

	const filesContexts = {
		...import.meta.glob("./assets/translations/**/*.ts"),
	};
	return (
		<TranslationProvider
			TranslationsContext={TranslationsContext}
			filesContexts={filesContexts}
			language={language}
		>
			<AppContainer>
				<Routes>
					<Route
						path="/"
						element={<SatisfactoryLayout />}
					>
						<Route
							index
							element={<Homepage />}
						/>
						<Route
							path="recipes"
							element={<RecipesList />}
						/>
						<Route
							path="calculator"
							element={<FactoryLineCalculator />}
						/>
						<Route
							path="frm/allMachines"
							element={<FRMAllMachines />}
						/>
						<Route
							path="*"
							element={<NotFound />}
						/>
					</Route>
				</Routes>
			</AppContainer>
		</TranslationProvider>
	);
}
